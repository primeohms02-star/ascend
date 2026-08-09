begin;

/*
 * Migrate ASCEND's two preserved beta identities from the Clerk
 * Development instance to the Clerk Production instance.
 *
 * This migration changes Clerk identity references only. It does not
 * delete, merge or recreate profiles, missions, XP, momentum, streaks,
 * onboarding context, opportunity learning data or support cases.
 *
 * The migration is deliberately rerunnable:
 *
 * - A completely unmigrated database is migrated and verified.
 * - A completely migrated database is verified without changing rows.
 * - A mixed or partially migrated database aborts and rolls back.
 */

set local lock_timeout = '15s';
set local statement_timeout = '5min';

select pg_advisory_xact_lock(
  hashtext(
    'ascend-clerk-production-user-id-migration-v1'
  )
);

/*
 * Prevent application writes while the identity references and their
 * replay snapshots are moved. Reads remain available.
 */

do $$
declare
  table_record record;
begin
  for table_record in
    select
      namespace.nspname as schema_name,
      relation.relname as table_name
    from pg_class as relation
    join pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relkind in ('r', 'p')
      and not relation.relispartition
    order by relation.relname
  loop
    execute format(
      'lock table %I.%I in share row exclusive mode',
      table_record.schema_name,
      table_record.table_name
    );
  end loop;
end;
$$;

set constraints all deferred;

create temporary table ascend_clerk_id_map (
  old_id text primary key,
  new_id text not null unique,
  identity_label text not null unique,
  migration_state text null,
  profile_id uuid null,
  mission_rows_before bigint not null default 0,
  active_mission_rows_before bigint not null default 0,
  operation_rows_before bigint not null default 0,
  old_text_matches_before bigint not null default 0,
  new_text_matches_before bigint not null default 0,
  old_json_matches_before bigint not null default 0,
  new_json_matches_before bigint not null default 0,
  updated_text_matches bigint not null default 0,
  updated_json_matches bigint not null default 0,
  old_text_matches_after bigint not null default 0,
  new_text_matches_after bigint not null default 0,
  old_json_matches_after bigint not null default 0,
  new_json_matches_after bigint not null default 0
) on commit drop;

insert into ascend_clerk_id_map (
  old_id,
  new_id,
  identity_label
)
values
  (
    'user_3GDbTPzck6Dyb3udxwsmn5GlKKW',
    'user_3HPDujWYUr90RfzvJ3jRMVjSSIM',
    'founder'
  ),
  (
    'user_3HJLGDrNBGgPK3ra2Ap4BNi6Cou',
    'user_3HPEUjEK8H9xCtptt5cBfJ31oVg',
    'beta'
  );

/*
 * These are the exact JSON result paths discovered by the read-only
 * production audit. They are stored idempotent lifecycle responses used
 * for safe network retries.
 */

create temporary table ascend_mission_result_user_paths (
  operation_type text not null,
  json_path text[] not null,
  primary key (operation_type, json_path)
) on commit drop;

insert into ascend_mission_result_user_paths (
  operation_type,
  json_path
)
values
  (
    'complete',
    array['activeMission', 'user_id']
  ),
  (
    'complete',
    array['completedMission', 'user_id']
  ),
  (
    'complete',
    array['memory', 'user_id']
  ),
  (
    'complete',
    array['momentum', 'user_id']
  ),
  (
    'complete',
    array['progress', 'user_id']
  ),
  (
    'complete',
    array['streak', 'user_id']
  ),
  (
    'onboarding_replace',
    array['activeMission', 'user_id']
  ),
  (
    'onboarding_replace',
    array['memory', 'user_id']
  ),
  (
    'onboarding_replace',
    array['previousMission', 'user_id']
  );

do $$
begin
  if (
    select count(*)
    from (
      select old_id as clerk_id
      from pg_temp.ascend_clerk_id_map

      union all

      select new_id as clerk_id
      from pg_temp.ascend_clerk_id_map
    ) as all_ids
  ) <> (
    select count(distinct clerk_id)
    from (
      select old_id as clerk_id
      from pg_temp.ascend_clerk_id_map

      union all

      select new_id as clerk_id
      from pg_temp.ascend_clerk_id_map
    ) as all_ids
  ) then
    raise exception
      'ASCEND Clerk migration failed: identity mappings are not distinct';
  end if;

  if to_regclass('public.profiles') is null
    or to_regclass('public.atlas_missions') is null
    or to_regclass('public.atlas_mission_operations') is null
  then
    raise exception
      'ASCEND Clerk migration failed: a required lifecycle table is missing';
  end if;
end;
$$;

/*
 * Count every exact occurrence in every writable public text column.
 * This avoids relying on a stale hard-coded list if legitimate activity
 * added another user-owned row after the audit.
 */

do $$
declare
  column_record record;
  mapping_record record;
  old_count bigint;
  new_count bigint;
