-- Disposable fixture: run after both onboarding and journey migrations. Rolls back all writes.
begin;
do $$
declare u text:='atlas-test-'||gen_random_uuid(); d text:='Learn to design and test a garment'; a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); c uuid:=gen_random_uuid(); failed boolean:=false;
begin
 perform public.save_atlas_direction(u,gen_random_uuid(),'Student','Test an idea',array['design'],array['time'],d,'Test direction');
 perform public.atlas_record_journey_update(u,a,null,d,'accept','Sketch one garment','');
 perform public.atlas_record_journey_update(u,a,null,d,'accept','Sketch one garment','');
 if (select count(*) from public.atlas_journey_updates where user_id=u)<>1 then raise exception 'Duplicate update';end if;
 begin perform public.atlas_record_journey_update(u,b,null,d,'done','Sketch one garment','Stale');exception when raise_exception then failed:=sqlerrm='JOURNEY_CONFLICT';end;
 if not failed then raise exception 'Stale update accepted';end if;
 perform public.atlas_record_journey_update(u,b,a,d,'done','Sketch one garment','I finished the sketch');
 perform public.atlas_record_journey_update(u,c,b,d,'achieved','Sketch one garment','I met my stated goal');
 if has_function_privilege('authenticated','public.atlas_record_journey_update(text,uuid,uuid,text,text,text,text)','execute') then raise exception 'Unexpected client privilege';end if;
end $$;
rollback;
