import { BrainContext } from "./context";

export function getIdentityLevel(
  progress: number,
  currentTitle: string,
  currentLevel: number
) {
  let title = currentTitle;
  let level = currentLevel;

  if (progress >= 25) {
    title = "Builder";
    level = 2;
  }

  if (progress >= 50) {
    title = "Creator";
    level = 3;
  }

  if (progress >= 75) {
    title = "Leader";
    level = 4;
  }

  if (progress >= 100) {
    title = "Ascendant";
    level = 5;
  }

  return {
    title,
    level,
  };
}

export function calculateNorthStarAlignment(
  brain: BrainContext
) {
  return brain.progress;
}