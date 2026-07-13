import { AdaptiveState } from "./adaptive";

export type AdaptiveOracle = {
  title: string;
  message: string;
};

export function buildAdaptiveOracle(
  adaptive: AdaptiveState
): AdaptiveOracle {
  switch (adaptive.oracleTone) {
    case "Encouraging":
      return {
        title: "Keep Going",
        message:
          "Progress isn't measured by perfection. One small victory today is enough. Protect your momentum.",
      };

    case "Balanced":
      return {
        title: "Stay Consistent",
        message:
          "You already have momentum. Continue showing up and trust the process. Small actions compound into extraordinary results.",
      };

    case "Challenging":
      return {
        title: "Raise Your Standard",
        message:
          "You're capable of more than maintaining momentum. Create something that pushes your limits and inspires others.",
      };

    default:
      return {
        title: "Today's Reflection",
        message:
          "Every decision you make shapes the person you're becoming.",
      };
  }
}