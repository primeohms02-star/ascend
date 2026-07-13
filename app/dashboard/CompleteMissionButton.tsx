"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useNotification } from "@/app/context/NotificationContext";

type Props = {
  missionId: string;
};

export default function CompleteMissionButton({
  missionId,
}: Props) {
  const router = useRouter();

  const { showNotification } =
    useNotification();

  const [loading, setLoading] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  async function completeMission() {
    if (loading || completed) return;

    setLoading(true);

    try {
      const res = await fetch(
        "/api/missions/complete",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            missionId,
          }),
        }
      );

      if (!res.ok) {
        console.error(await res.json());
        setLoading(false);
        return;
      }

      await res.json();

      setCompleted(true);

      showNotification({
        title: "Mission Complete 🎉",
        message:
          "You earned +15 XP and extended your momentum.",
        icon: "🎯",
      });

      router.refresh();
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  return (
    <button
      onClick={completeMission}
      disabled={loading || completed}
      className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
    >
      {completed
        ? "Mission Completed ✓"
        : loading
        ? "Completing..."
        : "Complete Mission"}
    </button>
  );
}