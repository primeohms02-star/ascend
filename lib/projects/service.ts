import "server-only";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { ProjectServiceError, projectErrorFromDatabase } from "./errors";
import type { ProjectListInput, ProjectSubmissionInput } from "./input";
import type { ProjectCard } from "./types";

const projectCardFields = [
  "id",
  "project_type",
  "entry_mode",
  "title",
  "summary",
  "category",
  "difficulty",
  "skills",
  "estimated_minutes",
  "capacity",
  "feedback_level",
  "starts_at",
  "join_deadline",
  "submission_deadline",
  "results_at",
  "published_at",
  "sponsor_id",
].join(",");

const projectDetailFields = [
  projectCardFields,
  "brief",
  "deliverables",
  "eligibility",
  "resources",
  "ai_policy",
  "ai_policy_detail",
  "rights_model",
  "usage_terms",
].join(",");

export async function listPublishedProjects(input: ProjectListInput) {
  const from = (input.page - 1) * input.pageSize;
  const to = from + input.pageSize - 1;
  const now = new Date().toISOString();

  let query = supabaseAdmin
    .from("ascend_projects")
    .select(projectCardFields, { count: "exact" })
    .eq("status", "published")
    .gt("submission_deadline", now)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (input.projectType) query = query.eq("project_type", input.projectType);
  if (input.difficulty) query = query.eq("difficulty", input.difficulty);
  if (input.category) query = query.eq("category", input.category);
  if (input.search) query = query.ilike("title", `%${input.search.replace(/[%_]/g, "")}%`);

  const { data, error, count } = await query;
  if (error) throw projectErrorFromDatabase(error);

  const total = count ?? 0;
  return {
    projects: (data ?? []) as unknown as ProjectCard[],
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.ceil(total / input.pageSize),
      hasNextPage: to + 1 < total,
      hasPreviousPage: input.page > 1,
    },
  };
}

export async function getPublishedProject(projectId: string, userId: string) {
  const now = new Date().toISOString();
  const [projectResult, criteriaResult, rewardResult, participationResult] = await Promise.all([
    supabaseAdmin.from("ascend_projects").select(projectDetailFields).eq("id", projectId).eq("status", "published").gt("submission_deadline", now).maybeSingle(),
    supabaseAdmin.from("ascend_project_criteria").select("id,title,description,weight,position").eq("project_id", projectId).order("position"),
    supabaseAdmin.from("ascend_project_rewards").select("reward_model,recipient_count,amount_minor,currency,non_cash_description,funding_status,expected_delivery_at").eq("project_id", projectId).maybeSingle(),
    supabaseAdmin.from("ascend_project_participations").select("id,status,joined_at,started_at,submitted_at,completed_at").eq("project_id", projectId).eq("user_id", userId).maybeSingle(),
  ]);

  if (projectResult.error) throw projectErrorFromDatabase(projectResult.error);
  if (!projectResult.data) throw new ProjectServiceError("PROJECT_NOT_FOUND", "This Project is unavailable or could not be found.", 404);
  if (criteriaResult.error) throw projectErrorFromDatabase(criteriaResult.error);
  if (rewardResult.error) throw projectErrorFromDatabase(rewardResult.error);
  if (participationResult.error) throw projectErrorFromDatabase(participationResult.error);

  const project = projectResult.data as unknown as Record<string, unknown> & { sponsor_id: string | null };
  let sponsor = null;
  if (project.sponsor_id) {
    const sponsorResult = await supabaseAdmin
      .from("ascend_project_sponsors")
      .select("id,name,website,verification_status")
      .eq("id", project.sponsor_id)
      .eq("verification_status", "verified")
      .maybeSingle();
    if (sponsorResult.error) throw projectErrorFromDatabase(sponsorResult.error);
    sponsor = sponsorResult.data;
  }

  return {
    project,
    criteria: criteriaResult.data ?? [],
    reward: rewardResult.data,
    sponsor,
    participation: participationResult.data,
  };
}

export async function joinProject(projectId: string, userId: string) {
  const { data, error } = await supabaseAdmin.rpc("ascend_join_project", {
    p_project_id: projectId,
    p_user_id: userId,
  });
  if (error) throw projectErrorFromDatabase(error);
  const participation = Array.isArray(data) ? data[0] : data;
  if (!participation) throw new ProjectServiceError("SERVICE_FAILURE", "ASCEND could not join this Project.", 500);
  return participation;
}

