import { BrainContext } from "@/lib/brain/context";

export type OracleMessage = {
  title: string;
  message: string;
};

export function consultOracle(
  brain: BrainContext
): OracleMessage {

  // Low progress

  if (brain.progress < 25) {
    return {
      title: "The journey has begun.",
      message:
        `Every expert was once a beginner. Stay focused on your North Star: "${brain.northStar}". Small steps today create extraordinary futures.`,
    };
  }

  // Building momentum

  if (brain.progress < 60) {
    return {
      title: "Momentum is growing.",
      message:
        `You're building consistency. Complete today's mission — "${brain.missionTitle}" — and your future self will thank you.`,
    };
  }

  // Strong progress

  if (brain.progress < 90) {
    return {
      title: "You're getting closer.",
      message:
        `You're no longer searching for direction. You're becoming the person capable of achieving "${brain.northStar}". Stay disciplined.`,
    };
  }

  // Near completion

  return {
    title: "Stay the course.",
    message:
      `You're remarkably close to this chapter of your journey. Protect your momentum. Finish strong, then prepare for an even greater North Star.`,
  };
}