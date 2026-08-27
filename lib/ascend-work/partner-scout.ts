import "server-only";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { ascendWorkClient } from "./client";

export type ScoutSignalStatus = "new" | "reviewing" | "promoted" | "dismissed";
export type ScoutSignal = {
  id: string; organizationName: string; website: string; sourceUrl: string; sourceTitle: string;
  evidence: string; suggestedCategory: string; suggestedMission: string; confidence: number;
  sourceQuality: number; opportunityFit: number; needSignal: string; precisionVersion: number;
  siteIdentity: string; contactUrl: string | null; organizationKind: string; ownershipVerified: boolean;
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
const excludedHosts = [
  "linkedin.com", "facebook.com", "instagram.com", "x.com", "twitter.com", "youtube.com", "wikipedia.org",
  "medium.com", "substack.com", "crunchbase.com", "f6s.com", "techpoint.africa", "techcabal.com", "businessday.ng",
  "guardian.ng", "punchng.com", "vanguardngr.com", "nairametrics.com", "thisdaylive.com", "thecable.ng",
  "opportunitydesk.org", "opportunitiesforafricans.com", "fundsforngos.org", "devex.com", "startupgrind.com",
  "technologytimes.ng", "startupweekly.com", "adsoftheworld.com",
];
const editorialPath = /\/(news|article|articles|blog|blogs|press|story|stories|opportunit(?:y|ies)|grant|grants|directory|listings?)(\/|$)/i;
const editorialTitle = /\b(top \d+|grant application|funding opportunit|latest news|how to apply|list of|roundup)\b/i;
const needPatterns: Array<[RegExp, string]> = [
  [/customer (research|feedback)|survey|market research/i, "The organisation is publicly working on customer or market research."],
  [/launch(ed|ing)?|new product|new service/i, "A public product or service launch may create a bounded research, content or QA need."],
  [/campaign|marketing|audience|content/i, "A public campaign or audience initiative may create a contained content or research need."],
  [/website|platform|mobile app|digital product/i, "A public digital product may create a bounded testing or usability-research need."],
  [/expand(ed|ing|s)?|growth|new market/i, "Public expansion activity may create a contained market or operations-research need."],
  [/programme|program|initiative|cohort/i, "A public programme may create a bounded research, data or communications need."],
  [/data|analytics|report|study/i, "A public data or research activity may create a contained analysis need."],
];

function hostOf(url: string): string | null { try { return new URL(url).hostname.toLowerCase().replace(/^www\./, ""); } catch { return null; } }
function isExcludedHost(host: string): boolean { return excludedHosts.some((blocked) => host === blocked || host.endsWith(`.${blocked}`)); }
function organizationNameFromHost(host: string): string {
  const parts = host.split(".");
  const suffixLength = /\.(com|org|net|edu|gov)\.ng$/.test(host) ? 3 : 2;
  const label = parts[Math.max(0, parts.length - suffixLength)] ?? parts[0];
  return label.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function sourceQualityFor(url: string, title: string, host: string): number {
  const parsed = new URL(url); let score = 45;
  if (host.endsWith(".ng")) score += 12;
  if (parsed.pathname === "/" || parsed.pathname.split("/").filter(Boolean).length <= 1) score += 18;
  if (editorialPath.test(parsed.pathname)) score -= 35;
  if (editorialTitle.test(title)) score -= 25;
  const hostToken = organizationNameFromHost(host).toLowerCase().replace(/\s+/g, "");
  if (hostToken.length > 2 && title.toLowerCase().replace(/\s+/g, "").includes(hostToken)) score += 15;
  return Math.max(0, Math.min(100, score));
}
function opportunityFitFor(text: string): { score: number; reason: string } {
  const matches = needPatterns.filter(([pattern]) => pattern.test(text));
  return { score: matches.length === 0 ? 0 : Math.min(85, 40 + matches.length * 15), reason: matches[0]?.[1] ?? "No strong, bounded work-need signal was detected." };
}
function decodeHtml(value: string): string { return value.replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&nbsp;/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); }
function metaContent(html: string, key: string): string {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, "i"), new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`, "i")];
  return decodeHtml(patterns[0].exec(html)?.[1] ?? patterns[1].exec(html)?.[1] ?? "");
}
function pageIdentity(html: string, host: string): string {
  const siteName = metaContent(html, "og:site_name");
  const title = decodeHtml(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "").split(/[|–—]/)[0]?.trim();
  const h1 = decodeHtml(/<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1] ?? "");
  const value = siteName || title || h1;
  return value.length >= 2 && value.length <= 100 ? value : organizationNameFromHost(host);
}
function contactPath(html: string, website: string): string | null {
  const matches = [...html.matchAll(/href=["']([^"']+)["']/gi)].map((match) => match[1]);
  const href = matches.find((value) => /^mailto:/i.test(value)) ?? matches.find((value) => /(^|\/)contact(?:-us)?(\/|$|[?#])/i.test(value));
  if (!href) return null;
  if (/^mailto:/i.test(href)) return website;
  try { const url = new URL(href, website); return hostOf(url.toString()) === hostOf(website) ? url.toString() : null; } catch { return null; }
}
function organizationKindFor(html: string): "organisation" | "publisher" | "directory" {
  const text = decodeHtml(html).toLowerCase();
  const publisherSignals = ["latest news", "breaking news", "advertise with us", "submit a story", "editorial team", "news categories", "trending stories"].filter((value) => text.includes(value)).length;
  const directorySignals = ["browse directory", "submit a listing", "opportunity directory", "browse opportunities", "find opportunities"].filter((value) => text.includes(value)).length;
  const articleCount = (html.match(/<article\b/gi) ?? []).length; const categoryLinks = (html.match(/href=["'][^"']*\/category\//gi) ?? []).length;
  if (publisherSignals >= 2 || articleCount >= 6 || categoryLinks >= 4) return "publisher";
  if (directorySignals >= 1) return "directory";
  return "organisation";
}
function isPrivateAddress(address: string): boolean {
  if (address === "::1" || address.startsWith("fc") || address.startsWith("fd") || address.startsWith("fe80:")) return true;
  if (!address.includes(".")) return false;
  const [a, b] = address.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}
async function readLimitedHtml(response: Response): Promise<string | null> {
  if (!response.body) return null;
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break; if (!value) continue; size += value.byteLength; if (size > 750_000) { await reader.cancel(); return null; } chunks.push(value); }
  const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(bytes);
}
async function fetchOfficialProfile(host: string): Promise<{ identity: string; contactUrl: string; aboutReady: boolean; kind: string } | null> {
  if (isIP(host) || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return null;
  const addresses = await lookup(host, { all: true }); if (addresses.length === 0 || addresses.some(({ address }) => isPrivateAddress(address))) return null;
  let url = `https://${host}`;
  for (let redirects = 0; redirects < 3; redirects += 1) {
    const response = await fetch(url, { redirect: "manual", headers: { "User-Agent": "ASCEND-Partner-Scout/1.0" }, signal: AbortSignal.timeout(7000) });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location"); if (!location) return null;
      const next = new URL(location, url); if (next.protocol !== "https:" || hostOf(next.toString()) !== host) return null;
      url = next.toString(); continue;
    }
    if (!response.ok || !response.headers.get("content-type")?.toLowerCase().includes("text/html")) return null;
    const length = Number(response.headers.get("content-length") ?? 0); if (length > 1_000_000) return null;
    const html = await readLimitedHtml(response); if (!html) return null; const contactUrl = contactPath(html, `https://${host}`); if (!contactUrl) return null;
    const aboutReady = /href=["'][^"']*\/(about|services|products?|programmes?|programs?)(\/|[?#"'])/i.test(html);
    return { identity: pageIdentity(html, host), contactUrl, aboutReady, kind: organizationKindFor(html) };
  }
  return null;
}
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
function mapSignal(row: Record<string, unknown>): ScoutSignal {
  return { id: String(row.id), organizationName: String(row.organization_name), website: String(row.website), sourceUrl: String(row.source_url), sourceTitle: String(row.source_title), evidence: String(row.evidence), suggestedCategory: String(row.suggested_category), suggestedMission: String(row.suggested_mission), confidence: Number(row.confidence), sourceQuality: Number(row.source_quality ?? 50), opportunityFit: Number(row.opportunity_fit ?? 50), needSignal: String(row.need_signal ?? "Legacy signal—review its source manually."), precisionVersion: Number(row.precision_version ?? 1), siteIdentity: String(row.site_identity ?? row.organization_name), contactUrl: row.contact_url ? String(row.contact_url) : null, organizationKind: String(row.organization_kind ?? "unverified"), ownershipVerified: Boolean(row.ownership_verified), status: row.status as ScoutSignalStatus, query: String(row.search_query), createdAt: String(row.created_at), updatedAt: String(row.updated_at) };
}

