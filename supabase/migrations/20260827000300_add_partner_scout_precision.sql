alter table public.ascend_work_scout_signals
  add column if not exists source_quality integer not null default 50 check (source_quality between 0 and 100),
  add column if not exists opportunity_fit integer not null default 50 check (opportunity_fit between 0 and 100),
  add column if not exists need_signal text not null default 'Legacy signal—review its source manually.',
  add column if not exists precision_version integer not null default 1 check (precision_version >= 1);

create index if not exists ascend_work_scout_signals_precision_idx
  on public.ascend_work_scout_signals (precision_version, source_quality desc, opportunity_fit desc);
