"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

type CompleteMissionButtonProps = {
  missionId: string;
};

type CompletionResult = {
  xpAwarded?: number;

  ascension?: {
    level?: number;
    score?: number;
  };
};

export default function CompleteMissionButton({
  missionId,
}: CompleteMissionButtonProps) {
  const router =
    useRouter();

  const [loading, setLoading] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState<CompletionResult | null>(
      null
    );

  /*
   * The same operation ID is retained when a request
   * fails and the user retries. This makes completion
   * safe if Supabase committed before the response
   * connection was lost.
   */
  const operationId =
    useRef<string | null>(
      null
    );

  /*
   * Reset local state when Atlas supplies a new
   * authoritative active mission.
   */
  useEffect(() => {
    setCompleted(false);
    setError("");
    setResult(null);

    operationId.current =
      null;
  }, [missionId]);

  async function completeMission() {
    if (
      loading ||
      completed ||
      !missionId
    ) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      operationId.current ??=
        crypto.randomUUID();

      const response =
        await fetch(
          "/api/missions/complete",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              missionId,

              operationId:
                operationId.current,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Atlas could not complete this mission."
        );
      }

      setCompleted(true);

      setResult({
        xpAwarded:
          data.xpAwarded,

        ascension:
          data.ascension,
      });

      /*
       * Refresh Server Component data without a full
       * browser reload. The dashboard will receive
       * the replacement active mission created by
       * the same database transaction.
       */
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Atlas could not complete this mission."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={
          completeMission
        }
        disabled={
          loading ||
          completed ||
          !missionId
        }
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 font-semibold text-slate-950 transition hover:from-orange-400 hover:to-amber-300 focus:outline-none focus:ring-2 focus:ring-orange-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {loading
          ? "Completing Mission..."
          : completed
            ? "Mission Completed ✓"
            : "Complete Mission"}
      </button>

      {result && (
        <div
          aria-live="polite"
          className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
        >
          +
          {result.xpAwarded ??
            0}{" "}
          XP earned

          {result.ascension
            ?.level
            ? ` • Level ${result.ascension.level}`
            : ""}
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 text-sm leading-6 text-rose-300"
        >
          {error}
        </p>
      )}
    </div>
  );
}