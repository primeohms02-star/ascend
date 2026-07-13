import { MemoryPattern } from "./patterns";

export type WeeklyReview = {
  title: string;
  summary: string;
  wins: string[];
  focus: string;
};

export function buildWeeklyReview(
  patterns: MemoryPattern,
  streak: number
): WeeklyReview {
  const wins: string[] = [];

  if (streak >= 7) {
    wins.push("Built a consistent daily habit.");
  }

  if (patterns.averageMood >= 4) {
    wins.push("Maintained positive emotional momentum.");
  }

  if (patterns.totalReflections >= 5) {
    wins.push("Reflected consistently throughout the week.");
  }

  if (wins.length === 0) {
    wins.push("You kept showing up. Every journey starts there.");
  }

  let focus =
    "Complete your daily mission every day this week.";

  if (patterns.averageMood >= 4) {
    focus =
      "Increase the difficulty of your missions.";
  } else if (patterns.averageMood <= 2.5) {
    focus =
      "Reduce mission size and rebuild consistency.";
  }

  return {
    title: "Weekly Review",

    summary:
      "Atlas analyzed your recent activity and identified your strongest growth patterns.",

    wins,

    focus,
  };
}