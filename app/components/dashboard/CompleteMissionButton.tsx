"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type CompleteMissionButtonProps = {
  missionId: string;
};

export default function CompleteMissionButton({
  missionId,
}: CompleteMissionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [completedMissionId, setCompletedMissionId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState("");
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /*
   * The same operation ID is retained when a request fails and the user
   * retries. This makes completion safe if Supabase committed before the
   * response connection was lost.
   */
  const operationId = useRef<string | null>(null);
  const completed = completedMissionId === missionId;

  useEffect(() => {
    return () => {
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
      }
    };
  }, []);

  async function completeMission() {
    if (loading || completed || !missionId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      operationId.current ??= crypto.randomUUID();

      const response = await fetch("/api/missions/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          missionId,
          operationId: operationId.current,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Atlas could not complete this mission.",
        );
      }

      setCompletedMissionId(missionId);

      // Leave the confirmation visible briefly, then refresh in place so the
      // newly generated mission replaces the completed mission card.
      refreshTimer.current = setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Atlas could not complete this mission.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={completeMission}
        disabled={loading || completed || !missionId}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 font-semibold text-slate-950 transition hover:from-orange-400 hover:to-amber-300 focus:outline-none focus:ring-2 focus:ring-orange-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {loading
          ? "Completing Mission..."
          : completed
            ? "Mission Completed ✓"
            : "Complete Mission"}
      </button>

      {error && (
        <p role="alert" className="mt-3 text-sm leading-6 text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}
