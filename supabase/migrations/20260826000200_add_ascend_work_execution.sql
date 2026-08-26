begin;

create table if not exists public.ascend_work_submissions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.ascend_work_applications(id) on delete restrict,
  project_id uuid not null references public.ascend_work_projects(id) on delete restrict,
  user_id text not null,
  deliverable_responses jsonb not null default '[]'::jsonb,
  student_note text not null default '' check (char_length(student_note) <= 3000),
  status text not null default 'draft' check (status in ('draft', 'submitted', 'revision_requested', 'approved')),
  revision_note text check (revision_note is null or char_length(revision_note) <= 3000),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ascend_work_audit_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.ascend_work_projects(id) on delete restrict,
  application_id uuid references public.ascend_work_applications(id) on delete restrict,
  actor_user_id text,
  actor_type text not null check (actor_type in ('student', 'admin', 'system')),
  event_type text not null check (char_length(event_type) between 3 and 100),
  from_status text,
  to_status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ascend_work_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null check (char_length(title) between 3 and 160),
  message text not null check (char_length(message) between 3 and 1000),
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ascend_work_verified_evidence (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.ascend_work_applications(id) on delete restrict,
  project_id uuid not null references public.ascend_work_projects(id) on delete restrict,
  user_id text not null,
  organization_name text not null,
  title text not null,
  summary text not null,
  skills text[] not null default '{}',
  deliverables jsonb not null default '[]'::jsonb,
  verified_by text not null,
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists ascend_work_submissions_user_idx
  on public.ascend_work_submissions (user_id, updated_at desc);
create index if not exists ascend_work_submissions_project_status_idx
  on public.ascend_work_submissions (project_id, status, updated_at desc);
create index if not exists ascend_work_audit_project_idx
  on public.ascend_work_audit_events (project_id, created_at desc);
create index if not exists ascend_work_audit_application_idx
  on public.ascend_work_audit_events (application_id, created_at desc);
create index if not exists ascend_work_notifications_user_idx
  on public.ascend_work_notifications (user_id, read_at, created_at desc);
create index if not exists ascend_work_verified_evidence_user_idx
  on public.ascend_work_verified_evidence (user_id, verified_at desc);

drop trigger if exists ascend_work_submissions_updated_at on public.ascend_work_submissions;
create trigger ascend_work_submissions_updated_at before update on public.ascend_work_submissions
for each row execute function public.ascend_work_set_updated_at();

create or replace function public.ascend_work_transition_application(
  p_application_id uuid,
  p_admin_user_id text,
  p_action text
)
returns table(application_id uuid, application_status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_application public.ascend_work_applications%rowtype;
  v_project public.ascend_work_projects%rowtype;
  v_next_status text;
  v_occupied integer;
begin
  if p_admin_user_id is null or char_length(trim(p_admin_user_id)) < 3 then
    raise exception 'ASCEND_WORK_INVALID_ADMIN';
  end if;

  select * into v_application
  from public.ascend_work_applications
  where id = p_application_id
  for update;
  if not found then raise exception 'ASCEND_WORK_APPLICATION_NOT_FOUND'; end if;

  select * into v_project
  from public.ascend_work_projects
  where id = v_application.project_id
  for update;
  if not found then raise exception 'ASCEND_WORK_PROJECT_NOT_FOUND'; end if;

  if p_action = 'shortlist' then
    if v_application.status <> 'submitted' then raise exception 'ASCEND_WORK_INVALID_TRANSITION'; end if;
    v_next_status := 'shortlisted';
  elsif p_action = 'reject' then
    if v_application.status not in ('submitted', 'shortlisted') then raise exception 'ASCEND_WORK_INVALID_TRANSITION'; end if;
    v_next_status := 'rejected';
  elsif p_action = 'accept' then
    if v_application.status not in ('submitted', 'shortlisted') then raise exception 'ASCEND_WORK_INVALID_TRANSITION'; end if;
    select count(*) into v_occupied
    from public.ascend_work_applications
    where project_id = v_application.project_id
      and status in ('accepted', 'completed', 'disputed');
    if v_occupied >= v_project.available_slots then raise exception 'ASCEND_WORK_NO_SLOTS'; end if;
    v_next_status := 'accepted';
  else
    raise exception 'ASCEND_WORK_INVALID_ACTION';
  end if;

  update public.ascend_work_applications
  set status = v_next_status
  where id = v_application.id;

  insert into public.ascend_work_audit_events (
    project_id, application_id, actor_user_id, actor_type, event_type, from_status, to_status
  ) values (
    v_application.project_id, v_application.id, p_admin_user_id, 'admin',
    'application_' || v_next_status, v_application.status, v_next_status
  );

  insert into public.ascend_work_notifications (user_id, title, message, href)
  values (
    v_application.user_id,
    case v_next_status
      when 'shortlisted' then 'Application shortlisted'
      when 'accepted' then 'Paid Mission application accepted'
      else 'Application update'
    end,
    case v_next_status
      when 'shortlisted' then 'Your application for “' || v_project.title || '” has been shortlisted.'
      when 'accepted' then 'You were selected for “' || v_project.title || '”. Your project workspace is ready.'
      else 'Your application for “' || v_project.title || '” was not selected for this pilot.'
    end,
    '/work/applications/' || v_application.id::text
  );

  if v_next_status = 'accepted' then
    insert into public.ascend_work_submissions (application_id, project_id, user_id)
    values (v_application.id, v_application.project_id, v_application.user_id)
    on conflict (application_id) do nothing;
  end if;

  return query select v_application.id, v_next_status;
end;
$$;

create or replace function public.ascend_work_review_submission(
  p_submission_id uuid,
  p_admin_user_id text,
  p_action text,
  p_revision_note text default null
)
returns table(submission_id uuid, submission_status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_submission public.ascend_work_submissions%rowtype;
  v_application public.ascend_work_applications%rowtype;
  v_project public.ascend_work_projects%rowtype;
  v_organization_name text;
  v_next_status text;
begin
  if p_admin_user_id is null or char_length(trim(p_admin_user_id)) < 3 then
    raise exception 'ASCEND_WORK_INVALID_ADMIN';
  end if;

  select * into v_submission from public.ascend_work_submissions
  where id = p_submission_id for update;
  if not found then raise exception 'ASCEND_WORK_SUBMISSION_NOT_FOUND'; end if;
  if v_submission.status <> 'submitted' then raise exception 'ASCEND_WORK_INVALID_TRANSITION'; end if;

  select * into v_application from public.ascend_work_applications
  where id = v_submission.application_id for update;
  select * into v_project from public.ascend_work_projects
  where id = v_submission.project_id for update;
  select name into v_organization_name from public.ascend_work_organizations
  where id = v_project.organization_id;

  if p_action = 'request_revision' then
    if p_revision_note is null or char_length(trim(p_revision_note)) < 5 then
      raise exception 'ASCEND_WORK_REVISION_NOTE_REQUIRED';
    end if;
    v_next_status := 'revision_requested';
    update public.ascend_work_submissions
    set status = v_next_status, revision_note = trim(p_revision_note), reviewed_at = now(), reviewed_by = p_admin_user_id
    where id = v_submission.id;
  elsif p_action = 'approve' then
    v_next_status := 'approved';
    update public.ascend_work_submissions
    set status = v_next_status, revision_note = null, reviewed_at = now(), reviewed_by = p_admin_user_id
    where id = v_submission.id;
    update public.ascend_work_applications set status = 'completed' where id = v_application.id;
    insert into public.ascend_work_verified_evidence (
      application_id, project_id, user_id, organization_name, title, summary,
      skills, deliverables, verified_by
    ) values (
      v_application.id, v_project.id, v_application.user_id,
      coalesce(v_organization_name, 'Verified organisation'), v_project.title,
      v_project.summary, v_project.required_skills, v_submission.deliverable_responses,
      p_admin_user_id
    ) on conflict (application_id) do nothing;
  else
    raise exception 'ASCEND_WORK_INVALID_ACTION';
  end if;

  insert into public.ascend_work_audit_events (
    project_id, application_id, actor_user_id, actor_type, event_type, from_status, to_status,
    metadata
  ) values (
    v_project.id, v_application.id, p_admin_user_id, 'admin',
    case when p_action = 'approve' then 'submission_approved' else 'submission_revision_requested' end,
    v_submission.status, v_next_status,
    case when p_action = 'request_revision' then jsonb_build_object('revision_note', trim(p_revision_note)) else '{}'::jsonb end
  );

  insert into public.ascend_work_notifications (user_id, title, message, href)
  values (
    v_application.user_id,
    case when p_action = 'approve' then 'Paid Mission approved' else 'Revision requested' end,
    case when p_action = 'approve'
      then 'Your work for “' || v_project.title || '” was approved and added to your verified evidence.'
      else 'A revision was requested for “' || v_project.title || '”. Open the workspace for feedback.'
    end,
    '/work/applications/' || v_application.id::text
  );

  return query select v_submission.id, v_next_status;
end;
$$;

alter table public.ascend_work_submissions enable row level security;
alter table public.ascend_work_audit_events enable row level security;
alter table public.ascend_work_notifications enable row level security;
alter table public.ascend_work_verified_evidence enable row level security;

revoke all on public.ascend_work_submissions, public.ascend_work_audit_events,
  public.ascend_work_notifications, public.ascend_work_verified_evidence
from public, anon, authenticated;
revoke execute on function public.ascend_work_transition_application(uuid, text, text)
from public, anon, authenticated;
revoke execute on function public.ascend_work_review_submission(uuid, text, text, text)
from public, anon, authenticated;

grant all on public.ascend_work_submissions, public.ascend_work_audit_events,
  public.ascend_work_notifications, public.ascend_work_verified_evidence
to service_role;
grant execute on function public.ascend_work_transition_application(uuid, text, text)
to service_role;
grant execute on function public.ascend_work_review_submission(uuid, text, text, text)
to service_role;

commit;
