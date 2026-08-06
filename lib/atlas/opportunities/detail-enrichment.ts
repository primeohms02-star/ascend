import type { Opportunity } from "./types";

const REQUEST_TIMEOUT_MS = 10000;
const MAX_HTML_CHARACTERS = 1_500_000;
const MAX_DESCRIPTION_CHARACTERS = 12000;

const REQUEST_HEADERS = {
  Accept: "text/html,application/xhtml+xml,application/json;q=0.8,*/*;q=0.5",
  "User-Agent":
    "Mozilla/5.0 (compatible; ASCEND-Opportunity-Details/1.0; +https://ascendai.space)",
};

type UnknownRecord = Record<string, unknown>;

type ExtractedDetails = {
  title?: string;
  company?: string;
  summary?: string;
  description?: string;
  location?: string;
  remote?: boolean;
  salary?: string;
  deadline?: string;
  employmentType?: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
};

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function decodeEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => {
      try {
        return String.fromCodePoint(Number(code));
      } catch {
        return " ";
      }
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => {
      try {
        return String.fromCodePoint(parseInt(code, 16));
      } catch {
        return " ";
      }
    })
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function cleanInlineText(value: string | undefined): string {
  if (!value) {
    return "";
  }

  return decodeEntities(value)
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function htmlToLines(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  const text = decodeEntities(value)
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, " ")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, " ")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, " ")
    .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, " ")
    .replace(/<li\b[^>]*>/gi, "\n- ")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(?:p|li|h1|h2|h3|h4|h5|h6|div|section|article|tr|ul|ol)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\r/g, "\n");

  return text
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 1);
}

function cleanList(values: string[]): string[] {
  const unique = new Map<string, string>();

  for (const rawValue of values) {
    const value = cleanInlineText(rawValue)
      .replace(/^(?:[-*•▪◦–—]|\d+[.)])\s*/, "")
      .trim();

    if (value.length < 3 || value.length > 700) {
      continue;
    }

    const key = value.toLowerCase();

    if (!unique.has(key)) {
      unique.set(key, value);
    }

    if (unique.size >= 30) {
      break;
    }
  }

  return Array.from(unique.values());
}

function valueToText(value: unknown): string {
  if (typeof value === "string") {
    return cleanInlineText(value);
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(valueToText).filter(Boolean).join(", ");
  }

  if (isRecord(value)) {
    for (const key of ["name", "value", "text", "description"]) {
      const text = valueToText(value[key]);

      if (text) {
        return text;
      }
    }
  }

  return "";
}

function valueToList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return cleanList(value.flatMap(valueToList));
  }

  if (typeof value === "string") {
    const lines = htmlToLines(value);

    if (lines.length > 1) {
      return cleanList(lines);
    }

    return cleanList(
      value
        .split(/\s*[•▪◦]\s*|\s*;\s*/)
        .filter(Boolean)
    );
  }

  const text = valueToText(value);

  return text ? [text] : [];
}

function getTypeNames(value: unknown): string[] {
  if (typeof value === "string") {
    return [value.toLowerCase()];
  }

  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.toLowerCase());
  }

  return [];
}

function flattenJsonLd(value: unknown): UnknownRecord[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenJsonLd);
  }

  if (!isRecord(value)) {
    return [];
  }

  const records = [value];
  const graph = value["@graph"];

  if (Array.isArray(graph)) {
    records.push(...graph.flatMap(flattenJsonLd));
  }

  return records;
}

function extractJsonLd(html: string): UnknownRecord[] {
  const records: UnknownRecord[] = [];
  const expression =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  for (const match of html.matchAll(expression)) {
    const source = decodeEntities(match[1])
      .replace(/^\s*<!--|-->\s*$/g, "")
      .replace(/^\s*<!\[CDATA\[|\]\]>\s*$/g, "")
      .trim();

    if (!source) {
      continue;
    }

    try {
      records.push(...flattenJsonLd(JSON.parse(source)));
    } catch {
      // Some publishers expose invalid JSON-LD. The HTML fallback handles them.
    }
  }

  return records;
}

function findStructuredRecord(records: UnknownRecord[]): UnknownRecord | null {
  const preferredTypes = [
    "jobposting",
    "educationaloccupationalprogram",
    "course",
    "event",
    "monetarygrant",
    "grant",
    "scholarship",
  ];

  for (const preferredType of preferredTypes) {
    const match = records.find((record) =>
      getTypeNames(record["@type"]).includes(preferredType)
    );

    if (match) {
      return match;
    }
  }

  return null;
}

