begin;

-- Refuse to retire an active promise. Investigate these records before deployment;
-- do not delete a delivery or change its status merely to bypass this guard.
do $$ begin
  if exists(select 1 from public.ascend_project_reward_deliveries where status not in ('delivered','resolved','cancelled'))
    or exists(select 1 from public.ascend_projects p join public.ascend_project_participations u on u.project_id=p.id
      where p.project_type='reward' and u.status in ('pending','joined','in_progress','submitted','revision_requested'))
    or exists(select 1 from public.ascend_projects where project_type='reward' and status in ('published','paused','submissions_closed','reviewing','results_ready'))
  then raise exception 'PROJECTS_RETIREMENT_BLOCKED: unresolved reward commitments. Review historical records before continuing.'; end if;
end $$;

alter table public.ascend_projects add column experience_kind text not null default 'build'
  check (experience_kind in ('explore','build'));

-- Historical rows remain unchanged. New reward projects and reopening them are blocked.
create function public.ascend_projects_non_monetary_guard() returns trigger
language plpgsql set search_path=public as $$ begin
  if new.project_type <> 'practice' and (TG_OP='INSERT' or new.status in ('published','scheduled')) then
    raise exception 'ASCEND_PROJECT_UNAVAILABLE';
  end if;
  return new;
end $$;
create trigger ascend_projects_non_monetary before insert or update on public.ascend_projects
for each row execute function public.ascend_projects_non_monetary_guard();

create table public.ascend_project_coaching (
  id uuid primary key default gen_random_uuid(),
  participation_id uuid not null references public.ascend_project_participations(id) on delete restrict,
  user_id text not null,
  input_hash text not null,
  feedback jsonb not null check(jsonb_typeof(feedback)='object'),
  created_at timestamptz not null default now(),
  unique(participation_id,input_hash)
);
alter table public.ascend_project_coaching enable row level security;
revoke all on public.ascend_project_coaching from public,anon,authenticated;
grant select,insert on public.ascend_project_coaching to service_role;
create index ascend_project_coaching_owner on public.ascend_project_coaching(user_id,participation_id,created_at desc);

-- Archive payment access. Owners can audit retained tables through Supabase.
revoke all on public.ascend_project_payment_profiles, public.ascend_project_sandbox_profiles,
 public.ascend_project_sandbox_payouts, public.ascend_project_reward_deliveries,
 public.ascend_project_rewards from service_role;
grant select on public.ascend_project_reward_deliveries, public.ascend_project_rewards to service_role;
revoke execute on function public.ascend_reserve_sandbox_payout(uuid,text) from public,anon,authenticated,service_role;
revoke execute on function public.ascend_record_sandbox_payout(uuid,text,text,text,bigint,text,text,text) from public,anon,authenticated,service_role;

