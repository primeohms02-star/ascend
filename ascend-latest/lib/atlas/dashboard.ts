import { calculateAscension } from "./ascension";
import { buildDailyBriefing } from "./dailyBriefing";
import { buildTimeline } from "./timeline";
import { loadAtlasMemories } from "./memory";
import { getActiveMission } from "./missionService";

import { getProfile } from "@/lib/supabase/profiles";
import { getProgress } from "@/lib/supabase/atlasProgress";
import { getMomentum } from "@/lib/supabase/atlasMomentum";

import type { Recommendation } from "@/lib/engine/recommendations";

function fallbackProfile(clerkId: string) {
  return {
    clerk_id: clerkId,
    full_name: "",
    email: "",
    journey: "Purpose Discovery",
    north_star: "",
    progress: 0,
    completed_steps: 0,
    current_streak: 0,
    longest_streak: 0,
    last_mission_date: null,
  } as const;
}

export async function getDirectionSnapshot(clerkId: string) {
  const [storedProfile, progressRecord] = await Promise.all([
    getProfile(clerkId),
    getProgress(clerkId),
  ]);

  const profile = storedProfile ?? fallbackProfile(clerkId);
  const ascension = calculateAscension(Number(progressRecord?.ascension_score ?? 0));

  return {
    northStar: profile.north_star || "Discover your purpose",
    alignment: ascension.progressPercent,
  };
}

export async function getActionSnapshot(clerkId: string) {
  const [storedProfile, currentMission] = await Promise.all([
    getProfile(clerkId),
    getActiveMission(clerkId),
  ]);

  const profile = storedProfile ?? fallbackProfile(clerkId);

  return {
    northStar: profile.north_star || "Discover your purpose",
    mission: {
      title: currentMission?.mission ?? "No Active Mission",
      description:
        currentMission?.reason ??
        "Start or update your journey so Atlas can prepare a mission aligned with your current direction.",
      missionId: currentMission?.id ?? "",
      available: Boolean(currentMission),
    },
  };
}

export async function getProgressSnapshot(clerkId: string) {
  const [progressRecord, momentum, atlasMemories] = await Promise.all([
    getProgress(clerkId),
    getMomentum(clerkId),
    loadAtlasMemories(clerkId),
  ]);

  const ascension = calculateAscension(Number(progressRecord?.ascension_score ?? 0));
  const timelineMemories = atlasMemories.filter(
    (
      memory
    ): memory is typeof memory & {
      created_at: string;
    } => typeof memory.created_at === "string"
  );
  const completeTimeline = buildTimeline(timelineMemories);
  const currentStreak = Number(momentum?.current_streak ?? 0);

  return {
    ascension,
    identity: {
      title: ascension.title,
      level: ascension.level,
    },
    progress: {
      progress: ascension.progressPercent,
      momentum: `${currentStreak} Day Streak`,
      message: "Keep moving toward your North Star.",
    },
    timeline: completeTimeline.slice(0, 3),
    timelineTotal: completeTimeline.length,
  };
}

export async function getAtlasDashboard(clerkId: string) {
  /*
   * The dashboard only needs the user's current profile, active mission,
   * progression, momentum and recent milestones. Loading the complete Atlas
   * conversation/knowledge/strategy context here made every dashboard visit
   * perform many database reads that the page never renders.
   */
  const [storedProfile, currentMission, progressRecord, momentum] =
    await Promise.all([
      getProfile(clerkId),
      getActiveMission(clerkId),
      getProgress(clerkId),
      getMomentum(clerkId),
    ]);

  const profile = storedProfile ?? fallbackProfile(clerkId);

  const ascensionScore = Number(progressRecord?.ascension_score ?? 0);
  const ascension = calculateAscension(ascensionScore);

  let recommendedNext: Recommendation;

  if (currentMission) {
    recommendedNext = {
      id: `mission-${currentMission.id}`,
      title: "Continue Your Current Mission",
      description: currentMission.mission,
      priority: "high",
      category: "Current Mission",
      action: "Go to Mission",
      href: "#mission",
    };
  } else if (!profile.north_star) {
    recommendedNext = {
      id: "start-journey",
      title: "Define Your North Star",
      description:
        "Complete ASCEND onboarding so Atlas can understand your identity, immediate goal, challenges and long-term direction.",
      priority: "high",
      category: "Direction",
      action: "Start Your Journey",
      href: "/onboarding",
    };
  } else {
    recommendedNext = {
      id: "recalibrate-direction",
      title: "Prepare Your Next Mission",
      description:
        "Start the journey process again to confirm or update your direction and allow Atlas to prepare a newly aligned mission.",
      priority: "high",
      category: "Direction",
      action: "Update Your Journey",
      href: "/onboarding",
    };
  }

  const journey = profile.journey ?? "Purpose Discovery";
  const northStar = profile.north_star ?? "";
  const dailyBriefing = buildDailyBriefing({
    journey,
    northStar,
    missionTitle: currentMission?.mission ?? "No active mission",
    missionReason: currentMission?.reason ?? "",
    progress: ascension.score,
  });

  const currentStreak = Number(momentum?.current_streak ?? 0);

  return {
    dailyBriefing: {
      ...dailyBriefing,
      focus: currentMission?.mission ?? recommendedNext.title,
    },

    compass: {
      northStar: northStar || "Discover your purpose",
      alignment: ascension.progressPercent,
    },

    mission: {
      title: currentMission?.mission ?? "No Active Mission",
      description:
        currentMission?.reason ??
        "Start or update your journey so Atlas can prepare a mission aligned with your current direction.",
      missionId: currentMission?.id ?? "",
      available: Boolean(currentMission),
    },

    progress: {
      progress: ascension.progressPercent,
      momentum: `${currentStreak} Day Streak`,
      message: "Keep moving toward your North Star.",
    },

    identity: {
      title: ascension.title,
      level: ascension.level,
    },

    ascension,

    atlasProgress: {
      ascension_score: ascension.score,
      level: ascension.level,
      title: ascension.title,
      currentLevelStart: ascension.currentLevelStart,
      nextLevelTarget: ascension.nextLevelTarget,
      progressPercent: ascension.progressPercent,
      xpIntoLevel: ascension.xpIntoLevel,
      xpRequiredForLevel: ascension.xpRequiredForLevel,
    },

    profile,
    recommendations: [recommendedNext],
    completedMissionCount: Number(momentum?.completed_missions ?? 0),
  };
}
