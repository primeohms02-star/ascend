import {
  getGreeting,
} from "../utils/greeting";

import {
  summarizeMissionDetail,
} from "./missionContent";

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
  missionCreatedAt?: string | null;
  currentStreak?: number;

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

  const missionCreatedAt = brain.missionCreatedAt
    ? new Date(brain.missionCreatedAt).getTime()
    : Number.NaN;

  const missionAgeDays = Number.isFinite(missionCreatedAt)
    ? Math.max(0, Math.floor((Date.now() - missionCreatedAt) / 86_400_000))
    : 0;

  const currentStreak = Math.max(0, Math.floor(brain.currentStreak ?? 0));

  let atlasNotice = `Your active mission, “${brain.missionTitle}”, is the clearest next step toward ${northStarPreview || "your North Star"}. Completing it will give Atlas a stronger signal for what should come next.`;

  if (!hasMission) {
    atlasNotice = `Atlas cannot prepare a meaningful next move until your ${brain.journey} journey has an active mission. Confirm your direction to restore the action loop.`;
  } else if (missionAgeDays >= 2) {
    atlasNotice = `“${brain.missionTitle}” has been active for ${missionAgeDays} days. If progress is blocked, ask Atlas to identify the obstacle and reduce it to one workable next step.`;
  } else if (currentStreak >= 3) {
    atlasNotice = `Your ${currentStreak}-day mission streak is creating consistent evidence of progress. Protect that momentum by completing “${brain.missionTitle}” before taking on another priority.`;
  } else if (ascensionScore === 0) {
    atlasNotice = `Completing “${brain.missionTitle}” will establish your first recorded evidence of progress toward ${northStarPreview || "your North Star"}.`;
  }

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
        ? summarizeMissionDetail(
            brain.missionReason
          )
        : "Start or update your journey so Atlas can prepare a mission from your identity, immediate goal, skills, challenges and North Star.",

    oracle: atlasNotice,
  };
}
