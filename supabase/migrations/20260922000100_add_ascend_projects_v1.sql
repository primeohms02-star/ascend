begin;

create table if not exists public.ascend_project_sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 140),
  website text,
  contact_name text,
  contact_email text,
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'information_required', 'verified', 'restricted', 'rejected', 'suspended')),
  verification_notes text,
  created_by text not null,
  verified_by text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ascend_projects (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid references public.ascend_project_sponsors(id) on delete restrict,
  project_type text not null check (project_type in ('practice', 'reward')),
  entry_mode text not null default 'open' check (entry_mode in ('open', 'reviewed')),
  title text not null check (char_length(trim(title)) between 4 and 120),
  summary text not null check (char_length(trim(summary)) between 20 and 360),
  brief text not null check (char_length(trim(brief)) between 40 and 8000),
  category text not null check (char_length(trim(category)) between 2 and 80),
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  skills text[] not null default '{}',
  deliverables text[] not null default '{}',
  eligibility jsonb not null default '{}'::jsonb check (jsonb_typeof(eligibility) = 'object'),
  resources jsonb not null default '[]'::jsonb check (jsonb_typeof(resources) = 'array'),
  estimated_minutes integer not null check (estimated_minutes between 15 and 12000),
  capacity integer check (capacity is null or capacity between 1 and 100000),
  feedback_level text not null default 'completion_only'
    check (feedback_level in ('individual', 'scored', 'general', 'completion_only')),
  ai_policy text not null default 'limited' check (ai_policy in ('allowed', 'limited', 'restricted')),
  ai_policy_detail text,
  rights_model text not null default 'portfolio'
    check (rights_model in ('portfolio', 'selected_use', 'licensed_use')),
  usage_terms text not null check (char_length(trim(usage_terms)) between 20 and 5000),
  starts_at timestamptz,
  join_deadline timestamptz,
  submission_deadline timestamptz not null,
  results_at timestamptz,
  status text not null default 'draft'
    check (status in ('draft', 'review', 'scheduled', 'published', 'paused', 'submissions_closed', 'reviewing', 'results_ready', 'completed', 'cancelled')),
  published_at timestamptz,
  created_by text not null,
  reviewed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (join_deadline is null or join_deadline <= submission_deadline),
  check (starts_at is null or starts_at <= submission_deadline),
  check (results_at is null or results_at >= submission_deadline),
  check (status not in ('scheduled', 'published', 'paused', 'submissions_closed', 'reviewing', 'results_ready', 'completed') or published_at is not null)
);

create table if not exists public.ascend_project_criteria (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.ascend_projects(id) on delete restrict,
  title text not null check (char_length(trim(title)) between 2 and 120),
  description text not null default '' check (char_length(description) <= 1000),
  weight integer not null check (weight between 1 and 100),
  position integer not null check (position between 1 and 100),
  created_at timestamptz not null default now(),
  unique (project_id, position)
);

create table if not exists public.ascend_project_participations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.ascend_projects(id) on delete restrict,
  user_id text not null,
  status text not null default 'joined'
    check (status in ('pending', 'joined', 'in_progress', 'submitted', 'revision_requested', 'completed', 'not_completed', 'awarded', 'withdrawn', 'disqualified')),
  joined_at timestamptz not null default now(),
  started_at timestamptz,
  submitted_at timestamptz,
  completed_at timestamptz,
  withdrawn_at timestamptz,
  reviewed_entry_by text,
  reviewed_entry_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create table if not exists public.ascend_project_submissions (
  id uuid primary key default gen_random_uuid(),
  participation_id uuid not null unique references public.ascend_project_participations(id) on delete restrict,
  project_id uuid not null references public.ascend_projects(id) on delete restrict,
  user_id text not null,
  deliverable_responses jsonb not null default '{}'::jsonb check (jsonb_typeof(deliverable_responses) = 'object'),
  participant_note text not null default '' check (char_length(participant_note) <= 5000),
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'revision_requested', 'accepted', 'rejected')),
  current_version integer not null default 1 check (current_version between 1 and 1000),
  revision_note text check (revision_note is null or char_length(revision_note) <= 5000),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ascend_project_submission_versions (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.ascend_project_submissions(id) on delete restrict,
  version integer not null check (version between 1 and 1000),
  deliverable_responses jsonb not null check (jsonb_typeof(deliverable_responses) = 'object'),
  participant_note text not null default '' check (char_length(participant_note) <= 5000),
  submitted_by text not null,
  created_at timestamptz not null default now(),
  unique (submission_id, version)
);

