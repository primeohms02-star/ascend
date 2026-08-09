export type Memory = {
  missionsCompleted: number;
  missionsMissed: number;
  currentStreak: number;
  longestStreak: number;

  strengths: string[];
  weaknesses: string[];

  lastMission: string | null;
};

export function createMemory(): Memory {
  return {
    missionsCompleted: 0,
    missionsMissed: 0,

    currentStreak: 0,
    longestStreak: 0,

    strengths: [],
    weaknesses: [],

    lastMission: null,
  };
}