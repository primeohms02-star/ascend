alter table public.ascend_work_scout_signals
  add column if not exists cross_source_verified boolean not null default false,
  add column if not exists confirmation_url text;

create index if not exists ascend_work_scout_signals_consensus_idx
  on public.ascend_work_scout_signals (cross_source_verified, precision_version, confidence desc);

update public.ascend_work_scout_signals
set status = 'dismissed',
    updated_at = timezone('utc', now())
where precision_version < 5
  and status in ('new', 'reviewing');
