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
const TIME_RANGE_LINE = /^(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?\s*[–—-]\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*(?:\||[–—-])\s*(.+)$/i;
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
          className="rounded-md border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-[0.92em] text-cyan-100"
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
          className="break-all text-cyan-300 underline decoration-cyan-400/40 underline-offset-4 transition hover:text-cyan-200"
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

  /*
   * Models occasionally return a good schedule without actual line breaks.
   * Split before each time range so the renderer can turn every block into a
   * compact schedule row instead of displaying a wall of text.
   */
  prepared = prepared.replace(
    /\s+(?=\d{1,2}(?::\d{2})?\s*(?:AM|PM)?\s*[–—-]\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM)?\s*(?:\||[–—-]))/gi,
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

  return cells.join(" — ");
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

  const time = cleanPlainText(match[1]).replace(/\s+/g, " ");
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
      detail: detailParts.join(" — "),
    };
  }

  const dashPieces = rest
    .split(/\s+[–—-]\s+/)
    .map((piece) => cleanPlainText(piece))
    .filter(Boolean);

  const title = dashPieces.shift() ?? "Planned block";
  const detail = dashPieces
    .join(" — ")
    .replace(/\s*[•●▪◦‣]\s*/g, " · ")
    .replace(/(?:\s*·\s*){2,}/g, " · ")
    .trim();

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
        value: cleanPlainText(labelMatch[2]),
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
      listItems.push(cleanPlainText(unorderedMatch[1]));
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      if (listType && listType !== "ordered-list") {
        flushList();
      }
      listType = "ordered-list";
      listItems.push(cleanPlainText(orderedMatch[1]));
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
    <div className="space-y-3.5 text-[15px] leading-6 text-slate-200 sm:text-base sm:leading-7">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <div key={`heading-${index}`} className="flex items-center gap-2.5 pt-1">
              <span aria-hidden="true" className="h-px w-5 shrink-0 bg-amber-300/60" />
              <h3 className="text-[15px] font-semibold tracking-tight text-white sm:text-base">
                {renderInline(block.text)}
              </h3>
            </div>
          );
        }

        if (block.type === "label") {
          return (
            <div
              key={`label-${index}`}
              className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200/75">
                {block.label}
              </p>
              <p className="mt-1.5 leading-6 text-slate-200">
                {renderInline(block.value)}
              </p>
            </div>
          );
        }

        if (block.type === "schedule") {
          return (
            <div key={`schedule-${index}`} className="space-y-2">
              {block.items.map((item, itemIndex) => (
                <div
                  key={`${item.time}-${itemIndex}`}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-3 sm:px-4"
                >
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                    <span className="rounded-full border border-amber-300/20 bg-amber-300/[0.08] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-amber-200">
                      {item.time}
                    </span>
                    <p className="min-w-0 font-semibold leading-5 text-white">
                      {renderInline(item.title)}
                    </p>
                  </div>
                  {item.detail && (
                    <p className="mt-2 text-[14px] leading-6 text-slate-400 sm:text-[15px]">
                      {renderInline(item.detail)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          );
        }

        if (block.type === "unordered-list") {
          return (
            <ul key={`unordered-${index}`} className="space-y-2.5">
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-[0.62rem] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300"
                  />
                  <span className="min-w-0 flex-1">{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "ordered-list") {
          return (
            <ol key={`ordered-${index}`} className="space-y-2.5">
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-300/25 bg-amber-300/[0.08] text-[11px] font-semibold text-amber-200">
                    {itemIndex + 1}
                  </span>
                  <span className="min-w-0 flex-1 pt-0.5">
                    {renderInline(item)}
                  </span>
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
          <p key={`paragraph-${index}`} className="max-w-[68ch] text-slate-300">
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