create table if not exists public.ascend_project_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.ascend_project_submissions(id) on delete restrict,
  project_id uuid not null references public.ascend_projects(id) on delete restrict,
  reviewer_user_id text not null,
  reviewer_type text not null check (reviewer_type in ('admin', 'sponsor')),
  criterion_scores jsonb not null default '{}'::jsonb check (jsonb_typeof(criterion_scores) = 'object'),
  overall_score numeric(5,2) check (overall_score is null or (overall_score >= 0 and overall_score <= 100)),
  outcome text not null check (outcome in ('completed', 'revision_requested', 'not_completed', 'award_recommended')),
  user_feedback text not null default '' check (char_length(user_feedback) <= 5000),
  private_notes text not null default '' check (char_length(private_notes) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (submission_id, reviewer_user_id)
);

create table if not exists public.ascend_project_evidence (
  id uuid primary key default gen_random_uuid(),
  participation_id uuid not null unique references public.ascend_project_participations(id) on delete restrict,
  project_id uuid not null references public.ascend_projects(id) on delete restrict,
  user_id text not null,
  title text not null,
  summary text not null,
  skills text[] not null default '{}',
  deliverable_preview jsonb not null default '{}'::jsonb check (jsonb_typeof(deliverable_preview) = 'object'),
  evidence_status text not null check (evidence_status in ('completed', 'verified', 'awarded')),
  visibility text not null default 'private'
    check (visibility in ('private', 'approved_organizations', 'shareable', 'public')),
  share_token uuid unique,
  verified_by text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (visibility <> 'shareable' or share_token is not null),
  check (evidence_status = 'completed' or (verified_by is not null and verified_at is not null))
);

create table if not exists public.ascend_project_rewards (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.ascend_projects(id) on delete restrict,
  reward_model text not null check (reward_model in ('winner', 'completion', 'non_cash')),
  recipient_count integer not null check (recipient_count between 1 and 100000),
  amount_minor bigint,
  currency text,
  non_cash_description text,
  funding_status text not null default 'draft'
    check (funding_status in ('draft', 'awaiting_confirmation', 'confirmed', 'secured', 'cancelled')),
  funding_reference text,
  payment_owner text,
  expected_delivery_at timestamptz,
  confirmed_by text,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (reward_model in ('winner', 'completion') and amount_minor is not null and amount_minor > 0 and currency is not null and currency ~ '^[A-Z]{3}$')
    or
    (reward_model = 'non_cash' and non_cash_description is not null and char_length(trim(non_cash_description)) >= 5)
  ),
  check (funding_status not in ('confirmed', 'secured') or (confirmed_by is not null and confirmed_at is not null))
);

create table if not exists public.ascend_project_reward_deliveries (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid not null references public.ascend_project_rewards(id) on delete restrict,
  participation_id uuid not null unique references public.ascend_project_participations(id) on delete restrict,
  user_id text not null,
  amount_minor bigint,
  currency text,
  benefit_description text,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'information_required', 'processing', 'delivered', 'issue_reported', 'resolved', 'cancelled')),
  provider_reference text,
  delivered_at timestamptz,
  issue_note text check (issue_note is null or char_length(issue_note) <= 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (amount_minor is null or amount_minor > 0),
  check (currency is null or currency ~ '^[A-Z]{3}$')
);

