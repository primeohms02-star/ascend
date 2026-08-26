begin;

create or replace function public.ascend_work_transition_application(
  p_application_id uuid,
  p_admin_user_id text,
  p_action text
)
returns table(application_id uuid, application_status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_application public.ascend_work_applications%rowtype;
  v_project public.ascend_work_projects%rowtype;
  v_next_status text;
  v_occupied integer;
begin
  if p_admin_user_id is null or char_length(trim(p_admin_user_id)) < 3 then
    raise exception 'ASCEND_WORK_INVALID_ADMIN';
  end if;

  select * into v_application
  from public.ascend_work_applications
  where id = p_application_id
  for update;
  if not found then raise exception 'ASCEND_WORK_APPLICATION_NOT_FOUND'; end if;

  select * into v_project
  from public.ascend_work_projects
  where id = v_application.project_id
  for update;
  if not found then raise exception 'ASCEND_WORK_PROJECT_NOT_FOUND'; end if;

  if p_action = 'shortlist' then
    if v_application.status <> 'submitted' then raise exception 'ASCEND_WORK_INVALID_TRANSITION'; end if;
    v_next_status := 'shortlisted';
  elsif p_action = 'reject' then
    if v_application.status not in ('submitted', 'shortlisted') then raise exception 'ASCEND_WORK_INVALID_TRANSITION'; end if;
    v_next_status := 'rejected';
  elsif p_action = 'accept' then
    if v_application.status not in ('submitted', 'shortlisted') then raise exception 'ASCEND_WORK_INVALID_TRANSITION'; end if;
    select count(*) into v_occupied
    from public.ascend_work_applications
    where project_id = v_application.project_id
      and status in ('accepted', 'completed', 'disputed');
    if v_occupied >= v_project.available_slots then raise exception 'ASCEND_WORK_NO_SLOTS'; end if;
    v_next_status := 'accepted';
  else
    raise exception 'ASCEND_WORK_INVALID_ACTION';
  end if;

  update public.ascend_work_applications
  set status = v_next_status
  where id = v_application.id;

  insert into public.ascend_work_audit_events (
    project_id, application_id, actor_user_id, actor_type, event_type, from_status, to_status
  ) values (
    v_application.project_id, v_application.id, p_admin_user_id, 'admin',
    'application_' || v_next_status, v_application.status, v_next_status
  );

  insert into public.ascend_work_notifications (user_id, title, message, href)
  values (
    v_application.user_id,
    case v_next_status
      when 'shortlisted' then 'Application shortlisted'
      when 'accepted' then 'Paid Mission application accepted'
      else 'Application update'
    end,
    case v_next_status
      when 'shortlisted' then 'Your application for “' || v_project.title || '” has been shortlisted.'
      when 'accepted' then 'You were selected for “' || v_project.title || '”. Your project workspace is ready.'
      else 'Your application for “' || v_project.title || '” was not selected for this pilot.'
    end,
    '/work/applications/' || v_application.id::text
  );

  if v_next_status = 'accepted' then
    insert into public.ascend_work_submissions (application_id, project_id, user_id)
    values (v_application.id, v_application.project_id, v_application.user_id)
    on conflict on constraint ascend_work_submissions_application_id_key do nothing;
  end if;

  return query select v_application.id, v_next_status;
end;
$$;

revoke execute on function public.ascend_work_transition_application(uuid, text, text)
from public, anon, authenticated;
grant execute on function public.ascend_work_transition_application(uuid, text, text)
to service_role;

commit;
