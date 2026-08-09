export interface UserMemory {
  joinedAt: string;
  missionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastActive: string;
  biggestMilestone: string;
}

export function getUserMemory(): UserMemory {
  return {
    joinedAt: "2026-07-01",
    missionsCompleted: 0,
    currentStreak: 1,
    longestStreak: 1,
    lastActive: new Date().toISOString(),
    biggestMilestone: "Discovered your North Star",
  };
}