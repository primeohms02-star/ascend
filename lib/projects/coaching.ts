import { createHash } from "node:crypto";

export type CoachingFeedback = { strengths: string[]; improvements: string[]; nextStep: string };
export function coachingFingerprint(brief: unknown, responses: Record<string,string>, reflection: string) {
  return createHash("sha256").update(JSON.stringify([brief, Object.entries(responses).sort(([a],[b])=>a.localeCompare(b)), reflection])).digest("hex");
}
export function parseCoachingFeedback(value: unknown): CoachingFeedback {
  if (!value || typeof value !== "object") throw new Error("Invalid coaching response");
  const record = value as Record<string,unknown>;
  const list = (items: unknown) => {
    if (!Array.isArray(items) || items.length > 4 || items.some(item=>typeof item !== "string" || !item.trim() || item.length > 800)) throw new Error("Invalid coaching response");
    return items as string[];
  };
  if (typeof record.nextStep !== "string" || !record.nextStep.trim() || record.nextStep.length > 1000) throw new Error("Invalid coaching response");
  return { strengths: list(record.strengths), improvements: list(record.improvements), nextStep: record.nextStep };
}
