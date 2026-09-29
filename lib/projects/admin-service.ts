import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { projectErrorFromDatabase, ProjectServiceError } from "./errors";
import { canTransitionProjectStatus, validateProjectPublication } from "./lifecycle";
import type { ProjectStatus } from "./types";

export async function listProjectsForAdmin() {
  const [projects, submissions, sponsors, deliveries] = await Promise.all([
    supabaseAdmin.from("ascend_projects").select("id,title,project_type,category,difficulty,status,submission_deadline,published_at,updated_at,ascend_project_rewards(reward_model,recipient_count,amount_minor,currency,non_cash_description,funding_status,funding_reference)").order("updated_at",{ascending:false}),
    supabaseAdmin.from("ascend_project_submissions").select("id,project_id,user_id,status,current_version,submitted_at,participant_note,deliverable_responses").eq("status","submitted").order("submitted_at",{ascending:true}),
    supabaseAdmin.from("ascend_project_sponsors").select("id,name,website,verification_status,verified_at").order("name"),
    supabaseAdmin.from("ascend_project_reward_deliveries").select("id,reward_id,participation_id,user_id,amount_minor,currency,benefit_description,status,provider_reference,payment_provider,provider_transfer_id,transfer_reference,initiated_at,completed_at,failure_reason,created_at").order("created_at",{ascending:false}),
  ]);
  for(const result of [projects,submissions,sponsors,deliveries])if(result.error)throw projectErrorFromDatabase(result.error);
  return {projects:projects.data??[],submissions:submissions.data??[],sponsors:sponsors.data??[],deliveries:deliveries.data??[]};
}

export async function createPracticeProjectDraft(input: Record<string,unknown>, adminId:string) {
  const title=String(input.title??"").trim().slice(0,120), summary=String(input.summary??"").trim().slice(0,360), brief=String(input.brief??"").trim().slice(0,8000);
  const category=String(input.category??"General").trim().slice(0,80), difficulty=["beginner","intermediate","advanced"].includes(String(input.difficulty))?String(input.difficulty):"beginner";
  const deliverables=Array.isArray(input.deliverables)?input.deliverables.map(String).map(v=>v.trim()).filter(Boolean).slice(0,20):[];
  const skills=Array.isArray(input.skills)?input.skills.map(String).map(v=>v.trim()).filter(Boolean).slice(0,20):[];
  const deadline=new Date(String(input.submissionDeadline??"")); const estimatedMinutes=Math.max(15,Math.min(12000,Number(input.estimatedMinutes)||120));
  if(Number.isNaN(deadline.getTime()))throw new ProjectServiceError("INVALID_REQUEST","Set a valid submission deadline.",400);
  const usageTerms="The participant retains ownership. ASCEND may review the work for feedback and verified-experience evidence but may not use it commercially without separate permission.";
  const errors=validateProjectPublication({title,summary,brief,deliverables,criteriaWeights:[40,35,25],submissionDeadline:deadline.toISOString(),rightsModel:"portfolio",usageTerms,reward:{projectType:"practice",rewardModel:null,recipientCount:null,amountMinor:null,currency:null,nonCashDescription:null,fundingStatus:null}});
  if(errors.length)throw new ProjectServiceError("INVALID_REQUEST",errors.join(" "),400);
  const {data:project,error}=await supabaseAdmin.from("ascend_projects").insert({project_type:"practice",entry_mode:"open",title,summary,brief,category,difficulty,skills,deliverables,estimated_minutes:estimatedMinutes,feedback_level:"scored",ai_policy:"limited",ai_policy_detail:"AI may support structure and editing, but the participant remains responsible for the work and its accuracy.",rights_model:"portfolio",usage_terms:usageTerms,submission_deadline:deadline.toISOString(),status:"draft",created_by:adminId}).select("id,title,status").single();
  if(error)throw projectErrorFromDatabase(error);
  const criteria=[{project_id:project.id,title:"Quality",description:"The work meets the brief and deliverables.",weight:40,position:1},{project_id:project.id,title:"Reasoning",description:"Choices are clear and supported.",weight:35,position:2},{project_id:project.id,title:"Presentation",description:"The result is organised and usable.",weight:25,position:3}];
  const criteriaResult=await supabaseAdmin.from("ascend_project_criteria").insert(criteria); if(criteriaResult.error)throw projectErrorFromDatabase(criteriaResult.error);
  return project;
}

