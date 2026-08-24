const TITLE_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "for",
  "from",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
  "toward",
  "with",
  "your",
]);

function normalizeTitle(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function titleTokens(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9+#.]+/g, " ")
      .split(/\s+/)
      .map((token) =>
        token.length > 5 ? token.replace(/(?:ing|ed|es|s)$/i, "") : token,
      )
      .filter((token) => token.length >= 3 && !TITLE_STOP_WORDS.has(token)),
  );
}

export function isRepeatedMissionTitle(
  candidate: string,
  blockedTitles: string[],
): boolean {
  const candidateTokens = titleTokens(candidate);

  return blockedTitles.some((blockedTitle) => {
    if (normalizeTitle(candidate) === normalizeTitle(blockedTitle)) return true;

    const blockedTokens = titleTokens(blockedTitle);
    const smallerSize = Math.min(candidateTokens.size, blockedTokens.size);

    if (smallerSize === 0) return false;

    let shared = 0;
    for (const token of candidateTokens) {
      if (blockedTokens.has(token)) shared += 1;
    }

    return shared / smallerSize >= 0.67;
  });
}
