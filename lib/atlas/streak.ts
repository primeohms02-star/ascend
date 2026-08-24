export type StreakStatus =
  | "not-started"
  | "active-today"
  | "continue-today"
  | "expired";

export type StreakState = {
  current: number;
  longest: number;
  lastMissionDate: string | null;
  status: StreakStatus;
  label: string;
  message: string;
  rule: string;
};

type StoredStreak = {
  current_streak?: number | null;
  longest_streak?: number | null;
  last_mission_date?: string | null;
} | null;

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

function safeCount(value: number | null | undefined): number {
  return Math.max(0, Math.round(Number(value) || 0));
}

function dateKey(value: string | null | undefined): string | null {
  const match = value?.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? null;
}

function utcDayNumber(value: string): number | null {
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(timestamp)
    ? Math.floor(timestamp / DAY_IN_MILLISECONDS)
    : null;
}

function streakLabel(current: number): string {
  return `${current} Day Streak`;
}

export function resolveStreak(
  stored: StoredStreak,
  now = new Date()
): StreakState {
  const storedCurrent = safeCount(stored?.current_streak);
  const longest = Math.max(
    storedCurrent,
    safeCount(stored?.longest_streak)
  );
  const lastMissionDate = dateKey(stored?.last_mission_date);
  const today = now.toISOString().slice(0, 10);
  const todayNumber = utcDayNumber(today);
  const lastMissionDayNumber = lastMissionDate
    ? utcDayNumber(lastMissionDate)
    : null;
  const dayDifference =
    todayNumber !== null && lastMissionDayNumber !== null
      ? todayNumber - lastMissionDayNumber
      : null;
  const rule =
    "Complete one mission on consecutive calendar days to extend your streak. Only the first completion each day counts.";

  if (!lastMissionDate || storedCurrent === 0 || dayDifference === null) {
    return {
      current: 0,
      longest,
      lastMissionDate,
      status: "not-started",
      label: streakLabel(0),
      message: "Complete a mission to start your streak.",
      rule,
    };
  }

  if (dayDifference === 0) {
    return {
      current: storedCurrent,
      longest,
      lastMissionDate,
      status: "active-today",
      label: streakLabel(storedCurrent),
      message: "Today's mission is recorded. Return tomorrow to extend your streak.",
      rule,
    };
  }

  if (dayDifference === 1) {
    return {
      current: storedCurrent,
      longest,
      lastMissionDate,
      status: "continue-today",
      label: streakLabel(storedCurrent),
      message: "Complete a mission today to extend your streak.",
      rule,
    };
  }

  return {
    current: 0,
    longest,
    lastMissionDate,
    status: "expired",
    label: streakLabel(0),
    message: "Complete a mission today to begin a new streak.",
    rule,
  };
}
