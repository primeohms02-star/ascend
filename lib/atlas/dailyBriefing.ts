import { BrainContext } from "@/lib/brain/context";

export type DailyBriefing = {
  greeting: string;
  summary: string;
  focus: string;
  oracle: string;
};

export function buildDailyBriefing(
  brain: BrainContext
): DailyBriefing {
  let greeting = "Good morning.";

  if (brain.progress >= 80) {
    greeting =
      "Good morning. You're operating at a high level today.";
  } else if (brain.progress >= 50) {
    greeting =
      "Good morning. You're building real momentum.";
  } else if (brain.progress >= 20) {
    greeting =
      "Good morning. Every completed mission moves you forward.";
  } else {
    greeting =
      "Good morning. Today is another chance to begin.";
  }

  return {
    greeting,

    summary: `You are currently following the ${brain.journey} journey and are ${brain.progress}% aligned with your North Star.`,

    focus: `Today's mission is "${brain.missionTitle}". Finish it before the day ends.`,

    oracle:
      "Consistency is the bridge between intention and transformation.",
  };
}