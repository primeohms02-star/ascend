import "server-only";

import { ascendWorkClient } from "./client";
import { isAscendWorkAdmin } from "./admin-auth";
import type { PaidMission, WorkAccess, WorkAccessSource } from "./types";

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
  published_at: string;
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
    publishedAt: row.published_at,
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
