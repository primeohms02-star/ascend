import "server-only";

import { ascendWorkClient } from "./client";

export type ScoutSignalStatus = "new" | "reviewing" | "promoted" | "dismissed";
export type ScoutSignal = {
  id: string; organizationName: string; website: string; sourceUrl: string; sourceTitle: string;
  evidence: string; suggestedCategory: string; suggestedMission: string; confidence: number;
  status: ScoutSignalStatus; query: string; createdAt: string; updatedAt: string;
};

const defaultQueries = [
  "Nigeria startup launched new product official company",
  "Nigeria SME expanding operations official website",
  "Nigeria social enterprise new programme official",
  "Nigeria creative agency new campaign official",
  "Nigeria NGO research programme official",
  "Nigeria technology startup customer research official",
];
const excludedHosts = ["linkedin.com", "facebook.com", "instagram.com", "x.com", "twitter.com", "youtube.com", "wikipedia.org"];

function hostOf(url: string): string | null { try { return new URL(url).hostname.toLowerCase().replace(/^www\./, ""); } catch { return null; } }
function isExcludedHost(host: string): boolean { return excludedHosts.some((blocked) => host === blocked || host.endsWith(`.${blocked}`)); }
function categoryFor(text: string): string {
  const value = text.toLowerCase();
  if (/data|analytics|survey/.test(value)) return "Data and insights";
  if (/content|media|campaign|marketing/.test(value)) return "Content and marketing";
  if (/software|platform|website|app|technology/.test(value)) return "Product and website QA";
  if (/research|report|study|programme/.test(value)) return "Research";
  return "Operations research";
}
function missionFor(category: string): string {
  if (category === "Data and insights") return "Verify, organize and summarize a bounded dataset or customer-feedback sample.";
  if (category === "Content and marketing") return "Complete a focused content, audience or competitor audit with evidence-backed recommendations.";
  if (category === "Product and website QA") return "Test a defined website or product journey and provide a prioritized usability report.";
  if (category === "Research") return "Produce a source-verified research brief for one clearly defined business question.";
  return "Research and document a contained operational need with practical recommendations.";
}
function nameFromTitle(title: string, host: string): string {
  const clean = title.split(/[|–—:]/)[0]?.trim();
  return clean && clean.length >= 2 && clean.length <= 140 ? clean : host.split(".")[0].replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function mapSignal(row: Record<string, unknown>): ScoutSignal {
  return { id: String(row.id), organizationName: String(row.organization_name), website: String(row.website), sourceUrl: String(row.source_url), sourceTitle: String(row.source_title), evidence: String(row.evidence), suggestedCategory: String(row.suggested_category), suggestedMission: String(row.suggested_mission), confidence: Number(row.confidence), status: row.status as ScoutSignalStatus, query: String(row.search_query), createdAt: String(row.created_at), updatedAt: String(row.updated_at) };
}

export async function listScoutSignals(): Promise<ScoutSignal[]> {
  const { data, error } = await ascendWorkClient.from("ascend_work_scout_signals").select("*").order("status", { ascending: true }).order("confidence", { ascending: false }).order("created_at", { ascending: false });
  if (error) throw new Error(`SCOUT_LIST_FAILED:${error.message}`);
  return (data ?? []).map((row: Record<string, unknown>) => mapSignal(row));
}

export async function updateScoutSignal(id: string, status: ScoutSignalStatus): Promise<ScoutSignal> {
  const { data, error } = await ascendWorkClient.from("ascend_work_scout_signals").update({ status, updated_at: new Date().toISOString() }).eq("id", id).select("*").single();
  if (error || !data) throw new Error(`SCOUT_UPDATE_FAILED:${error?.message ?? "empty response"}`);
  return mapSignal(data as Record<string, unknown>);
}

export async function promoteScoutSignal(input: { signalId: string; contactName: string; contactEmail: string; contactRole?: string }): Promise<{ leadId: string }> {
  const { data: signal, error: signalError } = await ascendWorkClient.from("ascend_work_scout_signals").select("*").eq("id", input.signalId).single();
  if (signalError || !signal) throw new Error("SCOUT_SIGNAL_NOT_FOUND");
  const { data: lead, error: leadError } = await ascendWorkClient.from("ascend_work_partner_leads").insert({ organization_name: signal.organization_name, website: signal.website, contact_name: input.contactName, contact_email: input.contactEmail.toLowerCase(), contact_role: input.contactRole || null, organization_type: "other", task_category: signal.suggested_category, task_summary: `Public signal for review: ${signal.evidence}\n\nPotential mission: ${signal.suggested_mission}`, expected_deliverables: null, budget_range: "needs-guidance", estimated_hours: "not-sure", funding_confirmed: false, stage: "new", source: "partner_scout" }).select("id").single();
  if (leadError || !lead) throw new Error(`SCOUT_PROMOTE_FAILED:${leadError?.message ?? "empty response"}`);
  await ascendWorkClient.from("ascend_work_scout_signals").update({ status: "promoted", promoted_lead_id: lead.id, updated_at: new Date().toISOString() }).eq("id", input.signalId);
  return { leadId: String(lead.id) };
}

export async function runPartnerScout(triggeredBy: "admin" | "cron"): Promise<{ runId: string; discovered: number; inserted: number }> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("SCOUT_PROVIDER_NOT_CONFIGURED");
  const activeSince = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { data: activeRun, error: activeRunError } = await ascendWorkClient.from("ascend_work_scout_runs").select("id").eq("status", "running").gte("started_at", activeSince).limit(1).maybeSingle();
  if (activeRunError) throw new Error(`SCOUT_RUN_CHECK_FAILED:${activeRunError.message}`);
  if (activeRun) throw new Error("SCOUT_RUN_ALREADY_ACTIVE");
  const { data: run, error: runError } = await ascendWorkClient.from("ascend_work_scout_runs").insert({ provider: "tavily", triggered_by: triggeredBy, status: "running" }).select("id").single();
  if (runError || !run) throw new Error(`SCOUT_RUN_CREATE_FAILED:${runError?.message ?? "empty response"}`);
  let discovered = 0, inserted = 0;
  try {
    for (const query of defaultQueries) {
      const response = await fetch("https://api.tavily.com/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ api_key: apiKey, query, search_depth: "basic", max_results: 8, include_answer: false, include_images: false }) });
      if (!response.ok) throw new Error(`SCOUT_PROVIDER_${response.status}`);
      const payload = await response.json() as { results?: Array<{ title?: string; url?: string; content?: string; score?: number }> };
      for (const result of payload.results ?? []) {
        const sourceUrl = String(result.url ?? ""); const host = hostOf(sourceUrl); const evidence = String(result.content ?? "").trim();
        if (!host || isExcludedHost(host) || !sourceUrl.startsWith("https://") || evidence.length < 40) continue;
        discovered += 1; const category = categoryFor(`${result.title ?? ""} ${evidence}`); const confidence = Math.max(35, Math.min(95, Math.round(Number(result.score ?? 0.5) * 100)));
        const { data: added, error } = await ascendWorkClient.from("ascend_work_scout_signals").upsert({ organization_name: nameFromTitle(String(result.title ?? ""), host), website: `https://${host}`, source_url: sourceUrl, source_title: String(result.title ?? host).slice(0, 300), evidence: evidence.slice(0, 1500), suggested_category: category, suggested_mission: missionFor(category), confidence, status: "new", search_query: query, last_seen_at: new Date().toISOString() }, { onConflict: "source_url", ignoreDuplicates: true }).select("id");
        if (error) throw new Error(`SCOUT_SIGNAL_STORE_FAILED:${error.message}`);
        if ((added ?? []).length > 0) inserted += 1;
      }
    }
    await ascendWorkClient.from("ascend_work_scout_runs").update({ status: "completed", discovered_count: discovered, inserted_count: inserted, completed_at: new Date().toISOString() }).eq("id", run.id);
    return { runId: String(run.id), discovered, inserted };
  } catch (error) {
    await ascendWorkClient.from("ascend_work_scout_runs").update({ status: "failed", error_message: error instanceof Error ? error.message.slice(0, 1000) : "Unknown failure", completed_at: new Date().toISOString() }).eq("id", run.id);
    throw error;
  }
}
