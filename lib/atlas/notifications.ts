export type AtlasNotification = {
  id: string;
  title: string;
  message: string;
  priority: number;
};

export function buildNotification(atlas: any): AtlasNotification | null {
  const streak = atlas.momentum?.current_streak ?? 0;
  const progress = atlas.profile?.progress ?? 0;
  const mission = atlas.mission?.mission ?? "";

  // Mission overdue
  if (streak >= 5 && progress < 100) {
    return {
      id: "mission-check",
      title: "Mission Check-In",
      message: `You've been working on "${mission}" for a while. What's blocking your progress?`,
      priority: 100,
    };
  }

  // Level milestone
  if (
    atlas.atlasProgress?.ascension_score > 0 &&
    atlas.atlasProgress.ascension_score % 100 === 0
  ) {
    return {
      id: "level-up",
      title: "Level Up",
      message: "Excellent work. Your consistency is transforming your identity.",
      priority: 90,
    };
  }

  // New opportunity
  if (atlas.opportunities?.length > 0) {
    return {
      id: "opportunity",
      title: "New Opportunity",
      message: `I found something aligned with your journey: ${atlas.opportunities[0].title}`,
      priority: 80,
    };
  }

  return null;
}