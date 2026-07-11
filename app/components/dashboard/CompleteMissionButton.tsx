"use client";

import { useState } from "react";

type CompleteMissionButtonProps = {
  missionId: string;
};

export default function CompleteMissionButton({
  missionId,
}: CompleteMissionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  async function completeMission() {
    setLoading(true);

    try {
      const res = await fetch("/api/missions/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          missionId,
        }),
      });

      if (res.ok) {
        setCompleted(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={completeMission}
      disabled={loading || completed}
      className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {completed
        ? "Mission Completed ✓"
        : loading
        ? "Completing..."
        : "Complete Mission"}
    </button>
  );
}