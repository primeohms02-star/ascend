import { calculateAscension } from "./ascension";
import { getGreeting } from "@/lib/utils/greeting";

import { buildPathIdentity } from "./pathIdentity";
import { resolveStreak } from "./streak";
import { buildTimeline } from "./timeline";
import { loadAtlasMemories } from "./memory";

import { getProfile } from "@/lib/supabase/profiles";
import { getProgress } from "@/lib/supabase/atlasProgress";
import { getStreak } from "@/lib/supabase/atlasStreaks";

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

export async function getProgressSnapshot(clerkId: string) {
  const [storedProfile, progressRecord, streakRecord, atlasMemories] = await Promise.all([
    getProfile(clerkId),
    getProgress(clerkId),
    getStreak(clerkId),
    loadAtlasMemories(clerkId),
  ]);

  const profile = storedProfile ?? fallbackProfile(clerkId);
  const ascension = calculateAscension(Number(progressRecord?.ascension_score ?? 0));
  const identity = buildPathIdentity(profile.journey, profile.north_star);
  const streak = resolveStreak(streakRecord);
  const timelineMemories = atlasMemories.filter(
    (
      memory
    ): memory is typeof memory & {
      created_at: string;
    } => typeof memory.created_at === "string"
  );
  const completeTimeline = buildTimeline(timelineMemories);

  return {
    ascension,
    identity: {
      ...identity,
      level: ascension.level,
    },
    progress: {
      progress: ascension.progressPercent,
      momentum: `${streak.longest} day best streak`,
      message: "Historical streak retained. Your latest updates appear on Home.",
      streak,
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
  const results = await Promise.allSettled([
      getProfile(clerkId),
      getProgress(clerkId),
      getStreak(clerkId),
    ]);

  const labels = ["profile", "progress", "streak"];
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`Dashboard ${labels[index]} read failed:`, result.reason);
    }
  });

  const storedProfile = results[0].status === "fulfilled" ? results[0].value : null;

  const progressRecord = results[1].status === "fulfilled" ? results[1].value : null;
  const streakRecord = results[2].status === "fulfilled" ? results[2].value : null;

  const profile = storedProfile ?? fallbackProfile(clerkId);

  const ascensionScore = Number(progressRecord?.ascension_score ?? 0);
  const ascension = calculateAscension(ascensionScore);

  const recommendedNext:Recommendation={id:"atlas-guidance",title:"Choose your next step",description:"Atlas helps you act on your direction.",priority:"high",category:"Direction",action:"Open guidance",href:"/dashboard"};
  const journey = profile.journey ?? "Purpose Discovery";
  const northStar = profile.north_star ?? "";
  const identity = buildPathIdentity(journey, northStar);
  const streak = resolveStreak(streakRecord);
  return {
    dailyBriefing:{greeting:getGreeting(),summary:northStar,focus:"Your next step",focusDetail:"Choose a useful action with Atlas.",oracle:"Use your latest update to decide what comes next."},
    compass: {
      northStar: northStar || "Discover your purpose",
      alignment: ascension.progressPercent,
    },

    progress: {
      progress: ascension.progressPercent,
      momentum: `${streak.longest} day best streak`,
      message: "Historical streak retained. Your latest updates appear on Home.",
      streak,
    },

    identity: {
      ...identity,
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
  };
}
