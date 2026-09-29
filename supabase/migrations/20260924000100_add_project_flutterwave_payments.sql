begin;

create table if not exists public.ascend_project_payment_profiles (
  id uuid primary key default gen_random_uuid(), user_id text not null unique,
  provider text not null default 'flutterwave' check (provider in ('flutterwave')),
  provider_beneficiary_id text not null,
  bank_code text not null check (char_length(trim(bank_code)) between 2 and 20),
  bank_name text not null check (char_length(trim(bank_name)) between 2 and 160),
  account_name text not null check (char_length(trim(account_name)) between 2 and 200),
  account_last4 text not null check (account_last4 ~ '^[0-9]{4}$'),
  currency text not null default 'NGN' check (currency ~ '^[A-Z]{3}$'),
  verification_status text not null default 'verified' check (verification_status in ('verified','requires_update','disabled')),
  verified_at timestamptz not null default now(), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

alter table public.ascend_project_reward_deliveries
  add column if not exists payment_provider text,
  add column if not exists provider_transfer_id text,
  add column if not exists transfer_reference text,
  add column if not exists initiated_by text,
  add column if not exists initiated_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists failure_reason text,
  add column if not exists last_verified_at timestamptz;

alter table public.ascend_project_reward_deliveries drop constraint if exists ascend_project_reward_deliveries_payment_provider_check;
alter table public.ascend_project_reward_deliveries add constraint ascend_project_reward_deliveries_payment_provider_check check (payment_provider is null or payment_provider in ('flutterwave'));
create unique index if not exists ascend_project_reward_transfer_reference_key on public.ascend_project_reward_deliveries(transfer_reference) where transfer_reference is not null;
create index if not exists ascend_project_reward_payout_queue_idx on public.ascend_project_reward_deliveries(status, created_at) where amount_minor is not null;
drop trigger if exists ascend_project_payment_profiles_updated_at on public.ascend_project_payment_profiles;
create trigger ascend_project_payment_profiles_updated_at before update on public.ascend_project_payment_profiles for each row execute function public.ascend_projects_set_updated_at();
alter table public.ascend_project_payment_profiles enable row level security;
revoke all on public.ascend_project_payment_profiles from public, anon, authenticated;
grant all on public.ascend_project_payment_profiles to service_role;
comment on table public.ascend_project_payment_profiles is 'Server-only payout destinations. Full bank account numbers are never persisted; Flutterwave beneficiary IDs are used for transfers.';
commit;
