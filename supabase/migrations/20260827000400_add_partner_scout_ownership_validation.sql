alter table public.ascend_work_scout_signals
  add column if not exists site_identity text,
  add column if not exists contact_url text,
  add column if not exists organization_kind text not null default 'unverified'
    check (organization_kind in ('unverified','organisation','publisher','directory')),
  add column if not exists ownership_verified boolean not null default false;

create index if not exists ascend_work_scout_signals_validated_idx
  on public.ascend_work_scout_signals (ownership_verified, organization_kind, confidence desc);
