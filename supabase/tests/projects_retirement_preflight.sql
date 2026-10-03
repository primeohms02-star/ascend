-- Read-only: run in the Supabase SQL editor BEFORE deploying this update.
-- Any rows require review, not automatic cancellation or deletion.
select id,title,status from public.ascend_projects
where project_type='reward' and status in ('published','paused','submissions_closed','reviewing','results_ready');
select p.id,p.title,u.id as participation_id,u.status
from public.ascend_projects p join public.ascend_project_participations u on u.project_id=p.id
where p.project_type='reward' and u.status in ('pending','joined','in_progress','submitted','revision_requested');
select id,participation_id,status,amount_minor,currency
from public.ascend_project_reward_deliveries where status not in ('delivered','resolved','cancelled');
