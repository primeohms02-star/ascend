begin;

create table if not exists public.atlas_api_rate_limits (
  user_id text not null,
  bucket text not null,
  window_start timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, bucket, window_start)
);

create index if not exists atlas_api_rate_limits_updated_index
  on public.atlas_api_rate_limits (updated_at);

alter table public.atlas_api_rate_limits enable row level security;

revoke all on table public.atlas_api_rate_limits from public, anon, authenticated;

create or replace function public.consume_atlas_rate_limit(
  p_user_id text,
  p_bucket text,
  p_window_seconds integer,
  p_max_requests integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_window_start timestamptz;
  v_current_count integer;
begin
  if nullif(btrim(p_user_id), '') is null
    or nullif(btrim(p_bucket), '') is null
    or p_window_seconds < 1
    or p_max_requests < 1
  then
    raise exception 'Invalid Atlas rate-limit request';
  end if;

  v_window_start := to_timestamp(
    floor(extract(epoch from v_now) / p_window_seconds) * p_window_seconds
  );

  perform pg_advisory_xact_lock(hashtext(p_user_id || ':' || p_bucket));

  delete from public.atlas_api_rate_limits
  where user_id = p_user_id
    and bucket = p_bucket
    and updated_at < v_now - interval '2 days';

  select request_count
  into v_current_count
  from public.atlas_api_rate_limits
  where user_id = p_user_id
    and bucket = p_bucket
    and window_start = v_window_start
  for update;

  if found and v_current_count >= p_max_requests then
    return false;
  end if;

  insert into public.atlas_api_rate_limits (
    user_id,
    bucket,
    window_start,
    request_count,
    updated_at
  )
  values (
    p_user_id,
    btrim(p_bucket),
    v_window_start,
    1,
    v_now
  )
  on conflict (user_id, bucket, window_start)
  do update set
    request_count = public.atlas_api_rate_limits.request_count + 1,
    updated_at = excluded.updated_at;

  return true;
end;
$$;

revoke all on function public.consume_atlas_rate_limit(
  text, text, integer, integer
) from public, anon, authenticated;

grant execute on function public.consume_atlas_rate_limit(
  text, text, integer, integer
) to service_role;

commit;
