import { calculateReadiness } from "../skills/readiness";
import { generateRecommendations } from "../skills/recommendations";
import { buildRoadmap } from "./roadmap";
import { getCurrentMilestone } from "./milestones";

export function buildCareerPlan(
  northStar: string,
  userSkills: string[]
) {
  const readiness = calculateReadiness(
    northStar,
    userSkills
  );

  const recommendations =
    generateRecommendations(readiness);

  const roadmap =
    buildRoadmap(
      readiness,
      recommendations
    );

  const milestone =
    getCurrentMilestone(readiness.score);

  return {
    readiness,
    recommendations,
    roadmap,
    milestone,
  };
}