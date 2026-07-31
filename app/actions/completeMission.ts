"use server";

import {
  auth,
} from "@clerk/nextjs/server";

/*
 * Deprecated mission-completion action.
 *
 * Mission completion must go through:
 * POST /api/missions/complete
 *
 * That endpoint verifies mission ownership, requires
 * active status, prevents duplicate XP, and generates
 * the next mission through the approved lifecycle.
 */
export async function completeMissionAction(
  _missionId: string
) {
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  return {
    success: false,
    error:
      "This mission action is no longer supported. Refresh the Dashboard and use the current Complete Mission button.",
  };
}