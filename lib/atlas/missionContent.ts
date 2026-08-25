const DECORATIVE_ONLY = /^[\s#*_`~|:;=\-–—]+$/;
const SMALL_TITLE_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "for",
  "from",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

function stripInlineMarkup(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\\([#*_`>~|])/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/(^|\s)[*_~]+(?=\S)/g, "$1")
    .replace(/([^\s])[*_~]+(?=\s|$|[.,!?;:])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => {
      if (/^[A-Z0-9][A-Z0-9&/+.-]*(?:['’][a-z]+)?$/.test(word)) {
        return word;
      }

      const lower = word.toLocaleLowerCase();

      if (index > 0 && SMALL_TITLE_WORDS.has(lower)) {
        return lower;
      }

      return `${lower.charAt(0).toLocaleUpperCase()}${lower.slice(1)}`;
    })
    .join(" ");
}

function trimAtWord(value: string, maximumLength: number): string {
  if (value.length <= maximumLength) {
    return value;
  }

  const slice = value.slice(0, Math.max(1, maximumLength - 1));
  const boundary = slice.lastIndexOf(" ");
  const safeSlice = boundary >= Math.floor(maximumLength * 0.6)
    ? slice.slice(0, boundary)
    : slice;

  return `${safeSlice.replace(/[\s,;:.!?-]+$/g, "")}…`;
}

export function normalizeMissionDetail(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  let normalized = value
    .replace(/\r\n/g, "\n")
    .replace(/```(?:[a-z0-9_-]+)?\s*/gi, "")
    .replace(/^\s*#{1,6}\s*/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s*[•●▪◦‣›]\s*/g, "\n• ")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/\s+-\s+(?=[A-Z])/g, "\n• ")
    .replace(/\s+(?=\d+[.)]\s+[A-Z])/g, "\n")
    .replace(
      /\s+(?=(?:Outcome|Steps?|Evidence(?: of Completion)?|Why (?:this mission matters|it matters|this advances your North Star))\s*:)/gi,
      "\n",
    );

  normalized = normalized
    .split("\n")
    .map((line) => {
      const clean = stripInlineMarkup(line)
        .replace(/^\s*[-*]\s+/, "• ")
        .replace(/\s{2,}/g, " ")
        .trim();

      if (!clean || DECORATIVE_ONLY.test(clean)) {
        return "";
      }

      return clean;
    })
    .filter((line, index, lines) => line || (index > 0 && lines[index - 1]))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return normalized;
}

export function isUsableMissionTitle(value: string | null | undefined): boolean {
  if (!value || /[\r\n]/.test(value)) {
    return false;
  }

  const clean = stripInlineMarkup(value);
  const words = clean.split(/\s+/).filter(Boolean);

  return (
    clean.length >= 4 &&
    clean.length <= 48 &&
    /[\p{L}]/u.test(clean) &&
    !DECORATIVE_ONLY.test(value.trim()) &&
    !/^(?:mission|title|none|null|n\/?a)$/i.test(clean) &&
    !/^(?:outcome|steps?|evidence|why it matters)\s*:/i.test(clean) &&
    !/[,;:]/.test(clean) &&
    !/\b(?:because|in order to|ready to|so that|tailored|targeted|which)\b/i.test(clean) &&
    words.length >= 2 &&
    words.length <= 6
  );
}

function deriveMissionTitle(value: string): string {
  const detail = normalizeMissionDetail(value);
  const firstLine = detail
    .split("\n")
    .map((line) => line.replace(/^\s*(?:•|\d+[.)])\s*/, "").trim())
    .find(Boolean) ?? "";

  const firstSentence = firstLine.split(/(?<=[.!?])\s+/)[0] ?? firstLine;
  const outcomeMatch = firstSentence.match(
    /\b(?:task|mission|action|steps?)\s+to\s+(.+?)(?:[.!?]|$)/i,
  );

  let candidate = outcomeMatch?.[1] ?? firstSentence;

  candidate = candidate
    .replace(/^(?:outcome|deliverable|result)\s*:\s*/i, "")
    .replace(
      /^(?:spend|use|take)\s+(?:the\s+)?(?:next\s+)?(?:\d+(?:\s*(?:to|-|–|—)\s*\d+)?\s*)?(?:minutes?|hours?|days?)?\s*(?:completing|working on|to complete)?\s*/i,
      "",
    )
    .replace(/^(?:complete|create|prepare|work on)\s+(?:the\s+)?(?:following\s+)?/i, "")
    .split(/\s+(?:tailored|targeted|designed|ready)\s+(?:to|for)\s+/i)[0]
    .split(/\s+(?:for|with)\s+(?:(?:a|an|the|your|specific)\s+)?/i)[0]
    .split(/\s+(?:so that|which|that)\s+/i)[0]
    .split(
      /\s+to\s+(?=(?:a|an|the|your|reach|share|send|build|create|prepare|demonstrate|show|support|advance)\b)/i,
    )[0]
    .split(/,\s*(?:then|and then|and)\s+/i)[0]
    .replace(/^[\s:;,.\-–—]+|[\s:;,.\-–—]+$/g, "")
    .trim();

  if (/^(?:a|an)\s+/i.test(candidate)) {
    candidate = `Create ${candidate.toLocaleLowerCase()}`;
  }

  if (!candidate || candidate.split(/\s+/).length < 2) {
    candidate = "Create Evidence of Progress";
  }

  const words = candidate.split(/\s+/).filter(Boolean).slice(0, 6);

  while (
    words.length > 2 &&
    (titleCase(words.join(" ")).length > 48 ||
      /^(?:a|an|and|at|for|from|in|of|on|the|to|with)$/i.test(
        words.at(-1) ?? "",
      ))
  ) {
    words.pop();
  }

  const title = titleCase(words.join(" "));
  return title.length <= 48 ? title : "Create Evidence of Progress";
}

export function normalizeMissionTitle(
  value: string | null | undefined,
  detail?: string | null,
): string {
  const clean = stripInlineMarkup(value ?? "")
    .replace(/^(?:title|mission)\s*:\s*/i, "")
    .replace(/[\s:;,.\-–—]+$/g, "")
    .trim();

  if (isUsableMissionTitle(clean)) {
    return clean;
  }

  return deriveMissionTitle(`${value ?? ""}\n${detail ?? ""}`);
}

export function normalizeMissionContent(
  title: string | null | undefined,
  detail: string | null | undefined,
) {
  const rawTitleDetail =
    normalizeMissionDetail(title);

  const normalizedDetail =
    normalizeMissionDetail(detail);

  const rawComparison = rawTitleDetail.toLocaleLowerCase();
  const detailComparison = normalizedDetail.toLocaleLowerCase();

  const shouldPreserveRawTitle =
    !isUsableMissionTitle(title) &&
    Boolean(rawTitleDetail) &&
    (!normalizedDetail ||
      (!detailComparison.includes(rawComparison) &&
        !rawComparison.includes(detailComparison)));

  const description =
    normalizeMissionDetail(
      [
        shouldPreserveRawTitle ? rawTitleDetail : "",
        normalizedDetail,
      ]
        .filter(Boolean)
        .join("\n\n")
    );

  return {
    title: normalizeMissionTitle(title, description),
    description:
      description ||
      "Complete the defined outcome and save clear evidence of the progress it creates.",
  };
}

export function summarizeMissionDetail(
  value: string | null | undefined,
  maximumLength = 165,
): string {
  const plain = normalizeMissionDetail(value)
    .replace(/^\s*(?:•|\d+[.)])\s*/gm, "")
    .replace(/^(?:Outcome|Why (?:this mission matters|it matters))\s*:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) {
    return "Complete the defined outcome and save clear evidence of progress toward your North Star.";
  }

  const firstSentence = plain.match(/^.{35,}?[.!?](?=\s|$)/)?.[0] ?? plain;
  return trimAtWord(firstSentence, maximumLength);
}
