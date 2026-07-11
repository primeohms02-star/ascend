export function calculateStreak(
  currentStreak: number,
  longestStreak: number
) {
  const streak = currentStreak + 1;

  return {
    currentStreak: streak,
    longestStreak: Math.max(
      streak,
      longestStreak
    ),
  };
}