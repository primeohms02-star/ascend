import { AtlasBrainState } from "./brainState";

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
    brain.momentum?.current_streak ?? 0;

  const completed =
    brain.momentum?.completed_missions ?? 0;

  const skipped =
    brain.momentum?.skipped_missions ?? 0;

  if (streak >= 7)
    strengths.push("Consistent");

  if (completed >= 20)
    strengths.push("Finisher");

  if (brain.progress >= 60)
    strengths.push("Focused");

  if (skipped >= 5)
    weaknesses.push("Avoids difficult missions");

  if (streak < 3)
    weaknesses.push("Needs consistency");

  if (completed > skipped)
    habits.push("Completes before skipping");

  if (skipped > completed)
    habits.push("Often abandons missions");

  return {
    strengths,
    weaknesses,
    habits,
  };
}