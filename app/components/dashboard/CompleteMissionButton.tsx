"use client";

import {
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
    progressPercent?: number;
    title?: string;
  };

  completedMission?: {
    mission?: string;
  };

  nextMission?: {
    mission?: string;
    reason?: string | null;
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

        completedMission:
          data.completedMission,

        nextMission:
          data.nextMission,
      });

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
          className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.08] p-4 text-left"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Mission completed
          </p>

          <p className="mt-2 font-semibold text-white">
            {result.completedMission?.mission ?? "Your completed mission has been recorded."}
          </p>

          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
            <p className="rounded-xl bg-black/15 px-3 py-2 text-emerald-200">
              +{result.xpAwarded ?? 0} XP earned
            </p>
            <p className="rounded-xl bg-black/15 px-3 py-2 text-emerald-200">
              Level {result.ascension?.level ?? 0}
            </p>
            <p className="rounded-xl bg-black/15 px-3 py-2 text-emerald-200">
              {result.ascension?.progressPercent ?? 0}% through this level
            </p>
          </div>

          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              What Atlas learned
            </p>
            <p className="mt-1.5 text-sm leading-6 text-slate-300">
              This completion is now part of your progress history and helps Atlas make your next mission more precise.
            </p>
          </div>

          {result.nextMission?.mission ? (
            <div className="mt-3 rounded-xl border border-blue-400/15 bg-blue-400/[0.06] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
                Newly prepared mission
              </p>
              <p className="mt-1.5 font-semibold text-white">
                {result.nextMission.mission}
              </p>
              {result.nextMission.reason ? (
                <p className="mt-1.5 text-sm leading-6 text-slate-400">
                  {result.nextMission.reason}
                </p>
              ) : null}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => {
              router.replace("/dashboard#mission");
              router.refresh();
            }}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-300 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-200 sm:w-auto"
          >
            Continue Ascending
          </button>
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
