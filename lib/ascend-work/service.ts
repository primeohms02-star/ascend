import "server-only";

import { ascendWorkClient } from "./client";
import { isAscendWorkAdmin } from "./admin-auth";
import type { PaidMission, PaidMissionAdmin, WorkAccess, WorkAccessSource, WorkApplicationAdmin, WorkApplicationWorkspace, WorkAuditEvent, WorkNotification, WorkOrganizationAdmin, WorkOverview, WorkSubmissionAdmin, WorkSubmissionStatus, WorkVerifiedEvidence } from "./types";

type AccessRow = {
  source: WorkAccessSource;
  sponsor_name: string | null;
  ends_at: string | null;
};

type ProjectRow = {
  id: string;
  organization_id: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  required_skills: string[] | null;
  deliverables: string[] | null;
  payment_amount_minor: number;
  currency: string;
  estimated_hours: number;
  available_slots: number;
  application_deadline: string;
  delivery_deadline: string;
  published_at: string | null;
  status?: PaidMissionAdmin["status"];
  created_at?: string;
  updated_at?: string;
  organization: { name: string; verification_status: string } | null;
};

function mapProject(row: ProjectRow): PaidMission {
  return {
    id: row.id,
    organizationId: row.organization_id,
    organizationName: row.organization?.name ?? "Verified organisation",
    title: row.title,
    summary: row.summary,
    description: row.description,
    category: row.category,
    requiredSkills: row.required_skills ?? [],
    deliverables: row.deliverables ?? [],
    paymentAmountMinor: Number(row.payment_amount_minor),
    currency: row.currency,
    estimatedHours: row.estimated_hours,
    availableSlots: row.available_slots,
    applicationDeadline: row.application_deadline,
    deliveryDeadline: row.delivery_deadline,
    publishedAt: row.published_at ?? "",
  };
}

function mapAdminProject(row: ProjectRow): PaidMissionAdmin {
  return {
    ...mapProject(row),
    status: row.status ?? "draft",
    organizationVerificationStatus: row.organization?.verification_status ?? "unknown",
    publishedAt: row.published_at,
    createdAt: row.created_at ?? "",
    updatedAt: row.updated_at ?? "",
  };
}

