import type { JourneyState } from "./types";

export const draftKey = (userId: string) => "ascend:step-draft:v1:" + userId;

// A later check-in or a different direction invalidates an old edit.
export function readStepDraft(raw: string | null, state: JourneyState) {
  if (!raw || state.history[0]?.event === "achieved") return null;
  try {
    const d = JSON.parse(raw);
    if (
      !d ||
      d.direction !== state.direction ||
      d.previous !== (state.history[0]?.id ?? null) ||
      typeof d.step !== "string" ||
      d.step.length > 600 ||
      typeof d.why !== "string" ||
      d.why.length > 400
    )
      return null;
    return { step: d.step as string, why: d.why as string };
  } catch {
    return null;
  }
}
