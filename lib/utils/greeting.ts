export function getGreeting() {
  const now = new Date();

  // Nigeria (UTC+1)
  const nigeriaHour = (now.getUTCHours() + 1) % 24;

  if (nigeriaHour < 12) {
    return "Good morning";
  }

  if (nigeriaHour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}