import "server-only";

import { ascendWorkClient } from "./client";

export const partnerStages = ["new", "contacted", "interested", "verification", "mission_proposed", "funding_secured", "published", "completed", "repeat_partner", "declined"] as const;
export type PartnerStage = (typeof partnerStages)[number];

export type WorkPartnerLead = {
  id: string;
  organizationName: string;
  website: string | null;
  contactName: string;
  contactEmail: string;
  contactRole: string | null;
  organizationType: string;
  taskCategory: string;
  taskSummary: string;
  expectedDeliverables: string | null;
  budgetRange: string;
  estimatedHours: string;
  preferredStartDate: string | null;
  studentAudience: string | null;
  fundingConfirmed: boolean;
  stage: PartnerStage;
  source: string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

type NewPartnerLead = Omit<WorkPartnerLead, "id" | "stage" | "source" | "adminNotes" | "createdAt" | "updatedAt">;

function mapPartner(row: Record<string, unknown>): WorkPartnerLead {
  return {
    id: String(row.id), organizationName: String(row.organization_name), website: row.website ? String(row.website) : null,
    contactName: String(row.contact_name), contactEmail: String(row.contact_email), contactRole: row.contact_role ? String(row.contact_role) : null,
    organizationType: String(row.organization_type), taskCategory: String(row.task_category), taskSummary: String(row.task_summary),
    expectedDeliverables: row.expected_deliverables ? String(row.expected_deliverables) : null, budgetRange: String(row.budget_range),
    estimatedHours: String(row.estimated_hours), preferredStartDate: row.preferred_start_date ? String(row.preferred_start_date) : null,
    studentAudience: row.student_audience ? String(row.student_audience) : null, fundingConfirmed: Boolean(row.funding_confirmed),
    stage: row.stage as PartnerStage, source: String(row.source), adminNotes: row.admin_notes ? String(row.admin_notes) : null,
    createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  };
}

export async function createPartnerLead(input: NewPartnerLead): Promise<WorkPartnerLead> {
  const { data, error } = await ascendWorkClient.from("ascend_work_partner_leads").insert({
    organization_name: input.organizationName, website: input.website, contact_name: input.contactName,
    contact_email: input.contactEmail.toLowerCase(), contact_role: input.contactRole, organization_type: input.organizationType,
    task_category: input.taskCategory, task_summary: input.taskSummary, expected_deliverables: input.expectedDeliverables,
    budget_range: input.budgetRange, estimated_hours: input.estimatedHours, preferred_start_date: input.preferredStartDate,
    student_audience: input.studentAudience, funding_confirmed: input.fundingConfirmed, stage: "new", source: "public_form",
  }).select("*").single();
  if (error || !data) throw new Error(`PARTNER_CREATE_FAILED:${error?.message ?? "empty response"}`);
  return mapPartner(data as Record<string, unknown>);
}

export async function listPartnerLeads(): Promise<WorkPartnerLead[]> {
  const { data, error } = await ascendWorkClient.from("ascend_work_partner_leads").select("*").order("updated_at", { ascending: false });
  if (error) throw new Error(`PARTNER_LIST_FAILED:${error.message}`);
  return (data ?? []).map((row) => mapPartner(row as Record<string, unknown>));
}

export async function updatePartnerLead(id: string, stage: PartnerStage, adminNotes?: string): Promise<WorkPartnerLead> {
  const { data, error } = await ascendWorkClient.from("ascend_work_partner_leads").update({ stage, admin_notes: adminNotes || null, updated_at: new Date().toISOString() }).eq("id", id).select("*").single();
  if (error || !data) throw new Error(`PARTNER_UPDATE_FAILED:${error?.message ?? "empty response"}`);
  return mapPartner(data as Record<string, unknown>);
}
