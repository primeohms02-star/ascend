begin;

/*
 * Canonical ASCEND mission lifecycle.
 *
 * This migration is additive and preserves all existing profiles,
 * missions, onboarding context, progress, momentum, streaks and memory.
 */

create table if not exists public.atlas_mission_operations (
  operation_id uuid primary key,
  user_id text not null,
  operation_type text not null check (
    operation_type in ('onboarding_replace', 'complete')
  ),
  request_payload jsonb not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists atlas_mission_operations_user_created_index
  on public.atlas_mission_operations (user_id, created_at desc);

create unique index if not exists atlas_missions_one_active_per_user
  on public.atlas_missions (user_id)
  where status = 'active';

alter table public.atlas_onboarding_context
  add column if not exists direction_fact_id uuid null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'atlas_onboarding_context_direction_fact_id_fkey'
      and conrelid = 'public.atlas_onboarding_context'::regclass
  ) then
    alter table public.atlas_onboarding_context
      add constraint atlas_onboarding_context_direction_fact_id_fkey
      foreign key (direction_fact_id)
      references public.atlas_facts (id)
      on delete set null;
  end if;
end;
$$;

create or replace function public.replace_atlas_mission(
  p_user_id text,
  p_operation_id uuid,
  p_identity text,
  p_goal text,
  p_challenges text[],
  p_north_star text,
  p_direction_fact text,
  p_previous_direction_fact text,
  p_mission text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request jsonb;
  v_existing_operation public.atlas_mission_operations%rowtype;
  v_previous_context public.atlas_onboarding_context%rowtype;
  v_previous_mission public.atlas_missions%rowtype;
  v_new_mission public.atlas_missions%rowtype;
  v_new_fact_id uuid;
  v_memory public.atlas_memory%rowtype;
  v_is_recalibration boolean;
  v_result jsonb;
begin
  if nullif(btrim(p_user_id), '') is null
    or p_operation_id is null
    or nullif(btrim(p_identity), '') is null
    or nullif(btrim(p_goal), '') is null
    or nullif(btrim(p_north_star), '') is null
    or nullif(btrim(p_direction_fact), '') is null
    or nullif(btrim(p_mission), '') is null
    or nullif(btrim(p_reason), '') is null
  then
    raise exception 'Invalid onboarding mission lifecycle request';
  end if;

  v_request := jsonb_build_object(
    'identity', btrim(p_identity),
    'goal', btrim(p_goal),
    'challenges', to_jsonb(coalesce(p_challenges, array[]::text[])),
    'northStar', btrim(p_north_star),
    'directionFact', btrim(p_direction_fact),
    'previousDirectionFact', nullif(btrim(p_previous_direction_fact), ''),
    'mission', btrim(p_mission),
    'reason', btrim(p_reason)
  );

  perform pg_advisory_xact_lock(hashtext(p_user_id));

  select *
  into v_existing_operation
  from public.atlas_mission_operations
  where operation_id = p_operation_id;

  if found then
    if v_existing_operation.user_id <> p_user_id
      or v_existing_operation.operation_type <> 'onboarding_replace'
    then
      raise exception 'Operation ID was already used for a different request';
    end if;

    return jsonb_set(v_existing_operation.result, '{replayed}', 'true'::jsonb);
  end if;

  select *
  into v_previous_context
  from public.atlas_onboarding_context
  where user_id = p_user_id
  for update;

  v_is_recalibration := found;

  select *
  into v_previous_mission
  from public.atlas_missions
  where user_id = p_user_id
    and status = 'active'
  order by created_at desc
  limit 1
  for update;

  if found then
    update public.atlas_missions
    set status = 'replaced'
    where id = v_previous_mission.id
    returning * into v_previous_mission;
  end if;

  if v_previous_context.direction_fact_id is not null then
    delete from public.atlas_facts
    where id = v_previous_context.direction_fact_id
      and user_id = p_user_id;
  elsif nullif(btrim(p_previous_direction_fact), '') is not null then
    delete from public.atlas_facts
    where user_id = p_user_id
      and fact = btrim(p_previous_direction_fact);
  end if;

  insert into public.atlas_facts (user_id, fact)
  values (p_user_id, btrim(p_direction_fact))
  returning id into v_new_fact_id;

  insert into public.profiles (
    clerk_id,
    journey,
    north_star
  )
  values (
    p_user_id,
    btrim(p_identity),
    btrim(p_north_star)
  )
  on conflict (clerk_id)
  do update set
    journey = excluded.journey,
    north_star = excluded.north_star;

  insert into public.atlas_onboarding_context (
    user_id,
    identity,
    goal,
    challenges,
    north_star,
    direction_fact_id,
    updated_at
  )
  values (
    p_user_id,
    btrim(p_identity),
    btrim(p_goal),
    coalesce(p_challenges, array[]::text[]),
    btrim(p_north_star),
    v_new_fact_id,
    now()
  )
  on conflict (user_id)
  do update set
    identity = excluded.identity,
    goal = excluded.goal,
    challenges = excluded.challenges,
    north_star = excluded.north_star,
    direction_fact_id = excluded.direction_fact_id,
    updated_at = now();

  insert into public.atlas_missions (
    user_id,
    mission,
    reason,
    status
  )
  values (
    p_user_id,
    btrim(p_mission),
    btrim(p_reason),
    'active'
  )
  returning * into v_new_mission;

  insert into public.atlas_memory (
    user_id,
    role,
    message,
    memory_type,
    title,
    metadata
  )
  values (
    p_user_id,
    'system',
    case
      when v_is_recalibration then
        'The user intentionally updated their ASCEND direction. ' || btrim(p_direction_fact)
      else
        'ASCEND onboarding completed. ' || btrim(p_direction_fact)
    end,
    case when v_is_recalibration then 'direction' else 'onboarding' end,
    case when v_is_recalibration then 'Direction Recalibrated' else 'ASCEND Journey Started' end,
    jsonb_build_object(
      'operation_id', p_operation_id,
      'mission_id', v_new_mission.id,
      'previous_mission_id', v_previous_mission.id,
      'north_star', btrim(p_north_star)
    )
  )
  returning * into v_memory;

  v_result := jsonb_build_object(
    'operationId', p_operation_id,
    'replayed', false,
    'isRecalibration', v_is_recalibration,
    'previousMission', case
      when v_previous_mission.id is null then null
      else to_jsonb(v_previous_mission)
    end,
    'activeMission', to_jsonb(v_new_mission),
    'memory', to_jsonb(v_memory)
  );

  insert into public.atlas_mission_operations (
    operation_id,
    user_id,
    operation_type,
    request_payload,
    result
  )
  values (
    p_operation_id,
    p_user_id,
    'onboarding_replace',
    v_request,
    v_result
  );

  return v_result;
end;
$$;

create or replace function public.complete_atlas_mission(
  p_user_id text,
  p_mission_id uuid,
  p_operation_id uuid,
  p_next_mission text,
  p_next_reason text,
  p_xp_reward integer default 15
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request jsonb;
  v_existing_operation public.atlas_mission_operations%rowtype;
  v_completed_mission public.atlas_missions%rowtype;
  v_next_mission public.atlas_missions%rowtype;
  v_progress public.atlas_progress%rowtype;
  v_momentum public.atlas_momentum%rowtype;
  v_streak public.atlas_streaks%rowtype;
  v_memory public.atlas_memory%rowtype;
  v_today date := current_date;
  v_reward integer;
  v_new_score integer;
  v_new_level integer;
  v_current_streak integer;
  v_longest_streak integer;
  v_result jsonb;
begin
  if nullif(btrim(p_user_id), '') is null
    or p_mission_id is null
    or p_operation_id is null
    or nullif(btrim(p_next_mission), '') is null
    or nullif(btrim(p_next_reason), '') is null
  then
    raise exception 'Invalid mission completion request';
  end if;

  v_reward := greatest(0, coalesce(p_xp_reward, 0));

  v_request := jsonb_build_object(
    'missionId', p_mission_id,
    'nextMission', btrim(p_next_mission),
    'nextReason', btrim(p_next_reason),
    'xpReward', v_reward
  );

  perform pg_advisory_xact_lock(hashtext(p_user_id));

  select *
  into v_existing_operation
  from public.atlas_mission_operations
  where operation_id = p_operation_id;

  if found then
    if v_existing_operation.user_id <> p_user_id
      or v_existing_operation.operation_type <> 'complete'
    then
      raise exception 'Operation ID was already used for a different request';
    end if;

    return jsonb_set(v_existing_operation.result, '{replayed}', 'true'::jsonb);
  end if;

  select *
  into v_completed_mission
  from public.atlas_missions
  where id = p_mission_id
    and user_id = p_user_id
    and status = 'active'
  for update;

  if not found then
    raise exception 'Mission is not the active mission for this user';
  end if;

  update public.atlas_missions
  set
    status = 'completed',
    completed_at = now()
  where id = v_completed_mission.id
  returning * into v_completed_mission;

  insert into public.atlas_progress (
    user_id,
    ascension_score,
    level,
    updated_at
  )
  values (p_user_id, 0, 1, now())
  on conflict (user_id) do nothing;

  select *
  into v_progress
  from public.atlas_progress
  where user_id = p_user_id
  for update;

  v_new_score := greatest(0, coalesce(v_progress.ascension_score, 0) + v_reward);

  v_new_level := case
    when v_new_score >= 1000 then 10
    when v_new_score >= 750 then 9
    when v_new_score >= 550 then 8
    when v_new_score >= 400 then 7
    when v_new_score >= 275 then 6
    when v_new_score >= 175 then 5
    when v_new_score >= 100 then 4
    when v_new_score >= 50 then 3
    when v_new_score >= 15 then 2
    else 1
  end;

  update public.atlas_progress
  set
    ascension_score = v_new_score,
    level = v_new_level,
    updated_at = now()
  where user_id = p_user_id
  returning * into v_progress;

  insert into public.atlas_streaks (
    user_id,
    current_streak,
    longest_streak,
    last_mission_date,
    updated_at
  )
  values (p_user_id, 0, 0, null, now())
  on conflict (user_id) do nothing;

  select *
  into v_streak
  from public.atlas_streaks
  where user_id = p_user_id
  for update;

  if v_streak.last_mission_date = v_today then
    v_current_streak := coalesce(v_streak.current_streak, 0);
  elsif v_streak.last_mission_date = v_today - 1 then
    v_current_streak := coalesce(v_streak.current_streak, 0) + 1;
  else
    v_current_streak := 1;
  end if;

  v_longest_streak := greatest(
    v_current_streak,
    coalesce(v_streak.longest_streak, 0)
  );

  update public.atlas_streaks
  set
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_mission_date = v_today,
    updated_at = now()
  where user_id = p_user_id
  returning * into v_streak;

  insert into public.atlas_momentum (
    user_id,
    current_streak,
    longest_streak,
    completed_missions,
    skipped_missions,
    ascension_score,
    updated_at
  )
  values (p_user_id, 0, 0, 0, 0, 0, now())
  on conflict (user_id) do nothing;

  select *
  into v_momentum
  from public.atlas_momentum
  where user_id = p_user_id
  for update;

  update public.atlas_momentum
  set
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    completed_missions = coalesce(v_momentum.completed_missions, 0) + 1,
    skipped_missions = coalesce(v_momentum.skipped_missions, 0),
    ascension_score = v_new_score,
    updated_at = now()
  where user_id = p_user_id
  returning * into v_momentum;

  insert into public.atlas_missions (
    user_id,
    mission,
    reason,
    status
  )
  values (
    p_user_id,
    btrim(p_next_mission),
    btrim(p_next_reason),
    'active'
  )
  returning * into v_next_mission;

  insert into public.atlas_memory (
    user_id,
    role,
    message,
    memory_type,
    title,
    metadata
  )
  values (
    p_user_id,
    'system',
    'Completed: ' || v_completed_mission.mission,
    'mission',
    'Mission Completed',
    jsonb_build_object(
      'operation_id', p_operation_id,
      'mission_id', v_completed_mission.id,
      'mission', v_completed_mission.mission,
      'next_mission_id', v_next_mission.id,
      'xp_awarded', v_reward,
      'current_streak', v_current_streak,
      'longest_streak', v_longest_streak,
      'completed_missions', v_momentum.completed_missions,
      'ascension_score', v_new_score,
      'ascension_level', v_new_level,
      'completed_at', v_completed_mission.completed_at
    )
  )
  returning * into v_memory;

  v_result := jsonb_build_object(
    'operationId', p_operation_id,
    'replayed', false,
    'completedMission', to_jsonb(v_completed_mission),
    'activeMission', to_jsonb(v_next_mission),
    'progress', to_jsonb(v_progress),
    'momentum', to_jsonb(v_momentum),
    'streak', to_jsonb(v_streak),
    'memory', to_jsonb(v_memory),
    'xpAwarded', v_reward
  );

  insert into public.atlas_mission_operations (
    operation_id,
    user_id,
    operation_type,
    request_payload,
    result
  )
  values (
    p_operation_id,
    p_user_id,
    'complete',
    v_request,
    v_result
  );

  return v_result;
end;
$$;

revoke all on table public.atlas_mission_operations from public, anon, authenticated;
grant all on table public.atlas_mission_operations to service_role;

revoke all on function public.replace_atlas_mission(
  text, uuid, text, text, text[], text, text, text, text, text
) from public, anon, authenticated;

grant execute on function public.replace_atlas_mission(
  text, uuid, text, text, text[], text, text, text, text, text
) to service_role;

revoke all on function public.complete_atlas_mission(
  text, uuid, uuid, text, text, integer
) from public, anon, authenticated;

grant execute on function public.complete_atlas_mission(
  text, uuid, uuid, text, text, integer
) to service_role;

/*
 * Keep the superseded text-ID overload during rollout so the currently
 * deployed application remains compatible until the new routes are live.
 * A cleanup migration will remove it after deployment verification.
 */

commit;