begin
  for column_record in
    select
      namespace.nspname as schema_name,
      relation.relname as table_name,
      attribute.attname as column_name
    from pg_attribute as attribute
    join pg_class as relation
      on relation.oid = attribute.attrelid
    join pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    join pg_type as data_type
      on data_type.oid = attribute.atttypid
    where namespace.nspname = 'public'
      and relation.relkind in ('r', 'p')
      and not relation.relispartition
      and attribute.attnum > 0
      and not attribute.attisdropped
      and attribute.attgenerated = ''
      and data_type.typname in ('text', 'varchar', 'bpchar')
    order by
      relation.relname,
      attribute.attnum
  loop
    for mapping_record in
      select old_id, new_id
      from pg_temp.ascend_clerk_id_map
      order by identity_label
    loop
      execute format(
        'select count(*) from %I.%I where %I::text = $1',
        column_record.schema_name,
        column_record.table_name,
        column_record.column_name
      )
      into old_count
      using mapping_record.old_id;

      execute format(
        'select count(*) from %I.%I where %I::text = $1',
        column_record.schema_name,
        column_record.table_name,
        column_record.column_name
      )
      into new_count
      using mapping_record.new_id;

      update pg_temp.ascend_clerk_id_map
      set
        old_text_matches_before =
          old_text_matches_before + old_count,
        new_text_matches_before =
          new_text_matches_before + new_count
      where old_id = mapping_record.old_id;
    end loop;
  end loop;
end;
$$;

update pg_temp.ascend_clerk_id_map as mapping
set
  old_json_matches_before = (
    select count(*)
    from public.atlas_mission_operations as operation
    join pg_temp.ascend_mission_result_user_paths as result_path
      on result_path.operation_type = operation.operation_type
    where operation.result #>> result_path.json_path = mapping.old_id
  ),
  new_json_matches_before = (
    select count(*)
    from public.atlas_mission_operations as operation
    join pg_temp.ascend_mission_result_user_paths as result_path
      on result_path.operation_type = operation.operation_type
    where operation.result #>> result_path.json_path = mapping.new_id
  );

/*
 * Classify the database as wholly fresh or wholly migrated. Any mixed
 * state is unsafe and must be inspected instead of guessed through.
 */

update pg_temp.ascend_clerk_id_map
set migration_state =
  case
    when old_text_matches_before > 0
      and new_text_matches_before = 0
      and new_json_matches_before = 0
    then 'fresh'

    when old_text_matches_before = 0
      and old_json_matches_before = 0
      and new_text_matches_before > 0
    then 'already_migrated'

    else 'mixed'
  end;

do $$
declare
  mapping_record record;
  old_profile_count bigint;
  new_profile_count bigint;
  source_id text;
begin
  if exists (
    select 1
    from pg_temp.ascend_clerk_id_map
    where migration_state = 'mixed'
  ) then
    raise exception
      'ASCEND Clerk migration failed: mixed old/new identity state detected';
  end if;

  if (
    select count(distinct migration_state)
    from pg_temp.ascend_clerk_id_map
  ) <> 1 then
    raise exception
      'ASCEND Clerk migration failed: the two identities are not in the same migration state';
  end if;

  for mapping_record in
    select *
    from pg_temp.ascend_clerk_id_map
    order by identity_label
  loop
    select count(*)
    into old_profile_count
    from public.profiles
    where clerk_id = mapping_record.old_id;

    select count(*)
    into new_profile_count
    from public.profiles
    where clerk_id = mapping_record.new_id;

    if mapping_record.migration_state = 'fresh'
      and (
        old_profile_count <> 1
        or new_profile_count <> 0
      )
    then
      raise exception
        'ASCEND Clerk migration failed: % profile precondition is invalid',
        mapping_record.identity_label;
    end if;

    if mapping_record.migration_state = 'already_migrated'
      and (
        old_profile_count <> 0
        or new_profile_count <> 1
      )
    then
      raise exception
        'ASCEND Clerk migration failed: migrated % profile could not be verified',
        mapping_record.identity_label;
    end if;

    source_id :=
      case
        when mapping_record.migration_state = 'fresh'
        then mapping_record.old_id
        else mapping_record.new_id
      end;

    update pg_temp.ascend_clerk_id_map
    set
      profile_id = (
        select id
        from public.profiles
        where clerk_id = source_id
      ),
      mission_rows_before = (
        select count(*)
        from public.atlas_missions
        where user_id = source_id
      ),
      active_mission_rows_before = (
        select count(*)
        from public.atlas_missions
        where user_id = source_id
          and status = 'active'
      ),
      operation_rows_before = (
        select count(*)
        from public.atlas_mission_operations
        where user_id = source_id
      )
    where old_id = mapping_record.old_id;
  end loop;
end;
$$;

