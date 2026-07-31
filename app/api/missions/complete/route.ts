import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  auth,
} from "@clerk/nextjs/server";

import {
  getProfile,
} from "@/lib/supabase/profiles";

import {
  saveMission,
} from "@/lib/supabase/atlasMission";

import {
  getDailyMission,
} from "@/lib/engine/mission";

import {
  calculateAscension,
} from "@/lib/atlas/ascension";

import {
  completeMissionTransaction,
} from "@/lib/atlas/completeMissionTransaction";

import {
  recordMemory,
} from "@/lib/atlas/recordMemory";

import {
  updatePreference,
} from "@/lib/atlas/opportunities/preferences";

const MISSION_XP_REWARD = 15;

export async function POST(
  request: NextRequest
) {
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

    const body =
      await request.json();

    const missionId =
      body.missionId;

    if (
      typeof missionId !==
        "string" ||
      missionId.trim().length ===
        0
    ) {
      return NextResponse.json(
        {
          error:
            "A valid mission ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Mission completion, XP, daily streak and
     * momentum now succeed or fail together inside
     * one database transaction.
     */
    const transaction =
      await completeMissionTransaction(
        userId,
        missionId.trim(),
        MISSION_XP_REWARD
      );

    if (!transaction) {
      return NextResponse.json(
        {
          error:
            "This mission has already been completed or is no longer active.",
        },
        {
          status: 409,
        }
      );
    }

    const {
      completedMission,
      progress,
      momentum,
    } = transaction;

    const ascension =
      calculateAscension(
        Number(
          progress
            .ascension_score ?? 0
        )
      );

    const profile =
      await getProfile(userId);

    /*
     * Preference learning is useful but is not part
     * of the critical completion transaction.
     */
    if (profile?.journey) {
      try {
        await updatePreference(
          userId,
          profile.journey,
          3
        );
      } catch (
        preferenceError
      ) {
        console.error(
          "Mission Preference Update Error:",
          preferenceError
        );
      }
    }

    /*
     * Timeline memory is non-critical. Failure here
     * must not reverse genuine completion progress.
     */
    try {
      await recordMemory(
        userId,
        "mission",
        "Mission Completed",
        `Completed: ${completedMission.mission}`,
        {
          mission_id:
            completedMission.id,

          mission:
            completedMission.mission,

          xp_awarded:
            MISSION_XP_REWARD,

          current_streak:
            momentum
              .current_streak ?? 0,

          longest_streak:
            momentum
              .longest_streak ?? 0,

          completed_missions:
            momentum
              .completed_missions ?? 0,

          ascension_score:
            ascension.score,

          ascension_level:
            ascension.level,

          completed_at:
            completedMission
              .completed_at ??
            new Date().toISOString(),
        }
      );
    } catch (
      memoryError
    ) {
      console.error(
        "Mission Memory Error:",
        memoryError
      );
    }

    /*
     * The next mission is generated only after the
     * atomic completion transaction succeeds.
     */
    let nextMission = null;

    if (profile) {
      try {
        const generatedMission =
          await getDailyMission(
            profile.journey ??
              "Purpose Discovery",
            userId
          );

        nextMission =
          await saveMission(
            userId,
            generatedMission.title,
            generatedMission.description
          );
      } catch (
        missionError
      ) {
        console.error(
          "Next Mission Generation Error:",
          missionError
        );
      }
    }

    return NextResponse.json({
      success: true,

      completedMission,

      xpAwarded:
        MISSION_XP_REWARD,

      ascension,

      momentum,

      nextMission,
    });
  } catch (error) {
    console.error(
      "Complete Mission API Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Atlas could not complete this mission.",
      },
      {
        status: 500,
      }
    );
  }
}