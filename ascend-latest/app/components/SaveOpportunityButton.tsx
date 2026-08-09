"use client";

import { useState } from "react";

import type { Opportunity } from "@/lib/atlas/opportunities/types";

type Props = {
  opportunity: Opportunity;
  initialSaved?: boolean;
  onStatusChange?: (saved: boolean) => void;
};

export default function SaveOpportunityButton({
  opportunity,
  initialSaved = false,
  onStatusChange,
}: Props) {
  const [saved, setSaved] = useState(initialSaved);
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
        onStatusChange?.(true);
      } else {
        throw new Error(
          "Atlas could not save this opportunity."
        );
      }
    } catch (error) {
      console.error("Save Opportunity Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function unsave() {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        opportunityId: opportunity.id,
      });

      const res = await fetch(
        `/api/opportunities/status?${params.toString()}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        throw new Error(
          "Atlas could not unsave this opportunity."
        );
      }

      setSaved(false);
      onStatusChange?.(false);
    } catch (error) {
      console.error("Unsave Opportunity Error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={saved ? unsave : save}
      disabled={loading}
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
      {loading
        ? saved
          ? "Unsaving..."
          : "Saving..."
        : saved
          ? "Unsave"
          : "☆ Save"}
    </button>
  );
}