/*
 * Apply the text-column migration only when both identities are fresh.
 */

do $$
declare
  column_record record;
  mapping_record record;
  affected_count bigint;
begin
  if not exists (
    select 1
    from pg_temp.ascend_clerk_id_map
    where migration_state = 'fresh'
  ) then
    raise notice
      'ASCEND Clerk identities were already migrated; running verification only';
    return;
  end if;

  for column_record in
    select
      namespace.nspname as schema_name,
      relation.relname as table_name,
      attribute.attname as column_name
    from pg_attribute as attribute
    join pg_class as relation
      on relation.oid = attribute.attrelid
    join pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    join pg_type as data_type
      on data_type.oid = attribute.atttypid
    where namespace.nspname = 'public'
      and relation.relkind in ('r', 'p')
      and not relation.relispartition
      and attribute.attnum > 0
      and not attribute.attisdropped
      and attribute.attgenerated = ''
      and data_type.typname in ('text', 'varchar', 'bpchar')
    order by
      relation.relname,
      attribute.attnum
  loop
    for mapping_record in
      select old_id, new_id
      from pg_temp.ascend_clerk_id_map
      order by identity_label
    loop
      execute format(
        'update %I.%I set %I = $1 where %I::text = $2',
        column_record.schema_name,
        column_record.table_name,
        column_record.column_name,
        column_record.column_name
      )
      using
        mapping_record.new_id,
        mapping_record.old_id;

      get diagnostics affected_count = row_count;

      update pg_temp.ascend_clerk_id_map
      set updated_text_matches =
        updated_text_matches + affected_count
      where old_id = mapping_record.old_id;
    end loop;
  end loop;
end;
$$;

/*
 * Update only the audited user_id values inside stored lifecycle-result
 * JSON. jsonb_set preserves every other key and value byte-for-byte at
 * the logical JSON level.
 */

do $$
declare
  mapping_record record;
  path_record record;
  affected_count bigint;
begin
  if not exists (
    select 1
    from pg_temp.ascend_clerk_id_map
    where migration_state = 'fresh'
  ) then
    return;
  end if;

  for mapping_record in
    select old_id, new_id
    from pg_temp.ascend_clerk_id_map
    order by identity_label
  loop
    for path_record in
      select operation_type, json_path
      from pg_temp.ascend_mission_result_user_paths
      order by
        operation_type,
        json_path
    loop
      update public.atlas_mission_operations
      set result = jsonb_set(
        result,
        path_record.json_path,
        to_jsonb(mapping_record.new_id),
        false
      )
      where operation_type = path_record.operation_type
        and result #>> path_record.json_path = mapping_record.old_id;

      get diagnostics affected_count = row_count;

      update pg_temp.ascend_clerk_id_map
      set updated_json_matches =
        updated_json_matches + affected_count
      where old_id = mapping_record.old_id;
    end loop;
  end loop;
end;
$$;

/*
 * Recount every public text reference after mutation.
 */

do $$
declare
  column_record record;
  mapping_record record;
  old_count bigint;
  new_count bigint;
begin
  for column_record in
    select
      namespace.nspname as schema_name,
      relation.relname as table_name,
      attribute.attname as column_name
    from pg_attribute as attribute
    join pg_class as relation
      on relation.oid = attribute.attrelid
    join pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    join pg_type as data_type
      on data_type.oid = attribute.atttypid
    where namespace.nspname = 'public'
      and relation.relkind in ('r', 'p')
      and not relation.relispartition
      and attribute.attnum > 0
      and not attribute.attisdropped
      and attribute.attgenerated = ''
      and data_type.typname in ('text', 'varchar', 'bpchar')
    order by
      relation.relname,
      attribute.attnum
  loop
    for mapping_record in
      select old_id, new_id
      from pg_temp.ascend_clerk_id_map
      order by identity_label
    loop
      execute format(
        'select count(*) from %I.%I where %I::text = $1',
        column_record.schema_name,
        column_record.table_name,
        column_record.column_name
      )
      into old_count
      using mapping_record.old_id;

      execute format(
        'select count(*) from %I.%I where %I::text = $1',
        column_record.schema_name,
        column_record.table_name,
        column_record.column_name
      )
      into new_count
      using mapping_record.new_id;

      update pg_temp.ascend_clerk_id_map
      set
        old_text_matches_after =
          old_text_matches_after + old_count,
        new_text_matches_after =
          new_text_matches_after + new_count
      where old_id = mapping_record.old_id;
    end loop;
  end loop;
end;
$$;

update pg_temp.ascend_clerk_id_map as mapping
set
  old_json_matches_after = (
    select count(*)
    from public.atlas_mission_operations as operation
    join pg_temp.ascend_mission_result_user_paths as result_path
      on result_path.operation_type = operation.operation_type
    where operation.result #>> result_path.json_path = mapping.old_id
  ),
  new_json_matches_after = (
    select count(*)
    from public.atlas_mission_operations as operation
    join pg_temp.ascend_mission_result_user_paths as result_path
      on result_path.operation_type = operation.operation_type
    where operation.result #>> result_path.json_path = mapping.new_id
  );

