alter table public.ascend_work_scout_runs
  add column if not exists shortlisted_count integer not null default 0 check (shortlisted_count >= 0),
  add column if not exists confirmed_count integer not null default 0 check (confirmed_count >= 0),
  add column if not exists official_verified_count integer not null default 0 check (official_verified_count >= 0);

comment on column public.ascend_work_scout_runs.shortlisted_count is
  'Highest-quality Tavily candidates selected for bounded Brave confirmation.';

comment on column public.ascend_work_scout_runs.confirmed_count is
  'Shortlisted official domains independently confirmed by Brave.';

comment on column public.ascend_work_scout_runs.official_verified_count is
  'Brave-confirmed domains that passed ASCEND official-site and contact-path validation.';