export async function getWorkAccess(userId: string): Promise<WorkAccess> {
  if (isAscendWorkAdmin(userId)) {
    return { active: true, source: "admin", sponsorName: "ASCEND", endsAt: null };
  }

  const now = new Date().toISOString();
  const { data, error } = await ascendWorkClient
    .from("ascend_work_access_grants")
    .select("source,sponsor_name,ends_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .lte("starts_at", now)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`ASCEND Work access lookup failed: ${error.message}`);
  const grant = data as AccessRow | null;
  return grant
    ? { active: true, source: grant.source, sponsorName: grant.sponsor_name, endsAt: grant.ends_at }
    : { active: false, source: null, sponsorName: null, endsAt: null };
}

const projectSelection = `
  id,organization_id,title,summary,description,category,required_skills,deliverables,
  payment_amount_minor,currency,estimated_hours,available_slots,application_deadline,
  delivery_deadline,published_at,
  organization:ascend_work_organizations(name,verification_status)
`;

const adminProjectSelection = `
  id,organization_id,title,summary,description,category,required_skills,deliverables,
  payment_amount_minor,currency,estimated_hours,available_slots,application_deadline,
  delivery_deadline,status,published_at,created_at,updated_at,
  organization:ascend_work_organizations(name,verification_status)
`;

export async function listWorkOrganizationsAdmin(): Promise<WorkOrganizationAdmin[]> {
  const { data, error } = await ascendWorkClient
    .from("ascend_work_organizations")
    .select("id,name,website,verification_status")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`ASCEND Work organisations could not be loaded: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    website: row.website,
    verificationStatus: row.verification_status as WorkOrganizationAdmin["verificationStatus"],
  }));
}

export async function listPaidMissionsAdmin(): Promise<PaidMissionAdmin[]> {
  const { data, error } = await ascendWorkClient
    .from("ascend_work_projects")
    .select(adminProjectSelection)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`ASCEND Work admin projects could not be loaded: ${error.message}`);
  return (data as unknown as ProjectRow[]).map(mapAdminProject);
}

export async function listPublishedPaidMissions(): Promise<PaidMission[]> {
  const { data, error } = await ascendWorkClient
    .from("ascend_work_projects")
    .select(projectSelection)
    .eq("status", "published")
    .gt("application_deadline", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(`Paid Missions could not be loaded: ${error.message}`);
  return (data as unknown as ProjectRow[])
    .filter((row) => row.organization?.verification_status === "verified")
    .map(mapProject);
}

export async function getPublishedPaidMission(id: string): Promise<PaidMission | null> {
  const { data, error } = await ascendWorkClient
    .from("ascend_work_projects")
    .select(projectSelection)
    .eq("id", id)
    .eq("status", "published")
    .gt("application_deadline", new Date().toISOString())
    .maybeSingle();

  if (error) throw new Error(`Paid Mission could not be loaded: ${error.message}`);
  const row = data as unknown as ProjectRow | null;
  if (!row || row.organization?.verification_status !== "verified") return null;
  return mapProject(row);
}

export async function getAppliedPaidMissionIds(userId: string): Promise<Set<string>> {
  const { data, error } = await ascendWorkClient
    .from("ascend_work_applications")
    .select("project_id")
    .eq("user_id", userId)
    .neq("status", "withdrawn");

  if (error) throw new Error(`Paid Mission applications could not be loaded: ${error.message}`);
  return new Set((data as { project_id: string }[] | null)?.map((row) => row.project_id) ?? []);
}

export async function applyForPaidMission(input: {
  userId: string;
  projectId: string;
  coverNote: string;
}) {
  const access = await getWorkAccess(input.userId);
  if (!access.active) throw new Error("ASCEND_WORK_ACCESS_REQUIRED");

  const project = await getPublishedPaidMission(input.projectId);
  if (!project) throw new Error("ASCEND_WORK_PROJECT_UNAVAILABLE");

  const { data, error } = await ascendWorkClient
    .from("ascend_work_applications")
    .insert({
      project_id: project.id,
      user_id: input.userId,
      cover_note: input.coverNote,
      status: "submitted",
    })
    .select("id,status,submitted_at")
    .single();

  if (error?.code === "23505") throw new Error("ASCEND_WORK_ALREADY_APPLIED");
  if (error) throw new Error(`Paid Mission application failed: ${error.message}`);
  return data as { id: string; status: string; submitted_at: string };
}

export async function createWorkOrganization(input: {
  adminUserId: string;
  name: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  verificationStatus: "pending" | "verified";
  verificationNotes?: string;
}) {
  const verified = input.verificationStatus === "verified";
  const { data, error } = await ascendWorkClient
    .from("ascend_work_organizations")
    .insert({
      name: input.name,
      website: input.website || null,
      contact_name: input.contactName || null,
      contact_email: input.contactEmail || null,
      verification_status: input.verificationStatus,
      verification_notes: input.verificationNotes || null,
      created_by: input.adminUserId,
      verified_by: verified ? input.adminUserId : null,
      verified_at: verified ? new Date().toISOString() : null,
    })
    .select("id,name,verification_status,created_at")
    .single();

  if (error) throw new Error(`ASCEND Work organisation creation failed: ${error.message}`);
  return data;
}

export async function createPaidMission(input: {
  adminUserId: string;
  organizationId: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  requiredSkills: string[];
  deliverables: string[];
  paymentAmountMinor: number;
  currency: string;
  estimatedHours: number;
  availableSlots: number;
  applicationDeadline: string;
  deliveryDeadline: string;
  status: "draft" | "review" | "published";
}) {
  if (input.status === "published") {
    const { data: organization, error: organizationError } = await ascendWorkClient
      .from("ascend_work_organizations")
      .select("verification_status")
      .eq("id", input.organizationId)
      .maybeSingle();
    if (organizationError) throw new Error(`Organisation verification failed: ${organizationError.message}`);
    if (organization?.verification_status !== "verified") throw new Error("ASCEND_WORK_ORGANIZATION_NOT_VERIFIED");
  }

  const { data, error } = await ascendWorkClient
    .from("ascend_work_projects")
    .insert({
      organization_id: input.organizationId,
      title: input.title,
      summary: input.summary,
      description: input.description,
      category: input.category,
      required_skills: input.requiredSkills,
      deliverables: input.deliverables,
      payment_amount_minor: input.paymentAmountMinor,
      currency: input.currency,
      estimated_hours: input.estimatedHours,
      available_slots: input.availableSlots,
      application_deadline: input.applicationDeadline,
      delivery_deadline: input.deliveryDeadline,
      status: input.status,
      created_by: input.adminUserId,
      reviewed_by: input.status === "published" ? input.adminUserId : null,
      published_at: input.status === "published" ? new Date().toISOString() : null,
    })
    .select("id,title,status,created_at")
    .single();

  if (error) throw new Error(`Paid Mission creation failed: ${error.message}`);
  return data;
}

export async function updatePaidMissionDraft(input: {
  adminUserId: string;
  id: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  requiredSkills: string[];
  deliverables: string[];
  paymentAmountMinor: number;
  currency: string;
  estimatedHours: number;
  availableSlots: number;
  applicationDeadline: string;
  deliveryDeadline: string;
}) {
  const { data, error } = await ascendWorkClient
    .from("ascend_work_projects")
    .update({
      title: input.title,
      summary: input.summary,
      description: input.description,
      category: input.category,
      required_skills: input.requiredSkills,
      deliverables: input.deliverables,
      payment_amount_minor: input.paymentAmountMinor,
      currency: input.currency,
      estimated_hours: input.estimatedHours,
      available_slots: input.availableSlots,
      application_deadline: input.applicationDeadline,
      delivery_deadline: input.deliveryDeadline,
    })
    .eq("id", input.id)
    .in("status", ["draft", "review"])
    .select("id,title,status,updated_at")
    .maybeSingle();
  if (error) throw new Error(`Paid Mission update failed: ${error.message}`);
  if (!data) throw new Error("ASCEND_WORK_INVALID_TRANSITION");
  return data;
}

export async function transitionPaidMission(input: {
  adminUserId: string;
  id: string;
  action: "submit_review" | "return_draft" | "publish";
}) {
  const transitions = {
    submit_review: { from: "draft", to: "review" },
    return_draft: { from: "review", to: "draft" },
    publish: { from: "review", to: "published" },
  } as const;
  const transition = transitions[input.action];

  if (input.action === "publish") {
    const { data: project, error: projectError } = await ascendWorkClient
      .from("ascend_work_projects")
      .select("application_deadline,delivery_deadline,organization:ascend_work_organizations(verification_status)")
      .eq("id", input.id)
      .eq("status", "review")
      .maybeSingle();
    if (projectError) throw new Error(`Paid Mission review failed: ${projectError.message}`);
    if (!project) throw new Error("ASCEND_WORK_INVALID_TRANSITION");
    const organization = project.organization as unknown as { verification_status: string } | null;
    if (organization?.verification_status !== "verified") throw new Error("ASCEND_WORK_ORGANIZATION_NOT_VERIFIED");
    if (new Date(project.application_deadline) <= new Date()) throw new Error("ASCEND_WORK_DEADLINE_EXPIRED");
    if (new Date(project.delivery_deadline) <= new Date(project.application_deadline)) throw new Error("ASCEND_WORK_INVALID_DEADLINE");
  }

  const publishFields = input.action === "publish"
    ? { reviewed_by: input.adminUserId, published_at: new Date().toISOString() }
    : input.action === "submit_review"
      ? { reviewed_by: input.adminUserId, published_at: null }
      : { reviewed_by: null, published_at: null };
  const { data, error } = await ascendWorkClient
    .from("ascend_work_projects")
    .update({ status: transition.to, ...publishFields })
    .eq("id", input.id)
    .eq("status", transition.from)
    .select("id,title,status,published_at,updated_at")
    .maybeSingle();
  if (error) throw new Error(`Paid Mission transition failed: ${error.message}`);
  if (!data) throw new Error("ASCEND_WORK_INVALID_TRANSITION");
  return data;
}

export async function transitionPublishedPaidMission(input: {
  adminUserId: string;
  id: string;
  action: "pause" | "resume" | "close" | "complete";
}) {
  const transitions = {
    pause: { from: ["published"], to: "paused" },
    resume: { from: ["paused"], to: "published" },
    close: { from: ["published", "paused"], to: "closed" },
    complete: { from: ["closed"], to: "completed" },
  } as const;
  const transition = transitions[input.action];

  const { data: project, error: projectError } = await ascendWorkClient
    .from("ascend_work_projects")
    .select("id,title,status,application_deadline,delivery_deadline,organization:ascend_work_organizations(verification_status)")
    .eq("id", input.id)
    .maybeSingle();
  if (projectError) throw new Error(`Paid Mission lifecycle check failed: ${projectError.message}`);
  if (!project || !transition.from.includes(project.status as never)) throw new Error("ASCEND_WORK_INVALID_TRANSITION");

  if (input.action === "resume") {
    const organization = project.organization as unknown as { verification_status: string } | null;
    if (organization?.verification_status !== "verified") throw new Error("ASCEND_WORK_ORGANIZATION_NOT_VERIFIED");
    if (new Date(project.application_deadline) <= new Date()) throw new Error("ASCEND_WORK_DEADLINE_EXPIRED");
  }

  if (input.action === "complete") {
    const { count, error: countError } = await ascendWorkClient
      .from("ascend_work_applications")
      .select("id", { count: "exact", head: true })
      .eq("project_id", input.id)
      .in("status", ["submitted", "shortlisted", "accepted", "disputed"]);
    if (countError) throw new Error(`Paid Mission completion check failed: ${countError.message}`);
    if ((count ?? 0) > 0) throw new Error("ASCEND_WORK_UNRESOLVED_APPLICATIONS");
  }

  const { data, error } = await ascendWorkClient
    .from("ascend_work_projects")
    .update({ status: transition.to, reviewed_by: input.adminUserId })
    .eq("id", input.id)
    .in("status", [...transition.from])
    .select("id,title,status,updated_at")
    .maybeSingle();
  if (error) throw new Error(`Paid Mission lifecycle update failed: ${error.message}`);
  if (!data) throw new Error("ASCEND_WORK_INVALID_TRANSITION");
  return data;
}

export async function listProjectApplicationsAdmin(projectId: string): Promise<WorkApplicationAdmin[]> {
  const { data, error } = await ascendWorkClient
    .from("ascend_work_applications")
    .select("id,project_id,user_id,cover_note,status,submitted_at,updated_at")
    .eq("project_id", projectId)
    .order("submitted_at", { ascending: true })
    .limit(500);
  if (error) throw new Error(`Paid Mission applicants could not be loaded: ${error.message}`);

  const applications = data ?? [];
  const userIds = [...new Set(applications.map((application) => application.user_id))];
  const profilesByUser = new Map<string, { full_name: string | null; email: string | null }>();
  if (userIds.length) {
    const { data: profiles, error: profileError } = await ascendWorkClient
      .from("profiles")
      .select("clerk_id,full_name,email")
      .in("clerk_id", userIds);
    if (profileError) throw new Error(`Applicant profiles could not be loaded: ${profileError.message}`);
    for (const profile of profiles ?? []) profilesByUser.set(profile.clerk_id, profile);
  }

  return applications.map((application) => {
    const profile = profilesByUser.get(application.user_id);
    return {
      id: application.id,
      projectId: application.project_id,
      userId: application.user_id,
      applicantName: profile?.full_name?.trim() || "ASCEND user",
      applicantEmail: profile?.email ?? null,
      coverNote: application.cover_note,
      status: application.status as WorkApplicationAdmin["status"],
      submittedAt: application.submitted_at,
      updatedAt: application.updated_at,
    };
  });
}

export async function transitionWorkApplicationAdmin(input: {
  adminUserId: string;
  applicationId: string;
  action: "shortlist" | "accept" | "reject";
}) {
  const { data, error } = await ascendWorkClient.rpc("ascend_work_transition_application", {
    p_application_id: input.applicationId,
    p_admin_user_id: input.adminUserId,
    p_action: input.action,
  });
  if (error) {
    const message = error.message ?? "";
    if (message.includes("ASCEND_WORK_NO_SLOTS")) throw new Error("ASCEND_WORK_NO_SLOTS");
    if (message.includes("ASCEND_WORK_INVALID_TRANSITION")) throw new Error("ASCEND_WORK_INVALID_TRANSITION");
    if (message.includes("ASCEND_WORK_APPLICATION_NOT_FOUND")) throw new Error("ASCEND_WORK_APPLICATION_NOT_FOUND");
    throw new Error(`Application status update failed: ${message}`);
  }
  return (data as { application_id: string; application_status: string }[] | null)?.[0] ?? null;
}

type WorkspaceRow = {
  id: string;
  project_id: string;
  user_id: string;
  cover_note: string;
  status: WorkApplicationWorkspace["applicationStatus"];
  submitted_at: string;
  project: {
    title: string;
    deliverables: string[] | null;
    delivery_deadline: string;
    payment_amount_minor: number;
    currency: string;
    organization: { name: string } | null;
  } | null;
  submission: {
    id: string;
    deliverable_responses: Record<string, string> | null;
    student_note: string | null;
    status: WorkSubmissionStatus;
    revision_note: string | null;
    submitted_at: string | null;
    reviewed_at: string | null;
    updated_at: string;
  } | {
    id: string;
    deliverable_responses: Record<string, string> | null;
    student_note: string | null;
    status: WorkSubmissionStatus;
    revision_note: string | null;
    submitted_at: string | null;
    reviewed_at: string | null;
    updated_at: string;
  }[] | null;
};

const workspaceSelection = `
  id,project_id,user_id,cover_note,status,submitted_at,
  project:ascend_work_projects(
    title,deliverables,delivery_deadline,payment_amount_minor,currency,
    organization:ascend_work_organizations(name)
  ),
  submission:ascend_work_submissions(
    id,deliverable_responses,student_note,status,revision_note,submitted_at,reviewed_at,updated_at
  )
`;

function mapWorkspace(row: WorkspaceRow): WorkApplicationWorkspace {
  if (!row.project) throw new Error("ASCEND_WORK_PROJECT_NOT_FOUND");
  const submission = Array.isArray(row.submission)
    ? row.submission[0] ?? null
    : row.submission;
  return {
    id: row.id,
    projectId: row.project_id,
    projectTitle: row.project.title,
    organizationName: row.project.organization?.name ?? "Verified organisation",
    applicationStatus: row.status,
    coverNote: row.cover_note,
    submittedAt: row.submitted_at,
    deliverables: row.project.deliverables ?? [],
    deliveryDeadline: row.project.delivery_deadline,
    paymentAmountMinor: Number(row.project.payment_amount_minor),
    currency: row.project.currency,
    submission: submission ? {
      id: submission.id,
      responses: submission.deliverable_responses ?? {},
      studentNote: submission.student_note ?? "",
      status: submission.status,
      revisionNote: submission.revision_note,
      submittedAt: submission.submitted_at,
      reviewedAt: submission.reviewed_at,
      updatedAt: submission.updated_at,
    } : null,
  };
}

export async function listUserWorkApplications(userId: string): Promise<WorkApplicationWorkspace[]> {
  const { data, error } = await ascendWorkClient
    .from("ascend_work_applications")
    .select(workspaceSelection)
    .eq("user_id", userId)
    .neq("status", "withdrawn")
    .order("submitted_at", { ascending: false });
  if (error) throw new Error(`Your Paid Mission applications could not be loaded: ${error.message}`);
  return (data as unknown as WorkspaceRow[]).map(mapWorkspace);
}

export async function getUserWorkApplication(userId: string, applicationId: string): Promise<WorkApplicationWorkspace | null> {
  const { data, error } = await ascendWorkClient
    .from("ascend_work_applications")
    .select(workspaceSelection)
    .eq("id", applicationId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`Your Paid Mission workspace could not be loaded: ${error.message}`);
  return data ? mapWorkspace(data as unknown as WorkspaceRow) : null;
}

export async function saveWorkSubmission(input: {
  userId: string;
  applicationId: string;
  responses: Record<string, string>;
  studentNote: string;
  submit: boolean;
}) {
  const workspace = await getUserWorkApplication(input.userId, input.applicationId);
  if (!workspace) throw new Error("ASCEND_WORK_APPLICATION_NOT_FOUND");
  if (workspace.applicationStatus !== "accepted") throw new Error("ASCEND_WORK_WORKSPACE_UNAVAILABLE");
  if (!workspace.submission) throw new Error("ASCEND_WORK_SUBMISSION_NOT_FOUND");
  if (!["draft", "revision_requested"].includes(workspace.submission.status)) throw new Error("ASCEND_WORK_SUBMISSION_LOCKED");

  const responses = Object.fromEntries(workspace.deliverables.map((deliverable) => [deliverable, input.responses[deliverable]?.trim() ?? ""]));
  if (input.submit && workspace.deliverables.some((deliverable) => !responses[deliverable])) {
    throw new Error("ASCEND_WORK_DELIVERABLES_INCOMPLETE");
  }

  const nextStatus = input.submit ? "submitted" : workspace.submission.status === "revision_requested" ? "revision_requested" : "draft";
  const { data, error } = await ascendWorkClient
    .from("ascend_work_submissions")
    .update({
      deliverable_responses: responses,
      student_note: input.studentNote.trim() || null,
      status: nextStatus,
      submitted_at: input.submit ? new Date().toISOString() : workspace.submission.submittedAt,
    })
    .eq("id", workspace.submission.id)
    .eq("user_id", input.userId)
    .in("status", ["draft", "revision_requested"])
    .select("id,status,submitted_at,updated_at")
    .maybeSingle();
  if (error) throw new Error(`Paid Mission submission could not be saved: ${error.message}`);
  if (!data) throw new Error("ASCEND_WORK_SUBMISSION_LOCKED");
  return data;
}

export async function listProjectSubmissionsAdmin(projectId: string): Promise<WorkSubmissionAdmin[]> {
  const { data, error } = await ascendWorkClient
    .from("ascend_work_applications")
    .select(workspaceSelection)
    .eq("project_id", projectId)
    .in("status", ["accepted", "completed", "disputed"])
    .order("submitted_at", { ascending: true });
  if (error) throw new Error(`Paid Mission submissions could not be loaded: ${error.message}`);
  const rows = data as unknown as WorkspaceRow[];
  const userIds = [...new Set(rows.map((row) => row.user_id))];
  const profilesByUser = new Map<string, { full_name: string | null; email: string | null }>();
  if (userIds.length) {
    const { data: profiles, error: profileError } = await ascendWorkClient.from("profiles").select("clerk_id,full_name,email").in("clerk_id", userIds);
    if (profileError) throw new Error(`Applicant profiles could not be loaded: ${profileError.message}`);
    for (const profile of profiles ?? []) profilesByUser.set(profile.clerk_id, profile);
  }
  return rows.map((row) => {
    const profile = profilesByUser.get(row.user_id);
    return {
      ...mapWorkspace(row),
      userId: row.user_id,
      applicantName: profile?.full_name?.trim() || "ASCEND user",
      applicantEmail: profile?.email ?? null,
    };
  });
}

export async function reviewWorkSubmissionAdmin(input: {
  adminUserId: string;
  submissionId: string;
  action: "request_revision" | "approve";
  revisionNote?: string;
}) {
  const { data, error } = await ascendWorkClient.rpc("ascend_work_review_submission", {
    p_submission_id: input.submissionId,
    p_admin_user_id: input.adminUserId,
    p_action: input.action,
    p_revision_note: input.revisionNote ?? null,
  });
  if (error) {
    const message = error.message ?? "";
    if (message.includes("ASCEND_WORK_INVALID_TRANSITION")) throw new Error("ASCEND_WORK_INVALID_TRANSITION");
    if (message.includes("ASCEND_WORK_REVISION_NOTE_REQUIRED")) throw new Error("ASCEND_WORK_REVISION_NOTE_REQUIRED");
    if (message.includes("ASCEND_WORK_SUBMISSION_NOT_FOUND")) throw new Error("ASCEND_WORK_SUBMISSION_NOT_FOUND");
    throw new Error(`Submission review failed: ${message}`);
  }
  return (data as { submission_id: string; submission_status: string }[] | null)?.[0] ?? null;
}

export async function listUserVerifiedWork(userId: string): Promise<WorkVerifiedEvidence[]> {
  const { data, error } = await ascendWorkClient
    .from("ascend_work_verified_evidence")
    .select("id,application_id,project_id,organization_name,title,summary,skills,deliverables,verified_at")
    .eq("user_id", userId)
    .order("verified_at", { ascending: false });
  if (error) throw new Error(`Verified Work could not be loaded: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id,
    applicationId: row.application_id,
    projectId: row.project_id,
    organizationName: row.organization_name,
    title: row.title,
    summary: row.summary,
    skills: row.skills ?? [],
    deliverables: row.deliverables && typeof row.deliverables === "object" && !Array.isArray(row.deliverables)
      ? row.deliverables as Record<string, string>
      : {},
    verifiedAt: row.verified_at,
  }));
}

