create table if not exists public.ascend_work_partner_leads (
  id uuid primary key default gen_random_uuid(),
  organization_name text not null check (char_length(organization_name) between 2 and 140),
  website text,
  contact_name text not null,
  contact_email text not null,
  contact_role text,
  organization_type text not null,
  task_category text not null,
  task_summary text not null check (char_length(task_summary) between 40 and 2000),
  expected_deliverables text,
  budget_range text not null,
  estimated_hours text not null,
  preferred_start_date date,
  student_audience text,
  funding_confirmed boolean not null default false,
  stage text not null default 'new' check (stage in ('new','contacted','interested','verification','mission_proposed','funding_secured','published','completed','repeat_partner','declined')),
  source text not null default 'public_form',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ascend_work_partner_leads_attention_idx on public.ascend_work_partner_leads (stage, updated_at desc);
alter table public.ascend_work_partner_leads enable row level security;
revoke all on table public.ascend_work_partner_leads from anon, authenticated;
grant all on table public.ascend_work_partner_leads to service_role;
