begin;

drop function if exists
  public.complete_atlas_mission(
    text,
    text,
    integer
  );

commit;