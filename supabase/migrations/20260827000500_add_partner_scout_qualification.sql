alter table public.ascend_work_scout_signals
  add column if not exists demonstrated_need text,
  add column if not exists qualification_status text not null default 'official_organisation'
    check (qualification_status in ('official_organisation', 'potential_need', 'contact_verified')),
  add column if not exists verified_contact_name text,
  add column if not exists verified_contact_email text,
  add column if not exists verified_contact_role text,
  add column if not exists contact_verified_at timestamptz;

create index if not exists ascend_work_scout_signals_qualification_idx
  on public.ascend_work_scout_signals (qualification_status, precision_version, confidence desc);

update public.ascend_work_scout_signals
set status = 'dismissed',
    updated_at = timezone('utc', now())
where precision_version < 4
  and status in ('new', 'reviewing');