export async function listUserParticipations(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("ascend_project_participations")
    .select("id,project_id,status,joined_at,started_at,submitted_at,completed_at,updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw projectErrorFromDatabase(error);
  const participations = data ?? [];
  if (!participations.length) return [];

  const projectIds = participations.map((item) => item.project_id);
  const participationIds = participations.map((item) => item.id);
  const [projectsResult, submissionsResult, evidenceResult] = await Promise.all([
    supabaseAdmin.from("ascend_projects").select(projectCardFields).in("id", projectIds),
    supabaseAdmin.from("ascend_project_submissions").select("participation_id,status").in("participation_id", participationIds),
    supabaseAdmin.from("ascend_project_evidence").select("participation_id,evidence_status").in("participation_id", participationIds),
  ]);
  if (projectsResult.error) throw projectErrorFromDatabase(projectsResult.error);
  if (submissionsResult.error) throw projectErrorFromDatabase(submissionsResult.error);
  if (evidenceResult.error) throw projectErrorFromDatabase(evidenceResult.error);

  const projectRows = (projectsResult.data ?? []) as unknown as ProjectCard[];
  const projects = new Map(projectRows.map((item) => [item.id, item]));
  const submissions = new Map((submissionsResult.data ?? []).map((item) => [item.participation_id, item.status]));
  const evidence = new Map((evidenceResult.data ?? []).map((item) => [item.participation_id, item.evidence_status]));

  return participations.map((item) => ({
    ...item,
    project: projects.get(item.project_id) ?? null,
    submissionStatus: submissions.get(item.id) ?? null,
    evidenceStatus: evidence.get(item.id) ?? null,
  }));
}

export async function getUserProjectWorkspace(projectId: string, userId: string) {
  const participationResult = await supabaseAdmin
    .from("ascend_project_participations")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .maybeSingle();
  if (participationResult.error) throw projectErrorFromDatabase(participationResult.error);
  if (!participationResult.data) {
    throw new ProjectServiceError("PARTICIPATION_REQUIRED", "Join this Project before opening its workspace.", 403);
  }

  const [projectResult, criteriaResult, submissionResult, evidenceResult] = await Promise.all([
    supabaseAdmin.from("ascend_projects").select(projectDetailFields).eq("id", projectId).single(),
    supabaseAdmin.from("ascend_project_criteria").select("id,title,description,weight,position").eq("project_id", projectId).order("position"),
    supabaseAdmin.from("ascend_project_submissions").select("id,deliverable_responses,participant_note,status,current_version,revision_note,revision_deadline,submitted_at,reviewed_at,updated_at").eq("participation_id", participationResult.data.id).maybeSingle(),
    supabaseAdmin.from("ascend_project_evidence").select("id,title,summary,skills,evidence_status,visibility,share_token,verified_at,created_at").eq("participation_id", participationResult.data.id).maybeSingle(),
  ]);

  if (projectResult.error) throw projectErrorFromDatabase(projectResult.error);
  if (criteriaResult.error) throw projectErrorFromDatabase(criteriaResult.error);
  if (submissionResult.error) throw projectErrorFromDatabase(submissionResult.error);
  if (evidenceResult.error) throw projectErrorFromDatabase(evidenceResult.error);

  const reviewsResult = submissionResult.data
    ? await supabaseAdmin.from("ascend_project_reviews").select("outcome,criterion_scores,overall_score,user_feedback,created_at").eq("submission_id", submissionResult.data.id).order("created_at", { ascending: false })
    : { data: [], error: null };
  if (reviewsResult.error) throw projectErrorFromDatabase(reviewsResult.error);

  return {
    project: projectResult.data,
    criteria: criteriaResult.data ?? [],
    participation: participationResult.data,
    submission: submissionResult.data,
    reviews: reviewsResult.data ?? [],
    evidence: evidenceResult.data,
  };
}

export async function listUserProjectEvidence(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("ascend_project_evidence")
    .select("id,project_id,title,summary,skills,evidence_status,visibility,share_token,verified_at,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw projectErrorFromDatabase(error);
  return data ?? [];
}

export async function getUserSubmission(projectId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from("ascend_project_submissions")
    .select("id,participation_id,project_id,deliverable_responses,participant_note,status,current_version,revision_note,submitted_at,reviewed_at,updated_at")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw projectErrorFromDatabase(error);
  return data;
}

export async function saveUserSubmission(
  projectId: string,
  userId: string,
  input: ProjectSubmissionInput,
  submit: boolean,
) {
  const { data, error } = await supabaseAdmin.rpc("ascend_save_project_submission", {
    p_project_id: projectId,
    p_user_id: userId,
    p_deliverable_responses: input.deliverableResponses,
    p_participant_note: input.participantNote,
    p_submit: submit,
  });
  if (error) throw projectErrorFromDatabase(error);
  const submission = Array.isArray(data) ? data[0] : data;
  if (!submission) throw new ProjectServiceError("SERVICE_FAILURE", "ASCEND could not save this submission.", 500);
  return submission;
}
