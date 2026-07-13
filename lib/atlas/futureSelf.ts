import { MemoryPattern } from "./patterns";

export type FutureSelf = {
  title: string;
  message: string;
  trajectory:
    | "Rising"
    | "Stable"
    | "At Risk";
};

export function buildFutureSelf(
  patterns: MemoryPattern,
  streak: number,
  progress: number
): FutureSelf {

  if (
    streak >= 21 &&
    progress >= 70 &&
    patterns.averageMood >= 4
  ) {
    return {
      trajectory: "Rising",

      title:
        "You're Becoming Your Future Self",

      message:
        "Your habits are aligning with your goals. If you continue at this pace, the person you're becoming will be capable of far more than the person you are today.",
    };
  }

  if (
    streak >= 7 &&
    progress >= 30
  ) {
    return {
      trajectory: "Stable",

      title:
        "Your Future Is Taking Shape",

      message:
        "You're moving in the right direction. Stay consistent and your identity will continue evolving.",
    };
  }

  return {
    trajectory: "At Risk",

    title:
      "Your Future Needs Your Attention",

    message:
      "Your current trajectory suggests inconsistency. Small daily actions now will dramatically change where you arrive in six months.",
  };
}