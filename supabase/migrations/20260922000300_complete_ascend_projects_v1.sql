begin;

alter table public.ascend_project_submissions
  add column if not exists revision_deadline timestamptz;

create or replace function public.ascend_save_project_submission(
  p_project_id uuid,
  p_user_id text,
  p_deliverable_responses jsonb,
  p_participant_note text default '',
  p_submit boolean default false
)
returns table(submission_id uuid, submission_status text, submission_version integer)
language plpgsql security definer set search_path = public
as $$
declare
  v_project public.ascend_projects%rowtype;
  v_participation public.ascend_project_participations%rowtype;
  v_submission public.ascend_project_submissions%rowtype;
  v_submission_id uuid;
  v_status text;
  v_version integer;
  v_note text;
begin
  if p_user_id is null or char_length(trim(p_user_id)) < 3 then raise exception 'ASCEND_PROJECT_INVALID_USER'; end if;
  if p_deliverable_responses is null or jsonb_typeof(p_deliverable_responses) <> 'object' then raise exception 'ASCEND_PROJECT_INVALID_SUBMISSION'; end if;
  v_note := left(coalesce(trim(p_participant_note), ''), 5000);

  select * into v_project from public.ascend_projects where id = p_project_id for update;
  if not found then raise exception 'ASCEND_PROJECT_NOT_FOUND'; end if;
  if v_project.starts_at is not null and v_project.starts_at > now() then raise exception 'ASCEND_PROJECT_NOT_STARTED'; end if;

  select * into v_participation from public.ascend_project_participations
  where project_id = p_project_id and user_id = p_user_id for update;
  if not found then raise exception 'ASCEND_PROJECT_PARTICIPATION_REQUIRED'; end if;
  if v_participation.status = 'pending' then raise exception 'ASCEND_PROJECT_PARTICIPATION_PENDING'; end if;
  if v_participation.status not in ('joined', 'in_progress', 'revision_requested') then raise exception 'ASCEND_PROJECT_PARTICIPATION_INACTIVE'; end if;

  select * into v_submission from public.ascend_project_submissions
  where participation_id = v_participation.id for update;

  if v_participation.status = 'revision_requested' then
    if not found or v_submission.status <> 'revision_requested' then raise exception 'ASCEND_PROJECT_SUBMISSION_LOCKED'; end if;
    if v_submission.revision_deadline is null or v_submission.revision_deadline <= now() then raise exception 'ASCEND_PROJECT_REVISION_CLOSED'; end if;
  else
    if v_project.status <> 'published' then raise exception 'ASCEND_PROJECT_UNAVAILABLE'; end if;
    if v_project.submission_deadline <= now() then raise exception 'ASCEND_PROJECT_SUBMISSIONS_CLOSED'; end if;
  end if;

  if p_submit and p_deliverable_responses = '{}'::jsonb then raise exception 'ASCEND_PROJECT_SUBMISSION_EMPTY'; end if;
  if found and v_submission.status not in ('draft', 'revision_requested') then raise exception 'ASCEND_PROJECT_SUBMISSION_LOCKED'; end if;

  if found then
    v_version := case when p_submit and v_submission.status = 'revision_requested' then v_submission.current_version + 1 else v_submission.current_version end;
    v_status := case when p_submit then 'submitted' else v_submission.status end;
    update public.ascend_project_submissions set
      deliverable_responses = p_deliverable_responses, participant_note = v_note,
      status = v_status, current_version = v_version,
      revision_note = case when p_submit then null else revision_note end,
      revision_deadline = case when p_submit then null else revision_deadline end,
      submitted_at = case when p_submit then now() else submitted_at end,
      reviewed_at = case when p_submit then null else reviewed_at end,
      reviewed_by = case when p_submit then null else reviewed_by end
    where id = v_submission.id returning id into v_submission_id;
  else
    v_version := 1; v_status := case when p_submit then 'submitted' else 'draft' end;
    insert into public.ascend_project_submissions(participation_id,project_id,user_id,deliverable_responses,participant_note,status,current_version,submitted_at)
    values(v_participation.id,p_project_id,p_user_id,p_deliverable_responses,v_note,v_status,v_version,case when p_submit then now() else null end)
    returning id into v_submission_id;
  end if;

  if p_submit then
    insert into public.ascend_project_submission_versions(submission_id,version,deliverable_responses,participant_note,submitted_by)
    values(v_submission_id,v_version,p_deliverable_responses,v_note,p_user_id);
    update public.ascend_project_participations set status='submitted',submitted_at=now(),started_at=coalesce(started_at,now()) where id=v_participation.id;
    insert into public.ascend_project_audit_events(project_id,participation_id,submission_id,actor_user_id,actor_type,event_type,from_status,to_status,metadata)
    values(p_project_id,v_participation.id,v_submission_id,p_user_id,'participant','submission_submitted',v_participation.status,'submitted',jsonb_build_object('version',v_version));
  elsif v_participation.status = 'joined' then
    update public.ascend_project_participations set status='in_progress',started_at=coalesce(started_at,now()) where id=v_participation.id;
  end if;
  return query select v_submission_id,v_status,v_version;
