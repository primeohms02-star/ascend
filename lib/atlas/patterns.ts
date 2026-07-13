type Reflection = {
  reflection: string;
  mood: number;
};

export type MemoryPattern = {
  dominantMood: number;
  averageMood: number;
  totalReflections: number;
  insight: string;
};

export function analyzePatterns(
  reflections: Reflection[]
): MemoryPattern {
  if (reflections.length === 0) {
    return {
      dominantMood: 3,
      averageMood: 3,
      totalReflections: 0,
      insight:
        "Atlas is still learning about you.",
    };
  }

  const totalMood =
    reflections.reduce(
      (sum, reflection) =>
        sum + reflection.mood,
      0
    );

  const averageMood =
    Number(
      (
        totalMood /
        reflections.length
      ).toFixed(1)
    );

  let insight =
    "Keep reflecting consistently.";

  if (averageMood >= 4.5) {
    insight =
      "You are building strong emotional momentum.";
  } else if (averageMood >= 3.5) {
    insight =
      "Your progress is steady. Consistency will compound.";
  } else if (averageMood >= 2.5) {
    insight =
      "Atlas detects fluctuating momentum. Focus on small daily wins.";
  } else {
    insight =
      "Atlas detects persistent struggle. Reduce the size of your missions and rebuild confidence.";
  }

  return {
    dominantMood:
      Math.round(averageMood),

    averageMood,

    totalReflections:
      reflections.length,

    insight,
  };
}