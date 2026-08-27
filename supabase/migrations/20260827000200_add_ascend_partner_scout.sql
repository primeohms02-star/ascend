create table if not exists public.ascend_work_scout_runs (
  id uuid primary key default gen_random_uuid(), provider text not null, triggered_by text not null check (triggered_by in ('admin','cron')),
  status text not null check (status in ('running','completed','failed')), discovered_count integer not null default 0,
  inserted_count integer not null default 0, error_message text, started_at timestamptz not null default now(), completed_at timestamptz
);
create table if not exists public.ascend_work_scout_signals (
  id uuid primary key default gen_random_uuid(), organization_name text not null, website text not null, source_url text not null unique,
  source_title text not null, evidence text not null, suggested_category text not null, suggested_mission text not null,
  confidence integer not null check (confidence between 0 and 100), status text not null default 'new' check (status in ('new','reviewing','promoted','dismissed')),
  search_query text not null, promoted_lead_id uuid references public.ascend_work_partner_leads(id) on delete set null,
  first_seen_at timestamptz not null default now(), last_seen_at timestamptz not null default now(), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists ascend_work_scout_signals_attention_idx on public.ascend_work_scout_signals(status, confidence desc, created_at desc);
alter table public.ascend_work_scout_runs enable row level security;
alter table public.ascend_work_scout_signals enable row level security;
revoke all on table public.ascend_work_scout_runs, public.ascend_work_scout_signals from anon, authenticated;
grant all on table public.ascend_work_scout_runs, public.ascend_work_scout_signals to service_role;
