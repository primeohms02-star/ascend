export type AtlasMemory = {
  memory_type: string;
  title: string | null;
  message: string;
  metadata: any;
  created_at: string;
};

export function rankMemories(
  memories: AtlasMemory[]
) {
  return memories
    .map((memory) => {

      let score = 0;

      // Recent memories matter more
      const days =
        Math.floor(
          (Date.now() -
            new Date(memory.created_at).getTime()) /
          (1000 * 60 * 60 * 24)
        );

      score += Math.max(0, 30 - days);

      // Reflection memories matter
      if (
        memory.memory_type ===
        "reflection"
      )
        score += 40;

      // Mission memories matter
      if (
        memory.memory_type ===
        "mission"
      )
        score += 25;

      // North Star memories matter most
      if (
        memory.memory_type ===
        "north_star"
      )
        score += 100;

      return {
        ...memory,
        relevance: score,
      };

    })
    .sort(
      (a, b) =>
        b.relevance -
        a.relevance
    );
}