end;
$$;

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
      on conflict(participation_id) do update set summary=excluded.summary,skills=excluded.skills,deliverable_preview=excluded.deliverable_preview,evidence_status=excluded.evidence_status,verified_by=excluded.verified_by,verified_at=excluded.verified_at,updated_at=now()
      returning id into v_evidence_id;
      if v_status='awarded' then
        insert into public.ascend_project_reward_deliveries(reward_id,participation_id,user_id,amount_minor,currency,benefit_description,status)
        values(v_reward.id,v_participation.id,v_participation.user_id,v_reward.amount_minor,v_reward.currency,v_reward.non_cash_description,'confirmed')
        on conflict(participation_id) do nothing;
      end if;
    end if;
  end if;

  insert into public.ascend_project_audit_events(project_id,participation_id,submission_id,actor_user_id,actor_type,event_type,from_status,to_status,metadata)
  values(v_project.id,v_participation.id,v_submission.id,p_reviewer_user_id,'admin','submission_reviewed',v_participation.status,v_status,jsonb_build_object('outcome',p_outcome,'score',p_overall_score));
  return query select v_participation.id,v_status,v_evidence_id;
end;
$$;

revoke execute on function public.ascend_save_project_submission(uuid,text,jsonb,text,boolean) from public,anon,authenticated;
revoke execute on function public.ascend_review_project_submission(uuid,text,text,numeric,jsonb,text,text,integer) from public,anon,authenticated;
grant execute on function public.ascend_save_project_submission(uuid,text,jsonb,text,boolean) to service_role;
grant execute on function public.ascend_review_project_submission(uuid,text,text,numeric,jsonb,text,text,integer) to service_role;

insert into public.ascend_project_sponsors(id,name,website,verification_status,verification_notes,created_by,verified_by,verified_at)
values('00000000-0000-4000-8000-000000000101','ASCEND',null,'verified','ASCEND-created Practice Projects.','system','system',now())
on conflict(id) do nothing;

