"use client";

import { useState } from "react";

type Props = {
  missionId: string;
};

export default function CompleteMissionButton({
  missionId,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  async function completeMission() {
    setLoading(true);

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
    } else {
      console.error(await res.json());
    }

    setLoading(false);
  }

  return (
    <button
      onClick={completeMission}
      disabled={loading || completed}
      className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
    >
      {completed
        ? "Mission Completed ✓"
        : loading
        ? "Completing..."
        : "Complete Mission"}
    </button>
  );
}