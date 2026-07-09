export type Momentum = {
  status: string;
  message: string;
};

export function getMomentum(
  completedSteps: number,
  totalSteps: number
): Momentum {
  const percent = Math.round(
    (completedSteps / totalSteps) * 100
  );

  if (percent >= 75) {
    return {
      status: "🚀 High",
      message:
        "You're making excellent progress. Keep the momentum alive.",
    };
  }

  if (percent >= 40) {
    return {
      status: "⚡ Building",
      message:
        "You're gaining momentum. Stay consistent.",
    };
  }

  if (percent >= 10) {
    return {
      status: "🌱 Growing",
      message:
        "Every small step matters. Keep moving forward.",
    };
  }

  return {
    status: "🧭 Beginning",
    message:
      "Every great journey starts with the first step.",
  };
}