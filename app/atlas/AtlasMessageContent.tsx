import type { ReactNode } from "react";

type AtlasMessageContentProps = {
  content: string;
  isUser?: boolean;
};

type ContentBlock =
  | { type: "paragraph"; lines: string[] }
  | { type: "heading"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "code"; value: string };

const DECORATIVE_LINE = /^[\s*_~—–=-]{3,}$/;
const TABLE_DIVIDER = /^\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?$/;

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
        <strong
          key={`${part}-${index}`}
          className="font-semibold text-white"
        >
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

function parseContent(content: string): ContentBlock[] {
  const lines = content.replace(/\r\n/g, "\n").trim().split("\n");
  const blocks: ContentBlock[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
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
      continue;
    }

    const markdownHeading = rawTrimmed.match(/^#{1,6}\s+(.+)$/);
    if (markdownHeading) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: cleanPlainText(markdownHeading[1]) });
      continue;
    }

    const standaloneBoldHeading = trimmed.match(/^(?:\*\*|__)(.+)(?:\*\*|__)$/);
    if (standaloneBoldHeading && looksLikeHeading(standaloneBoldHeading[1])) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: cleanPlainText(standaloneBoldHeading[1]) });
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
  flushCode();

  return blocks;
}

export default function AtlasMessageContent({
  content,
  isUser = false,
}: AtlasMessageContentProps) {
  if (isUser) {
    return (
      <p className="whitespace-pre-wrap text-[15px] leading-7 sm:text-base">
        {cleanPlainText(content)}
      </p>
    );
  }

  const blocks = parseContent(content);

  return (
    <div className="space-y-4 text-[15px] leading-7 text-slate-200 sm:text-base sm:leading-7">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h3
              key={`heading-${index}`}
              className="pt-1 text-base font-semibold tracking-tight text-white sm:text-lg"
            >
              {renderInline(block.text)}
            </h3>
          );
        }

        if (block.type === "unordered-list") {
          return (
            <ul key={`unordered-${index}`} className="space-y-2.5">
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-[0.72rem] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300"
                  />
                  <span className="min-w-0 flex-1">{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "ordered-list") {
          return (
            <ol key={`ordered-${index}`} className="space-y-3">
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-300/25 bg-amber-300/10 text-xs font-semibold text-amber-200">
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
              className="overflow-x-auto rounded-2xl border border-white/10 bg-black/35 p-4 text-sm leading-6 text-cyan-100"
            >
              <code>{block.value}</code>
            </pre>
          );
        }

        return (
          <p key={`paragraph-${index}`} className="text-slate-200">
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
