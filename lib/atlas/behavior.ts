import {
  AtlasBrainState,
} from "./brainState";

export type BehaviorAnalysis = {
  strengths: string[];
  weaknesses: string[];
  habits: string[];
};

export function analyzeBehavior(
  brain: AtlasBrainState
): BehaviorAnalysis {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const habits: string[] = [];

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
   * Require enough evidence before describing
   * behavioural patterns.
   */
  if (streak >= 3) {
    strengths.push(
      "Building consistent action"
    );
  }

  if (completed >= 5) {
    strengths.push(
      "Produces evidence of completion"
    );
  }

  if (
    totalDecisions >= 4
  ) {
    const completionRate =
      completed /
      totalDecisions;

    if (
      completionRate >= 0.75
    ) {
      habits.push(
        "Usually follows missions through"
      );
    }

    if (
      completionRate < 0.5
    ) {
      weaknesses.push(
        "Mission follow-through may need support"
      );
    }
  }

  if (
    brain.reflections.length >=
      3
  ) {
    habits.push(
      "Uses reflection as part of growth"
    );
  }

  return {
    strengths,
    weaknesses,
    habits,
  };
}