export async function listUserWorkNotifications(userId: string): Promise<WorkNotification[]> {
  const { data, error } = await ascendWorkClient
    .from("ascend_work_notifications")
    .select("id,title,message,href,read_at,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`ASCEND Work notifications could not be loaded: ${error.message}`);
  return (data ?? []).map((row) => ({ id: row.id, title: row.title, message: row.message, href: row.href, readAt: row.read_at, createdAt: row.created_at }));
}

export async function countUnreadWorkNotifications(userId: string): Promise<number> {
  const { count, error } = await ascendWorkClient
    .from("ascend_work_notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);
  if (error) throw new Error(`ASCEND Work notification count failed: ${error.message}`);
  return count ?? 0;
}

export async function markWorkNotificationsRead(input: { userId: string; notificationId?: string }) {
  let query = ascendWorkClient
    .from("ascend_work_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", input.userId)
    .is("read_at", null);
  if (input.notificationId) query = query.eq("id", input.notificationId);
  const { error } = await query;
  if (error) throw new Error(`ASCEND Work notifications could not be updated: ${error.message}`);
}

export async function getUserWorkOverview(userId: string): Promise<WorkOverview> {
  const [applicationsResult, evidenceResult, notificationsResult] = await Promise.all([
    ascendWorkClient.from("ascend_work_applications").select("project_id,status").eq("user_id", userId).neq("status", "withdrawn"),
    ascendWorkClient.from("ascend_work_verified_evidence").select("id", { count: "exact", head: true }).eq("user_id", userId),
    ascendWorkClient.from("ascend_work_notifications").select("id", { count: "exact", head: true }).eq("user_id", userId).is("read_at", null),
  ]);
  if (applicationsResult.error) throw new Error(`ASCEND Work overview failed: ${applicationsResult.error.message}`);
  if (evidenceResult.error) throw new Error(`ASCEND Work overview failed: ${evidenceResult.error.message}`);
  if (notificationsResult.error) throw new Error(`ASCEND Work overview failed: ${notificationsResult.error.message}`);
  const applications = applicationsResult.data ?? [];
  return {
    applicationCount: applications.length,
    activeWorkspaceCount: applications.filter((item) => item.status === "accepted").length,
    verifiedWorkCount: evidenceResult.count ?? 0,
    unreadNotificationCount: notificationsResult.count ?? 0,
    appliedProjectIds: [...new Set(applications.map((item) => item.project_id))],
  };
}

export async function listWorkAuditEventsAdmin(projectId: string): Promise<WorkAuditEvent[]> {
  const { data, error } = await ascendWorkClient
    .from("ascend_work_audit_events")
    .select("id,project_id,application_id,actor_user_id,actor_type,event_type,from_status,to_status,metadata,created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(`ASCEND Work audit history could not be loaded: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id,
    projectId: row.project_id,
    applicationId: row.application_id,
    actorUserId: row.actor_user_id,
    actorType: row.actor_type as WorkAuditEvent["actorType"],
    eventType: row.event_type,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    metadata: row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata) ? row.metadata as Record<string, unknown> : {},
    createdAt: row.created_at,
  }));
}

export async function grantWorkAccess(input: {
  adminUserId: string;
  userId: string;
  source: Exclude<WorkAccessSource, "admin">;
  sponsorName?: string;
  startsAt?: string;
  endsAt?: string;
}) {
  const { data, error } = await ascendWorkClient
    .from("ascend_work_access_grants")
    .insert({
      user_id: input.userId,
      source: input.source,
      sponsor_name: input.sponsorName || null,
      starts_at: input.startsAt ?? new Date().toISOString(),
      ends_at: input.endsAt || null,
      created_by: input.adminUserId,
      status: "active",
      plan_code: "ascend_full",
    })
    .select("id,user_id,source,sponsor_name,starts_at,ends_at,status")
    .single();

  if (error) throw new Error(`ASCEND Work access grant failed: ${error.message}`);
  return data;
}
