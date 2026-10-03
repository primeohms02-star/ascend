-- Run only in a disposable development database after the Projects migrations.
-- All test writes roll back. No network or payment calls.
begin;
do $$
declare
  pid uuid := 'aa202610-0200-4000-8000-000000000001';
  uid text := 'redesign-test-user';
  u uuid; s uuid; e uuid; e2 uuid; payload jsonb; n integer;
begin
  update public.ascend_projects set status='published',published_at=now() where id=pid;
  select jsonb_object_agg(d, 'A meaningful original response with supporting explanation for '||d)
    into payload from public.ascend_projects p,unnest(p.deliverables) d where p.id=pid;
  select participation_id into u from public.ascend_join_project(pid,uid);
  perform public.ascend_join_project(pid,uid);
  select count(*) into n from public.ascend_project_participations where project_id=pid and user_id=uid;
  if n<>1 then raise exception 'Duplicate participation'; end if;
  begin
    perform public.ascend_complete_learning_project(pid,'another-user');
    raise exception 'Ownership check failed';
  exception when others then if sqlerrm not like '%PARTICIPATION_REQUIRED%' then raise; end if; end;
  begin
    perform public.ascend_save_project_submission(pid,uid,'{}','short',true);
    raise exception 'Incomplete submission accepted';
  exception when others then if sqlerrm not like '%INCOMPLETE%' then raise; end if; end;
  select submission_id into s from public.ascend_save_project_submission(pid,uid,payload,'I learned to compare roles using evidence, and my next step is to explore a real example.',false);
  select public.ascend_complete_learning_project(pid,uid) into e;
  select public.ascend_complete_learning_project(pid,uid) into e2;
  if e is distinct from e2 or e is null then raise exception 'Completion is not idempotent'; end if;
  if not exists(select 1 from public.ascend_project_evidence where id=e and evidence_status='completed' and verified_by is null and visibility='private' and share_token is null) then raise exception 'False verification or public evidence'; end if;
  begin
    perform public.ascend_save_project_submission(pid,uid,payload,'Attempt to change completed work',false);
    raise exception 'Completed work editable';
  exception when others then if sqlerrm not like '%PARTICIPATION_INACTIVE%' then raise; end if; end;
  -- An independent user can request human review, but cannot bypass a revision.
  perform public.ascend_join_project(pid,'review-test-user');
  select submission_id into s from public.ascend_save_project_submission(pid,'review-test-user',payload,'My reflection explains the evidence used, its limitations and what I want to try next.',true);
  begin
    perform public.ascend_complete_learning_project(pid,'review-test-user');
    raise exception 'Submitted work bypassed review';
  exception when others then if sqlerrm not like '%PARTICIPATION_INACTIVE%' then raise; end if; end;
  perform public.ascend_review_project_submission(s,'test-admin','revision_requested',null,'{}','Explain the limitations more clearly.','',7);
  begin
    perform public.ascend_complete_learning_project(pid,'review-test-user');
    raise exception 'Revision bypassed';
  exception when others then if sqlerrm not like '%PARTICIPATION_INACTIVE%' then raise; end if; end;
  perform public.ascend_save_project_submission(pid,'review-test-user',payload,'I revised my explanation and added the limitations of my evidence and the next experiment.',true);
  perform public.ascend_review_project_submission(s,'test-admin','completed',80,'{}','Clear reasoning and reflection.','',7);
  if not exists(select 1 from public.ascend_project_evidence where user_id='review-test-user' and evidence_status='verified' and verified_by='test-admin' and visibility='private') then raise exception 'Human review evidence missing'; end if;
  if exists(select 1 from public.ascend_project_reward_deliveries where user_id in(uid,'review-test-user')) then raise exception 'Reward delivery created'; end if;
  if has_function_privilege('anon','public.ascend_complete_learning_project(uuid,text)','execute') or has_function_privilege('authenticated','public.ascend_complete_learning_project(uuid,text)','execute') then raise exception 'Completion RPC exposed'; end if;
  if has_function_privilege('service_role','public.ascend_reserve_sandbox_payout(uuid,text)','execute') then raise exception 'Payment RPC remains enabled'; end if;
  if has_table_privilege('anon','public.ascend_project_coaching','select') or has_table_privilege('authenticated','public.ascend_project_coaching','insert') then raise exception 'Coaching data exposed'; end if;
  if has_table_privilege('service_role','public.ascend_project_payment_profiles','select') then raise exception 'Old payment profile access remains'; end if;
end $$;
rollback;
