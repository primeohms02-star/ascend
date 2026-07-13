import { BrainContext } from "@/lib/brain/context";

export type AtlasContext = {
  identity: string;
  identityLevel: number;

  ascensionScore: number;

  streak: number;

  progress: number;

  momentum: string;
  momentumMessage: string;

  northStar: string;

  currentMission: string;

  completedMissions: number;
};

export function buildAtlasContext(
  brain: BrainContext & {
    atlasProgress?: {
      ascension_score: number;
    };
    identity?: {
      identity_title: string;
      confidence: number;
    };
    streak?: {
      current_streak: number;
    };
    missions?: {
      completed: boolean;
      title: string;
    }[];
  }
): AtlasContext {
  return {
    identity:
      brain.identity?.identity_title ??
      "Explorer",

    identityLevel:
      Math.floor(
        (brain.atlasProgress?.ascension_score ??
          0) / 100
      ) + 1,

    ascensionScore:
      brain.atlasProgress?.ascension_score ??
      0,

    streak:
      brain.streak?.current_streak ?? 0,

    progress:
      brain.progress,

    momentum:
      brain.momentum,
      momentumMessage: brain.momentumMessage,

    northStar:
      brain.northStar,

    currentMission:
      brain.missions?.[0]?.title ??
      "No Mission",

    completedMissions:
      brain.missions?.filter(
        (m) => m.completed
      ).length ?? 0,
  };
}