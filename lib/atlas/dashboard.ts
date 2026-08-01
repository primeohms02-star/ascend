import {
  loadAtlasContext,
} from "./brain";

import {
  calculateAscension,
} from "./ascension";

import type {
  Recommendation,
} from "@/lib/engine/recommendations";

export async function getAtlasDashboard(
  clerkId: string
) {
  const atlas =
    await loadAtlasContext(
      clerkId
    );

  /*
   * Only an active mission can be displayed as the
   * user's current mission.
   */
  const currentMission =
    atlas.missions?.find(
      (mission: any) =>
        mission.status ===
        "active"
    ) ?? null;

  /*
   * atlas_progress is the canonical source of
   * Ascension XP and level.
   */
  const ascensionScore =
    Number(
      atlas.atlasProgress
        ?.ascension_score ?? 0
    );

  const ascension =
    calculateAscension(
      ascensionScore
    );

  let recommendedNext:
    Recommendation;

  if (currentMission) {
    recommendedNext = {
      id:
        `mission-${currentMission.id}`,

      title:
        "Continue Your Current Mission",

      description:
        currentMission.mission,

      priority:
        "high",

      category:
        "Current Mission",

      action:
        "Go to Mission",

      href:
        "#mission",
    };
  } else if (
    !atlas.profile?.north_star
  ) {
    recommendedNext = {
      id:
        "start-journey",

      title:
        "Define Your North Star",

      description:
        "Complete ASCEND onboarding so Atlas can understand your identity, immediate goal, challenges and long-term direction.",

      priority:
        "high",

      category:
        "Direction",

      action:
        "Start Your Journey",

      href:
        "/onboarding",
    };
  } else {
    recommendedNext = {
      id:
        "recalibrate-direction",

      title:
        "Prepare Your Next Mission",

      description:
        "Start the journey process again to confirm or update your direction and allow Atlas to prepare a newly aligned mission.",

      priority:
        "high",

      category:
        "Direction",

      action:
        "Update Your Journey",

      href:
        "/onboarding",
    };
  }

  const completeTimeline =
    atlas.timeline ?? [];

  /*
   * Display only the three most recent milestones.
   */
  const timelinePreview =
    completeTimeline.slice(
      0,
      3
    );

  return {
    dailyBriefing: {
      ...atlas.dailyBriefing,

      focus:
        currentMission
          ?.mission ??
        recommendedNext.title,
    },

    compass: {
      northStar:
        atlas.profile
          ?.north_star ??
        "Discover your purpose",

      /*
       * This represents progress within the current
       * Ascension level, not a scientific measurement
       * of alignment with the user's North Star.
       */
      alignment:
        ascension.progressPercent,
    },

    mission: {
      title:
        currentMission
          ?.mission ??
        "No Active Mission",

      description:
        currentMission
          ?.reason ??
        "Start or update your journey so Atlas can prepare a mission aligned with your current direction.",

      missionId:
        currentMission?.id ??
        "",

      available:
        Boolean(
          currentMission
        ),
    },

    progress: {
      progress:
        ascension.progressPercent,

      momentum:
        `${
          atlas.momentum
            ?.current_streak ?? 0
        } Day Streak`,

      message:
        atlas.momentumMessage ??
        "Keep moving toward your North Star.",
    },

    identity: {
      title:
        ascension.title,

      level:
        ascension.level,
    },

    ascension,

    atlasProgress: {
      ascension_score:
        ascension.score,

      level:
        ascension.level,

      title:
        ascension.title,

      currentLevelStart:
        ascension.currentLevelStart,

      nextLevelTarget:
        ascension.nextLevelTarget,

      progressPercent:
        ascension.progressPercent,

      xpIntoLevel:
        ascension.xpIntoLevel,

      xpRequiredForLevel:
        ascension.xpRequiredForLevel,
    },

    profile:
      atlas.profile,

    strategy:
      atlas.strategy,

    knowledge:
      atlas.knowledge,

    reflection:
      atlas.reflection,

    journey:
      atlas.journey,

    compassAnswers:
      atlas.compassAnswers,

    compassResults:
      atlas.compassResults,

    opportunities:
      atlas.opportunities ??
      [],

    recommendations: [
      recommendedNext,
    ],

    timeline:
      timelinePreview,

    timelineTotal:
      completeTimeline.length,

    completedMissionCount:
      Number(
        atlas.momentum
          ?.completed_missions ?? 0
      ),
  };
}