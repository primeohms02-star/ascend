export function buildCompass(
  northStar: string,
  progress: number
) {
  return {
    northStar,
    alignment: Math.max(
      0,
      Math.min(progress, 100)
    ),
  };
}