import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { projectErrorFromDatabase, ProjectServiceError } from "./errors";
import { canTransitionProjectStatus, validateProjectPublication } from "./lifecycle";
import type { ProjectStatus } from "./types";

export async function listProjectsForAdmin() {
  const [projects, submissions] = await Promise.all([
    supabaseAdmin.from("ascend_projects").select("id,title,project_type,category,difficulty,status,submission_deadline,published_at,updated_at").order("updated_at",{ascending:false}),
    supabaseAdmin.from("ascend_project_submissions").select("id,project_id,user_id,status,current_version,submitted_at,participant_note,deliverable_responses").eq("status","submitted").order("submitted_at",{ascending:true}),
  ]);
  if(projects.error)throw projectErrorFromDatabase(projects.error); if(submissions.error)throw projectErrorFromDatabase(submissions.error);
  return {projects:projects.data??[],submissions:submissions.data??[]};
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