create table if not exists public.ascend_project_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  project_id uuid references public.ascend_projects(id) on delete restrict,
  participation_id uuid references public.ascend_project_participations(id) on delete restrict,
  title text not null check (char_length(trim(title)) between 3 and 160),
  message text not null check (char_length(trim(message)) between 3 and 1000),
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ascend_project_audit_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.ascend_projects(id) on delete restrict,
  participation_id uuid references public.ascend_project_participations(id) on delete restrict,
  submission_id uuid references public.ascend_project_submissions(id) on delete restrict,
  actor_user_id text,
  actor_type text not null check (actor_type in ('participant', 'sponsor', 'admin', 'system')),
  event_type text not null check (char_length(trim(event_type)) between 3 and 120),
  from_status text,
  to_status text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists ascend_projects_public_idx
  on public.ascend_projects(status, project_type, submission_deadline, published_at desc);
create index if not exists ascend_projects_category_idx
  on public.ascend_projects(category, difficulty, status);
create index if not exists ascend_projects_sponsor_idx
  on public.ascend_projects(sponsor_id, status, updated_at desc);
create index if not exists ascend_project_participations_user_idx
  on public.ascend_project_participations(user_id, updated_at desc);
create index if not exists ascend_project_participations_project_status_idx
  on public.ascend_project_participations(project_id, status, joined_at);
create index if not exists ascend_project_submissions_project_status_idx
  on public.ascend_project_submissions(project_id, status, updated_at desc);
create index if not exists ascend_project_reviews_project_idx
  on public.ascend_project_reviews(project_id, created_at desc);
create index if not exists ascend_project_evidence_user_idx
  on public.ascend_project_evidence(user_id, visibility, created_at desc);
create index if not exists ascend_project_reward_deliveries_user_idx
  on public.ascend_project_reward_deliveries(user_id, status, updated_at desc);
create index if not exists ascend_project_notifications_user_idx
  on public.ascend_project_notifications(user_id, read_at, created_at desc);
create index if not exists ascend_project_audit_project_idx
  on public.ascend_project_audit_events(project_id, created_at desc);

create or replace function public.ascend_projects_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'ascend_project_sponsors',
    'ascend_projects',
    'ascend_project_participations',
    'ascend_project_submissions',
    'ascend_project_reviews',
    'ascend_project_evidence',
    'ascend_project_rewards',
    'ascend_project_reward_deliveries'
  ] loop
    execute format('drop trigger if exists %I on public.%I', table_name || '_updated_at', table_name);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.ascend_projects_set_updated_at()',
      table_name || '_updated_at',
      table_name
    );
  end loop;
end;
$$;

alter table public.ascend_project_sponsors enable row level security;
alter table public.ascend_projects enable row level security;
alter table public.ascend_project_criteria enable row level security;
alter table public.ascend_project_participations enable row level security;
alter table public.ascend_project_submissions enable row level security;
alter table public.ascend_project_submission_versions enable row level security;
alter table public.ascend_project_reviews enable row level security;
alter table public.ascend_project_evidence enable row level security;
alter table public.ascend_project_rewards enable row level security;
alter table public.ascend_project_reward_deliveries enable row level security;
alter table public.ascend_project_notifications enable row level security;
alter table public.ascend_project_audit_events enable row level security;

revoke all on public.ascend_project_sponsors, public.ascend_projects,
  public.ascend_project_criteria, public.ascend_project_participations,
  public.ascend_project_submissions, public.ascend_project_submission_versions,
  public.ascend_project_reviews, public.ascend_project_evidence,
  public.ascend_project_rewards, public.ascend_project_reward_deliveries,
  public.ascend_project_notifications, public.ascend_project_audit_events
from public, anon, authenticated;

revoke execute on function public.ascend_projects_set_updated_at() from public, anon, authenticated;
revoke execute on function public.ascend_join_project(uuid, text) from public, anon, authenticated;

grant all on public.ascend_project_sponsors, public.ascend_projects,
  public.ascend_project_criteria, public.ascend_project_participations,
  public.ascend_project_submissions, public.ascend_project_submission_versions,
  public.ascend_project_reviews, public.ascend_project_evidence,
  public.ascend_project_rewards, public.ascend_project_reward_deliveries,
  public.ascend_project_notifications, public.ascend_project_audit_events
to service_role;

grant execute on function public.ascend_projects_set_updated_at() to service_role;
grant execute on function public.ascend_join_project(uuid, text) to service_role;

commit;
