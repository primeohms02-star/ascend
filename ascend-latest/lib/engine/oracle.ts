import { AtlasBrainState } from "@/lib/atlas/brainState";
import { decideNextAction } from "@/lib/atlas/decisionEngine";

export type OracleMessage = {
  title: string;
  message: string;
};

export function consultOracle(
  brain: AtlasBrainState
): OracleMessage {

  const decision =
    decideNextAction(brain);

  const streak =
    brain.momentum?.current_streak ?? 0;

  const progress =
    brain.progress;

  if (decision.priority === "discipline") {

    return {

      title: "Restore Momentum",

      message:
        `You've built a ${streak}-day streak. Protect it. Small consistent actions today are more valuable than ambitious plans tomorrow.`,

    };

  }

  if (decision.priority === "growth") {

    return {

      title: "Your Next Breakthrough",

      message:
        `You're ${progress}% aligned with your North Star. The fastest way forward is to attack your current weakness instead of repeating what already feels comfortable.`,

    };

  }

  return {

    title: "Recover Your Energy",

    message:
      "Growth is impossible without recovery. Slow down today so you can move faster tomorrow.",

  };

}