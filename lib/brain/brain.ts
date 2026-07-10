import { BrainContext } from "./context";

export type BrainDecision = {
  status: "Lost" | "Exploring" | "Growing" | "Ascending";

  northStarAlignment: number;

  nextMissionTitle: string;
  nextMissionDescription: string;

  oracleTitle: string;
  oracleMessage: string;

  opportunityPriority:
    | "Course"
    | "Job"
    | "Scholarship"
    | "Accelerator";

  identityTitle: string;
  identityLevel: number;
};

export function think(
  brain: BrainContext
): BrainDecision {

  const memory = brain.memory ?? {
    currentStreak: 0,
    longestStreak: 0,
    missionsCompleted: 0,
    missionsMissed: 0,
  };

  const identity = brain.identity;

  let identityTitle = identity.title;
  let identityLevel = identity.level;

  if (brain.progress >= 25) {
    identityTitle = "Builder";
    identityLevel = 2;
  }

  if (brain.progress >= 50) {
    identityTitle = "Creator";
    identityLevel = 3;
  }

  if (brain.progress >= 75) {
    identityTitle = "Leader";
    identityLevel = 4;
  }

  if (brain.progress >= 100) {
    identityTitle = "Ascendant";
    identityLevel = 5;
  }

  if (memory.currentStreak >= 30) {
    return {
      status: "Ascending",

      northStarAlignment: brain.progress,

      nextMissionTitle: "Protect Your Momentum",

      nextMissionDescription:
        "Thirty days of consistency is rare. Don't break the chain.",

      oracleTitle: "Consistency becomes identity.",

      oracleMessage:
        "Your habits are becoming who you are. Keep showing up.",

      opportunityPriority: "Accelerator",

      identityTitle,
      identityLevel,
    };
  }

  if (brain.progress < 25) {
    return {
      status: "Lost",

      northStarAlignment: brain.progress,

      nextMissionTitle: "Build Consistency",

      nextMissionDescription:
        "Complete one meaningful task today. Small wins create momentum.",

      oracleTitle: "Small steps create momentum.",

      oracleMessage:
        "Forget perfection. Win today. One completed mission is better than ten unfinished plans.",

      opportunityPriority: "Course",

      identityTitle,
      identityLevel,
    };
  }

  if (brain.progress < 50) {
    return {
      status: "Exploring",

      northStarAlignment: brain.progress,

      nextMissionTitle: "Develop Valuable Skills",

      nextMissionDescription:
        "Invest time learning a skill that moves you closer to your North Star.",

      oracleTitle: "Momentum is building.",

      oracleMessage:
        "You've proven you can move. Keep building skills that compound.",

      opportunityPriority: "Course",

      identityTitle,
      identityLevel,
    };
  }

  if (brain.progress < 80) {
    return {
      status: "Growing",

      northStarAlignment: brain.progress,

      nextMissionTitle: "Apply Your Skills",

      nextMissionDescription:
        "Execution beats preparation. Build something real this week.",

      oracleTitle: "Execution beats preparation.",

      oracleMessage:
        "The next stage isn't more learning. It's doing.",

      opportunityPriority: "Job",

      identityTitle,
      identityLevel,
    };
  }

  return {
    status: "Ascending",

    northStarAlignment: brain.progress,

    nextMissionTitle: "Multiply Your Impact",

    nextMissionDescription:
      "Create opportunities for yourself and others.",

    oracleTitle: "Think beyond yourself.",

    oracleMessage:
      "Your growth now has the power to help other people grow.",

    opportunityPriority: "Accelerator",

    identityTitle,
    identityLevel,
  };
}