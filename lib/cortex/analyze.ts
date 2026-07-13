import { AtlasContext } from "./context";

export type AtlasAnalysis = {
  needsMomentumBoost: boolean;
  closeToLevelUp: boolean;
  hasStrongMomentum: boolean;
  needsIdentityWork: boolean;
};

export function analyzeContext(
  context: AtlasContext
): AtlasAnalysis {
  return {
    needsMomentumBoost:
      context.streak <= 1,

    closeToLevelUp:
      context.ascensionScore % 100 >= 80,

    hasStrongMomentum:
      context.streak >= 7,

    needsIdentityWork:
      context.identity === "Explorer",
  };
}