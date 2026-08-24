import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  auth,
} from "@clerk/nextjs/server";

import {
  calculateAscension,
} from "@/lib/atlas/ascension";

import {
  completeMissionLifecycle,
  getActiveMission,
  getMissionOperation,
  type CompletionResult,
} from "@/lib/atlas/missionService";

import {
  getDailyMission,
} from "@/lib/engine/mission";

import {
  getProfile,
} from "@/lib/supabase/profiles";
import { consumeAtlasRateLimit } from "@/lib/atlas/rateLimit";

const MISSION_XP_REWARD = 15;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function jsonResult(
  result: CompletionResult
) {
  const ascension =
    calculateAscension(
      Number(
        result.progress
          .ascension_score ?? 0
      )
    );

  return NextResponse.json({
    success: true,

    operationId:
      result.operationId,

    replayed:
      result.replayed,

    completedMission:
      result.completedMission,

    nextMission:
      result.activeMission,

    xpAwarded:
      result.xpAwarded,

    progress:
      result.progress,

    momentum:
      result.momentum,

    streak:
      result.streak,

    ascension,
  });
}

export async function POST(
  request: NextRequest
) {
  try {
    const { userId } =
      await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      (await request.json()) as {
        missionId?: unknown;
        operationId?: unknown;
      };

    if (
      typeof body.missionId !==
        "string" ||
      !uuidPattern.test(
        body.missionId
      )
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

    if (
      typeof body.operationId !==
        "string" ||
      !uuidPattern.test(
        body.operationId
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A valid operation ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const missionId =
      body.missionId;

    const operationId =
      body.operationId;

    /*
     * A retry after a committed response timeout
     * returns the stored result without invoking AI
     * or awarding XP again.
     */
    const existingResult =
      await getMissionOperation<CompletionResult>(
        userId,
        operationId,
        "complete"
      );

    if (existingResult) {
      return jsonResult(
        existingResult
      );
    }

    const activeMission = await getActiveMission(userId);

    if (!activeMission || activeMission.id !== missionId) {
      return NextResponse.json(
        {
          error: "This mission is no longer the active mission.",
          retryable: false,
        },
        { status: 409 },
      );
    }

    const userAllowed = await consumeAtlasRateLimit({
      userId,
      bucket: "mission-completion",
      windowSeconds: 600,
      maxRequests: 6,
    });
    const serviceAllowed = userAllowed
      ? await consumeAtlasRateLimit({
          userId: "__ascend_global__",
          bucket: "groq-requests",
          windowSeconds: 60,
          maxRequests: 120,
        })
      : false;

    if (!userAllowed || !serviceAllowed) {
      return NextResponse.json(
        {
          error:
            "ASCEND has received several mission-completion requests. Wait a moment before trying again.",
          retryable: true,
          operationId,
        },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }

    let journey:
      | string
      | null = null;

    try {
      const profile =
        await getProfile(
          userId
        );

      journey =
        profile?.journey ??
        null;
    } catch (
      profileError
    ) {
      console.error(
        "Mission Profile Read Error:",
        profileError
      );
    }

    /*
     * AI generation happens before any lifecycle
     * write. A generation failure leaves the active
     * mission untouched.
     */
    const proposedMission =
      await getDailyMission(
        journey ??
          "Purpose Discovery",
        userId,
        {
          projectCompletion:
            true,

          xpReward:
            MISSION_XP_REWARD,
        }
      );

    try {
      const result =
        await completeMissionLifecycle({
          userId,
          missionId,
          operationId,

          nextMission:
            proposedMission.title,

          nextReason:
            proposedMission.description,

          xpReward:
            MISSION_XP_REWARD,
        });

      return jsonResult(
        result
      );
    } catch (
      transactionError
    ) {
      console.error(
        "Mission Completion Response Error:",
        transactionError
      );

      /*
       * Supabase may commit before the HTTP response
       * is lost. The operation record is the
       * authoritative recovery proof.
       */
      try {
        const recoveredResult =
          await getMissionOperation<CompletionResult>(
            userId,
            operationId,
            "complete"
          );

        if (recoveredResult) {
          return jsonResult(
            recoveredResult
          );
        }
      } catch (
        recoveryError
      ) {
        console.error(
          "Mission Completion Recovery Error:",
          recoveryError
        );
      }

      return NextResponse.json(
        {
          error:
            "ASCEND temporarily lost contact with the mission service. Retry this same completion safely.",

          retryable: true,

          operationId,
        },
        {
          status: 503,
        }
      );
    }
  } catch (error) {
    console.error(
      "Mission Completion Route Error:",
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
