"use client";

import { useState } from "react";

type Props = {
  opportunity: any;
};

export default function ApplyOpportunityButton({
  opportunity,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function apply() {
    try {
      setLoading(true);

      await fetch("/api/opportunities/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          opportunity,
        }),
      });

      window.open(
        opportunity.url,
        "_blank",
        "noopener,noreferrer"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={apply}
      disabled={loading}
      className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2 font-medium text-white transition-all duration-300 hover:scale-105"
    >
      {loading ? "Opening..." : "Apply →"}
    </button>
  );
}