create or replace function public.ascend_join_project(
  p_project_id uuid,
  p_user_id text
)
returns table(participation_id uuid, participation_status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project public.ascend_projects%rowtype;
  v_existing public.ascend_project_participations%rowtype;
  v_count integer;
  v_status text;
  v_participation_id uuid;
begin
  if p_user_id is null or char_length(trim(p_user_id)) < 3 then
    raise exception 'ASCEND_PROJECT_INVALID_USER';
  end if;

  select * into v_project
  from public.ascend_projects
  where id = p_project_id
  for update;

  if not found then raise exception 'ASCEND_PROJECT_NOT_FOUND'; end if;
  if v_project.project_type <> 'practice' then raise exception 'ASCEND_PROJECT_UNAVAILABLE'; end if;
  if v_project.status <> 'published' then raise exception 'ASCEND_PROJECT_UNAVAILABLE'; end if;
  if v_project.starts_at is not null and v_project.starts_at > now() then raise exception 'ASCEND_PROJECT_NOT_STARTED'; end if;
  if v_project.join_deadline is not null and v_project.join_deadline <= now() then raise exception 'ASCEND_PROJECT_JOIN_CLOSED'; end if;
  if v_project.submission_deadline <= now() then raise exception 'ASCEND_PROJECT_SUBMISSIONS_CLOSED'; end if;

  select * into v_existing
  from public.ascend_project_participations
  where project_id = p_project_id and user_id = p_user_id;

  if found then
    return query select v_existing.id, v_existing.status;
    return;
  end if;

  if v_project.capacity is not null then
    select count(*) into v_count
    from public.ascend_project_participations
    where project_id = p_project_id
      and status not in ('withdrawn', 'disqualified', 'not_completed');
    if v_count >= v_project.capacity then raise exception 'ASCEND_PROJECT_CAPACITY_REACHED'; end if;
  end if;

  v_status := case when v_project.entry_mode = 'reviewed' then 'pending' else 'joined' end;

  insert into public.ascend_project_participations(project_id, user_id, status)
  values (p_project_id, p_user_id, v_status)
  returning id into v_participation_id;

  insert into public.ascend_project_audit_events(
    project_id, participation_id, actor_user_id, actor_type, event_type, to_status
  ) values (
    p_project_id, v_participation_id, p_user_id, 'participant', 'project_joined', v_status
  );

  return query select v_participation_id, v_status;
end;
$$;

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
  if octet_length(p_deliverable_responses::text) > 220000 then raise exception 'ASCEND_PROJECT_INVALID_SUBMISSION'; end if;
  v_note := left(coalesce(trim(p_participant_note), ''), 5000);

  select * into v_project from public.ascend_projects where id = p_project_id for update;
  if not found then raise exception 'ASCEND_PROJECT_NOT_FOUND'; end if;
  if v_project.project_type <> 'practice' then raise exception 'ASCEND_PROJECT_UNAVAILABLE'; end if;
  if v_project.starts_at is not null and v_project.starts_at > now() then raise exception 'ASCEND_PROJECT_NOT_STARTED'; end if;

  if p_submit and (char_length(v_note) < 40 or exists (
    select 1 from unnest(v_project.deliverables) d where
      jsonb_typeof(p_deliverable_responses->d) is distinct from 'string'
      or char_length(trim(p_deliverable_responses->>d)) < 20
  )) then raise exception 'ASCEND_PROJECT_INCOMPLETE'; end if;
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
  v_status text;
  v_evidence_status text;
  v_evidence_id uuid;
begin
  if p_reviewer_user_id is null or char_length(trim(p_reviewer_user_id)) < 3 then raise exception 'ASCEND_PROJECT_INVALID_REVIEWER'; end if;
  if p_outcome not in ('completed','revision_requested','not_completed') then raise exception 'ASCEND_PROJECT_INVALID_REVIEW'; end if;
  if p_overall_score is not null and (p_overall_score < 0 or p_overall_score > 100) then raise exception 'ASCEND_PROJECT_INVALID_SCORE'; end if;
  if jsonb_typeof(coalesce(p_criterion_scores,'{}'::jsonb)) <> 'object' then raise exception 'ASCEND_PROJECT_INVALID_SCORE'; end if;

  select * into v_submission from public.ascend_project_submissions where id=p_submission_id for update;
  if not found then raise exception 'ASCEND_PROJECT_SUBMISSION_NOT_FOUND'; end if;
  if v_submission.status <> 'submitted' then raise exception 'ASCEND_PROJECT_SUBMISSION_NOT_REVIEWABLE'; end if;
  select * into v_participation from public.ascend_project_participations where id=v_submission.participation_id for update;
  select * into v_project from public.ascend_projects where id=v_submission.project_id for update;

  if v_project.project_type <> 'practice' then raise exception 'ASCEND_PROJECT_UNAVAILABLE'; end if;
  insert into public.ascend_project_reviews(submission_id,project_id,reviewer_user_id,reviewer_type,criterion_scores,overall_score,outcome,user_feedback,private_notes)
  values(v_submission.id,v_project.id,p_reviewer_user_id,'admin',coalesce(p_criterion_scores,'{}'::jsonb),p_overall_score,p_outcome,left(coalesce(p_user_feedback,''),5000),left(coalesce(p_private_notes,''),5000))
  on conflict(submission_id,reviewer_user_id) do update set criterion_scores=excluded.criterion_scores,overall_score=excluded.overall_score,outcome=excluded.outcome,user_feedback=excluded.user_feedback,private_notes=excluded.private_notes,updated_at=now();

  if p_outcome = 'revision_requested' then
    v_status := 'revision_requested';
    update public.ascend_project_submissions set status='revision_requested',revision_note=left(coalesce(p_user_feedback,'Revision requested.'),5000),revision_deadline=now()+(greatest(1,least(p_revision_days,30))||' days')::interval,reviewed_at=now(),reviewed_by=p_reviewer_user_id where id=v_submission.id;
    update public.ascend_project_participations set status=v_status where id=v_participation.id;
  else
    v_status := case when p_outcome='completed' then 'completed' else 'not_completed' end;
    update public.ascend_project_submissions set status=case when p_outcome in ('completed') then 'accepted' else 'rejected' end,reviewed_at=now(),reviewed_by=p_reviewer_user_id,revision_deadline=null where id=v_submission.id;
    update public.ascend_project_participations set status=v_status,completed_at=case when v_status in ('completed') then now() else completed_at end where id=v_participation.id;
    if v_status in ('completed') then
      v_evidence_status := 'verified';
      insert into public.ascend_project_evidence(participation_id,project_id,user_id,title,summary,skills,deliverable_preview,evidence_status,visibility,verified_by,verified_at)
      values(v_participation.id,v_project.id,v_participation.user_id,v_project.title,'Completed and reviewed through ASCEND Projects.',v_project.skills,v_submission.deliverable_responses,v_evidence_status,'private',p_reviewer_user_id,now())
      on conflict on constraint ascend_project_evidence_participation_id_key do update set summary=excluded.summary,skills=excluded.skills,deliverable_preview=excluded.deliverable_preview,evidence_status=excluded.evidence_status,verified_by=excluded.verified_by,verified_at=excluded.verified_at,updated_at=now()
      returning id into v_evidence_id;

    end if;
  end if;

  insert into public.ascend_project_audit_events(project_id,participation_id,submission_id,actor_user_id,actor_type,event_type,from_status,to_status,metadata)
  values(v_project.id,v_participation.id,v_submission.id,p_reviewer_user_id,'admin','submission_reviewed',v_participation.status,v_status,jsonb_build_object('outcome',p_outcome,'score',p_overall_score));
  return query select v_participation.id,v_status,v_evidence_id;
end;
$$;


-- Completion records the participant's work, never a skill verification or AI verdict.
create function public.ascend_complete_learning_project(p_project_id uuid,p_user_id text)
returns uuid language plpgsql security definer set search_path=public as $$
declare
  p public.ascend_projects%rowtype;
  u public.ascend_project_participations%rowtype;
  s public.ascend_project_submissions%rowtype;
  eid uuid;
begin
  select * into p from public.ascend_projects where id=p_project_id for update;
  if not found or p.project_type <> 'practice' then raise exception 'ASCEND_PROJECT_UNAVAILABLE'; end if;
  select * into u from public.ascend_project_participations where project_id=p.id and user_id=p_user_id for update;
  if not found then raise exception 'ASCEND_PROJECT_PARTICIPATION_REQUIRED'; end if;
  if u.status='completed' then
    select id into eid from public.ascend_project_evidence where participation_id=u.id;
    return eid;
  end if;
  -- Human review/revision cannot be bypassed with self completion.
  if u.status not in ('joined','in_progress') then raise exception 'ASCEND_PROJECT_PARTICIPATION_INACTIVE'; end if;
  if p.status <> 'published' or p.submission_deadline<=now() or p.starts_at>now() then raise exception 'ASCEND_PROJECT_UNAVAILABLE'; end if;
  select * into s from public.ascend_project_submissions where participation_id=u.id for update;
  if not found or s.status<>'draft' then raise exception 'ASCEND_PROJECT_SUBMISSION_EMPTY'; end if;
  if char_length(trim(s.participant_note))<40 or exists(select 1 from unnest(p.deliverables) d
    where jsonb_typeof(s.deliverable_responses->d) is distinct from 'string' or char_length(trim(s.deliverable_responses->>d))<20)
    then raise exception 'ASCEND_PROJECT_INCOMPLETE'; end if;
  insert into public.ascend_project_submission_versions(submission_id,version,deliverable_responses,participant_note,submitted_by)
    values(s.id,s.current_version,s.deliverable_responses,s.participant_note,p_user_id);
  update public.ascend_project_submissions set status='accepted',submitted_at=now() where id=s.id;
  update public.ascend_project_participations set status='completed',completed_at=now(),started_at=coalesce(started_at,now()) where id=u.id;
  insert into public.ascend_project_evidence(participation_id,project_id,user_id,title,summary,skills,deliverable_preview,evidence_status,visibility)
    values(u.id,p.id,p_user_id,p.title,s.participant_note,p.skills,s.deliverable_responses,'completed','private') returning id into eid;
  insert into public.ascend_project_audit_events(project_id,participation_id,submission_id,actor_user_id,actor_type,event_type,from_status,to_status)
    values(p.id,u.id,s.id,p_user_id,'participant','learning_project_completed',u.status,'completed');
  return eid;
end $$;
revoke execute on function public.ascend_complete_learning_project(uuid,text) from public,anon,authenticated;
grant execute on function public.ascend_complete_learning_project(uuid,text) to service_role;

commit;
