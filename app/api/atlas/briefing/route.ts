import {
  NextResponse,
} from "next/server";

import {
  auth,
} from "@clerk/nextjs/server";

import {
  getGreeting,
} from "@/lib/utils/greeting";

import {
  loadAtlasContext,
} from "@/lib/atlas/brain";

import {
  hasSeenNotification,
  saveNotification,
} from "@/lib/atlas/notificationMemory";

import {
  buildNotification,
} from "@/lib/atlas/notifications";

export async function GET() {
  try {
    const { userId } =
      await auth();

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

    const atlas =
      await loadAtlasContext(
        userId
      );

    const mission =
      atlas.missions?.find(
        (storedMission: any) =>
          storedMission.status ===
          "active"
      ) ?? null;

    const missionTitle =
      mission?.mission ??
      "No active mission";

    const streak = Number(
      atlas.momentum
        ?.current_streak ?? 0
    );

    const greeting =
      getGreeting();

    const summary =
      mission
        ? streak > 0
          ? `Your current mission is “${missionTitle}”. You have recorded ${streak} consecutive mission completions.`
          : `Your current mission is “${missionTitle}”.`
        : "You currently have no active mission. Review your direction while Atlas prepares the next valid step.";

    const notification =
      buildNotification({
        ...atlas,
        mission,
      });

    let oracle =
      mission
        ? "Continue executing your current mission. Ordinary conversations will not replace it."
        : "Atlas will create a mission only after a valid mission lifecycle event.";

    let isNew = false;

    if (notification) {
      const notificationId =
        notification.id;

      const seen =
        await hasSeenNotification(
          userId,
          notificationId
        );

      if (!seen) {
        await saveNotification(
          userId,
          notificationId
        );

        oracle =
          `${notification.title}: ${notification.message}`;

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
    console.error(
      "Atlas Briefing Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Atlas could not load your briefing.",
      },
      {
        status: 500,
      }
    );
  }
}