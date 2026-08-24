/**
 * Repairs common model-output artifacts before the main Atlas prose parser.
 * This stays safe for server and client use so new and stored replies match.
 */
export function normalizeAtlasListArtifacts(value: string): string {
  return value
    .replace(/[\u00a0\u202f]/g, " ")
    .replace(/[‑‒–—]/g, "-")
    .replace(/≈\s*/g, "about ")
    .replace(/^\s*([0-9])(?:\uFE0F?\u20E3)\s*/gmu, "$1. ")
    .replace(/^\s*[-*•]\s+\[(?:\s|x|X)\]\s+/gmu, "• ")
    .replace(
      /([:;.!?])\s+[-*]\s+(?=(?:\*\*|__)?[\p{Lu}\d])/gmu,
      "$1\n• ",
    )
    .replace(/:\s*\.\s+(?=[\p{Lu}\d])/gmu, ":\n• ")
    .replace(/\n\s*\.\s+(?=[\p{Lu}\d])/gmu, "\n• ")
    .replace(/([.!?]):(?=\s|$)/gmu, ":")
    .replace(/([.!?])([”’"'])\.(?=\s|$)/gmu, "$1$2")
    .replace(/(^|[.!?]\s+)([a-z])/gmu, (_, prefix: string, letter: string) =>
      `${prefix}${letter.toUpperCase()}`,
    );
}
