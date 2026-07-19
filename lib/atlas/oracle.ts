export function buildOracle(
  progress: number,
  streak: number,
  northStar: string
) {
  if (streak >= 30) {
    return {
      title: "Momentum is Compounding",
      message:
        "Your consistency is becoming part of your identity. Protect it.",
    };
  }

  if (progress >= 80) {
    return {
      title: "Final Stretch",
      message:
        "Your North Star is no longer distant. Finish with precision.",
    };
  }

  if (progress >= 50) {
    return {
      title: "You're Ascending",
      message:
        `Every decision is pulling you closer to "${northStar}".`,
    };
  }

  return {
    title: "Direction Before Speed",
    message:
      "Clarity creates momentum. Keep following the path Atlas has laid before you.",
  };
}