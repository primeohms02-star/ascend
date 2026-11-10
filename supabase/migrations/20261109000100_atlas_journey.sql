begin;
-- Append-only, user-confirmed updates. No change to previous work, XP, or onboarding.
create table public.atlas_journey_updates (
 id uuid primary key, user_id text not null, direction text not null,
 event text not null check(event in ('accept','tried','stuck','done','achieved')),
 step text not null check(char_length(step) between 1 and 600),
 note text not null check(char_length(note)<=1500), recorded_at timestamptz not null default clock_timestamp()
);
create index atlas_journey_owner_idx on public.atlas_journey_updates(user_id,recorded_at desc);
alter table public.atlas_journey_updates enable row level security;
revoke all on public.atlas_journey_updates from public,anon,authenticated;
grant select,insert on public.atlas_journey_updates to service_role;
create function public.atlas_record_journey_update(p_user text,p_id uuid,p_previous uuid,p_direction text,p_event text,p_step text,p_note text)
returns uuid language plpgsql security definer set search_path=public as $$
declare prev public.atlas_journey_updates%rowtype; existing public.atlas_journey_updates%rowtype; live_direction text;
begin
 perform pg_advisory_xact_lock(hashtext(p_user));
 select * into existing from public.atlas_journey_updates where id=p_id;
 if found then
  if existing.user_id=p_user and existing.direction=p_direction and existing.event=p_event and existing.step=p_step and existing.note=p_note then return p_id;end if;
  raise exception 'JOURNEY_CONFLICT';
 end if;
 select coalesce(nullif(pr.north_star,''),oc.north_star) into live_direction from public.atlas_onboarding_context oc left join public.profiles pr on pr.clerk_id=oc.user_id where oc.user_id=p_user;
 if nullif(p_direction,'') is null or live_direction is distinct from p_direction then raise exception 'JOURNEY_CONFLICT';end if;
 select * into prev from public.atlas_journey_updates where user_id=p_user and direction=p_direction order by recorded_at desc,id desc limit 1;
 if prev.id is distinct from p_previous then raise exception 'JOURNEY_CONFLICT';end if;
 if prev.event='achieved' then raise exception 'JOURNEY_CONFLICT';end if;
 if p_event <> 'accept' and (prev.id is null or (prev.event='done' and p_event<>'achieved') or prev.step<>p_step or nullif(btrim(p_note),'') is null) then raise exception 'JOURNEY_CONFLICT';end if;
 insert into public.atlas_journey_updates(id,user_id,direction,event,step,note)values(p_id,p_user,p_direction,p_event,p_step,p_note);
 return p_id;
end $$;
revoke all on function public.atlas_record_journey_update(text,uuid,uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.atlas_record_journey_update(text,uuid,uuid,text,text,text,text) to service_role;
create or replace function public.save_atlas_direction(
 p_user_id text, p_operation_id uuid, p_identity text, p_goal text,
 p_skills text[], p_challenges text[], p_north_star text, p_direction_fact text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
 v_request jsonb;
 v_previous public.atlas_project_direction_operations%rowtype;
 v_context public.atlas_onboarding_context%rowtype;
 v_fact_id uuid;
 v_recalibration boolean;
 v_result jsonb;
begin
 if nullif(btrim(p_user_id),'') is null or p_operation_id is null
 or nullif(btrim(p_identity),'') is null or nullif(btrim(p_goal),'') is null
 or length(btrim(p_north_star)) not between 20 and 1200
 or nullif(btrim(p_north_star),'') is null or nullif(btrim(p_direction_fact),'') is null then
   raise exception 'Invalid project direction request';
 end if;
 v_request := jsonb_build_object('identity',p_identity,'goal',p_goal,'skills',p_skills,
   'challenges',p_challenges,'northStar',p_north_star,'directionFact',p_direction_fact);
 perform pg_advisory_xact_lock(hashtext(p_user_id));
 select * into v_previous from public.atlas_project_direction_operations o where o.operation_id=p_operation_id;
 if found then
   if v_previous.user_id<>p_user_id or v_previous.request_payload<>v_request then
     raise exception 'Operation ID already used for another request';
   end if;
   return v_previous.result || jsonb_build_object('replayed',true);
 end if;
 select * into v_context from public.atlas_onboarding_context c where c.user_id=p_user_id for update;
 v_recalibration := found;
 if v_context.direction_fact_id is not null then
   delete from public.atlas_facts f where f.id=v_context.direction_fact_id and f.user_id=p_user_id;
 end if;
 insert into public.atlas_facts(user_id,fact) values(p_user_id,p_direction_fact) returning id into v_fact_id;
 insert into public.profiles(clerk_id,journey,north_star) values(p_user_id,p_identity,p_north_star)
 on conflict(clerk_id) do update set journey=excluded.journey,north_star=excluded.north_star;
 insert into public.atlas_onboarding_context(user_id,identity,goal,skills,challenges,north_star,direction_fact_id,updated_at)
 values(p_user_id,p_identity,p_goal,coalesce(p_skills,array[]::text[]),coalesce(p_challenges,array[]::text[]),p_north_star,v_fact_id,now())
 on conflict(user_id) do update set identity=excluded.identity,goal=excluded.goal,skills=excluded.skills,
 challenges=excluded.challenges,north_star=excluded.north_star,direction_fact_id=excluded.direction_fact_id,updated_at=now();
 insert into public.atlas_memory(user_id,role,message,memory_type,title,metadata)
 values(p_user_id,'system','Direction saved for Atlas. ' || p_direction_fact,
 case when v_recalibration then 'direction' else 'onboarding' end,
 case when v_recalibration then 'Direction Updated' else 'ASCEND Journey Started' end,
 jsonb_build_object('operation_id',p_operation_id,'north_star',p_north_star));
 v_result := jsonb_build_object('operationId',p_operation_id,'replayed',false,'isRecalibration',v_recalibration,'directionReady',true);
 insert into public.atlas_project_direction_operations(operation_id,user_id,request_payload,result)
 values(p_operation_id,p_user_id,v_request,v_result);
 return v_result;
end;
$$;
revoke all on function public.save_atlas_direction(text,uuid,text,text,text[],text[],text,text) from public,anon,authenticated;
grant execute on function public.save_atlas_direction(text,uuid,text,text,text[],text[],text,text) to service_role;

create table public.atlas_journey_hidden_listings (
 user_id text not null, opportunity_id text not null check(length(opportunity_id) between 1 and 500),
 created_at timestamptz not null default now(), primary key(user_id,opportunity_id)
);
alter table public.atlas_journey_hidden_listings enable row level security;
revoke all on public.atlas_journey_hidden_listings from public,anon,authenticated;
grant select,insert on public.atlas_journey_hidden_listings to service_role;
commit;
