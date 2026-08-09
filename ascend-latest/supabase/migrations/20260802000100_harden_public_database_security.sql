begin;

/*
 * ASCEND V1 beta security hardening.
 *
 * This migration changes only database security metadata. It does not
 * delete or update profiles, missions, XP, momentum, opportunity data,
 * onboarding context, memory, reflections or support cases.
 *
 * All application database access has been moved to server-only
 * service-role clients before this migration is applied.
 */

/*
 * Enable RLS on every current table in the public schema, including
 * tables that are not represented in the generated TypeScript types.
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
  loop
    execute format(
      'alter table %I.%I enable row level security',
      table_record.schema_name,
      table_record.table_name
    );
  end loop;
end;
$$;

/*
 * ASCEND now performs all public-table reads and writes on the server.
 * Remove direct table and sequence access from browser-facing roles.
 */

revoke all privileges
on all tables in schema public
from public, anon, authenticated;

revoke all privileges
on all sequences in schema public
from public, anon, authenticated;

grant all privileges
on all tables in schema public
to service_role;

grant all privileges
on all sequences in schema public
to service_role;

/*
 * Preferences and impressions are server-owned learning data. Remove
 * every existing policy on these two tables so the previous USING
 * (true) and WITH CHECK (true) policies cannot remain active.
 */

do $$
declare
  policy_record record;
begin
  for policy_record in
    select
      schemaname,
      tablename,
      policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'atlas_preferences',
        'atlas_opportunity_impressions'
      )
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end;
$$;

/*
 * PostgreSQL grants EXECUTE on new functions to PUBLIC by default.
 * Lock down every current public-schema function, then restore access
 * only to the service role used by ASCEND server routes.
 */

revoke execute
on all functions in schema public
from public, anon, authenticated;

grant execute
on all functions in schema public
to service_role;

/*
 * Explicitly preserve both onboarding RPC overloads during rollout and
 * the canonical atomic mission-completion RPC. The legacy onboarding
 * overload is intentionally retained until deployment callers are
 * checked separately.
 */

grant execute on function
  public.replace_atlas_mission(
    text,
    uuid,
    text,
    text,
    text[],
    text,
    text,
    text,
    text,
    text
  )
to service_role;

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
to service_role;

grant execute on function
  public.complete_atlas_mission(
    text,
    uuid,
    uuid,
    text,
    text,
    integer
  )
to service_role;

/*
 * Apply secure defaults to future objects created by the migration
 * owner so this exposure is not reintroduced by a later migration.
 */

alter default privileges in schema public
  revoke all privileges on tables
  from public, anon, authenticated;

alter default privileges in schema public
  revoke all privileges on sequences
  from public, anon, authenticated;

alter default privileges in schema public
  revoke execute on functions
  from public, anon, authenticated;

alter default privileges in schema public
  grant all privileges on tables
  to service_role;

alter default privileges in schema public
  grant all privileges on sequences
  to service_role;

alter default privileges in schema public
  grant execute on functions
  to service_role;

/*
 * Fail the transaction if any public table remains without RLS.
 */

do $$
begin
  if exists (
    select 1
    from pg_class as relation
    join pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relkind in ('r', 'p')
      and not relation.relrowsecurity
  ) then
    raise exception
      'ASCEND security migration failed: a public table still has RLS disabled';
  end if;
end;
$$;

/*
 * Fail if PUBLIC, anon or authenticated retains any direct privilege
 * on a public table.
 */

do $$
begin
  if exists (
    select 1
    from pg_class as relation
    join pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    cross join lateral aclexplode(
      coalesce(
        relation.relacl,
        acldefault('r', relation.relowner)
      )
    ) as privilege
    where namespace.nspname = 'public'
      and relation.relkind in ('r', 'p')
      and (
        privilege.grantee = 0
        or privilege.grantee in (
          select oid
          from pg_roles
          where rolname in (
            'anon',
            'authenticated'
          )
        )
      )
  ) then
    raise exception
      'ASCEND security migration failed: a public role still has table privileges';
  end if;
end;
$$;

/*
 * Fail if a browser-facing role can still execute a public function.
 * PUBLIC grants are included because anon and authenticated inherit
 * privileges granted to PUBLIC.
 */

do $$
begin
  if exists (
    select 1
    from pg_proc as procedure
    join pg_namespace as namespace
      on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and (
        has_function_privilege(
          'anon',
          procedure.oid,
          'execute'
        )
        or has_function_privilege(
          'authenticated',
          procedure.oid,
          'execute'
        )
      )
  ) then
    raise exception
      'ASCEND security migration failed: a public role still has function execution';
  end if;
end;
$$;

/*
 * Fail if the canonical lifecycle RPCs are not executable by the
 * service role after hardening.
 */

do $$
begin
  if not has_function_privilege(
    'service_role',
    'public.replace_atlas_mission(text,uuid,text,text,text[],text,text,text,text,text)',
    'execute'
  ) then
    raise exception
      'ASCEND security migration failed: legacy onboarding RPC is unavailable to service_role';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.replace_atlas_mission(text,uuid,text,text,text[],text[],text,text,text,text,text)',
    'execute'
  ) then
    raise exception
      'ASCEND security migration failed: skills-aware onboarding RPC is unavailable to service_role';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.complete_atlas_mission(text,uuid,uuid,text,text,integer)',
    'execute'
  ) then
    raise exception
      'ASCEND security migration failed: mission completion RPC is unavailable to service_role';
  end if;
end;
$$;

notify pgrst, 'reload schema';

commit;