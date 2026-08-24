/**
 * Repairs common model-output artifacts before the main Atlas prose parser.
 * This stays safe for server and client use so new and stored replies match.
 */
export function normalizeAtlasListArtifacts(value: string): string {
  return value
    .replace(/^\s*([0-9])(?:\uFE0F?\u20E3)\s*/gmu, "$1. ")
    .replace(
      /([:;.!?])\s+[-*]\s+(?=(?:\*\*|__)?[\p{Lu}\d])/gmu,
      "$1\n• ",
    )
    .replace(/:\s*\.\s+(?=[\p{Lu}\d])/gmu, ":\n• ")
    .replace(/\n\s*\.\s+(?=[\p{Lu}\d])/gmu, "\n• ");
}
