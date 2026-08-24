import "server-only";

import { supabaseServer } from "@/lib/supabase-server";

type RateLimitInput = {
  userId: string;
  bucket: string;
  windowSeconds: number;
  maxRequests: number;
};

type LocalWindow = {
  count: number;
  expiresAt: number;
};

const localWindows = new Map<string, LocalWindow>();

function consumeLocalFallback(input: RateLimitInput): boolean {
  const now = Date.now();
  const key = `${input.userId}:${input.bucket}`;
  const existing = localWindows.get(key);

  if (!existing || existing.expiresAt <= now) {
    localWindows.set(key, {
      count: 1,
      expiresAt: now + input.windowSeconds * 1000,
    });
    return true;
  }

  if (existing.count >= input.maxRequests) {
    return false;
  }

  existing.count += 1;
  return true;
}

export async function consumeAtlasRateLimit(
  input: RateLimitInput,
): Promise<boolean> {
  const safeInput = {
    userId: input.userId.trim(),
    bucket: input.bucket.trim().slice(0, 80),
    windowSeconds: Math.max(1, Math.floor(input.windowSeconds)),
    maxRequests: Math.max(1, Math.floor(input.maxRequests)),
  };

  if (!safeInput.userId || !safeInput.bucket) {
    return false;
  }

  const { data, error } = await supabaseServer.rpc(
    "consume_atlas_rate_limit" as never,
    {
      p_user_id: safeInput.userId,
      p_bucket: safeInput.bucket,
      p_window_seconds: safeInput.windowSeconds,
      p_max_requests: safeInput.maxRequests,
    } as never,
  );

  if (error) {
    console.error("Atlas Database Rate Limit Error:", error);

    // A per-process fallback is useful during local development, but is not a
    // security boundary in a horizontally scaled production deployment. Fail
    // closed there until the database migration is available.
    return process.env.NODE_ENV === "production"
      ? false
      : consumeLocalFallback(safeInput);
  }

  return data === true;
}