/*
 * Verify counts, preserved profile UUIDs and mission lifecycle rows.
 */

do $$
declare
  mapping_record record;
  json_column_record record;
  remaining_json_rows bigint;
  current_mission_rows bigint;
  current_active_mission_rows bigint;
  current_operation_rows bigint;
begin
  for mapping_record in
    select *
    from pg_temp.ascend_clerk_id_map
    order by identity_label
  loop
    if mapping_record.old_text_matches_after <> 0
      or mapping_record.old_json_matches_after <> 0
    then
      raise exception
        'ASCEND Clerk migration failed: old % identity references remain',
        mapping_record.identity_label;
    end if;

    if mapping_record.migration_state = 'fresh'
      and mapping_record.updated_text_matches <>
        mapping_record.old_text_matches_before
    then
      raise exception
        'ASCEND Clerk migration failed: % text update count mismatch',
        mapping_record.identity_label;
    end if;

    if mapping_record.migration_state = 'fresh'
      and mapping_record.updated_json_matches <>
        mapping_record.old_json_matches_before
    then
      raise exception
        'ASCEND Clerk migration failed: % JSON update count mismatch',
        mapping_record.identity_label;
    end if;

    if mapping_record.migration_state = 'fresh'
      and mapping_record.new_text_matches_after <>
        mapping_record.old_text_matches_before
    then
      raise exception
        'ASCEND Clerk migration failed: % destination text count mismatch',
        mapping_record.identity_label;
    end if;

    if mapping_record.migration_state = 'fresh'
      and mapping_record.new_json_matches_after <>
        mapping_record.old_json_matches_before
    then
      raise exception
        'ASCEND Clerk migration failed: % destination JSON count mismatch',
        mapping_record.identity_label;
    end if;

    if not exists (
      select 1
      from public.profiles
      where clerk_id = mapping_record.new_id
        and id = mapping_record.profile_id
    ) then
      raise exception
        'ASCEND Clerk migration failed: % profile UUID was not preserved',
        mapping_record.identity_label;
    end if;

    if exists (
      select 1
      from public.profiles
      where clerk_id = mapping_record.old_id
    ) then
      raise exception
        'ASCEND Clerk migration failed: old % profile identity remains',
        mapping_record.identity_label;
    end if;

    select count(*)
    into current_mission_rows
    from public.atlas_missions
    where user_id = mapping_record.new_id;

    select count(*)
    into current_active_mission_rows
    from public.atlas_missions
    where user_id = mapping_record.new_id
      and status = 'active';

    select count(*)
    into current_operation_rows
    from public.atlas_mission_operations
    where user_id = mapping_record.new_id;

    if current_mission_rows <>
      mapping_record.mission_rows_before
      or current_active_mission_rows <>
        mapping_record.active_mission_rows_before
      or current_operation_rows <>
        mapping_record.operation_rows_before
    then
      raise exception
        'ASCEND Clerk migration failed: % mission lifecycle row counts changed',
        mapping_record.identity_label;
    end if;

    if current_active_mission_rows > 1 then
      raise exception
        'ASCEND Clerk migration failed: % has more than one active mission',
        mapping_record.identity_label;
    end if;

    /*
     * The prior audit found JSON IDs only in mission-operation results.
     * Fail and roll back if any old ID remains anywhere in public JSON.
     */

    for json_column_record in
      select
        namespace.nspname as schema_name,
        relation.relname as table_name,
        attribute.attname as column_name
      from pg_attribute as attribute
      join pg_class as relation
        on relation.oid = attribute.attrelid
      join pg_namespace as namespace
        on namespace.oid = relation.relnamespace
      join pg_type as data_type
        on data_type.oid = attribute.atttypid
      where namespace.nspname = 'public'
        and relation.relkind in ('r', 'p')
        and not relation.relispartition
        and attribute.attnum > 0
        and not attribute.attisdropped
        and data_type.typname in ('json', 'jsonb')
      order by
        relation.relname,
        attribute.attnum
    loop
      execute format(
        'select count(*) from %I.%I where position($1 in %I::text) > 0',
        json_column_record.schema_name,
        json_column_record.table_name,
        json_column_record.column_name
      )
      into remaining_json_rows
      using mapping_record.old_id;

      if remaining_json_rows > 0 then
        raise exception
          'ASCEND Clerk migration failed: old % identity remains in %.%',
          mapping_record.identity_label,
          json_column_record.table_name,
          json_column_record.column_name;
      end if;
    end loop;
  end loop;
end;
$$;

notify pgrst, 'reload schema';

commit;