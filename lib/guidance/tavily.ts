import { readResults, type Research } from "./sources";
// The caller supplies a public topic only. No user ID, stored profile, transcript or notes.
export async function searchPublicTopic(
  query: string,
  key: string,
  fetcher: typeof fetch = fetch,
): Promise<Research> {
  const checked = new Date().toISOString();
  try {
    const res = await fetcher("https://api.tavily.com/search", {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        query,
        search_depth: "basic",
        max_results: 5,
        include_answer: false,
        include_raw_content: false,
        include_published_date: true,
        safe_search: true,
      }),
    });
    if (!res.ok) throw Error("Search unavailable");
    const data = await res.json();
    if (!Array.isArray(data?.results)) throw Error("Invalid search response");
    const sources = readResults(data);
    return {
      status: sources.length ? "ready" : "no_results",
      sources,
      checked,
    };
  } catch {
    return { status: "unavailable", sources: [], checked };
  }
}
