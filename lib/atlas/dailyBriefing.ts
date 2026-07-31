import {
  getGreeting,
} from "../utils/greeting";

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

  /*
   * Canonical Ascension XP—not a percentage.
   */
  progress: number;
};

export function buildDailyBriefing(
  brain: DailyBriefingInput
): DailyBriefing {
  const ascensionScore =
    Math.max(
      0,
      Math.round(
        Number.isFinite(
          brain.progress
        )
          ? brain.progress
          : 0
      )
    );

  let message =
    "Today is another opportunity to create evidence of progress.";

  if (
    ascensionScore >= 400
  ) {
    message =
      "Your completed actions show substantial momentum.";
  } else if (
    ascensionScore >= 175
  ) {
    message =
      "You are building meaningful evidence of growth.";
  } else if (
    ascensionScore >= 50
  ) {
    message =
      "Your completed missions are creating visible momentum.";
  } else if (
    ascensionScore > 0
  ) {
    message =
      "Every valid mission completion strengthens your direction.";
  }

  const hasMission =
    brain.missionTitle !==
    "No active mission";

  return {
    greeting:
      `${getGreeting()}. ${message}`,

    summary:
      `You are following the ${brain.journey} journey and have earned ${ascensionScore} Ascension XP toward your North Star.`,

    focus:
      hasMission
        ? `Your current mission is “${brain.missionTitle}”.`
        : "You currently have no active mission.",

    oracle:
      "Progress is measured through meaningful evidence, not activity alone.",
  };
}