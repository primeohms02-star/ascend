export function generateMission(completedSteps: number) {
  const missions = [
    {
      title: "Discover Your North Star",
      description:
        "Spend 20 minutes thinking deeply about the person you want to become.",
    },
    {
      title: "Build Momentum",
      description:
        "Take one action today that moves you closer to your North Star.",
    },
    {
      title: "Win the Morning",
      description:
        "Wake up one hour earlier and plan your day before touching your phone.",
    },
    {
      title: "Learn Something New",
      description:
        "Study for at least 30 minutes in the field you want to master.",
    },
    {
      title: "Create Instead of Consume",
      description:
        "Build, write, design or create something instead of scrolling social media.",
    },
    {
      title: "Reflect",
      description:
        "Journal about today's progress and identify one lesson you learned.",
    },
  ];

  return missions[Math.min(completedSteps, missions.length - 1)];
}