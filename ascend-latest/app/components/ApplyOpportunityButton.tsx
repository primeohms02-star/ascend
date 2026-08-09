"use client";

import { useState } from "react";
import type { Opportunity } from "@/lib/atlas/opportunities/types";

type Props = {
  opportunity: Opportunity;
  initialApplied?: boolean;
  onApplied?: () => void;
};

export default function ApplyOpportunityButton({
  opportunity,
  initialApplied = false,
  onApplied,
}: Props) {
  const [applied, setApplied] = useState(initialApplied);
  const [applicationOpened, setApplicationOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function recordApplicationOpened() {
    setError("");

    if (!opportunity.url) {
      setError("The original application link is not available for this opportunity.");
      return;
    }

    setApplicationOpened(true);
  }

  async function confirmSubmitted() {
    if (applied || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/opportunities/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity,
          confirmedSubmitted: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Atlas could not record this submitted application.");
      }

      setApplied(true);
      setApplicationOpened(false);
      onApplied?.();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Atlas could not record this submitted application."
      );
    } finally {
      setLoading(false);
    }
  }

  if (applied) {
    return (
      <div>
        <button
          type="button"
          disabled
          className="rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-5 py-2 font-medium text-cyan-200 opacity-90"
        >
          Applied ✓
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-sm">
      {opportunity.url ? (
        <a
          href={opportunity.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={recordApplicationOpened}
          className="inline-flex rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2 font-medium text-white transition hover:brightness-110"
        >
          Apply →
        </a>
      ) : (
        <button
          type="button"
          onClick={recordApplicationOpened}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2 font-medium text-white transition hover:brightness-110"
        >
          Apply →
        </button>
      )}

      {applicationOpened && (
        <div className="mt-2 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06] p-3">
          <p className="text-xs leading-5 text-slate-300">
            Opening the application does not mark it as applied. Confirm only after you actually submit it.
          </p>
          <button
            type="button"
            onClick={confirmSubmitted}
            disabled={loading}
            className="mt-2 rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/15 disabled:opacity-60"
          >
            {loading ? "Recording..." : "I submitted my application"}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 max-w-xs text-xs leading-5 text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}
