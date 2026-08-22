begin;

/*
 * New ASCEND accounts begin at Level 0. Completing the first standard
 * 15-XP mission unlocks Level 1; existing users are recalculated from their
 * earned score so progress remains evidence-based and deterministic.
 */

alter table public.atlas_progress
  alter column level set default 0;

update public.atlas_progress
set
  level = case
    when greatest(0, coalesce(ascension_score, 0)) >= 1000 then 10
    when greatest(0, coalesce(ascension_score, 0)) >= 750 then 9
    when greatest(0, coalesce(ascension_score, 0)) >= 550 then 8
    when greatest(0, coalesce(ascension_score, 0)) >= 400 then 7
    when greatest(0, coalesce(ascension_score, 0)) >= 275 then 6
    when greatest(0, coalesce(ascension_score, 0)) >= 175 then 5
    when greatest(0, coalesce(ascension_score, 0)) >= 100 then 4
    when greatest(0, coalesce(ascension_score, 0)) >= 50 then 3
    when greatest(0, coalesce(ascension_score, 0)) >= 30 then 2
    when greatest(0, coalesce(ascension_score, 0)) >= 15 then 1
    else 0
  end,
  updated_at = now()
where level is distinct from case
  when greatest(0, coalesce(ascension_score, 0)) >= 1000 then 10
  when greatest(0, coalesce(ascension_score, 0)) >= 750 then 9
  when greatest(0, coalesce(ascension_score, 0)) >= 550 then 8
  when greatest(0, coalesce(ascension_score, 0)) >= 400 then 7
  when greatest(0, coalesce(ascension_score, 0)) >= 275 then 6
  when greatest(0, coalesce(ascension_score, 0)) >= 175 then 5
  when greatest(0, coalesce(ascension_score, 0)) >= 100 then 4
  when greatest(0, coalesce(ascension_score, 0)) >= 50 then 3
  when greatest(0, coalesce(ascension_score, 0)) >= 30 then 2
  when greatest(0, coalesce(ascension_score, 0)) >= 15 then 1
  else 0
end;

/*
 * Retain the complete selected opportunity in a user's private Library.
 * This provides a durable fallback when a third-party feed rotates or
 * removes the original record after the user saved or applied to it.
 */

alter table public.atlas_opportunity_memory
  add column if not exists opportunity_data jsonb;

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
  values (p_user_id, 0, 0, now())
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
    when v_new_score >= 30 then 2
    when v_new_score >= 15 then 1
    else 0
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

revoke all on function public.complete_atlas_mission(
  text, uuid, uuid, text, text, integer
) from public, anon, authenticated;

grant execute on function public.complete_atlas_mission(
  text, uuid, uuid, text, text, integer
) to service_role;

do $$
begin
  if exists (
    select 1
    from public.atlas_progress
    where level is distinct from case
      when greatest(0, coalesce(ascension_score, 0)) >= 1000 then 10
      when greatest(0, coalesce(ascension_score, 0)) >= 750 then 9
      when greatest(0, coalesce(ascension_score, 0)) >= 550 then 8
      when greatest(0, coalesce(ascension_score, 0)) >= 400 then 7
      when greatest(0, coalesce(ascension_score, 0)) >= 275 then 6
      when greatest(0, coalesce(ascension_score, 0)) >= 175 then 5
      when greatest(0, coalesce(ascension_score, 0)) >= 100 then 4
      when greatest(0, coalesce(ascension_score, 0)) >= 50 then 3
      when greatest(0, coalesce(ascension_score, 0)) >= 30 then 2
      when greatest(0, coalesce(ascension_score, 0)) >= 15 then 1
      else 0
    end
  ) then
    raise exception 'ASCEND progression migration failed: stored levels are inconsistent';
  end if;
end;
$$;

commit;
