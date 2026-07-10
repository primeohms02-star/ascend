"use client";

import { useTransition } from "react";
import { completeMissionAction } from "@/app/actions/completeMission";

type CompleteMissionButtonProps = {
  missionId: string;
};

export default function CompleteMissionButton({
  missionId,
}: CompleteMissionButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() =>
        startTransition(() => {
          completeMissionAction(missionId);
        })
      }
      disabled={isPending}
      className="mt-6 w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
    >
      {isPending ? "Completing..." : "Complete Mission"}
    </button>
  );
}