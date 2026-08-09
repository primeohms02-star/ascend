import {
  AtlasBrainState,
} from "./brainState";

export type AtlasDecision = {
  priority:
    | "growth"
    | "discipline"
    | "recovery";

  missionWeight: number;
  oracleWeight: number;
  opportunityWeight: number;

  explanation: string;
};

export function decideNextAction(
  brain: AtlasBrainState
): AtlasDecision {
  const streak =
    Number(
      brain.momentum
        ?.current_streak ?? 0
    );

  const completed =
    Number(
      brain.momentum
        ?.completed_missions ?? 0
    );

  const skipped =
    Number(
      brain.momentum
        ?.skipped_missions ?? 0
    );

  const totalDecisions =
    completed + skipped;

  /*
   * Recovery requires evidence of disrupted
   * follow-through. New users are not labelled
   * undisciplined.
   */
  if (
    totalDecisions >= 4 &&
    skipped > completed
  ) {
    return {
      priority:
        "recovery",

      missionWeight: 70,
      oracleWeight: 90,
      opportunityWeight: 30,

      explanation:
        "Use a smaller, evidence-producing mission to rebuild reliable momentum.",
    };
  }

  /*
   * Established users returning after a break
   * receive a manageable consistency mission.
   */
  if (
    completed >= 3 &&
    streak === 0
  ) {
    return {
      priority:
        "discipline",

      missionWeight: 90,
      oracleWeight: 60,
      opportunityWeight: 30,

      explanation:
        "Re-establish a realistic action rhythm before increasing complexity.",
    };
  }

  if (
    streak >= 5 ||
    brain.progress >= 70
  ) {
    return {
      priority:
        "growth",

      missionWeight: 70,
      oracleWeight: 80,
      opportunityWeight: 90,

      explanation:
        "Current evidence supports a higher-impact strategic action.",
    };
  }

  return {
    priority:
      "growth",

    missionWeight: 80,
    oracleWeight: 60,
    opportunityWeight: 50,

    explanation:
      "Continue steady, relevant progression toward the North Star.",
  };
}