function formatAddress(value: unknown): string {
  const locations = Array.isArray(value) ? value : [value];
  const labels: string[] = [];

  for (const location of locations) {
    if (!isRecord(location)) {
      const text = valueToText(location);

      if (text) {
        labels.push(text);
      }

      continue;
    }

    const address = isRecord(location.address)
      ? location.address
      : location;

    const parts = [
      valueToText(address.streetAddress),
      valueToText(address.addressLocality),
      valueToText(address.addressRegion),
      valueToText(address.postalCode),
      valueToText(address.addressCountry),
    ].filter(Boolean);

    const label = parts.join(", ") || valueToText(location.name);

    if (label) {
      labels.push(label);
    }
  }

  return Array.from(new Set(labels)).join(" · ");
}

function formatSalary(record: UnknownRecord): string {
  const salarySource = record.baseSalary ?? record.estimatedSalary;

  if (typeof salarySource === "string") {
    return cleanInlineText(salarySource);
  }

  if (!isRecord(salarySource)) {
    return "";
  }

  const currency = valueToText(salarySource.currency);
  const value = isRecord(salarySource.value)
    ? salarySource.value
    : salarySource;

  const exactValue = valueToText(value.value);
  const minimum = valueToText(value.minValue);
  const maximum = valueToText(value.maxValue);
  const unit = valueToText(value.unitText).toLowerCase();

  let amount = exactValue;

  if (!amount && minimum && maximum) {
    amount = `${minimum}–${maximum}`;
  } else if (!amount) {
    amount = minimum || maximum;
  }

  return [currency, amount, unit ? `/ ${unit}` : ""]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function getMetaContent(html: string, key: string): string {
  const metaExpression = /<meta\b[^>]*>/gi;

  for (const match of html.matchAll(metaExpression)) {
    const tag = match[0];
    const attributes: Record<string, string> = {};

    for (const attributeMatch of tag.matchAll(
      /([:\w-]+)\s*=\s*(["'])([\s\S]*?)\2/g
    )) {
      attributes[attributeMatch[1].toLowerCase()] = attributeMatch[3];
    }

    const name = (attributes.name ?? attributes.property ?? "").toLowerCase();

    if (name === key.toLowerCase()) {
      return cleanInlineText(attributes.content);
    }
  }

  return "";
}

function extractHeading(html: string): string {
  const heading = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1];
  return cleanInlineText(heading);
}

function selectMainHtml(html: string): string {
  const candidates: string[] = [];
  const patterns = [
    /<main\b[^>]*>([\s\S]*?)<\/main>/gi,
    /<article\b[^>]*>([\s\S]*?)<\/article>/gi,
    /<div\b[^>]*(?:id|class)=["'][^"']*(?:job-description|job-details|vacancy-details|opportunity-details|entry-content|post-content)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
    /<section\b[^>]*(?:id|class)=["'][^"']*(?:job-description|job-details|vacancy-details|opportunity-details|entry-content|post-content)[^"']*["'][^>]*>([\s\S]*?)<\/section>/gi,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      if (match[1]) {
        candidates.push(match[1]);
      }
    }
  }

  if (candidates.length === 0) {
    return /<body\b[^>]*>([\s\S]*?)<\/body>/i.exec(html)?.[1] ?? html;
  }

  return candidates.sort(
    (first, second) => htmlToLines(second).join(" ").length - htmlToLines(first).join(" ").length
  )[0];
}

type SectionName = "overview" | "responsibilities" | "requirements" | "benefits";

function classifyHeading(line: string): SectionName | null {
  if (line.length > 100) {
    return null;
  }

  const value = line
    .toLowerCase()
    .replace(/[^a-z0-9' ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (
    /^(job |role |position )?(summary|overview|description|about the role|about this role)$/.test(value)
  ) {
    return "overview";
  }

  if (
    /^(key |main )?(responsibilities|responsibility|duties|what you will do|what you'll do|the role)$/.test(value)
  ) {
    return "responsibilities";
  }

  if (
    /^(minimum |preferred |job )?(requirements|requirement|qualifications|qualification|skills|experience|what we are looking for|what we're looking for|who you are)$/.test(value)
  ) {
    return "requirements";
  }

  if (
    /^(benefits|perks|compensation and benefits|what we offer|what you will get|what you'll get)$/.test(value)
  ) {
    return "benefits";
  }

  return null;
}

function parseSections(lines: string[]): {
  overview: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
} {
  const sections: Record<SectionName, string[]> = {
    overview: [],
    responsibilities: [],
    requirements: [],
    benefits: [],
  };

  let currentSection: SectionName = "overview";

  for (const line of lines) {
    const heading = classifyHeading(line);

    if (heading) {
      currentSection = heading;
      continue;
    }

    sections[currentSection].push(line);
  }

  const overview = sections.overview
    .filter((line) => !/^[-*•]/.test(line))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2400);

  return {
    overview,
    responsibilities: cleanList(sections.responsibilities),
    requirements: cleanList(sections.requirements),
    benefits: cleanList(sections.benefits),
  };
}

function extractLabelValue(lines: string[], labels: string[]): string {
  const labelPattern = labels
    .map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  const expression = new RegExp(`^(?:${labelPattern})\\s*[:\\-–—]\\s*(.+)$`, "i");

  for (const line of lines) {
    const value = expression.exec(line)?.[1]?.trim();

    if (value && value.length <= 500) {
      return value;
    }
  }

  return "";
}

function parseStructuredDetails(record: UnknownRecord): ExtractedDetails {
  const description = valueToText(record.description);
  const summary = valueToText(record.jobSummary) || valueToText(record.abstract);
  const remoteValue = valueToText(record.jobLocationType).toLowerCase();
  const applicantLocation = formatAddress(record.applicantLocationRequirements);
  const physicalLocation = formatAddress(record.jobLocation ?? record.location);
  const remote = remoteValue.includes("telecommute") || remoteValue.includes("remote");
  const hasRemoteType = remoteValue.length > 0;
  const location = remote
    ? applicantLocation
      ? `Remote · ${applicantLocation}`
      : "Remote"
    : physicalLocation || applicantLocation;

  return {
    title: valueToText(record.title) || valueToText(record.name),
    company:
      valueToText(record.hiringOrganization) ||
      valueToText(record.provider) ||
      valueToText(record.organizer),
    summary: summary || cleanInlineText(description).slice(0, 2400),
    description,
    location,
    remote: remote ? true : hasRemoteType ? false : undefined,
    salary: formatSalary(record),
    deadline:
      valueToText(record.validThrough) ||
      valueToText(record.applicationDeadline) ||
      valueToText(record.endDate),
    employmentType: valueToText(record.employmentType),
    responsibilities: valueToList(record.responsibilities),
    requirements: cleanList([
      ...valueToList(record.qualifications),
      ...valueToList(record.skills),
      ...valueToList(record.experienceRequirements),
      ...valueToList(record.educationRequirements),
    ]),
    benefits: valueToList(record.jobBenefits),
  };
}

function parseHtmlDetails(html: string): ExtractedDetails {
  const mainHtml = selectMainHtml(html);
  const lines = htmlToLines(mainHtml);
  const sections = parseSections(lines);
  const metaDescription =
    getMetaContent(html, "description") || getMetaContent(html, "og:description");

  const salary = extractLabelValue(lines, [
    "salary",
    "compensation",
    "pay",
    "stipend",
    "salary range",
  ]);

  const location = extractLabelValue(lines, [
    "location",
    "job location",
    "work location",
    "country",
  ]);

  const deadline = extractLabelValue(lines, [
    "deadline",
    "application deadline",
    "closing date",
    "application closes",
    "valid through",
  ]);

  const employmentType = extractLabelValue(lines, [
    "employment type",
    "job type",
    "work type",
    "contract type",
  ]);

  const description = lines.join("\n").slice(0, MAX_DESCRIPTION_CHARACTERS);

  return {
    title: extractHeading(html),
    summary:
      metaDescription ||
      sections.overview ||
      lines.slice(0, 8).join(" ").slice(0, 2400),
    description,
    location,
    remote:
      /\b(?:fully remote|remote position|remote role|work from home|telecommute)\b/i.test(
        `${location} ${description.slice(0, 4000)}`
      ) || undefined,
    salary,
    deadline,
    employmentType,
    responsibilities: sections.responsibilities,
    requirements: sections.requirements,
    benefits: sections.benefits,
  };
}

function mergeDetails(
  structured: ExtractedDetails | null,
  htmlDetails: ExtractedDetails
): ExtractedDetails {
  const choose = (first?: string, second?: string) => first?.trim() || second?.trim() || undefined;

  return {
    title: choose(structured?.title, htmlDetails.title),
    company: choose(structured?.company, htmlDetails.company),
    summary: choose(structured?.summary, htmlDetails.summary),
    description: choose(structured?.description, htmlDetails.description),
    location: choose(structured?.location, htmlDetails.location),
    remote: structured?.remote ?? htmlDetails.remote,
    salary: choose(structured?.salary, htmlDetails.salary),
    deadline: choose(structured?.deadline, htmlDetails.deadline),
    employmentType: choose(structured?.employmentType, htmlDetails.employmentType),
    responsibilities:
      structured?.responsibilities.length
        ? structured.responsibilities
        : htmlDetails.responsibilities,
    requirements:
      structured?.requirements.length
        ? structured.requirements
        : htmlDetails.requirements,
    benefits:
      structured?.benefits.length ? structured.benefits : htmlDetails.benefits,
  };
}

function isPrivateHostname(hostname: string): boolean {
  const value = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (
    value === "localhost" ||
    value.endsWith(".localhost") ||
    value.endsWith(".local") ||
    value === "::1" ||
    value === "0.0.0.0"
  ) {
    return true;
  }

  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(value);

  if (!ipv4) {
    return false;
  }

  const first = Number(ipv4[1]);
  const second = Number(ipv4[2]);

  return (
    first === 10 ||
    first === 127 ||
    first === 0 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function getSafeUrl(value: string | undefined): URL | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (!['http:', 'https:'].includes(url.protocol) || isPrivateHostname(url.hostname)) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

async function fetchOriginalHtml(url: URL): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const requestOptions: RequestInit & {
      next: {
        revalidate: number;
      };
    } = {
      headers: REQUEST_HEADERS,
      redirect: "follow",
      signal: controller.signal,
      next: {
        revalidate: 1800,
      },
    };

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

    if (
      contentType &&
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml+xml") &&
      !contentType.includes("application/json")
    ) {
      return null;
    }

    const html = await response.text();

    return html.slice(0, MAX_HTML_CHARACTERS);
  } catch (error) {
    if (!(error instanceof Error && error.name === "AbortError")) {
      console.error("Opportunity detail enrichment failed:", url.hostname, error);
    }

    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildDetailedDescription(
  opportunity: Opportunity,
  details: ExtractedDetails
): string | undefined {
  const sections: string[] = [];

  if (details.summary) {
    sections.push(details.summary);
  }

  if (details.responsibilities.length) {
    sections.push(`Responsibilities\n${details.responsibilities.map((item) => `- ${item}`).join("\n")}`);
  }

  if (details.requirements.length) {
    sections.push(`Requirements\n${details.requirements.map((item) => `- ${item}`).join("\n")}`);
  }

  if (details.benefits.length) {
    sections.push(`Benefits\n${details.benefits.map((item) => `- ${item}`).join("\n")}`);
  }

  const enriched = sections.join("\n\n").trim();
  const existing = opportunity.description?.trim() ?? "";

  if (!enriched) {
    return existing || undefined;
  }

  return (enriched.length >= existing.length ? enriched : existing).slice(
    0,
    MAX_DESCRIPTION_CHARACTERS
  );
}

export async function enrichOpportunityFromOriginalSource(
  opportunity: Opportunity
): Promise<Opportunity> {
  const url = getSafeUrl(opportunity.url);

  if (!url) {
    return opportunity;
  }

  const html = await fetchOriginalHtml(url);

  if (!html) {
    return opportunity;
  }

  const structuredRecord = findStructuredRecord(extractJsonLd(html));
  const structuredDetails = structuredRecord
    ? parseStructuredDetails(structuredRecord)
    : null;
  const htmlDetails = parseHtmlDetails(html);
  const details = mergeDetails(structuredDetails, htmlDetails);
  const description = buildDetailedDescription(opportunity, details);

  return {
    ...opportunity,
    title: details.title || opportunity.title,
    company: details.company || opportunity.company,
    summary: details.summary || opportunity.summary,
    description,
    location: details.location || opportunity.location,
    remote: details.remote ?? opportunity.remote,
    salary: details.salary || opportunity.salary,
    deadline: details.deadline || opportunity.deadline,
    employmentType: details.employmentType || opportunity.employmentType,
    responsibilities:
      details.responsibilities.length > 0
        ? details.responsibilities
        : opportunity.responsibilities,
    requirements:
      details.requirements.length > 0
        ? details.requirements
        : opportunity.requirements,
    benefits:
      details.benefits.length > 0 ? details.benefits : opportunity.benefits,
  };
}
