import { MemoryPattern } from "./patterns";

export type Prediction = {
  title: string;
  message: string;
  confidence: number;
};

export function buildPrediction(
  patterns: MemoryPattern,
  streak: number
): Prediction {
  if (streak >= 21) {
    return {
      title: "Momentum is Compounding",
      message:
        "You've built a strong habit. Keep protecting it—you're entering your highest growth phase.",
      confidence: 94,
    };
  }

  if (streak >= 7) {
    return {
      title: "Consistency Detected",
      message:
        "You're becoming more consistent. One more week could permanently strengthen this habit.",
      confidence: 88,
    };
  }

  if (patterns.averageMood <= 2.5) {
    return {
      title: "Momentum Risk",
      message:
        "Your recent reflections suggest motivation may be declining. Focus on one small win today.",
      confidence: 86,
    };
  }

  return {
    title: "Growth Ahead",
    message:
      "Your current trajectory is positive. Stay consistent and Atlas will continue increasing your challenge level.",
    confidence: 80,
  };
}