export async function createRewardProjectDraft(input:Record<string,unknown>,adminId:string){
  const sponsorName=String(input.sponsorName??"").trim().slice(0,140);const sponsorWebsite=String(input.sponsorWebsite??"").trim().slice(0,500)||null;
  if(sponsorName.length<2)throw new ProjectServiceError("INVALID_REQUEST","Add the verified sponsor or funding organisation.",400);
  const rewardModel=["winner","completion","non_cash"].includes(String(input.rewardModel))?String(input.rewardModel):"winner";
  const amountMinor=rewardModel==="non_cash"?null:Math.round(Number(input.amountNgn)*100);const recipientCount=Math.max(1,Math.min(100000,Number(input.recipientCount)||1));
  const nonCashDescription=rewardModel==="non_cash"?String(input.nonCashDescription??"").trim().slice(0,1000):null;
  const fundingStatus=["awaiting_confirmation","confirmed","secured"].includes(String(input.fundingStatus))?String(input.fundingStatus):"awaiting_confirmation";
  const fundingReference=String(input.fundingReference??"").trim().slice(0,240)||null;
  if(["confirmed","secured"].includes(fundingStatus)&&!fundingReference)throw new ProjectServiceError("INVALID_REQUEST","A funding reference is required before funding can be confirmed.",400);
  const title=String(input.title??"").trim().slice(0,120),summary=String(input.summary??"").trim().slice(0,360),brief=String(input.brief??"").trim().slice(0,8000),category=String(input.category??"General").trim().slice(0,80);
  const difficulty=["beginner","intermediate","advanced"].includes(String(input.difficulty))?String(input.difficulty):"beginner";const deadline=new Date(String(input.submissionDeadline??""));if(Number.isNaN(deadline.getTime()))throw new ProjectServiceError("INVALID_REQUEST","Set a valid submission deadline.",400);
  const deliverables=Array.isArray(input.deliverables)?input.deliverables.map(String).map(v=>v.trim()).filter(Boolean).slice(0,20):[];const skills=Array.isArray(input.skills)?input.skills.map(String).map(v=>v.trim()).filter(Boolean).slice(0,20):[];
  const usageTerms=String(input.usageTerms??"Participants retain ownership. The sponsor may review submitted work; any commercial use requires separate written permission.").trim().slice(0,5000);
  if(amountMinor!==null&&(!Number.isFinite(amountMinor)||amountMinor<1))throw new ProjectServiceError("INVALID_REQUEST","Enter a valid positive reward amount.",400);const reward={projectType:"reward" as const,rewardModel:rewardModel as "winner"|"completion"|"non_cash",recipientCount,amountMinor,currency:rewardModel==="non_cash"?null:"NGN",nonCashDescription,fundingStatus:fundingStatus as "awaiting_confirmation"|"confirmed"|"secured"};
  const errors=validateProjectPublication({title,summary,brief,deliverables,criteriaWeights:[40,35,25],submissionDeadline:deadline.toISOString(),rightsModel:"portfolio",usageTerms,reward});if(errors.length)throw new ProjectServiceError("INVALID_REQUEST",errors.join(" "),400);
  const existing=await supabaseAdmin.from("ascend_project_sponsors").select("id,verification_status").ilike("name",sponsorName).maybeSingle();if(existing.error)throw projectErrorFromDatabase(existing.error);
  let sponsor=existing.data;if(!sponsor){const created=await supabaseAdmin.from("ascend_project_sponsors").insert({name:sponsorName,website:sponsorWebsite,verification_status:"verified",verification_notes:"Verified by ASCEND Projects admin during controlled reward setup.",created_by:adminId,verified_by:adminId,verified_at:new Date().toISOString()}).select("id,verification_status").single();if(created.error)throw projectErrorFromDatabase(created.error);sponsor=created.data}
  if(sponsor.verification_status!=="verified")throw new ProjectServiceError("INVALID_REQUEST","The sponsor must be verified before a Reward Project is created.",409);
  const projectInsert=await supabaseAdmin.from("ascend_projects").insert({sponsor_id:sponsor.id,project_type:"reward",entry_mode:"open",title,summary,brief,category,difficulty,skills,deliverables,estimated_minutes:Math.max(15,Math.min(12000,Number(input.estimatedMinutes)||180)),feedback_level:"scored",ai_policy:"limited",ai_policy_detail:"AI may support structure and editing, but the participant remains responsible for the work and its accuracy.",rights_model:"portfolio",usage_terms:usageTerms,submission_deadline:deadline.toISOString(),status:"draft",created_by:adminId}).select("id,title,status").single();if(projectInsert.error)throw projectErrorFromDatabase(projectInsert.error);
  const confirmed=["confirmed","secured"].includes(fundingStatus);const [criteriaResult,rewardResult]=await Promise.all([supabaseAdmin.from("ascend_project_criteria").insert([{project_id:projectInsert.data.id,title:"Quality",description:"The work meets the brief and deliverables.",weight:40,position:1},{project_id:projectInsert.data.id,title:"Reasoning",description:"Choices are clear and supported.",weight:35,position:2},{project_id:projectInsert.data.id,title:"Presentation",description:"The result is organised and usable.",weight:25,position:3}]),supabaseAdmin.from("ascend_project_rewards").insert({project_id:projectInsert.data.id,reward_model:rewardModel,recipient_count:recipientCount,amount_minor:amountMinor,currency:rewardModel==="non_cash"?null:"NGN",non_cash_description:nonCashDescription,funding_status:fundingStatus,funding_reference:fundingReference,payment_owner:"Praevoryn / ASCEND",confirmed_by:confirmed?adminId:null,confirmed_at:confirmed?new Date().toISOString():null})]);
  if(criteriaResult.error)throw projectErrorFromDatabase(criteriaResult.error);if(rewardResult.error)throw projectErrorFromDatabase(rewardResult.error);return projectInsert.data;
}

