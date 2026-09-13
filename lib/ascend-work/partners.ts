import "server-only";

import { ascendWorkClient } from "./client";
import { createPaidMission, createWorkOrganization } from "./service";

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
  outreachSubject: string | null; outreachBody: string | null; outreachPreparedAt: string | null;
  contactVerified: boolean; scopeConfirmed: boolean; deliverablesConfirmed: boolean; deadlineConfirmed: boolean;
  fundingAmountMinor: number | null; fundingCurrency: string | null; organizationId: string | null; projectId: string | null;
  createdAt: string;
  updatedAt: string;
};

type NewPartnerLead = Omit<WorkPartnerLead,
  "id" | "stage" | "source" | "adminNotes" | "createdAt" | "updatedAt" |
  "outreachSubject" | "outreachBody" | "outreachPreparedAt" | "contactVerified" |
  "scopeConfirmed" | "deliverablesConfirmed" | "deadlineConfirmed" |
  "fundingAmountMinor" | "fundingCurrency" | "organizationId" | "projectId"
>;

function mapPartner(row: Record<string, unknown>): WorkPartnerLead {
  return {
    id: String(row.id), organizationName: String(row.organization_name), website: row.website ? String(row.website) : null,
    contactName: String(row.contact_name), contactEmail: String(row.contact_email), contactRole: row.contact_role ? String(row.contact_role) : null,
    organizationType: String(row.organization_type), taskCategory: String(row.task_category), taskSummary: String(row.task_summary),
    expectedDeliverables: row.expected_deliverables ? String(row.expected_deliverables) : null, budgetRange: String(row.budget_range),
    estimatedHours: String(row.estimated_hours), preferredStartDate: row.preferred_start_date ? String(row.preferred_start_date) : null,
    studentAudience: row.student_audience ? String(row.student_audience) : null, fundingConfirmed: Boolean(row.funding_confirmed),
    stage: row.stage as PartnerStage, source: String(row.source), adminNotes: row.admin_notes ? String(row.admin_notes) : null,
    outreachSubject: row.outreach_subject ? String(row.outreach_subject) : null, outreachBody: row.outreach_body ? String(row.outreach_body) : null, outreachPreparedAt: row.outreach_prepared_at ? String(row.outreach_prepared_at) : null,
    contactVerified: Boolean(row.contact_verified), scopeConfirmed: Boolean(row.scope_confirmed), deliverablesConfirmed: Boolean(row.deliverables_confirmed), deadlineConfirmed: Boolean(row.deadline_confirmed),
    fundingAmountMinor: row.funding_amount_minor == null ? null : Number(row.funding_amount_minor), fundingCurrency: row.funding_currency ? String(row.funding_currency) : null, organizationId: row.organization_id ? String(row.organization_id) : null, projectId: row.project_id ? String(row.project_id) : null,
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

export async function preparePartnerOutreach(id: string): Promise<WorkPartnerLead> {
  const { data: lead, error } = await ascendWorkClient.from("ascend_work_partner_leads").select("*").eq("id", id).single();
  if (error || !lead) throw new Error("PARTNER_NOT_FOUND");
  const subject = `A scoped student project for ${lead.organization_name}`;
  const body = `Hello ${lead.contact_name},\n\nASCEND connects capable students with short, paid projects from verified organisations. We noticed a public need connected to ${lead.task_category.toLowerCase()}.\n\nA possible project is: ${lead.task_summary}\n\nThis is only a proposal. Nothing will be published unless your organisation confirms the scope, deliverables, deadline and payment. Would you be open to a short conversation?\n\nKind regards,\nASCEND Work`;
  const { data, error: updateError } = await ascendWorkClient.from("ascend_work_partner_leads").update({ outreach_subject: subject, outreach_body: body, outreach_prepared_at: new Date().toISOString(), stage: "contacted" } as never).eq("id", id).select("*").single();
  if (updateError || !data) throw new Error(`PARTNER_OUTREACH_FAILED:${updateError?.message ?? "empty response"}`);
  return mapPartner(data as Record<string, unknown>);
}

export async function confirmPartnerMission(input: { id: string; fundingAmountMinor: number; currency: string; estimatedHours: string; expectedDeliverables: string }): Promise<WorkPartnerLead> {
  const { data, error } = await ascendWorkClient.from("ascend_work_partner_leads").update({ contact_verified: true, scope_confirmed: true, deliverables_confirmed: true, deadline_confirmed: true, funding_confirmed: true, funding_amount_minor: input.fundingAmountMinor, funding_currency: input.currency, estimated_hours: input.estimatedHours, expected_deliverables: input.expectedDeliverables, budget_range: `${input.currency} ${(input.fundingAmountMinor / 100).toLocaleString()}`, stage: "funding_secured" } as never).eq("id", input.id).select("*").single();
  if (error || !data) throw new Error(`PARTNER_CONFIRM_FAILED:${error?.message ?? "empty response"}`);
  return mapPartner(data as Record<string, unknown>);
}

export async function convertPartnerToDraft(input: { id: string; adminUserId: string }): Promise<{ partner: WorkPartnerLead; projectId: string }> {
  const { data: row, error } = await ascendWorkClient.from("ascend_work_partner_leads").select("*").eq("id", input.id).single();
  if (error || !row) throw new Error("PARTNER_NOT_FOUND");
  const lead = mapPartner(row as Record<string, unknown>);
  if (lead.projectId) return { partner: lead, projectId: lead.projectId };
  if (!lead.fundingConfirmed || !lead.contactVerified || !lead.scopeConfirmed || !lead.deliverablesConfirmed || !lead.deadlineConfirmed || !lead.fundingAmountMinor || !lead.fundingCurrency || !lead.expectedDeliverables) throw new Error("PARTNER_CONFIRMATION_INCOMPLETE");
  const hours = Math.min(20, Math.max(5, Number.parseInt(lead.estimatedHours, 10) || 10));
  const organization = await createWorkOrganization({ adminUserId: input.adminUserId, name: lead.organizationName, website: lead.website ?? undefined, contactName: lead.contactName, contactEmail: lead.contactEmail, verificationStatus: "verified", verificationNotes: "Verified through the ASCEND Mission Acquisition workflow." });
  const now = Date.now();
  const project = await createPaidMission({ adminUserId: input.adminUserId, organizationId: organization.id, title: `${lead.taskCategory} project for ${lead.organizationName}`.slice(0, 100), summary: lead.taskSummary.slice(0, 320).padEnd(20, "."), description: `${lead.taskSummary}\n\nThis private draft was prepared after the organisation confirmed its scope, deliverables, deadline and funding.`, category: lead.taskCategory, requiredSkills: [], deliverables: lead.expectedDeliverables.split(/\r?\n/).map((v) => v.trim()).filter(Boolean), paymentAmountMinor: lead.fundingAmountMinor, currency: lead.fundingCurrency, estimatedHours: hours, availableSlots: 1, applicationDeadline: new Date(now + 7 * 86400000).toISOString(), deliveryDeadline: new Date(now + 21 * 86400000).toISOString(), status: "draft" });
  const { data, error: linkError } = await ascendWorkClient.from("ascend_work_partner_leads").update({ organization_id: organization.id, project_id: project.id, stage: "mission_proposed" } as never).eq("id", input.id).select("*").single();
  if (linkError || !data) throw new Error(`PARTNER_LINK_FAILED:${linkError?.message ?? "empty response"}`);
  return { partner: mapPartner(data as Record<string, unknown>), projectId: String(project.id) };
}
