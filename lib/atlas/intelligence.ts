import { analyzePatterns } from "./patterns";
import { buildAdaptiveState } from "./adaptive";
import { buildAdaptiveMission } from "./adaptiveMission";
import { buildAdaptiveOracle } from "./adaptiveOracle";
import { buildPrediction } from "./predictive";
import { buildWeeklyReview } from "./weeklyReview";
import { buildFutureSelf } from "./futureSelf";

export function buildAtlasEngine(
  reflections: any[],
  streak: number,
  progress: number
) {
  const patterns =
    analyzePatterns(reflections);

  const adaptive =
    buildAdaptiveState(patterns);

  const adaptiveMission =
    buildAdaptiveMission(adaptive);

  const adaptiveOracle =
    buildAdaptiveOracle(adaptive);

  const prediction =
    buildPrediction(
      patterns,
      streak
    );

  const weeklyReview =
    buildWeeklyReview(
      patterns,
      streak
    );

  const futureSelf =
    buildFutureSelf(
      patterns,
      streak,
      progress
    );

  return {
    patterns,

    adaptive,

    adaptiveMission,

    adaptiveOracle,

    prediction,

    weeklyReview,

    futureSelf,
  };
}