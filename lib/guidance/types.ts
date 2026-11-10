export type JourneyEvent = "accept" | "tried" | "stuck" | "done" | "achieved";
export type JourneyEntry = {
  id: string;
  direction: string;
  event: JourneyEvent;
  step: string;
  note: string;
  recorded_at: string;
};
export type JourneyState = { direction: string; history: JourneyEntry[] };
export function activeStep(history: JourneyEntry[]) {
  return history[0] && !["done", "achieved"].includes(history[0].event)
    ? history[0].step
    : null;
}
export function safePublicLink(input: unknown) {
  if (typeof input !== "string") return null;
  try {
    const u = new URL(input);
    if (
      !["https:", "http:"].includes(u.protocol) ||
      u.username ||
      u.password ||
      !u.hostname.includes(".") ||
      u.hostname.endsWith(".local") ||
      /^\d+(\.\d+){3}$/.test(u.hostname)
    )
      return null;
    return u.href;
  } catch {
    return null;
  }
}
