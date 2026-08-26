begin;

create table if not exists public.ascend_work_access_grants (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  source text not null check (source in ('individual', 'university', 'corporate', 'foundation', 'pilot', 'admin')),
  status text not null default 'active' check (status in ('active', 'expired', 'revoked')),
  plan_code text not null default 'ascend_full',
  sponsor_name text,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);

create table if not exists public.ascend_work_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 140),
  website text,
  contact_name text,
  contact_email text,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'rejected', 'suspended')),
  verification_notes text,
  created_by text not null,
  verified_by text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ascend_work_projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.ascend_work_organizations(id) on delete restrict,
  title text not null check (char_length(trim(title)) between 4 and 100),
  summary text not null check (char_length(trim(summary)) between 20 and 320),
  description text not null check (char_length(trim(description)) between 40 and 5000),
  category text not null check (char_length(trim(category)) between 2 and 80),
  required_skills text[] not null default '{}',
  deliverables text[] not null default '{}',
  payment_amount_minor bigint not null check (payment_amount_minor > 0),
  currency text not null default 'NGN' check (currency ~ '^[A-Z]{3}$'),
  estimated_hours integer not null check (estimated_hours between 1 and 160),
  available_slots integer not null default 1 check (available_slots between 1 and 100),
  application_deadline timestamptz not null,
  delivery_deadline timestamptz not null,
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'paused', 'closed', 'completed', 'cancelled')),
  created_by text not null,
  reviewed_by text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (delivery_deadline > application_deadline),
  check (status <> 'published' or published_at is not null)
);

create table if not exists public.ascend_work_applications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.ascend_work_projects(id) on delete restrict,
  user_id text not null,
  cover_note text not null default '' check (char_length(cover_note) <= 1200),
  status text not null default 'submitted' check (status in ('submitted', 'shortlisted', 'accepted', 'rejected', 'withdrawn', 'completed', 'disputed')),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create index if not exists ascend_work_access_grants_user_active_idx
  on public.ascend_work_access_grants (user_id, status, ends_at);
create index if not exists ascend_work_projects_status_deadline_idx
  on public.ascend_work_projects (status, application_deadline, published_at desc);
create index if not exists ascend_work_projects_organization_idx
  on public.ascend_work_projects (organization_id);
create index if not exists ascend_work_applications_user_idx
  on public.ascend_work_applications (user_id, submitted_at desc);
create index if not exists ascend_work_applications_project_status_idx
  on public.ascend_work_applications (project_id, status);

create or replace function public.ascend_work_set_updated_at()
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

drop trigger if exists ascend_work_access_grants_updated_at on public.ascend_work_access_grants;
create trigger ascend_work_access_grants_updated_at before update on public.ascend_work_access_grants
for each row execute function public.ascend_work_set_updated_at();
drop trigger if exists ascend_work_organizations_updated_at on public.ascend_work_organizations;
create trigger ascend_work_organizations_updated_at before update on public.ascend_work_organizations
for each row execute function public.ascend_work_set_updated_at();
drop trigger if exists ascend_work_projects_updated_at on public.ascend_work_projects;
create trigger ascend_work_projects_updated_at before update on public.ascend_work_projects
for each row execute function public.ascend_work_set_updated_at();
drop trigger if exists ascend_work_applications_updated_at on public.ascend_work_applications;
create trigger ascend_work_applications_updated_at before update on public.ascend_work_applications
for each row execute function public.ascend_work_set_updated_at();

alter table public.ascend_work_access_grants enable row level security;
alter table public.ascend_work_organizations enable row level security;
alter table public.ascend_work_projects enable row level security;
alter table public.ascend_work_applications enable row level security;

revoke all on public.ascend_work_access_grants, public.ascend_work_organizations,
  public.ascend_work_projects, public.ascend_work_applications
from public, anon, authenticated;
revoke all on all sequences in schema public from public, anon, authenticated;
revoke execute on function public.ascend_work_set_updated_at() from public, anon, authenticated;

grant all on public.ascend_work_access_grants, public.ascend_work_organizations,
  public.ascend_work_projects, public.ascend_work_applications
to service_role;
grant all on all sequences in schema public to service_role;
grant execute on function public.ascend_work_set_updated_at() to service_role;

commit;