export async function archiveLegacyScoutSignals(): Promise<number> {
  const { data, error } = await ascendWorkClient.from("ascend_work_scout_signals").update({ status: "dismissed", updated_at: new Date().toISOString() }).lt("precision_version", 3).in("status", ["new", "reviewing"]).select("id");
  if (error) throw new Error(`SCOUT_ARCHIVE_FAILED:${error.message}`);
  return (data ?? []).length;
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
  if (!(["new", "reviewing"] as string[]).includes(String(signal.status)) || Number(signal.precision_version) < 3 || signal.ownership_verified !== true || !signal.contact_url) throw new Error("SCOUT_SIGNAL_NOT_VALIDATED");
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
    const candidates = new Map<string, { sourceUrl: string; host: string; title: string; evidence: string; query: string; category: string; mission: string; sourceQuality: number; opportunityFit: number; needSignal: string; confidence: number }>();
    for (const query of defaultQueries) {
      const response = await fetch("https://api.tavily.com/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ api_key: apiKey, query, search_depth: "basic", max_results: 8, include_answer: false, include_images: false }) });
      if (!response.ok) throw new Error(`SCOUT_PROVIDER_${response.status}`);
      const payload = await response.json() as { results?: Array<{ title?: string; url?: string; content?: string; score?: number }> };
      for (const result of payload.results ?? []) {
        const sourceUrl = String(result.url ?? ""); const host = hostOf(sourceUrl); const evidence = String(result.content ?? "").trim();
        if (!host || isExcludedHost(host) || !sourceUrl.startsWith("https://") || evidence.length < 40) continue;
        discovered += 1;
        const title = String(result.title ?? host); const combined = `${title} ${evidence}`;
        const sourceQuality = sourceQualityFor(sourceUrl, title, host); const fit = opportunityFitFor(combined);
        if (sourceQuality < 60 || fit.score < 40) continue;
        const category = categoryFor(combined); const confidence = Math.round(sourceQuality * 0.55 + fit.score * 0.45);
        const candidate = { sourceUrl, host, title, evidence, query, category, mission: missionFor(category), sourceQuality, opportunityFit: fit.score, needSignal: fit.reason, confidence };
        if (!candidates.has(host) || candidates.get(host)!.confidence < confidence) candidates.set(host, candidate);
      }
    }
    const candidateList = [...candidates.values()];
    const validationBatchSize = 12;
    for (let index = 0; index < candidateList.length; index += validationBatchSize) {
      const batch = candidateList.slice(index, index + validationBatchSize);
      const outcomes = await Promise.all(batch.map(async (candidate) => {
        let profile: Awaited<ReturnType<typeof fetchOfficialProfile>>;
        try { profile = await fetchOfficialProfile(candidate.host); } catch { profile = null; }
        if (!profile || profile.kind !== "organisation") return 0;
        const validatedSourceQuality = Math.min(95, candidate.sourceQuality + 10 + (profile.aboutReady ? 8 : 0));
        if (validatedSourceQuality < 75) return 0;
        const { data: existing, error: existingError } = await ascendWorkClient.from("ascend_work_scout_signals").select("id").eq("website", `https://${candidate.host}`).in("status", ["new", "reviewing", "promoted"]).limit(1).maybeSingle();
        if (existingError) throw new Error(`SCOUT_DUPLICATE_CHECK_FAILED:${existingError.message}`);
        if (existing) return 0;
        const confidence = Math.round(validatedSourceQuality * 0.55 + candidate.opportunityFit * 0.45);
        const { data: added, error } = await ascendWorkClient.from("ascend_work_scout_signals").upsert({ organization_name: profile.identity, website: `https://${candidate.host}`, source_url: candidate.sourceUrl, source_title: candidate.title.slice(0, 300), evidence: candidate.evidence.slice(0, 1500), suggested_category: candidate.category, suggested_mission: candidate.mission, confidence, source_quality: validatedSourceQuality, opportunity_fit: candidate.opportunityFit, need_signal: candidate.needSignal, precision_version: 3, site_identity: profile.identity, contact_url: profile.contactUrl, organization_kind: profile.kind, ownership_verified: true, status: "new", search_query: candidate.query, last_seen_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { onConflict: "source_url" }).select("id");
        if (error) throw new Error(`SCOUT_SIGNAL_STORE_FAILED:${error.message}`);
        return (added ?? []).length > 0 ? 1 : 0;
      }));
      inserted += outcomes.reduce<number>((total, outcome) => total + outcome, 0);
    }
    await ascendWorkClient.from("ascend_work_scout_runs").update({ status: "completed", discovered_count: discovered, inserted_count: inserted, completed_at: new Date().toISOString() }).eq("id", run.id);
    return { runId: String(run.id), discovered, inserted };
  } catch (error) {
    await ascendWorkClient.from("ascend_work_scout_runs").update({ status: "failed", error_message: error instanceof Error ? error.message.slice(0, 1000) : "Unknown failure", completed_at: new Date().toISOString() }).eq("id", run.id);
    throw error;
  }
}
