export function buildRecommendations(
  progress: number
) {
  if (progress < 25) {
    return [
      "Focus on building consistency before increasing intensity.",
    ];
  }

  if (progress < 50) {
    return [
      "Finish your current mission before pursuing new opportunities.",
    ];
  }

  if (progress < 75) {
    return [
      "Begin taking on larger challenges aligned with your North Star.",
    ];
  }

  return [
    "You're ready to mentor others while continuing your own ascent.",
  ];
}