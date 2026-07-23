import { AtlasMemory } from "./memory";
import { Recommendation } from "../skills/recommendations";

export function adaptRecommendations(
  recommendations: Recommendation[],
  memory: AtlasMemory
): Recommendation[] {

  return recommendations.filter(
    recommendation =>
      !memory.completedSkills.includes(
        recommendation.title.replace("Learn ", "")
      )
  );

}