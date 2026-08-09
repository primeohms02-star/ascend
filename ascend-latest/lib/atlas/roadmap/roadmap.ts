import { ReadinessResult } from "../skills/readiness";
import { Recommendation } from "../skills/recommendations";

export type Roadmap = {
  today: string[];
  thisWeek: string[];
  thisMonth: string[];
  nextMilestone: string;
};

export function buildRoadmap(
  readiness: ReadinessResult,
  recommendations: Recommendation[]
): Roadmap {

  return {

    today: recommendations
      .slice(0, 1)
      .map(r => r.title),

    thisWeek: recommendations
      .slice(1, 3)
      .map(r => r.title),

    thisMonth: recommendations
      .slice(3, 5)
      .map(r => r.title),

    nextMilestone:
      readiness.score >= 80
        ? "Start applying for opportunities."
        : "Increase your Career Readiness before applying.",

  };

}