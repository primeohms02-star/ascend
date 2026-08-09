begin;

/*
 * Add structured skills to ASCEND onboarding.
 *
 * This migration is additive:
 * - Existing onboarding records receive an empty skills array.
 * - The previous onboarding RPC remains available during deployment.
 * - The new application uses the skills-aware RPC overload.
 */

alter table
  public.atlas_onboarding_context
add column if not exists
  skills text[] not null
  default array[]::text[];

/*
 * Skills-aware onboarding replacement transaction.
 *
 * The existing ten-argument function remains temporarily available so
 * the currently deployed application continues working while the new
 * application version is being prepared.
 */

create or replace function
  public.replace_atlas_mission(
    p_user_id text,
    p_operation_id uuid,
    p_identity text,
    p_goal text,
    p_skills text[],
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

  v_existing_operation
    public.atlas_mission_operations%rowtype;

  v_previous_context
    public.atlas_onboarding_context%rowtype;

  v_previous_mission
    public.atlas_missions%rowtype;

  v_new_mission
    public.atlas_missions%rowtype;

  v_new_fact_id uuid;

  v_memory
    public.atlas_memory%rowtype;

  v_is_recalibration boolean;

  v_result jsonb;
begin
  if
    nullif(
      btrim(p_user_id),
      ''
    ) is null

    or p_operation_id is null

    or nullif(
      btrim(p_identity),
      ''
    ) is null

    or nullif(
      btrim(p_goal),
      ''
    ) is null

    or nullif(
      btrim(p_north_star),
      ''
    ) is null

    or nullif(
      btrim(p_direction_fact),
      ''
    ) is null

    or nullif(
      btrim(p_mission),
      ''
    ) is null

    or nullif(
      btrim(p_reason),
      ''
    ) is null
  then
    raise exception
      'Invalid onboarding mission lifecycle request';
  end if;

  v_request :=
    jsonb_build_object(
      'identity',
      btrim(p_identity),

      'goal',
      btrim(p_goal),

      'skills',
      to_jsonb(
        coalesce(
          p_skills,
          array[]::text[]
        )
      ),

      'challenges',
      to_jsonb(
        coalesce(
          p_challenges,
          array[]::text[]
        )
      ),

      'northStar',
      btrim(p_north_star),

      'directionFact',
      btrim(p_direction_fact),

      'previousDirectionFact',
      nullif(
        btrim(
          p_previous_direction_fact
        ),
        ''
      ),

      'mission',
      btrim(p_mission),

      'reason',
      btrim(p_reason)
    );

  /*
   * Serialize all onboarding and mission
   * lifecycle operations for this user.
   */

  perform
    pg_advisory_xact_lock(
      hashtext(p_user_id)
    );

  /*
   * Return the stored result when this
   * operation has already succeeded.
   */

  select *
  into v_existing_operation
  from
    public.atlas_mission_operations
  where
    operation_id =
      p_operation_id;

  if found then
    if
      v_existing_operation.user_id
        <> p_user_id

      or
      v_existing_operation.operation_type
        <> 'onboarding_replace'
    then
      raise exception
        'Operation ID was already used for a different request';
    end if;

    return jsonb_set(
      v_existing_operation.result,
      '{replayed}',
      'true'::jsonb
    );
  end if;

  /*
   * Lock the current onboarding direction.
   */

  select *
  into v_previous_context
  from
    public.atlas_onboarding_context
  where
    user_id = p_user_id
  for update;

  v_is_recalibration := found;

  /*
   * Lock and replace the current active mission.
   */

  select *
  into v_previous_mission
  from
    public.atlas_missions
  where
    user_id = p_user_id
    and status = 'active'
  order by
    created_at desc
  limit 1
  for update;

  if found then
    update
      public.atlas_missions
    set
      status = 'replaced'
    where
      id =
        v_previous_mission.id
    returning *
    into
      v_previous_mission;
  end if;

  /*
   * Remove only the previous direction fact.
   * Historical memories and other facts remain.
   */

  if
    v_previous_context.direction_fact_id
      is not null
  then
    delete from
      public.atlas_facts
    where
      id =
        v_previous_context.direction_fact_id
      and user_id =
        p_user_id;

  elsif
    nullif(
      btrim(
        p_previous_direction_fact
      ),
      ''
    ) is not null
  then
    delete from
      public.atlas_facts
    where
      user_id =
        p_user_id
      and fact =
        btrim(
          p_previous_direction_fact
        );
  end if;

  /*
   * Save the current human-readable direction fact.
   */

  insert into
    public.atlas_facts(
      user_id,
      fact
    )
  values (
    p_user_id,
    btrim(
      p_direction_fact
    )
  )
  returning id
  into v_new_fact_id;

  /*
   * Synchronize the live profile direction.
   */

  insert into
    public.profiles(
      clerk_id,
      journey,
      north_star
    )
  values (
    p_user_id,
    btrim(p_identity),
    btrim(p_north_star)
  )
  on conflict (
    clerk_id
  )
  do update set
    journey =
      excluded.journey,

    north_star =
      excluded.north_star;

  /*
   * Save all structured onboarding context,
   * including the user's declared skills.
   */

  insert into
    public.atlas_onboarding_context(
      user_id,
      identity,
      goal,
      skills,
      challenges,
      north_star,
      direction_fact_id,
      updated_at
    )
  values (
    p_user_id,

    btrim(
      p_identity
    ),

    btrim(
      p_goal
    ),

    coalesce(
      p_skills,
      array[]::text[]
    ),

    coalesce(
      p_challenges,
      array[]::text[]
    ),

    btrim(
      p_north_star
    ),

    v_new_fact_id,

    now()
  )
  on conflict (
    user_id
  )
  do update set
    identity =
      excluded.identity,

    goal =
      excluded.goal,

    skills =
      excluded.skills,

    challenges =
      excluded.challenges,

    north_star =
      excluded.north_star,

    direction_fact_id =
      excluded.direction_fact_id,

    updated_at =
      now();

  /*
   * Insert the newly generated active mission.
   */

  insert into
    public.atlas_missions(
      user_id,
      mission,
      reason,
      status
    )
  values (
    p_user_id,

    btrim(
      p_mission
    ),

    btrim(
      p_reason
    ),

    'active'
  )
  returning *
  into v_new_mission;

  /*
   * Record the direction event without altering
   * historical progress, XP or momentum.
   */

  insert into
    public.atlas_memory(
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
      when v_is_recalibration
      then
        'The user intentionally updated their ASCEND direction. '
        ||
        btrim(
          p_direction_fact
        )
      else
        'ASCEND onboarding completed. '
        ||
        btrim(
          p_direction_fact
        )
    end,

    case
      when v_is_recalibration
      then 'direction'
      else 'onboarding'
    end,

    case
      when v_is_recalibration
      then 'Direction Recalibrated'
      else 'ASCEND Journey Started'
    end,

    jsonb_build_object(
      'operation_id',
      p_operation_id,

      'mission_id',
      v_new_mission.id,

      'previous_mission_id',
      v_previous_mission.id,

      'north_star',
      btrim(
        p_north_star
      ),

      'skills',
      to_jsonb(
        coalesce(
          p_skills,
          array[]::text[]
        )
      )
    )
  )
  returning *
  into v_memory;

  v_result :=
    jsonb_build_object(
      'operationId',
      p_operation_id,

      'replayed',
      false,

      'isRecalibration',
      v_is_recalibration,

      'previousMission',
      case
        when
          v_previous_mission.id
            is null
        then null
        else
          to_jsonb(
            v_previous_mission
          )
      end,

      'activeMission',
      to_jsonb(
        v_new_mission
      ),

      'memory',
      to_jsonb(
        v_memory
      )
    );

  /*
   * Store the result for safe network retries.
   */

  insert into
    public.atlas_mission_operations(
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

revoke all on function
  public.replace_atlas_mission(
    text,
    uuid,
    text,
    text,
    text[],
    text[],
    text,
    text,
    text,
    text,
    text
  )
from
  public,
  anon,
  authenticated;

grant execute on function
  public.replace_atlas_mission(
    text,
    uuid,
    text,
    text,
    text[],
    text[],
    text,
    text,
    text,
    text,
    text
  )
to
  service_role;

notify pgrst, 'reload schema';

commit;