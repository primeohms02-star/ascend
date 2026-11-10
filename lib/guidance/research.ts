import { searchPublicTopic } from "./tavily";
import "server-only";
import { consumeAtlasRateLimit } from "@/lib/atlas/rateLimit";
import { publicTopic, type Source, type Research } from "./sources";
export type { Research } from "./sources";
export async function researchForReply(
  userId: string,
  message: string,
  explicit: string,
): Promise<Research> {
  const checked = new Date().toISOString();
  const result = (
    status: Research["status"],
    sources: Source[] = [],
  ): Research => ({ status, sources, checked });
  const requested =
    !!explicit ||
    /\b(search the (web|internet)|look up|research online|latest|currently open|find current)\b/i.test(
      message,
    );
  if (!requested) return result("not_requested");
  const query = explicit || publicTopic(message);
  if (!query) return result("needs_topic");
  const key = process.env.TAVILY_API_KEY;
  if (!key) return result("unavailable");
  try {
    if (
      !(await consumeAtlasRateLimit({
        userId,
        bucket: "atlas-web-search",
        windowSeconds: 86400,
        maxRequests: 6,
      })) ||
      !(await consumeAtlasRateLimit({
        userId: "__ascend_global__",
        bucket: "atlas-web-search",
        windowSeconds: 86400,
        maxRequests: 100,
      }))
    )
      return result("limit");
    return await searchPublicTopic(query, key);
  } catch {
    return result("unavailable");
  }
}