export async function updateRewardFunding(projectId:string,input:Record<string,unknown>,adminId:string){const status=String(input.fundingStatus??"");if(!["awaiting_confirmation","confirmed","secured","cancelled"].includes(status))throw new ProjectServiceError("INVALID_REQUEST","Choose a valid funding status.",400);const reference=String(input.fundingReference??"").trim().slice(0,240)||null;if(["confirmed","secured"].includes(status)&&!reference)throw new ProjectServiceError("INVALID_REQUEST","Add a funding reference before confirming funds.",400);const confirmed=["confirmed","secured"].includes(status);const result=await supabaseAdmin.from("ascend_project_rewards").update({funding_status:status,funding_reference:reference,confirmed_by:confirmed?adminId:null,confirmed_at:confirmed?new Date().toISOString():null}).eq("project_id",projectId).select("project_id,funding_status,funding_reference").single();if(result.error)throw projectErrorFromDatabase(result.error);return result.data}

export async function transitionProject(projectId:string,next:ProjectStatus,adminId:string){
  const projectResult=await supabaseAdmin.from("ascend_projects").select("*").eq("id",projectId).single(); if(projectResult.error)throw projectErrorFromDatabase(projectResult.error);
  const project=projectResult.data; const current=project.status as ProjectStatus;
  if(!canTransitionProjectStatus(current,next))throw new ProjectServiceError("INVALID_REQUEST",`A Project cannot move from ${current} to ${next}.`,409);
  if(next==="published"||next==="scheduled"){
    const [criteria,reward]=await Promise.all([supabaseAdmin.from("ascend_project_criteria").select("weight").eq("project_id",projectId),supabaseAdmin.from("ascend_project_rewards").select("*").eq("project_id",projectId).maybeSingle()]);
    if(criteria.error)throw projectErrorFromDatabase(criteria.error);if(reward.error)throw projectErrorFromDatabase(reward.error);
    const errors=validateProjectPublication({title:project.title,summary:project.summary,brief:project.brief,deliverables:project.deliverables,criteriaWeights:(criteria.data??[]).map(item=>item.weight),submissionDeadline:project.submission_deadline,rightsModel:project.rights_model,usageTerms:project.usage_terms,reward:project.project_type==="practice"?{projectType:"practice",rewardModel:null,recipientCount:null,amountMinor:null,currency:null,nonCashDescription:null,fundingStatus:null}:{projectType:"reward",rewardModel:reward.data?.reward_model??null,recipientCount:reward.data?.recipient_count??null,amountMinor:reward.data?.amount_minor??null,currency:reward.data?.currency??null,nonCashDescription:reward.data?.non_cash_description??null,fundingStatus:reward.data?.funding_status??null}});
    if(errors.length)throw new ProjectServiceError("INVALID_REQUEST",errors.join(" "),400);
  }
  const {data,error}=await supabaseAdmin.from("ascend_projects").update({status:next,reviewed_by:adminId,published_at:next==="published"?(project.published_at??new Date().toISOString()):project.published_at}).eq("id",projectId).select("id,title,status").single(); if(error)throw projectErrorFromDatabase(error);return data;
}

export async function reviewProjectSubmission(submissionId:string,input:Record<string,unknown>,adminId:string){
  const outcome=String(input.outcome??""); if(!["completed","revision_requested","not_completed","award_recommended"].includes(outcome))throw new ProjectServiceError("INVALID_REQUEST","Choose a valid review outcome.",400);
  const score=input.overallScore===null||input.overallScore===undefined?null:Number(input.overallScore); const feedback=String(input.userFeedback??"").trim().slice(0,5000);
  const {data,error}=await supabaseAdmin.rpc("ascend_review_project_submission",{p_submission_id:submissionId,p_reviewer_user_id:adminId,p_outcome:outcome,p_overall_score:score,p_criterion_scores:{},p_user_feedback:feedback,p_private_notes:String(input.privateNotes??"").slice(0,5000),p_revision_days:Math.max(1,Math.min(30,Number(input.revisionDays)||7))});
  if(error)throw projectErrorFromDatabase(error);return Array.isArray(data)?data[0]:data;
}
