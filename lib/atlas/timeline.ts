export type TimelineItem = {
  id?: string;
  title: string | null;
  message: string;
  type: string;
  created_at: string;
};

export function buildTimeline(
  memories: TimelineItem[]
) {
  return memories
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
    .map((memory) => ({

      icon:
        memory.type === "mission"
          ? "🎯"
          : memory.type === "reflection"
          ? "📝"
          : memory.type === "north_star"
          ? "⭐"
          : memory.type === "oracle"
          ? "🧠"
          : "📌",

      title:
        memory.title ??
        "Memory",

      message:
        memory.message,

      created_at:
        memory.created_at,

    }));
}