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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function apply() {
    if (loading || applied) {
      return;
    }

    if (!opportunity.url) {
      setError(
        "The original application link is unavailable."
      );

      return;
    }

    setLoading(true);
    setError("");

    /*
     * Open a temporary tab immediately so browsers do not
     * block it while ASCEND records the application.
     */
    const postingWindow = window.open(
      "about:blank",
      "_blank"
    );

    if (postingWindow) {
      postingWindow.opener = null;

      postingWindow.document.title =
        "Opening opportunity...";

      postingWindow.document.body.innerHTML = `
        <div style="
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          background:#020617;
          color:#cbd5e1;
          font-family:Arial,sans-serif;
        ">
          Recording your application and opening the original posting...
        </div>
      `;
    }

    try {
      const response = await fetch(
        "/api/opportunities/apply",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            opportunity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Atlas could not record this application."
        );
      }

      setApplied(true);
      onApplied?.();

      if (postingWindow) {
        postingWindow.location.replace(
          opportunity.url
        );
      } else {
        const openedWindow = window.open(
          opportunity.url,
          "_blank",
          "noopener,noreferrer"
        );

        if (!openedWindow) {
          setError(
            "Your application was recorded, but the browser blocked the original posting. Allow pop-ups and try opening it again."
          );
        }
      }
    } catch (error) {
      if (postingWindow) {
        postingWindow.close();
      }

      setError(
        error instanceof Error
          ? error.message
          : "Atlas could not record this application."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={apply}
        disabled={loading || applied}
        className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2 font-medium text-white transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
      >
        {loading
          ? "Opening..."
          : applied
            ? "✓ Applied"
            : "Apply →"}
      </button>

      {error && (
        <p
          role="alert"
          className="mt-2 max-w-xs text-xs leading-5 text-rose-300"
        >
          {error}
        </p>
      )}
    </div>
  );
}
