"use client";

import { useState } from "react";

type Props = {
  opportunityId: string;
  initialStatus: string;
};

const statuses = [
  "saved",
  "applied",
  "interview",
  "accepted",
  "rejected",
];

export default function OpportunityStatusSelector({
  opportunityId,
  initialStatus,
}: Props) {
  const [status, setStatus] = useState(initialStatus);

  async function update(newStatus: string) {
    setStatus(newStatus);

    await fetch("/api/opportunities/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        opportunityId,
        status: newStatus,
      }),
    });
  }

  return (
    <select
      value={status}
      onChange={(e) => update(e.target.value)}
      className="
        rounded-xl
        border
        border-slate-700
        bg-slate-900
        px-3
        py-2
        text-sm
        text-white
        outline-none
      "
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  );
}