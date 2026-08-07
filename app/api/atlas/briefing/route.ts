import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getGreeting } from "@/lib/utils/greeting";
import { getProfile } from "@/lib/supabase/profiles";
import { getMomentum } from "@/lib/supabase/atlasMomentum";
import { getProgress } from "@/lib/supabase/atlasProgress";
import { getActiveMission } from "@/lib/atlas/missionService";
import {
  hasSeenNotification,
  saveNotification,
} from "@/lib/atlas/notificationMemory";
import { buildNotification } from "@/lib/atlas/notifications";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * The Atlas landing briefing needs only four live records. Avoid loading
     * the complete conversation, knowledge, strategy and Compass context just
     * to render this small card.
     */
    const [profile, mission, momentum, atlasProgress] = await Promise.all([
      getProfile(userId),
      getActiveMission(userId),
      getMomentum(userId),
      getProgress(userId),
    ]);

    const missionTitle = mission?.mission ?? "No active mission";
    const streak = Number(momentum?.current_streak ?? 0);
    const greeting = getGreeting();

    const summary = mission
      ? streak > 0
        ? `Your current mission is “${missionTitle}”. You have recorded ${streak} consecutive mission completions.`
        : `Your current mission is “${missionTitle}”.`
      : profile?.north_star
        ? "You currently have no active mission. Start your journey again to confirm your direction and allow Atlas to prepare a newly aligned mission."
        : "You currently have no active mission. Complete onboarding so Atlas can understand your direction and prepare your first mission.";

    const notification = buildNotification({
      profile,
      mission,
      momentum,
      atlasProgress,
      opportunities: [],
    });

    let oracle = mission
      ? "Continue executing your current mission. Atlas can help you research, plan and overcome obstacles while you remain responsible for completing it."
      : profile?.north_star
        ? "Your existing progress remains preserved. Updating your journey will replace only your current direction and prepare a new active mission."
        : "Start your ASCEND journey to define your North Star and receive your first strategic mission.";

    let isNew = false;

    if (notification) {
      const notificationId = notification.id;
      const seen = await hasSeenNotification(userId, notificationId);

      if (!seen) {
        await saveNotification(userId, notificationId);
        oracle = `${notification.title}: ${notification.message}`;
        isNew = true;
      }
    }

    return NextResponse.json({
      greeting,
      summary,
      mission,
      streak,
      oracle,
      isNew,
    });
  } catch (error) {
    console.error("Atlas Briefing Error:", error);

    return NextResponse.json(
      {
        error: "Atlas could not load your briefing.",
      },
      {
        status: 500,
      }
    );
  }
}
