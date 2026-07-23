"use client";

import { useState } from "react";

type Props = {
  opportunity: any;
};

export default function SaveOpportunityButton({
  opportunity,
}: Props) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function save() {
    try {
      setLoading(true);

      const res = await fetch("/api/opportunities/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          opportunity,
        }),
      });

      if (res.ok) {
        setSaved(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={save}
      disabled={loading || saved}
      className="
        rounded-xl
        border
        border-slate-700
        px-4
        py-2
        text-sm
        font-medium
        text-slate-300
        transition
        hover:border-blue-500/40
        hover:text-blue-300
      "
    >
      {saved ? "✓ Saved" : loading ? "Saving..." : "☆ Save"}
    </button>
  );
}