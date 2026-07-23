import { ReadinessResult } from "./readiness";

export type Recommendation = {
  title: string;
  reason: string;
};

export function generateRecommendations(
  readiness: ReadinessResult
): Recommendation[] {

  return readiness.missing.slice(0, 5).map((skill) => ({
    title: `Learn ${skill}`,
    reason: `${skill} is one of the key skills preventing you from reaching your North Star.`,
  }));

}