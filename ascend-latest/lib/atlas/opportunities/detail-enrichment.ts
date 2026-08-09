import type { Opportunity } from "./types";

const REQUEST_TIMEOUT_MS = 10000;
const MAX_HTML_CHARACTERS = 1_500_000;
const MAX_DESCRIPTION_CHARACTERS = 12000;
const MAX_SUMMARY_CHARACTERS = 1000;
const MAX_DETAIL_ITEMS = 14;

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

type SectionName =
  | "overview"
  | "responsibilities"
  | "requirements"
  | "benefits";

type MetadataField =
  | "salary"
  | "deadline"
  | "location"
  | "employmentType";

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
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizedLabel(value: string): string {
  return cleanInlineText(value)
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9' ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isPlaceholderValue(value: string | undefined): boolean {
  if (!value) {
    return true;
  }

  return /^(?:not specified|not available|n\/?a|none|nil|tbd|to be confirmed|to be announced|unspecified|unknown)[.!]?$/i.test(
    cleanInlineText(value)
  );
}

function isStrongStopLine(value: string): boolean {
  const line = normalizedLabel(value);

  return /^(?:how to apply|application method|apply now|share this job|share this opportunity|related jobs?|related posts?|recommended jobs?|recommended opportunities|similar jobs?|latest jobs?|more jobs?|comments?(?: \d+)?|leave a comment|footer|about us|contact us|privacy policy|terms of service)$/.test(
    line
  );
}

function isBoilerplateLine(value: string): boolean {
  const raw = cleanInlineText(value);
  const line = normalizedLabel(raw);

  if (!line) {
    return true;
  }

  if (isStrongStopLine(line)) {
    return true;
  }

  if (
    /^(?:home|menu|search|print|copy url|copy link|subscribe|advertise|advertisement|newsletter|job alert|cookie policy|all rights reserved|copyright)\b/.test(
      line
    )
  ) {
    return true;
  }

  if (
    /\b(?:facebook|twitter|whatsapp|linkedin|telegram|viber|pinterest|email this|share on|follow us)\b/i.test(
      raw
    ) && raw.length < 260
  ) {
    return true;
  }

  if (
    /^(?:home\s*[|›»/]|home\s+contact us\s+about us|contact us\s*[|]|about us\s*[|])/i.test(
      raw
    )
  ) {
    return true;
  }

  if (/^(?:tags?|categories?|posted by|written by|author|published|updated)\s*[:\-]/i.test(raw)) {
    return true;
  }

  return false;
}

