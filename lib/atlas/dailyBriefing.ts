import { getGreeting } from "../utils/greeting";

export type DailyBriefing = {
  greeting: string;
  summary: string;
  focus: string;
  oracle: string;
};

type DailyBriefingInput = {
  journey: string;
  northStar: string;
  missionTitle: string;
  progress: number;
};

export function buildDailyBriefing(
  brain: DailyBriefingInput
): DailyBriefing {
  let greeting = getGreeting();

 const baseGreeting = getGreeting();

let message = "Today is another chance to begin.";

if (brain.progress >= 80) {
  message = "You're operating at a high level today.";
} else if (brain.progress >= 50) {
  message = "You're building real momentum.";
} else if (brain.progress >= 20) {
  message = "Every completed mission moves you forward.";
}

return {
  greeting: `${baseGreeting}. ${message}`,
  summary: `You are currently following the ${brain.journey} journey and are ${brain.progress}% aligned with your North Star.`,
  focus: `Today's mission is "${brain.missionTitle}". Finish it before the day ends.`,
  oracle: "Consistency is the bridge between intention and transformation.",
};

  return {
    greeting,

    summary: `You are currently following the ${brain.journey} journey and are ${brain.progress}% aligned with your North Star.`,

    focus: `Today's mission is "${brain.missionTitle}". Finish it before the day ends.`,

    oracle:
      "Consistency is the bridge between intention and transformation.",
  };
}