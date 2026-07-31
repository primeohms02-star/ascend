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
  completeMissionById,
  saveMission,
} from "@/lib/supabase/atlasMission";

import {
  getDailyMission,
} from "@/lib/engine/mission";

import {
  completeMission as completeMomentumMission,
} from "@/lib/atlas/momentum";

import {
  addAscensionScore,
} from "@/lib/supabase/atlasProgress";

import {
  calculateAscension,
} from "@/lib/atlas/ascension";

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
     * Complete only the exact active mission clicked.
     * A completed mission cannot award XP twice.
     */
    const completedMission =
      await completeMissionById(
        userId,
        missionId.trim()
      );

    if (!completedMission) {
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

    /*
     * atlas_progress is the only canonical source
     * of Ascension XP and level.
     *
     * Momentum records completion counts and the
     * date-based streak, but no longer calculates
     * a separate Ascension score.
     */
    const [
      progress,
      momentum,
    ] = await Promise.all([
      addAscensionScore(
        userId,
        MISSION_XP_REWARD
      ),

      completeMomentumMission(
        userId
      ),
    ]);

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
     * Mission completion teaches the opportunity
     * system about the user's broad direction.
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
     * Store one structured milestone in Atlas
     * history. Conversation memory remains separate.
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
              ?.current_streak ?? 0,

          longest_streak:
            momentum
              ?.longest_streak ?? 0,

          completed_missions:
            momentum
              ?.completed_missions ?? 0,

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
     * A new mission is generated only after a valid
     * mission completion lifecycle event.
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
        /*
         * The Dashboard remains usable if next-mission
         * generation temporarily fails.
         */
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