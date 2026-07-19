export type AscensionState = {
  score: number;
  level: number;
  title: string;
};

export function calculateAscension(
  score: number
): AscensionState {

  const level =
    Math.floor(score / 100) + 1;

  let title = "Explorer";

  if (level >= 5)
    title = "Pathfinder";

  if (level >= 10)
    title = "Builder";

  if (level >= 15)
    title = "Visionary";

  if (level >= 20)
    title = "Architect";

  if (level >= 30)
    title = "Ascendant";

  return {
    score,
    level,
    title,
  };
}