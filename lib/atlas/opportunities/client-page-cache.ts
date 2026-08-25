const CACHE_PREFIX = "ascend:opportunity-page:v1";
const CACHE_TTL_MS = 15 * 60 * 1000;
export const DEFAULT_OPPORTUNITY_PAGE_URL =
  "/api/opportunities?page=1&limit=10&filter=All";

const warmRequests = new Map<string, Promise<void>>();

type CacheEntry<T> = {
  storedAt: number;
  data: T;
};

function cacheKey(userId: string, requestUrl: string): string {
  return `${CACHE_PREFIX}:${userId}:${requestUrl}`;
}

export function readOpportunityPageCache<T>(
  userId: string,
  requestUrl: string,
): T | null {
  if (typeof window === "undefined" || !userId) {
    return null;
  }

  try {
    const stored = window.sessionStorage.getItem(cacheKey(userId, requestUrl));

    if (!stored) {
      return null;
    }

    const entry = JSON.parse(stored) as CacheEntry<T>;

    if (
      typeof entry.storedAt !== "number" ||
      Date.now() - entry.storedAt > CACHE_TTL_MS ||
      !entry.data
    ) {
      window.sessionStorage.removeItem(cacheKey(userId, requestUrl));
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

export function writeOpportunityPageCache<T>(
  userId: string,
  requestUrl: string,
  data: T,
): void {
  if (typeof window === "undefined" || !userId) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      cacheKey(userId, requestUrl),
      JSON.stringify({ storedAt: Date.now(), data } satisfies CacheEntry<T>),
    );
  } catch {
    // The live response still renders when storage is unavailable or full.
  }
}

export async function warmDefaultOpportunityPage(
  userId: string,
): Promise<void> {
  const requestUrl = DEFAULT_OPPORTUNITY_PAGE_URL;

  if (!userId || readOpportunityPageCache(userId, requestUrl)) {
    return;
  }

  const existingRequest = warmRequests.get(userId);

  if (existingRequest) {
    return existingRequest;
  }

  const request = (async () => {
    const response = await fetch(requestUrl, { cache: "no-store" });

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    if (data && Array.isArray(data.opportunities) && data.profile) {
      writeOpportunityPageCache(userId, requestUrl, data);
    }
  })().finally(() => {
    warmRequests.delete(userId);
  });

  warmRequests.set(userId, request);
  return request;
}
