begin;

-- Test records never update the real reward-delivery ledger. Existing v3 data is retained.
create table public.ascend_project_sandbox_profiles (
  user_id text primary key,
  recipient_id text not null check (recipient_id ~ '^rcb_[A-Za-z0-9_-]+$'),
  bank_code text not null,
  bank_name text not null,
  account_name text not null,
  account_last4 text not null check (account_last4 ~ '^[0-9]{4}$'),
  verified_at timestamptz not null default now()
);
create table public.ascend_project_sandbox_payouts (
  delivery_id uuid primary key references public.ascend_project_reward_deliveries(id) on delete restrict,
  transfer_reference text not null unique,
  recipient_id text not null,
  amount_minor bigint not null check (amount_minor between 1 and 9007199254740991),
  currency text not null default 'NGN' check (currency = 'NGN'),
  state text not null default 'reserved' check (state in ('reserved','pending','succeeded','failed','unknown')),
  provider_transfer_id text unique,
  initiated_by text not null,
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  check (provider_transfer_id is null or provider_transfer_id ~ '^trf_[A-Za-z0-9_-]+$')
);
alter table public.ascend_project_sandbox_profiles enable row level security;
alter table public.ascend_project_sandbox_payouts enable row level security;
revoke all on public.ascend_project_sandbox_profiles, public.ascend_project_sandbox_payouts from public, anon, authenticated;
grant all on public.ascend_project_sandbox_profiles, public.ascend_project_sandbox_payouts to service_role;

create function public.ascend_reserve_sandbox_payout(p_delivery_id uuid, p_admin_id text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_delivery public.ascend_project_reward_deliveries%rowtype;
  v_reward public.ascend_project_rewards%rowtype;
  v_profile public.ascend_project_sandbox_profiles%rowtype;
  v_attempt public.ascend_project_sandbox_payouts%rowtype;
begin
  if p_admin_id is null or length(trim(p_admin_id)) = 0 then raise exception 'SANDBOX_INVALID_ADMIN'; end if;
  select * into v_delivery from public.ascend_project_reward_deliveries where id = p_delivery_id for update;
  if not found then raise exception 'SANDBOX_DELIVERY_NOT_FOUND'; end if;
  if v_delivery.status not in ('confirmed','information_required')
    or v_delivery.provider_transfer_id is not null or v_delivery.transfer_reference is not null
    or v_delivery.currency is distinct from 'NGN' or v_delivery.amount_minor is null
    or v_delivery.amount_minor not between 1 and 9007199254740991 then
    raise exception 'SANDBOX_DELIVERY_INELIGIBLE';
  end if;
  select * into v_reward from public.ascend_project_rewards where id = v_delivery.reward_id for share;
  if not found or v_reward.funding_status not in ('confirmed','secured')
    or v_reward.reward_model not in ('winner','completion')
    or v_reward.currency is distinct from 'NGN'
    or v_reward.amount_minor is distinct from v_delivery.amount_minor
    or nullif(trim(v_reward.funding_reference),'') is null then
    raise exception 'SANDBOX_FUNDING_REQUIRED';
  end if;
  select * into v_profile from public.ascend_project_sandbox_profiles where user_id = v_delivery.user_id for share;
  if not found then raise exception 'SANDBOX_PROFILE_REQUIRED'; end if;
  if exists(select 1 from public.ascend_project_sandbox_payouts where delivery_id = p_delivery_id) then
    raise exception 'SANDBOX_ALREADY_RESERVED';
  end if;
  insert into public.ascend_project_sandbox_payouts(delivery_id, transfer_reference, recipient_id, amount_minor, initiated_by)
    values(p_delivery_id, 'asc-t4-' || replace(p_delivery_id::text,'-',''), v_profile.recipient_id, v_delivery.amount_minor, p_admin_id)
    returning * into v_attempt;
  insert into public.ascend_project_audit_events(project_id, participation_id, actor_user_id, actor_type, event_type, to_status, metadata)
    values(v_reward.project_id, v_delivery.participation_id, p_admin_id, 'admin', 'sandbox_payout_reserved', 'reserved',
      jsonb_build_object('delivery_id',p_delivery_id,'mode','test','reference',v_attempt.transfer_reference));
  return to_jsonb(v_attempt);
end;
$$;

create function public.ascend_record_sandbox_payout(
  p_delivery_id uuid, p_transfer_id text, p_reference text, p_recipient_id text,
  p_amount_minor bigint, p_source_currency text, p_destination_currency text, p_state text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_attempt public.ascend_project_sandbox_payouts%rowtype;
  v_project_id uuid;
  v_participation_id uuid;
  v_state text;
begin
  select * into v_attempt from public.ascend_project_sandbox_payouts where delivery_id = p_delivery_id for update;
  if not found then raise exception 'SANDBOX_ATTEMPT_NOT_FOUND'; end if;
  if p_transfer_id is null or p_transfer_id !~ '^trf_[A-Za-z0-9_-]+$'
    or p_reference is distinct from v_attempt.transfer_reference
    or p_recipient_id is distinct from v_attempt.recipient_id
    or p_amount_minor is distinct from v_attempt.amount_minor
    or p_source_currency is distinct from 'NGN' or p_destination_currency is distinct from 'NGN'
    or (v_attempt.provider_transfer_id is not null and v_attempt.provider_transfer_id is distinct from p_transfer_id)
    or p_state is null or p_state not in ('pending','succeeded','failed','unknown') then
    raise exception 'SANDBOX_TRANSFER_MISMATCH';
  end if;
  -- Delayed notifications must not undo a verified success or downgrade a failure to pending.
  v_state := case when v_attempt.state = 'succeeded' then 'succeeded'
    when v_attempt.state = 'failed' and p_state in ('pending','unknown') then 'failed' else p_state end;
  update public.ascend_project_sandbox_payouts set provider_transfer_id = p_transfer_id, state = v_state, verified_at = now()
    where delivery_id = p_delivery_id;
  if v_attempt.state is distinct from v_state or v_attempt.provider_transfer_id is null then
    select r.project_id, d.participation_id into v_project_id, v_participation_id
      from public.ascend_project_reward_deliveries d join public.ascend_project_rewards r on r.id = d.reward_id where d.id = p_delivery_id;
    insert into public.ascend_project_audit_events(project_id,participation_id,actor_type,event_type,from_status,to_status,metadata)
      values(v_project_id,v_participation_id,'system','sandbox_payout_verified',v_attempt.state,v_state,
        jsonb_build_object('delivery_id',p_delivery_id,'mode','test','transfer_id',p_transfer_id));
  end if;
  return jsonb_build_object('delivery_id',p_delivery_id,'state',v_state,'mode','test');
end;
$$;
revoke all on function public.ascend_reserve_sandbox_payout(uuid,text) from public, anon, authenticated;
revoke all on function public.ascend_record_sandbox_payout(uuid,text,text,text,bigint,text,text,text) from public, anon, authenticated;
grant execute on function public.ascend_reserve_sandbox_payout(uuid,text) to service_role;
grant execute on function public.ascend_record_sandbox_payout(uuid,text,text,text,bigint,text,text,text) to service_role;
comment on table public.ascend_project_sandbox_payouts is 'Flutterwave v4 test simulations only. Success is not payment and does not settle any real reward.';
commit;
