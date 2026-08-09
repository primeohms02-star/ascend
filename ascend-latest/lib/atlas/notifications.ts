export type AtlasNotification = {
  id: string;
  title: string;
  message: string;
  priority: number;
};

type AtlasNotificationContext = {
  mission?: {
    id?: string | null;
    mission?: string | null;
    created_at?: string | null;
  } | null;
  atlasProgress?: {
    ascension_score?: number | null;
  } | null;
  opportunities?: Array<{
    title?: string | null;
  }>;
};

const MISSION_CHECK_AGE_MS = 48 * 60 * 60 * 1000;

export function buildNotification(
  atlas: AtlasNotificationContext
): AtlasNotification | null {
  const missionTitle = atlas.mission?.mission?.trim() ?? "";
  const missionCreatedAt = atlas.mission?.created_at
    ? new Date(atlas.mission.created_at).getTime()
    : Number.NaN;
  const missionAge = Date.now() - missionCreatedAt;

  // A check-in requires age evidence; a strong streak does not imply delay.
  if (
    missionTitle &&
    Number.isFinite(missionCreatedAt) &&
    missionAge >= MISSION_CHECK_AGE_MS
  ) {
    return {
      id: `mission-check-${atlas.mission?.id ?? missionCreatedAt}`,
      title: "Mission Check-In",
      message: `Your mission “${missionTitle}” is still active. What is blocking completion?`,
      priority: 100,
    };
  }

  // Level milestone
  const ascensionScore = Number(
    atlas.atlasProgress?.ascension_score ?? 0
  );

  if (
    ascensionScore > 0 &&
    ascensionScore % 100 === 0
  ) {
    return {
      id: `level-up-${ascensionScore}`,
      title: "Level Up",
      message: "Excellent work. Your consistency is transforming your identity.",
      priority: 90,
    };
  }

  // New opportunity
  const opportunityTitle = atlas.opportunities?.[0]?.title?.trim();

  if (opportunityTitle) {
    return {
      id: `opportunity-${opportunityTitle.toLowerCase().replace(/\s+/g, "-")}`,
      title: "New Opportunity",
      message: `I found something aligned with your journey: ${opportunityTitle}`,
      priority: 80,
    };
  }

  return null;
}
