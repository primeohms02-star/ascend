export type TimelineMemory = {
  id?: string;
  title: string | null;
  message: string;
  memory_type:
    | string
    | null;
  created_at: string;
};

export type TimelineItem = {
  id?: string;
  icon: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
};

export function buildTimeline(
  memories: TimelineMemory[]
): TimelineItem[] {
  return [...memories]
    .sort(
      (first, second) =>
        new Date(
          second.created_at
        ).getTime() -
        new Date(
          first.created_at
        ).getTime()
    )
    .map((memory) => {
      const type =
        memory.memory_type ??
        "memory";

      const icon =
        type === "mission"
          ? "🎯"
          : type === "reflection"
            ? "📝"
            : type === "north_star"
              ? "⭐"
              : type === "oracle"
                ? "🧠"
                : "📌";

      return {
        id: memory.id,
        icon,
        title:
          memory.title ??
          "Memory",
        message:
          memory.message,
        type,
        created_at:
          memory.created_at,
      };
    });
}