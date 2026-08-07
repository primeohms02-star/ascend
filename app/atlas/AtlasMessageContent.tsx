import type { ReactNode } from "react";

type AtlasMessageContentProps = {
  content: string;
  isUser?: boolean;
};

type ScheduleItem = {
  time: string;
  title: string;
  detail: string;
};

type ContentBlock =
  | { type: "paragraph"; lines: string[] }
  | { type: "heading"; text: string }
  | { type: "label"; label: string; value: string }
  | { type: "schedule"; items: ScheduleItem[] }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "code"; value: string };

const DECORATIVE_LINE = /^[\s*_~—–=-]{3,}$/;
const TABLE_DIVIDER = /^\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?$/;
const TIME_RANGE_LINE = /^(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?\s*(?:to|[–—-])\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*(?:\||[–—-])\s*(.+)$/i;
const LABEL_LINE = /^(Primary North Star|North Star|Current Mission|Mission|Primary Focus|Today['’]s Focus|Goal|Recommendation|Next Step)\s*:\s*(.+)$/i;

function cleanPlainText(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/\\([#*_`>~|])/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/(^|\s)[*_~]+(?=\S)/g, "$1")
    .replace(/([^\s])[*_~]+(?=\s|$|[.,!?;:])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function renderInline(text: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|https?:\/\/[^\s]+)/g;
  const parts = text.split(pattern).filter(Boolean);

  return parts.map((part, index) => {
    if (
      (part.startsWith("**") && part.endsWith("**")) ||
      (part.startsWith("__") && part.endsWith("__"))
    ) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-white">
          {cleanPlainText(part.slice(2, -2))}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${part}-${index}`}
          className="rounded-md bg-white/[0.07] px-1.5 py-0.5 font-mono text-[0.92em] text-slate-100"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={`${part}-${index}`}
          href={part}
          target="_blank"
          rel="noreferrer"
          className="break-all text-amber-200 underline decoration-amber-300/35 underline-offset-4 transition hover:text-amber-100"
        >
          {part}
        </a>
      );
    }

    return cleanPlainText(part);
  });
}

function normalizeLine(rawLine: string) {
  return rawLine
    .replace(/^\s*>+\s?/, "")
    .replace(/^\s*#{1,6}\s+/, "")
    .trimEnd();
}

function prepareContent(content: string) {
  let prepared = content.replace(/\r\n/g, "\n").trim();

  // Legacy Atlas replies sometimes put multiple schedule entries on one line.
  // Split them before parsing so old history also reads cleanly.
  prepared = prepared.replace(
    /\s+(?=\d{1,2}(?::\d{2})?\s*(?:AM|PM)?\s*(?:to|[–—-])\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM)?\s*(?:\||[–—-]))/gi,
    "\n"
  );

  prepared = prepared.replace(
    /\s+(?=(?:Primary North Star|North Star|Current Mission|Mission|Primary Focus|Today['’]s Focus|Recommendation|Next Step)\s*:)/gi,
    "\n"
  );

  prepared = prepared.replace(/\s+(?=\d+[.)]\s+[A-Z])/g, "\n");

  return prepared;
}

function tableRowToSentence(line: string) {
  const cells = line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cleanPlainText(cell))
    .filter(Boolean);

  return cells.join(": ");
}

function looksLikeHeading(line: string) {
  const clean = cleanPlainText(line);

  if (!clean || clean.length > 78) {
    return false;
  }

  if (/^(?:Today['’]s Action Plan|Your .*Day Plan|Action Plan|Your Day Plan)/i.test(clean)) {
    return true;
  }

  if (/[:.!?]$/.test(clean)) {
    return clean.endsWith(":");
  }

  const words = clean.split(/\s+/);

  return (
    words.length <= 8 &&
    !/^https?:\/\//i.test(clean) &&
    (clean === clean.toUpperCase() ||
      words.every((word) =>
        /^(?:[A-Z0-9][\p{L}\p{N}'’&/-]*|and|or|to|of|for|the|a|an|with|in)$/u.test(
          word
        )
      ))
  );
}

function scheduleItemFromLine(line: string): ScheduleItem | null {
  const match = line.match(TIME_RANGE_LINE);

  if (!match) {
    return null;
  }

  const time = cleanPlainText(match[1])
    .replace(/\s*[–—-]\s*/g, " to ")
    .replace(/\s+/g, " ");
  const rest = match[2].trim();
  const pipePieces = rest
    .split(/\s*\|\s*/)
    .map((piece) => cleanPlainText(piece))
    .filter(Boolean);

  if (pipePieces.length >= 2) {
    const [title, ...detailParts] = pipePieces;

    return {
      time,
      title: title || "Planned block",
      detail: detailParts.join(". "),
    };
  }

  const separatorPieces = rest
    .split(/\s+[–—]\s+/)
    .map((piece) => cleanPlainText(piece))
    .filter(Boolean);

  const title = separatorPieces.shift() ?? "Planned block";
  const detail = separatorPieces.join(". ").trim();

  return {
    time,
    title,
    detail,
  };
}

function parseContent(content: string): ContentBlock[] {
  const lines = prepareContent(content).split("\n");
  const blocks: ContentBlock[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let scheduleItems: ScheduleItem[] = [];
  let listType: "unordered-list" | "ordered-list" | null = null;
  let codeLines: string[] = [];
  let inCodeBlock = false;

  function flushParagraph() {
    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", lines: paragraph });
      paragraph = [];
    }
  }

  function flushList() {
    if (listType && listItems.length > 0) {
      blocks.push({ type: listType, items: listItems });
      listItems = [];
      listType = null;
    }
  }

  function flushSchedule() {
    if (scheduleItems.length > 0) {
      blocks.push({ type: "schedule", items: scheduleItems });
      scheduleItems = [];
    }
  }

  function flushCode() {
    if (codeLines.length > 0) {
      blocks.push({ type: "code", value: codeLines.join("\n").trim() });
      codeLines = [];
    }
  }

  for (const rawLine of lines) {
    const rawTrimmed = rawLine.trim();

    if (/^```/.test(rawTrimmed)) {
      flushParagraph();
      flushList();
      flushSchedule();

      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(rawLine);
      continue;
    }

    const line = normalizeLine(rawLine);
    const trimmed = line.trim();

    if (!trimmed || DECORATIVE_LINE.test(trimmed) || TABLE_DIVIDER.test(trimmed)) {
      flushParagraph();
      flushList();
      flushSchedule();
      continue;
    }

    const scheduleItem = scheduleItemFromLine(trimmed);
    if (scheduleItem) {
      flushParagraph();
      flushList();
      scheduleItems.push(scheduleItem);
      continue;
    }

    flushSchedule();

    const markdownHeading = rawTrimmed.match(/^#{1,6}\s+(.+)$/);
    if (markdownHeading) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: cleanPlainText(markdownHeading[1]) });
      continue;
    }

    const labelMatch = trimmed.match(LABEL_LINE);
    if (labelMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "label",
        label: cleanPlainText(labelMatch[1]),
        value: labelMatch[2].trim(),
      });
      continue;
    }

    const standaloneBoldHeading = trimmed.match(/^(?:\*\*|__)(.+)(?:\*\*|__)$/);
    if (standaloneBoldHeading && looksLikeHeading(standaloneBoldHeading[1])) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        text: cleanPlainText(standaloneBoldHeading[1]),
      });
      continue;
    }

    const unorderedMatch = trimmed.match(/^(?:[-*•●▪◦‣›→])\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (listType && listType !== "unordered-list") {
        flushList();
      }
      listType = "unordered-list";
      listItems.push(unorderedMatch[1].trim());
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      if (listType && listType !== "ordered-list") {
        flushList();
      }
      listType = "ordered-list";
      listItems.push(orderedMatch[1].trim());
      continue;
    }

    if (trimmed.includes("|") && trimmed.split("|").length >= 3) {
      flushList();
      const sentence = tableRowToSentence(trimmed);
      if (sentence) {
        paragraph.push(sentence);
      }
      continue;
    }

    flushList();

    if (looksLikeHeading(trimmed) && paragraph.length === 0) {
      blocks.push({ type: "heading", text: cleanPlainText(trimmed) });
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  flushSchedule();
  flushCode();

  return blocks;
}

export default function AtlasMessageContent({
  content,
  isUser = false,
}: AtlasMessageContentProps) {
  if (isUser) {
    return (
      <p className="whitespace-pre-wrap text-[15px] leading-6 sm:text-base">
        {cleanPlainText(content)}
      </p>
    );
  }

  const blocks = parseContent(content);

  return (
    <div className="space-y-5 text-[16px] leading-7 text-[#ECECF1] sm:text-[17px] sm:leading-8">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h3
              key={`heading-${index}`}
              className="pt-1 text-[17px] font-semibold tracking-tight text-white sm:text-lg"
            >
              {renderInline(block.text)}
            </h3>
          );
        }

        if (block.type === "label") {
          return (
            <p key={`label-${index}`} className="max-w-[70ch]">
              <strong className="font-semibold text-white">{block.label}:</strong>{" "}
              {renderInline(block.value)}
            </p>
          );
        }

        if (block.type === "schedule") {
          return (
            <ul
              key={`schedule-${index}`}
              className="list-disc space-y-3.5 pl-6 marker:text-slate-400"
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${item.time}-${itemIndex}`} className="pl-1">
                  <strong className="font-semibold text-white">{item.time}:</strong>{" "}
                  <span className="font-semibold text-white">
                    {renderInline(item.title)}
                  </span>
                  {item.detail ? (
                    <span className="text-[#ECECF1]">. {renderInline(item.detail)}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "unordered-list") {
          return (
            <ul
              key={`unordered-${index}`}
              className="list-disc space-y-3.5 pl-6 marker:text-slate-400"
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`} className="pl-1">
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "ordered-list") {
          return (
            <ol
              key={`ordered-${index}`}
              className="list-decimal space-y-3.5 pl-6 marker:font-semibold marker:text-slate-400"
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`} className="pl-1">
                  {renderInline(item)}
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === "code") {
          return (
            <pre
              key={`code-${index}`}
              className="overflow-x-auto rounded-xl border border-white/10 bg-black/35 p-4 text-sm leading-6 text-cyan-100"
            >
              <code>{block.value}</code>
            </pre>
          );
        }

        return (
          <p key={`paragraph-${index}`} className="max-w-[70ch] text-[#ECECF1]">
            {block.lines.map((line, lineIndex) => (
              <span key={`${line}-${lineIndex}`}>
                {lineIndex > 0 ? " " : null}
                {renderInline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
