import { AdaptiveState } from "./adaptive";

export type AdaptiveMission = {
  title: string;
  description: string;
};

export function buildAdaptiveMission(
  adaptive: AdaptiveState
): AdaptiveMission {
  switch (adaptive.missionDifficulty) {
    case "Easy":
      return {
        title: "Complete One Meaningful Task",
        description:
          "Focus on one small win today. Momentum begins with consistency.",
      };

    case "Medium":
      return {
        title: "Build Something Valuable",
        description:
          "Dedicate one focused session to creating or improving a meaningful project.",
      };

    case "Hard":
      return {
        title: "Lead With Action",
        description:
          "Take on a challenge that stretches your abilities and creates value for others.",
      };

    default:
      return {
        title: "Keep Moving",
        description:
          "Progress is built one intentional step at a time.",
      };
  }
}