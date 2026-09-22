begin;

create or replace function public.ascend_review_project_submission(
  p_submission_id uuid,
  p_reviewer_user_id text,
  p_outcome text,
  p_overall_score numeric default null,
  p_criterion_scores jsonb default '{}'::jsonb,
  p_user_feedback text default '',
  p_private_notes text default '',
  p_revision_days integer default 7
)
returns table(participation_id uuid, participation_status text, evidence_id uuid)
language plpgsql security definer set search_path = public
as $$
declare
  v_submission public.ascend_project_submissions%rowtype;
  v_participation public.ascend_project_participations%rowtype;
  v_project public.ascend_projects%rowtype;
  v_reward public.ascend_project_rewards%rowtype;
  v_status text;
  v_evidence_status text;
  v_evidence_id uuid;
begin
  if p_reviewer_user_id is null or char_length(trim(p_reviewer_user_id)) < 3 then raise exception 'ASCEND_PROJECT_INVALID_REVIEWER'; end if;
  if p_outcome not in ('completed','revision_requested','not_completed','award_recommended') then raise exception 'ASCEND_PROJECT_INVALID_REVIEW'; end if;
  if p_overall_score is not null and (p_overall_score < 0 or p_overall_score > 100) then raise exception 'ASCEND_PROJECT_INVALID_SCORE'; end if;
  if jsonb_typeof(coalesce(p_criterion_scores,'{}'::jsonb)) <> 'object' then raise exception 'ASCEND_PROJECT_INVALID_SCORE'; end if;

  select * into v_submission from public.ascend_project_submissions where id=p_submission_id for update;
  if not found then raise exception 'ASCEND_PROJECT_SUBMISSION_NOT_FOUND'; end if;
  if v_submission.status <> 'submitted' then raise exception 'ASCEND_PROJECT_SUBMISSION_NOT_REVIEWABLE'; end if;
  select * into v_participation from public.ascend_project_participations where id=v_submission.participation_id for update;
  select * into v_project from public.ascend_projects where id=v_submission.project_id for update;

  if p_outcome = 'award_recommended' then
    select * into v_reward from public.ascend_project_rewards where project_id=v_project.id;
    if not found or v_reward.funding_status not in ('confirmed','secured') then raise exception 'ASCEND_PROJECT_REWARD_NOT_SECURED'; end if;
  end if;

  insert into public.ascend_project_reviews(submission_id,project_id,reviewer_user_id,reviewer_type,criterion_scores,overall_score,outcome,user_feedback,private_notes)
  values(v_submission.id,v_project.id,p_reviewer_user_id,'admin',coalesce(p_criterion_scores,'{}'::jsonb),p_overall_score,p_outcome,left(coalesce(p_user_feedback,''),5000),left(coalesce(p_private_notes,''),5000))
  on conflict(submission_id,reviewer_user_id) do update set criterion_scores=excluded.criterion_scores,overall_score=excluded.overall_score,outcome=excluded.outcome,user_feedback=excluded.user_feedback,private_notes=excluded.private_notes,updated_at=now();

  if p_outcome = 'revision_requested' then
    v_status := 'revision_requested';
    update public.ascend_project_submissions set status='revision_requested',revision_note=left(coalesce(p_user_feedback,'Revision requested.'),5000),revision_deadline=now()+(greatest(1,least(p_revision_days,30))||' days')::interval,reviewed_at=now(),reviewed_by=p_reviewer_user_id where id=v_submission.id;
    update public.ascend_project_participations set status=v_status where id=v_participation.id;
  else
    v_status := case when p_outcome='completed' then 'completed' when p_outcome='award_recommended' then 'awarded' else 'not_completed' end;
    update public.ascend_project_submissions set status=case when p_outcome in ('completed','award_recommended') then 'accepted' else 'rejected' end,reviewed_at=now(),reviewed_by=p_reviewer_user_id,revision_deadline=null where id=v_submission.id;
    update public.ascend_project_participations set status=v_status,completed_at=case when v_status in ('completed','awarded') then now() else completed_at end where id=v_participation.id;
    if v_status in ('completed','awarded') then
      v_evidence_status := case when v_status='awarded' then 'awarded' else 'verified' end;
      insert into public.ascend_project_evidence(participation_id,project_id,user_id,title,summary,skills,deliverable_preview,evidence_status,visibility,verified_by,verified_at)
      values(v_participation.id,v_project.id,v_participation.user_id,v_project.title,'Completed and reviewed through ASCEND Projects.',v_project.skills,v_submission.deliverable_responses,v_evidence_status,'private',p_reviewer_user_id,now())
      on conflict on constraint ascend_project_evidence_participation_id_key do update set summary=excluded.summary,skills=excluded.skills,deliverable_preview=excluded.deliverable_preview,evidence_status=excluded.evidence_status,verified_by=excluded.verified_by,verified_at=excluded.verified_at,updated_at=now()
      returning id into v_evidence_id;
      if v_status='awarded' then
        insert into public.ascend_project_reward_deliveries(reward_id,participation_id,user_id,amount_minor,currency,benefit_description,status)
        values(v_reward.id,v_participation.id,v_participation.user_id,v_reward.amount_minor,v_reward.currency,v_reward.non_cash_description,'confirmed')
        on conflict on constraint ascend_project_reward_deliveries_participation_id_key do nothing;
      end if;
    end if;
  end if;

  insert into public.ascend_project_audit_events(project_id,participation_id,submission_id,actor_user_id,actor_type,event_type,from_status,to_status,metadata)
  values(v_project.id,v_participation.id,v_submission.id,p_reviewer_user_id,'admin','submission_reviewed',v_participation.status,v_status,jsonb_build_object('outcome',p_outcome,'score',p_overall_score));
  return query select v_participation.id,v_status,v_evidence_id;
end;
$$;

commit;