function cleanCandidateItem(value: string): string {
  return cleanInlineText(value)
    .replace(/^(?:[-*•▪◦–—]|\d+[.)])\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isDisplayableDetailItem(value: string): boolean {
  const item = cleanCandidateItem(value);
  const label = normalizedLabel(item);

  if (
    item.length < 4 ||
    item.length > 420 ||
    isBoilerplateLine(item) ||
    isPlaceholderValue(item)
  ) {
    return false;
  }

  if (
    /^(?:salary|compensation|pay|stipend|salary range|application closing date|application deadline|closing date|deadline|location|job location|work location|employment type|job type|contract type|how to apply|application method|note|share this job|share this opportunity)$/.test(
      label
    )
  ) {
    return false;
  }

  if (
    /^(?:salary|compensation|pay|stipend|salary range|application closing date|application deadline|closing date|deadline|location|job location|work location|employment type|job type|contract type)\s*[:\-–—]/i.test(
      item
    )
  ) {
    return false;
  }

  if (/^(?:note|important)\s*:/i.test(item)) {
    return false;
  }

  if (
    /^(?:interested and qualified candidates|qualified candidates should|send your cv|submit your application|apply via|click here to apply|only shortlisted candidates)/i.test(
      item
    )
  ) {
    return false;
  }

  if (
    /\b(?:massive job recruitment|job recruitment \(\d+ positions?\)|recruitment \(\d+ positions?\)|list of successful candidates)\b/i.test(
      item
    )
  ) {
    return false;
  }

  return true;
}

function cleanList(values: string[], limit = MAX_DETAIL_ITEMS): string[] {
  const unique = new Map<string, string>();

  for (const rawValue of values) {
    const value = cleanCandidateItem(rawValue);

    if (!isDisplayableDetailItem(value)) {
      continue;
    }

    const key = normalizedLabel(value);

    if (!unique.has(key)) {
      unique.set(key, value);
    }

    if (unique.size >= limit) {
      break;
    }
  }

  return Array.from(unique.values());
}

function stripSummaryNoise(value: string): string {
  let text = cleanInlineText(value);

  const stopExpressions = [
    /\bShare this (?:job|opportunity)\b/i,
    /\bHow to apply\b/i,
    /\bApplication method\b/i,
    /\bRelated (?:jobs|posts|opportunities)\b/i,
    /\bRecommended (?:jobs|opportunities)\b/i,
    /\bComments?\s*\(\d+\)/i,
    /\bHome\s*\|\s*Contact Us\b/i,
  ];

  for (const expression of stopExpressions) {
    const match = expression.exec(text);

    if (match && match.index > 0) {
      text = text.slice(0, match.index);
    }
  }

  const numberedList = /\s+(?:1|01)[.)]\s+[A-Z]/.exec(text);

  if (numberedList && numberedList.index > 240) {
    text = text.slice(0, numberedList.index);
  }

  text = text
    .replace(/^(?:Home\s+[^.!?]{0,180}|Print\s+[^.!?]{0,180})\s+/i, "")
    .replace(/\b(?:Print|Telegram|Viber|Copy URL|Facebook|Twitter|WhatsApp|LinkedIn|Email)\b(?:\s+|$)/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text;
}

function createConciseSummary(value: string | undefined): string {
  const text = stripSummaryNoise(value ?? "");

  if (!text || isBoilerplateLine(text)) {
    return "";
  }

  const sentences = text.split(/(?<=[.!?])\s+/);
  const selected: string[] = [];
  let length = 0;

  for (const sentence of sentences) {
    const candidate = sentence.trim();

    if (!candidate || isBoilerplateLine(candidate)) {
      continue;
    }

    if (selected.length >= 5) {
      break;
    }

    if (length + candidate.length > MAX_SUMMARY_CHARACTERS) {
      break;
    }

    selected.push(candidate);
    length += candidate.length + 1;
  }

  let summary = selected.join(" ").trim();

  if (!summary) {
    summary = text.slice(0, MAX_SUMMARY_CHARACTERS).trim();
  }

  if (summary.length > MAX_SUMMARY_CHARACTERS) {
    const shortened = summary.slice(0, MAX_SUMMARY_CHARACTERS);
    const boundary = Math.max(
      shortened.lastIndexOf(". "),
      shortened.lastIndexOf("! "),
      shortened.lastIndexOf("? ")
    );

    summary = (boundary > 300 ? shortened.slice(0, boundary + 1) : shortened).trim();
  }

  return summary;
}

function removeNoisyContainers(value: string): string {
  return value
    .replace(/<!--[^>]*>[\s\S]*?-->/g, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, " ")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, " ")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, " ")
    .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, " ")
    .replace(
      /<div\b[^>]*(?:id|class)=["'][^"']*(?:related|recommended|similar|share|social|sidebar|footer|comment|newsletter|advert|breadcrumb|pagination|more-jobs|latest-jobs|job-alert|cookie)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,
      " "
    )
    .replace(
      /<section\b[^>]*(?:id|class)=["'][^"']*(?:related|recommended|similar|share|social|sidebar|footer|comment|newsletter|advert|breadcrumb|pagination|more-jobs|latest-jobs|job-alert|cookie)[^"']*["'][^>]*>[\s\S]*?<\/section>/gi,
      " "
    );
}

function htmlToLines(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  const text = decodeEntities(removeNoisyContainers(value))
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

  return text ? cleanList([text]) : [];
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
    const salary = cleanInlineText(salarySource);
    return isPlaceholderValue(salary) ? "" : salary;
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

  const salary = [currency, amount, unit ? `/ ${unit}` : ""]
    .filter(Boolean)
    .join(" ")
    .trim();

  return isPlaceholderValue(salary) ? "" : salary;
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

function candidateScore(candidate: string): number {
  const lines = htmlToLines(candidate);
  const textLength = lines.join(" ").length;
  const relevantHeadings = lines.filter(
    (line) => classifyHeading(line) || classifyMetadataHeading(line)
  ).length;
  const noisyLines = lines.filter(isBoilerplateLine).length;
  const links = (candidate.match(/<a\b/gi) ?? []).length;

  return (
    Math.min(textLength, 30000) +
    relevantHeadings * 700 -
    noisyLines * 500 -
    links * 18
  );
}

function selectMainHtml(html: string): string {
  const candidates: string[] = [];
  const patterns = [
    /<div\b[^>]*(?:id|class)=["'][^"']*(?:job-description|job-details|vacancy-details|opportunity-details|entry-content|post-content|article-content|single-content)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
    /<section\b[^>]*(?:id|class)=["'][^"']*(?:job-description|job-details|vacancy-details|opportunity-details|entry-content|post-content|article-content|single-content)[^"']*["'][^>]*>([\s\S]*?)<\/section>/gi,
    /<article\b[^>]*>([\s\S]*?)<\/article>/gi,
    /<main\b[^>]*>([\s\S]*?)<\/main>/gi,
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
    (first, second) => candidateScore(second) - candidateScore(first)
  )[0];
}

function classifyHeading(line: string): SectionName | null {
  if (line.length > 120) {
    return null;
  }

  const value = normalizedLabel(line);

  if (
    /^(?:job |role |position |opportunity )?(?:summary|overview|description|about the role|about this role|about the opportunity|programme overview|program overview)$/.test(
      value
    )
  ) {
    return "overview";
  }

  if (
    /^(?:key |main )?(?:responsibilities|responsibility|duties|what you will do|what you'll do|the role|key tasks|your role)$/.test(
      value
    )
  ) {
    return "responsibilities";
  }

  if (
    /^(?:minimum |preferred |job |candidate )?(?:requirements|requirement|qualifications|qualification|skills|experience|what you will need|what we are looking for|what we're looking for|who you are|eligibility|selection criteria)$/.test(
      value
    )
  ) {
    return "requirements";
  }

  if (
    /^(?:benefits|perks|compensation and benefits|what we offer|what you will get|what you'll get|what is offered)$/.test(
      value
    )
  ) {
    return "benefits";
  }

  return null;
}

function classifyMetadataHeading(line: string): MetadataField | null {
  const value = normalizedLabel(line);

  if (/^(?:salary|compensation|pay|stipend|salary range)$/.test(value)) {
    return "salary";
  }

  if (
    /^(?:deadline|application deadline|application closing date|closing date|application closes|valid through)$/.test(
      value
    )
  ) {
    return "deadline";
  }

  if (/^(?:location|job location|work location|country)$/.test(value)) {
    return "location";
  }

  if (
    /^(?:employment type|job type|work type|contract type)$/.test(value)
  ) {
    return "employmentType";
  }

  return null;
}

function isStandalonePageTitle(line: string, pageTitle: string): boolean {
  const first = normalizedLabel(line);
  const second = normalizedLabel(pageTitle);

  return Boolean(first && second && (first === second || first.includes(second) || second.includes(first)));
}

function parseSections(
  lines: string[],
  pageTitle = ""
): {
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

  for (let index = 0; index < lines.length; index += 1) {
    const line = cleanInlineText(lines[index]);

    if (!line) {
      continue;
    }

    if (isStrongStopLine(line)) {
      break;
    }

    if (isBoilerplateLine(line)) {
      continue;
    }

    const metadataHeading = classifyMetadataHeading(line);

    if (metadataHeading) {
      const nextLine = cleanInlineText(lines[index + 1]);

      if (
        nextLine &&
        !classifyHeading(nextLine) &&
        !classifyMetadataHeading(nextLine) &&
        !isStrongStopLine(nextLine)
      ) {
        index += 1;
      }

      continue;
    }

    const heading = classifyHeading(line);

    if (heading) {
      currentSection = heading;
      continue;
    }

    if (isStandalonePageTitle(line, pageTitle)) {
      continue;
    }

    if (currentSection !== "overview" && !isDisplayableDetailItem(line)) {
      continue;
    }

    sections[currentSection].push(line);
  }

  const overview = createConciseSummary(
    sections.overview
      .filter((line) => !/^[-*•]/.test(line))
      .join(" ")
  );

  return {
    overview,
    responsibilities: cleanList(sections.responsibilities),
    requirements: cleanList(sections.requirements),
    benefits: cleanList(sections.benefits),
  };
}

function extractLabelValue(lines: string[], labels: string[]): string {
  const normalizedLabels = new Set(labels.map(normalizedLabel));
  const labelPattern = labels
    .map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  const inlineExpression = new RegExp(
    `^(?:${labelPattern})\\s*[:\\-–—]\\s*(.+)$`,
    "i"
  );

  for (let index = 0; index < lines.length; index += 1) {
    const line = cleanInlineText(lines[index]);
    const inlineValue = inlineExpression.exec(line)?.[1]?.trim();

    if (inlineValue && inlineValue.length <= 500 && !isPlaceholderValue(inlineValue)) {
      return inlineValue;
    }

    if (!normalizedLabels.has(normalizedLabel(line))) {
      continue;
    }

    const nextLine = cleanInlineText(lines[index + 1]);

    if (
      nextLine &&
      nextLine.length <= 500 &&
      !isPlaceholderValue(nextLine) &&
      !classifyHeading(nextLine) &&
      !classifyMetadataHeading(nextLine) &&
      !isStrongStopLine(nextLine) &&
      !isBoilerplateLine(nextLine)
    ) {
      return nextLine;
    }
  }

  return "";
}

function parseStructuredDetails(record: UnknownRecord): ExtractedDetails {
  const descriptionSource =
    typeof record.description === "string" ? record.description : "";
  const descriptionLines = htmlToLines(descriptionSource);
  const title = valueToText(record.title) || valueToText(record.name);
  const parsedDescription = parseSections(descriptionLines, title);
  const explicitSummary =
    valueToText(record.jobSummary) || valueToText(record.abstract);
  const remoteValue = valueToText(record.jobLocationType).toLowerCase();
  const applicantLocation = formatAddress(record.applicantLocationRequirements);
  const physicalLocation = formatAddress(record.jobLocation ?? record.location);
  const remote =
    remoteValue.includes("telecommute") || remoteValue.includes("remote");
  const hasRemoteType = remoteValue.length > 0;
  const location = remote
    ? applicantLocation
      ? `Remote · ${applicantLocation}`
      : "Remote"
    : physicalLocation || applicantLocation;

  const responsibilities = cleanList([
    ...valueToList(record.responsibilities),
    ...parsedDescription.responsibilities,
  ]);
  const requirements = cleanList([
    ...valueToList(record.qualifications),
    ...valueToList(record.skills),
    ...valueToList(record.experienceRequirements),
    ...valueToList(record.educationRequirements),
    ...parsedDescription.requirements,
  ]);
  const benefits = cleanList([
    ...valueToList(record.jobBenefits),
    ...parsedDescription.benefits,
  ]);
  const summary = createConciseSummary(
    explicitSummary || parsedDescription.overview || descriptionSource
  );

  return {
    title,
    company:
      valueToText(record.hiringOrganization) ||
      valueToText(record.provider) ||
      valueToText(record.organizer),
    summary,
    description: summary,
    location,
    remote: remote ? true : hasRemoteType ? false : undefined,
    salary: formatSalary(record),
    deadline:
      valueToText(record.validThrough) ||
      valueToText(record.applicationDeadline) ||
      valueToText(record.endDate),
    employmentType: valueToText(record.employmentType),
    responsibilities,
    requirements,
    benefits,
  };
}

function parseHtmlDetails(html: string): ExtractedDetails {
  const mainHtml = selectMainHtml(html);
  const lines = htmlToLines(mainHtml);
  const title = extractHeading(html);
  const sections = parseSections(lines, title);
  const metaDescription = createConciseSummary(
    getMetaContent(html, "description") || getMetaContent(html, "og:description")
  );

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
    "application closing date",
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

  const summary = sections.overview || metaDescription;

  return {
    title,
    summary,
    description: summary,
    location,
    remote:
      /\b(?:fully remote|remote position|remote role|work from home|telecommute)\b/i.test(
        `${location} ${summary}`
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
  const choose = (first?: string, second?: string) =>
    first?.trim() || second?.trim() || undefined;

  return {
    title: choose(structured?.title, htmlDetails.title),
    company: structured?.company?.trim() || undefined,
    summary: choose(structured?.summary, htmlDetails.summary),
    description: choose(structured?.description, htmlDetails.description),
    location: choose(structured?.location, htmlDetails.location),
    remote: structured?.remote ?? htmlDetails.remote,
    salary: choose(structured?.salary, htmlDetails.salary),
    deadline: choose(structured?.deadline, htmlDetails.deadline),
    employmentType: choose(
      structured?.employmentType,
      htmlDetails.employmentType
    ),
    responsibilities: cleanList([
      ...(structured?.responsibilities ?? []),
      ...htmlDetails.responsibilities,
    ]),
    requirements: cleanList([
      ...(structured?.requirements ?? []),
      ...htmlDetails.requirements,
    ]),
    benefits: cleanList([
      ...(structured?.benefits ?? []),
      ...htmlDetails.benefits,
    ]),
  };
}

function titleTokens(value: string): Set<string> {
  return new Set(
    normalizedLabel(value)
      .split(" ")
      .filter(
        (token) =>
          token.length > 2 &&
          ![
            "the",
            "and",
            "for",
            "with",
            "job",
            "role",
            "position",
            "opportunity",
            "programme",
            "program",
          ].includes(token)
      )
  );
}

function shouldUseSourceTitle(currentTitle: string, sourceTitle?: string): boolean {
  if (!sourceTitle) {
    return false;
  }

  const current = titleTokens(currentTitle);
  const source = titleTokens(sourceTitle);

  if (current.size === 0 || source.size === 0) {
    return false;
  }

  let overlap = 0;

  for (const token of current) {
    if (source.has(token)) {
      overlap += 1;
    }
  }

  return overlap / Math.min(current.size, source.size) >= 0.5;
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

    if (!["http:", "https:"].includes(url.protocol) || isPrivateHostname(url.hostname)) {
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
  const summary = createConciseSummary(details.summary);

  if (summary) {
    sections.push(summary);
  }

  if (details.responsibilities.length) {
    sections.push(
      `Responsibilities\n${details.responsibilities
        .map((item) => `- ${item}`)
        .join("\n")}`
    );
  }

  if (details.requirements.length) {
    sections.push(
      `Requirements\n${details.requirements
        .map((item) => `- ${item}`)
        .join("\n")}`
    );
  }

  if (details.benefits.length) {
    sections.push(
      `Benefits\n${details.benefits.map((item) => `- ${item}`).join("\n")}`
    );
  }

  const enriched = sections.join("\n\n").trim();

  if (enriched) {
    return enriched.slice(0, MAX_DESCRIPTION_CHARACTERS);
  }

  return opportunity.description?.trim() || undefined;
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
  const summary = createConciseSummary(
    details.summary || opportunity.summary || opportunity.description
  );
  const responsibilities = cleanList(
    details.responsibilities.length
      ? details.responsibilities
      : opportunity.responsibilities ?? []
  );
  const requirements = cleanList(
    details.requirements.length
      ? details.requirements
      : opportunity.requirements ?? []
  );
  const benefits = cleanList(
    details.benefits.length ? details.benefits : opportunity.benefits ?? []
  );
  const cleanedDetails: ExtractedDetails = {
    ...details,
    summary,
    responsibilities,
    requirements,
    benefits,
  };
  const description = buildDetailedDescription(opportunity, cleanedDetails);
  const salary = isPlaceholderValue(details.salary) ? "" : details.salary;
  const deadline = isPlaceholderValue(details.deadline) ? "" : details.deadline;

  return {
    ...opportunity,
    title: shouldUseSourceTitle(opportunity.title, details.title)
      ? details.title || opportunity.title
      : opportunity.title,
    company: details.company || opportunity.company,
    summary: summary || opportunity.summary,
    description,
    location: details.location || opportunity.location,
    remote: details.remote ?? opportunity.remote,
    salary: salary || opportunity.salary,
    deadline: deadline || opportunity.deadline,
    employmentType: details.employmentType || opportunity.employmentType,
    responsibilities:
      responsibilities.length > 0 ? responsibilities : undefined,
    requirements: requirements.length > 0 ? requirements : undefined,
    benefits: benefits.length > 0 ? benefits : undefined,
  };
}
