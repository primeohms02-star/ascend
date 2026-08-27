import "server-only";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { ascendWorkClient } from "./client";

export type ScoutSignalStatus = "new" | "reviewing" | "promoted" | "dismissed";
export type ScoutQualificationStatus = "official_organisation" | "potential_need" | "contact_verified";
export type ScoutSignal = {
  id: string; organizationName: string; website: string; sourceUrl: string; sourceTitle: string;
  evidence: string; suggestedCategory: string; suggestedMission: string; confidence: number;
  sourceQuality: number; opportunityFit: number; needSignal: string; precisionVersion: number;
  siteIdentity: string; contactUrl: string | null; organizationKind: string; ownershipVerified: boolean;
  demonstratedNeed: string; qualificationStatus: ScoutQualificationStatus;
  crossSourceVerified: boolean; confirmationUrl: string | null;
  status: ScoutSignalStatus; query: string; createdAt: string; updatedAt: string;
};

const defaultQueries = [
  "Nigeria organisation announced request for proposal research data official website",
  "Nigeria company launched digital product platform official website",
  "Nigeria NGO announced programme monitoring evaluation official website",
  "Nigeria SME announced expansion market research official website",
  "Nigeria organisation seeking survey customer research official website",
  "Nigeria creative company announced campaign communications official website",
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
type NeedAnalysis = { category: string; reason: string; demonstratedNeed: string; mission: string; score: number };
const genericIdentity = /^(home|about(?: us)?|welcome|official (?:site|website)|contact(?: us)?|homepage|main page|untitled)$/i;
const marketingIdentity = /\b(award[- ]winning|best|leading|top[- ]rated|number one|#1|agency in (?:lagos|nigeria)|research for national health|networking for development)\b/i;
const actionSignal = /\b(announc(?:e|ed|es|ing)|launch(?:ed|es|ing)?|expand(?:ed|s|ing)?|pilot(?:ed|s|ing)?|develop(?:ed|s|ing)?|roll(?:ed|s|ing)? out|redesign(?:ed|s|ing)?|seek(?:s|ing)?|recruit(?:s|ing)?|invite(?:s|d)?|call(?:s|ing)? for|commission(?:ed|s|ing)?|conduct(?:ed|s|ing)?|implement(?:ed|s|ing)?|deliver(?:ed|s|ing)?|introduc(?:e|ed|es|ing)|upcoming|currently)\b/i;
const weakPageDebris = /^(?:about|contact|home|hero|banner|logo|image|img|menu|navigation|read more|learn more)(?:\s+(?:image|img))?$/i;
const sloganLanguage = /\b(creating|enabling|empowering|transforming|building|shaping|driving|unlocking)\b.*\b(environment|future|wealth|growth|success|change|opportunities?)\b/i;
const currentYear = new Date().getUTCFullYear();

function decodeEntity(entity: string, code: string, hex: string): string {
  if (code || hex) {
    const value = Number.parseInt(code || hex, hex ? 16 : 10);
    return Number.isFinite(value) && value > 0 && value <= 0x10ffff ? String.fromCodePoint(value) : " ";
  }
  const named: Record<string, string> = { amp: "&", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", hellip: "…", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“" };
  return named[entity.toLowerCase()] ?? " ";
}

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
function decodeHtml(value: string): string {
  return value
    .replace(/&#(\d+);|&#x([\da-f]+);|&([a-z]+);/gi, (_match, code: string, hex: string, entity: string) => decodeEntity(entity ?? "", code ?? "", hex ?? ""))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function cleanEvidence(value: string): string {
  const cleaned = decodeHtml(value)
    .replace(/#{1,6}\s*/g, " ")
    .replace(/\[(?:\.\.\.|…)]/g, " ")
    .replace(/\b(?:hero|about|banner|logo|thumbnail|featured)\s+(?:img|image)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const sentences = cleaned.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter((sentence) => sentence.length >= 30 && !weakPageDebris.test(sentence));
  const selected = sentences.filter((sentence) => actionSignal.test(sentence)).slice(0, 3);
  const evidence = (selected.length > 0 ? selected : sentences.slice(0, 2)).join(" ");
  return evidence.slice(0, 900).trim();
}
function isListicle(title: string, evidence: string): boolean {
  const combined = `${title} ${evidence}`;
  const numberedEntries = combined.match(/(?:^|\s)\d{1,2}[.)]\s+[A-Z]/g) ?? [];
  const websites = combined.match(/\b(?:https?:\/\/|www\.)[^\s)]+/gi) ?? [];
  return /\b(top\s+\d+|list of|\d+\s+(?:best|leading|top)\s+(?:companies|startups|organisations|organizations))\b/i.test(combined) || numberedEntries.length >= 2 || websites.length >= 2;
}
function isFreshEvidence(value: string): boolean {
  const years = [...value.matchAll(/\b(20\d{2})\b/g)].map((match) => Number(match[1])).filter(Number.isFinite);
  return years.length === 0 || Math.max(...years) >= currentYear - 1;
}
function analyzeNeed(value: string): NeedAnalysis | null {
  const text = cleanEvidence(value);
  if (text.length < 60 || !actionSignal.test(text) || !isFreshEvidence(text)) return null;
  const matches: Array<{ pattern: RegExp; category: string; reason: string; mission: string }> = [
    { pattern: /\b(customer research|customer feedback|market research|survey|user research)\b/i, category: "Research", reason: "The organisation publicly described an active customer or market-research need.", mission: "Design and complete a bounded research brief for the stated audience, then deliver source-backed findings and recommendations." },
    { pattern: /\b(website|platform|mobile app|digital product|portal|user journey|usability)\b/i, category: "Product and website QA", reason: "The organisation publicly described an active digital product or service initiative.", mission: "Test the specific public digital journey identified in the evidence and deliver a prioritized usability and quality-assurance report." },
    { pattern: /\b(campaign|marketing|audience|content|communications|community engagement)\b/i, category: "Content and marketing", reason: "The organisation publicly described an active campaign, audience or communications initiative.", mission: "Audit the stated initiative’s audience and communications needs, then deliver evidence-backed content recommendations and sample outputs." },
    { pattern: /\b(data|analytics|dataset|monitoring|evaluation|report|study)\b/i, category: "Data and insights", reason: "The organisation publicly described an active data, reporting or evaluation initiative.", mission: "Verify and structure a bounded sample from the stated initiative, then deliver a concise analysis with documented methodology." },
    { pattern: /\b(expand|expansion|new market|operations|programme|program|initiative|cohort)\b/i, category: "Operations research", reason: "The organisation publicly described an active programme or operational expansion.", mission: "Research the specific operational question evidenced by the initiative and deliver a scoped implementation brief with practical recommendations." },
  ];
  const match = matches.find(({ pattern }) => pattern.test(text));
  if (!match) return null;
  const specificity = (text.match(actionSignal) ?? []).length;
  return { category: match.category, reason: match.reason, demonstratedNeed: text, mission: match.mission, score: Math.min(90, 60 + specificity * 10) };
}
function metaContent(html: string, key: string): string {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, "i"), new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`, "i")];
  return decodeHtml(patterns[0].exec(html)?.[1] ?? patterns[1].exec(html)?.[1] ?? "");
}
function pageIdentity(html: string, host: string): string | null {
  const hostIdentity = organizationNameFromHost(host);
  const structuredNames = [...html.matchAll(/"@type"\s*:\s*"(?:Organization|Corporation|NGO|GovernmentOrganization)"[\s\S]{0,800}?"name"\s*:\s*"([^"]+)"/gi)].map((match) => decodeHtml(match[1]));
  const candidates = [
    ...structuredNames,
    metaContent(html, "og:site_name"),
    metaContent(html, "application-name"),
  ].map((value) => value.replace(/\s+/g, " ").trim()).filter(Boolean);
  const credible = candidates.find((value) => value.length >= 2 && value.length <= 100 && value.split(/\s+/).length <= 8 && !/[.!?]$/.test(value) && !genericIdentity.test(value) && !marketingIdentity.test(value) && !sloganLanguage.test(value));
  if (credible) return credible;
  const fallbackCandidates = [decodeHtml(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? ""), decodeHtml(/<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1] ?? "")];
  const normalizedHost = hostIdentity.toLowerCase().replace(/[^a-z0-9]/g, "");
  const confirmsHost = fallbackCandidates.some((value) => value.toLowerCase().replace(/[^a-z0-9]/g, "").includes(normalizedHost));
  return confirmsHost && !genericIdentity.test(hostIdentity) ? hostIdentity : null;
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
    const html = await readLimitedHtml(response); if (!html) return null; const contactUrl = contactPath(html, `https://${host}`); if (!contactUrl) return null; const identity = pageIdentity(html, host); if (!identity) return null;
    const aboutReady = /href=["'][^"']*\/(about|services|products?|programmes?|programs?)(\/|[?#"'])/i.test(html);
    return { identity, contactUrl, aboutReady, kind: organizationKindFor(html) };
  }
  return null;
}
function isOfficialContact(input: { name: string; email: string; website: string }): boolean {
  const nameParts = input.name.trim().split(/\s+/).filter(Boolean);
  if (nameParts.length < 2 || /^(admin|team|support|contact|hello|info|office)$/i.test(nameParts.join(" "))) return false;
  const emailDomain = input.email.toLowerCase().split("@")[1] ?? "";
  const websiteHost = hostOf(input.website) ?? "";
  return Boolean(emailDomain && websiteHost && (emailDomain === websiteHost || emailDomain.endsWith(`.${websiteHost}`) || websiteHost.endsWith(`.${emailDomain}`)));
}
type ProviderResult = { title: string; url: string; content: string };
async function searchTavily(apiKey: string, query: string): Promise<ProviderResult[]> {
  const response = await fetch("https://api.tavily.com/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ api_key: apiKey, query, search_depth: "basic", max_results: 10, include_answer: false, include_images: false, time_range: "year" }), signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`SCOUT_TAVILY_${response.status}`);
  const payload = await response.json() as { results?: Array<{ title?: string; url?: string; content?: string }> };
  return (payload.results ?? []).map((result) => ({ title: String(result.title ?? ""), url: String(result.url ?? ""), content: String(result.content ?? "") }));
}
async function searchBrave(apiKey: string, query: string): Promise<ProviderResult[]> {
  const params = new URLSearchParams({ q: query, country: "NG", search_lang: "en", count: "20", freshness: "py", safesearch: "strict", extra_snippets: "true" });
  const response = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, { headers: { Accept: "application/json", "X-Subscription-Token": apiKey }, signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`SCOUT_BRAVE_${response.status}`);
  const payload = await response.json() as { web?: { results?: Array<{ title?: string; url?: string; description?: string; extra_snippets?: string[] }> } };
  return (payload.web?.results ?? []).map((result) => ({ title: String(result.title ?? ""), url: String(result.url ?? ""), content: [result.description, ...(result.extra_snippets ?? [])].filter(Boolean).join(" ") }));
}
function mapSignal(row: Record<string, unknown>): ScoutSignal {
  return { id: String(row.id), organizationName: String(row.organization_name), website: String(row.website), sourceUrl: String(row.source_url), sourceTitle: String(row.source_title), evidence: String(row.evidence), suggestedCategory: String(row.suggested_category), suggestedMission: String(row.suggested_mission), confidence: Number(row.confidence), sourceQuality: Number(row.source_quality ?? 50), opportunityFit: Number(row.opportunity_fit ?? 50), needSignal: String(row.need_signal ?? "Legacy signal—review its source manually."), precisionVersion: Number(row.precision_version ?? 1), siteIdentity: String(row.site_identity ?? row.organization_name), contactUrl: row.contact_url ? String(row.contact_url) : null, organizationKind: String(row.organization_kind ?? "unverified"), ownershipVerified: Boolean(row.ownership_verified), demonstratedNeed: String(row.demonstrated_need ?? ""), qualificationStatus: (row.qualification_status ?? "official_organisation") as ScoutQualificationStatus, crossSourceVerified: Boolean(row.cross_source_verified), confirmationUrl: row.confirmation_url ? String(row.confirmation_url) : null, status: row.status as ScoutSignalStatus, query: String(row.search_query), createdAt: String(row.created_at), updatedAt: String(row.updated_at) };
}

export async function archiveLegacyScoutSignals(): Promise<number> {
  const { data, error } = await ascendWorkClient.from("ascend_work_scout_signals").update({ status: "dismissed", updated_at: new Date().toISOString() }).lt("precision_version", 5).in("status", ["new", "reviewing"]).select("id");
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
  if (!(["new", "reviewing"] as string[]).includes(String(signal.status)) || Number(signal.precision_version) < 5 || signal.ownership_verified !== true || signal.cross_source_verified !== true || !signal.contact_url || signal.qualification_status !== "potential_need" || !signal.demonstrated_need) throw new Error("SCOUT_SIGNAL_NOT_VALIDATED");
  if (!isOfficialContact({ name: input.contactName, email: input.contactEmail, website: String(signal.website) })) throw new Error("SCOUT_CONTACT_NOT_OFFICIAL");
  const { data: lead, error: leadError } = await ascendWorkClient.from("ascend_work_partner_leads").insert({ organization_name: signal.organization_name, website: signal.website, contact_name: input.contactName, contact_email: input.contactEmail.toLowerCase(), contact_role: input.contactRole || null, organization_type: "other", task_category: signal.suggested_category, task_summary: `Public signal for review: ${signal.evidence}\n\nPotential mission: ${signal.suggested_mission}`, expected_deliverables: null, budget_range: "needs-guidance", estimated_hours: "not-sure", funding_confirmed: false, stage: "new", source: "partner_scout" }).select("id").single();
  if (leadError || !lead) throw new Error(`SCOUT_PROMOTE_FAILED:${leadError?.message ?? "empty response"}`);
  await ascendWorkClient.from("ascend_work_scout_signals").update({ status: "promoted", qualification_status: "contact_verified", verified_contact_name: input.contactName.trim(), verified_contact_email: input.contactEmail.toLowerCase(), verified_contact_role: input.contactRole || null, contact_verified_at: new Date().toISOString(), promoted_lead_id: lead.id, updated_at: new Date().toISOString() }).eq("id", input.signalId);
  return { leadId: String(lead.id) };
}

export async function runPartnerScout(triggeredBy: "admin" | "cron"): Promise<{ runId: string; discovered: number; inserted: number }> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  const braveKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!tavilyKey || !braveKey) throw new Error("SCOUT_PROVIDER_NOT_CONFIGURED");
  const activeSince = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { data: activeRun, error: activeRunError } = await ascendWorkClient.from("ascend_work_scout_runs").select("id").eq("status", "running").gte("started_at", activeSince).limit(1).maybeSingle();
  if (activeRunError) throw new Error(`SCOUT_RUN_CHECK_FAILED:${activeRunError.message}`);
  if (activeRun) throw new Error("SCOUT_RUN_ALREADY_ACTIVE");
  const { data: run, error: runError } = await ascendWorkClient.from("ascend_work_scout_runs").insert({ provider: "tavily+brave", triggered_by: triggeredBy, status: "running" }).select("id").single();
  if (runError || !run) throw new Error(`SCOUT_RUN_CREATE_FAILED:${runError?.message ?? "empty response"}`);
  let discovered = 0, inserted = 0;
  try {
    const candidates = new Map<string, { sourceUrl: string; confirmationUrl: string; host: string; title: string; evidence: string; query: string; category: string; mission: string; sourceQuality: number; opportunityFit: number; needSignal: string; demonstratedNeed: string; confidence: number }>();
    const providerResults = await Promise.all(defaultQueries.map(async (query) => {
      const [tavily, brave] = await Promise.all([searchTavily(tavilyKey, query), searchBrave(braveKey, query)]);
      return { query, tavily, brave };
    }));
    for (const { query, tavily, brave } of providerResults) {
      const braveByHost = new Map<string, ProviderResult>();
      for (const result of brave) { const host = hostOf(result.url); if (host && !isExcludedHost(host) && result.url.startsWith("https://") && !braveByHost.has(host)) braveByHost.set(host, result); }
      for (const result of tavily) {
        const sourceUrl = result.url; const host = hostOf(sourceUrl); const evidence = cleanEvidence(result.content);
        if (!host || isExcludedHost(host) || !sourceUrl.startsWith("https://") || evidence.length < 40) continue;
        discovered += 1;
        const confirmation = braveByHost.get(host); if (!confirmation) continue;
        const title = decodeHtml(result.title || host); if (isListicle(title, evidence) || isListicle(confirmation.title, confirmation.content)) continue;
        const need = analyzeNeed(`${title}. ${evidence}`);
        const sourceQuality = sourceQualityFor(sourceUrl, title, host);
        if (sourceQuality < 60 || !need || need.score < 60) continue;
        const confidence = Math.min(95, Math.round(sourceQuality * 0.5 + need.score * 0.4 + 10));
        const candidate = { sourceUrl, confirmationUrl: confirmation.url, host, title, evidence: need.demonstratedNeed, query, category: need.category, mission: need.mission, sourceQuality, opportunityFit: need.score, needSignal: `${need.reason} Tavily and Brave independently confirmed the official domain.`, demonstratedNeed: need.demonstratedNeed, confidence };
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
        const { data: added, error } = await ascendWorkClient.from("ascend_work_scout_signals").upsert({ organization_name: profile.identity, website: `https://${candidate.host}`, source_url: candidate.sourceUrl, confirmation_url: candidate.confirmationUrl, cross_source_verified: true, source_title: candidate.title.slice(0, 300), evidence: candidate.evidence.slice(0, 900), suggested_category: candidate.category, suggested_mission: candidate.mission, confidence, source_quality: validatedSourceQuality, opportunity_fit: candidate.opportunityFit, need_signal: candidate.needSignal, demonstrated_need: candidate.demonstratedNeed, qualification_status: "potential_need", precision_version: 5, site_identity: profile.identity, contact_url: profile.contactUrl, organization_kind: profile.kind, ownership_verified: true, status: "new", search_query: candidate.query, last_seen_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { onConflict: "source_url" }).select("id");
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