insert into public.ascend_projects(id,sponsor_id,project_type,entry_mode,title,summary,brief,category,difficulty,skills,deliverables,estimated_minutes,feedback_level,ai_policy,ai_policy_detail,rights_model,usage_terms,join_deadline,submission_deadline,results_at,status,published_at,created_by,reviewed_by)
values
('00000000-0000-4000-8000-000000000201','00000000-0000-4000-8000-000000000101','practice','open','Build a Student Opportunity Map','Research and organise a practical map of opportunities for students pursuing one clear career direction.','Choose a student career direction. Find credible opportunities, organise them by type and deadline, then explain why the strongest options fit the chosen student. Use current public information and include original sources.','Research','beginner',array['Research','Information organisation','Career awareness'],array['A structured map containing at least eight relevant opportunities','A short explanation of the three strongest options','Original source links for every opportunity'],240,'scored','allowed','AI may support planning and editing, but every opportunity and source must be personally verified.','portfolio','You retain ownership of your work. ASCEND may review it for feedback and verified-experience evidence but will not use it commercially without separate permission.',now()+interval '75 days',now()+interval '90 days',now()+interval '105 days','published',now(),'system','system'),
('00000000-0000-4000-8000-000000000202','00000000-0000-4000-8000-000000000101','practice','open','Create a Simple Launch Plan','Turn a fictional student-focused product idea into a clear, realistic four-week launch plan.','Choose or invent a small product that helps students. Define its audience, message, launch channels, weekly actions and simple success measures. Keep the plan realistic for a small team and limited budget.','Business','intermediate',array['Planning','Audience research','Communication'],array['A one-page product and audience definition','A four-week launch plan with weekly actions','Three measurable launch indicators'],300,'scored','limited','AI may help structure the plan, but the strategic choices and final reasoning must be your own.','portfolio','You retain ownership of your work. ASCEND may review it for feedback and verified-experience evidence but will not use it commercially without separate permission.',now()+interval '75 days',now()+interval '90 days',now()+interval '105 days','published',now(),'system','system'),
('00000000-0000-4000-8000-000000000203','00000000-0000-4000-8000-000000000101','practice','open','Design a Community Impact Proposal','Create a concise proposal for a small initiative that solves a visible problem in a school or local community.','Identify one real, bounded community problem. Explain who it affects, propose a feasible response, define the resources required and show how progress would be measured over six weeks.','Social Impact','intermediate',array['Problem framing','Proposal writing','Impact measurement'],array['A clear problem statement supported by local observations or sources','A six-week activity and resource plan','A measurement framework with at least three indicators'],360,'scored','limited','AI may assist with editing and structure. Do not fabricate community evidence, interviews or statistics.','portfolio','You retain ownership of your work. ASCEND may review it for feedback and verified-experience evidence but will not use it commercially without separate permission.',now()+interval '75 days',now()+interval '90 days',now()+interval '105 days','published',now(),'system','system')
on conflict(id) do nothing;

insert into public.ascend_project_criteria(project_id,title,description,weight,position)
select project_id,title,description,weight,position from (values
('00000000-0000-4000-8000-000000000201'::uuid,'Relevance','The opportunities fit the chosen direction and audience.',30,1),('00000000-0000-4000-8000-000000000201'::uuid,'Verification','Every listing is current and linked to an original source.',30,2),('00000000-0000-4000-8000-000000000201'::uuid,'Reasoning','The strongest choices are explained with evidence.',25,3),('00000000-0000-4000-8000-000000000201'::uuid,'Clarity','The map is organised and easy to use.',15,4),
('00000000-0000-4000-8000-000000000202'::uuid,'Audience clarity','The target user and need are specific.',25,1),('00000000-0000-4000-8000-000000000202'::uuid,'Strategic coherence','Message, channels and actions support one another.',30,2),('00000000-0000-4000-8000-000000000202'::uuid,'Feasibility','The plan fits the stated time and resources.',25,3),('00000000-0000-4000-8000-000000000202'::uuid,'Measurement','Success indicators are useful and measurable.',20,4),
('00000000-0000-4000-8000-000000000203'::uuid,'Problem definition','The problem is specific, grounded and bounded.',25,1),('00000000-0000-4000-8000-000000000203'::uuid,'Response design','The proposed activities address the stated problem.',30,2),('00000000-0000-4000-8000-000000000203'::uuid,'Feasibility','Resources and timing are realistic.',20,3),('00000000-0000-4000-8000-000000000203'::uuid,'Impact measurement','Indicators show meaningful progress.',25,4)
) as criteria(project_id,title,description,weight,position)
on conflict(project_id,position) do nothing;

commit;
