import { getJourneyProfile } from "@/lib/engine/journey";
import { getDailyMission } from "@/lib/engine/mission";
import { getRoadmap } from "@/lib/engine/roadmap";
import { getMomentum } from "./momentum";
import { getOpportunities } from "@/lib/engine/opportunities";
import { getRecommendations } from "@/lib/engine/recommendations";
import { createMemory } from "./memory";
import { createIdentity } from "./identity";

export type BrainContext = {
  journey: string;
  northStar: string;

  missionTitle: string;
  missionDescription: string;

  roadmapSteps: number;
  completedSteps: number;
  progress: number;

  momentum: string;
  momentumMessage: string;

  memory: ReturnType<typeof createMemory>;

  identity: ReturnType<typeof createIdentity>;

  opportunities: ReturnType<typeof getOpportunities>;

  recommendations: ReturnType<typeof getRecommendations>;
};

export function buildBrainContext(
  firstAnswer: string
): BrainContext {
  const journey = getJourneyProfile(firstAnswer);

  const mission = getDailyMission(journey.title);

  const roadmap = getRoadmap(journey.title);

  const opportunities = getOpportunities(
    journey.title
  );

  const recommendations = getRecommendations(
    journey.title
  );

  const memory = createMemory();

  const identity = createIdentity();

  const completedSteps = roadmap.filter(
    (step) => step.completed
  ).length;

  const progress = Math.round(
    (completedSteps / roadmap.length) * 100
  );

  const momentum = getMomentum(
    completedSteps,
    roadmap.length
  );

  return {
    journey: journey.title,

    northStar: journey.northStar,

    missionTitle: mission.title,
    missionDescription: mission.description,

    roadmapSteps: roadmap.length,
    completedSteps,

    progress,

    momentum: momentum.status,
    momentumMessage: momentum.message,

    memory,

    identity,

    opportunities,

    recommendations,
  };
}