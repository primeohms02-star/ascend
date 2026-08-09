import {
  getGreeting,
} from "../utils/greeting";

export type DailyBriefing = {
  greeting: string;
  summary: string;
  focus: string;
  focusDetail: string;
  oracle: string;
};

type DailyBriefingInput = {
  journey: string;
  northStar: string;
  missionTitle: string;
  missionReason: string;

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

  const cleanNorthStar =
    brain.northStar
      .trim()
      .replace(/\s+/g, " ");

  const northStarPreview =
    cleanNorthStar.length > 150
      ? `${cleanNorthStar.slice(
          0,
          147
        )}...`
      : cleanNorthStar;

  const cleanMissionReason =
    brain.missionReason
      .trim()
      .replace(/\s+/g, " ");

  return {
    greeting:
      `${getGreeting()}. ${message}`,

    summary:
      `You are following the ${brain.journey} journey and have earned ${ascensionScore} Ascension XP toward your North Star.`,

    focus:
      hasMission
        ? brain.missionTitle
        : "You currently have no active mission.",

    focusDetail:
      hasMission
        ? cleanMissionReason ||
          `Completing this mission should create visible evidence of progress toward ${northStarPreview || "your North Star"}.`
        : "Start or update your journey so Atlas can prepare a mission from your identity, immediate goal, skills, challenges and North Star.",

    oracle:
      hasMission
        ? `The priority is evidence that connects this mission to your direction: ${northStarPreview || "your North Star"}. Complete the defined outcome, then use what you learn to make the next action more precise.`
        : `Your ${brain.journey} journey needs a current mission before Atlas can evaluate the next meaningful action. Confirm your direction to continue building momentum.`,
  };
}
