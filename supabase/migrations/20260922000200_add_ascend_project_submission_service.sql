begin;

create or replace function public.ascend_save_project_submission(
  p_project_id uuid,
  p_user_id text,
  p_deliverable_responses jsonb,
  p_participant_note text default '',
  p_submit boolean default false
)
returns table(submission_id uuid, submission_status text, submission_version integer)
language plpgsql
security definer
set search_path = public
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
  if p_user_id is null or char_length(trim(p_user_id)) < 3 then
    raise exception 'ASCEND_PROJECT_INVALID_USER';
  end if;
  if p_deliverable_responses is null or jsonb_typeof(p_deliverable_responses) <> 'object' then
    raise exception 'ASCEND_PROJECT_INVALID_SUBMISSION';
  end if;

  v_note := left(coalesce(trim(p_participant_note), ''), 5000);

  select * into v_project
  from public.ascend_projects
  where id = p_project_id
  for update;

  if not found then raise exception 'ASCEND_PROJECT_NOT_FOUND'; end if;
  if v_project.status <> 'published' then raise exception 'ASCEND_PROJECT_UNAVAILABLE'; end if;
  if v_project.starts_at is not null and v_project.starts_at > now() then
    raise exception 'ASCEND_PROJECT_NOT_STARTED';
  end if;
  if v_project.submission_deadline <= now() then
    raise exception 'ASCEND_PROJECT_SUBMISSIONS_CLOSED';
  end if;

  select * into v_participation
  from public.ascend_project_participations
  where project_id = p_project_id and user_id = p_user_id
  for update;

  if not found then raise exception 'ASCEND_PROJECT_PARTICIPATION_REQUIRED'; end if;
  if v_participation.status = 'pending' then raise exception 'ASCEND_PROJECT_PARTICIPATION_PENDING'; end if;
  if v_participation.status not in ('joined', 'in_progress', 'revision_requested') then
    raise exception 'ASCEND_PROJECT_PARTICIPATION_INACTIVE';
  end if;
  if p_submit and p_deliverable_responses = '{}'::jsonb then
    raise exception 'ASCEND_PROJECT_SUBMISSION_EMPTY';
  end if;

  select * into v_submission
  from public.ascend_project_submissions
  where participation_id = v_participation.id
  for update;

  if found and v_submission.status not in ('draft', 'revision_requested') then
    raise exception 'ASCEND_PROJECT_SUBMISSION_LOCKED';
  end if;

  if found then
    v_version := case
      when p_submit and v_submission.status = 'revision_requested' then v_submission.current_version + 1
      else v_submission.current_version
    end;
    v_status := case when p_submit then 'submitted' else v_submission.status end;

    update public.ascend_project_submissions
    set deliverable_responses = p_deliverable_responses,
        participant_note = v_note,
        status = v_status,
        current_version = v_version,
        revision_note = case when p_submit then null else revision_note end,
        submitted_at = case when p_submit then now() else submitted_at end,
        reviewed_at = case when p_submit then null else reviewed_at end,
        reviewed_by = case when p_submit then null else reviewed_by end
    where id = v_submission.id
    returning id into v_submission_id;
  else
    v_version := 1;
    v_status := case when p_submit then 'submitted' else 'draft' end;

    insert into public.ascend_project_submissions(
      participation_id, project_id, user_id, deliverable_responses,
      participant_note, status, current_version, submitted_at
    ) values (
      v_participation.id, p_project_id, p_user_id, p_deliverable_responses,
      v_note, v_status, v_version, case when p_submit then now() else null end
    ) returning id into v_submission_id;
  end if;

  if p_submit then
    insert into public.ascend_project_submission_versions(
      submission_id, version, deliverable_responses, participant_note, submitted_by
    ) values (
      v_submission_id, v_version, p_deliverable_responses, v_note, p_user_id
    );

    update public.ascend_project_participations
    set status = 'submitted', submitted_at = now(), started_at = coalesce(started_at, now())
    where id = v_participation.id;

    insert into public.ascend_project_audit_events(
      project_id, participation_id, submission_id, actor_user_id,
      actor_type, event_type, from_status, to_status,
      metadata
    ) values (
      p_project_id, v_participation.id, v_submission_id, p_user_id,
      'participant', 'submission_submitted', v_participation.status, 'submitted',
      jsonb_build_object('version', v_version)
    );
  elsif v_participation.status = 'joined' then
    update public.ascend_project_participations
    set status = 'in_progress', started_at = coalesce(started_at, now())
    where id = v_participation.id;
  end if;

  return query select v_submission_id, v_status, v_version;
end;
$$;

revoke execute on function public.ascend_save_project_submission(uuid, text, jsonb, text, boolean)
from public, anon, authenticated;

grant execute on function public.ascend_save_project_submission(uuid, text, jsonb, text, boolean)
to service_role;

commit;
