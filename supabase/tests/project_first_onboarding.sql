-- Optional verification AFTER applying the migration, ideally on a test database.
-- All fixture writes are rolled back. No existing user records are modified.
begin;
do $$
declare
 u text := 'project-focus-test-' || gen_random_uuid()::text;
 op uuid := gen_random_uuid();
 result jsonb;
 rejected boolean := false;
 n integer;
begin
 result := public.save_atlas_project_direction(u,op,'Student','Test an idea',array['research'],array['time'],
 'Build a sustainable business serving local customers','Test direction fact');
 if not (result->>'projectReady')::boolean then raise exception 'Direction not confirmed'; end if;
 result := public.save_atlas_project_direction(u,op,'Student','Test an idea',array['research'],array['time'],
 'Build a sustainable business serving local customers','Test direction fact');
 if not (result->>'replayed')::boolean then raise exception 'Retry was not idempotent'; end if;
 select count(*) into n from public.atlas_memory where user_id=u;
 if n<>1 then raise exception 'Retry duplicated memory'; end if;
 select count(*) into n from public.atlas_missions where user_id=u;
 if n<>0 then raise exception 'Onboarding created a mission'; end if;
 begin
   perform public.save_atlas_project_direction(u,op,'Student','Changed goal',array['research'],array['time'],
   'Build a sustainable business serving local customers','Changed fact');
 exception when others then rejected := true;
 end;
 if not rejected then raise exception 'Conflicting retry was accepted'; end if;
 if has_function_privilege('authenticated','public.save_atlas_project_direction(text,uuid,text,text,text[],text[],text,text)','EXECUTE')
 or has_function_privilege('anon','public.save_atlas_project_direction(text,uuid,text,text,text[],text[],text,text)','EXECUTE') then
   raise exception 'Direction function is exposed to browser roles';
 end if;
end;
$$;
rollback;
select 'Project-first onboarding checks passed; fixture data rolled back.' as result;
