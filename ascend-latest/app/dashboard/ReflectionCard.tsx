"use client";

import { useState } from "react";

type ReflectionCardProps = {
  missionId: string;
};

export default function ReflectionCard({
  missionId,
}: ReflectionCardProps) {
  const [reflection, setReflection] =
    useState("");

  const [mood, setMood] =
    useState(3);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  async function save() {
    setSaving(true);

    const res = await fetch(
      "/api/reflections",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          missionId,
          reflection,
          mood,
        }),
      }
    );

    if (res.ok) {
      setSaved(true);
    }

    setSaving(false);
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">

      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
        Reflection
      </p>

      <h2 className="mt-2 text-2xl font-bold">
        How did today go?
      </h2>

      <textarea
        value={reflection}
        onChange={(e) =>
          setReflection(e.target.value)
        }
        placeholder="Write a few thoughts..."
        className="mt-4 h-36 w-full rounded-xl border p-4"
      />

      <div className="mt-4">

        <label className="text-sm font-medium">
          Mood (1–5)
        </label>

        <input
          type="range"
          min={1}
          max={5}
          value={mood}
          onChange={(e) =>
            setMood(Number(e.target.value))
          }
          className="w-full"
        />

      </div>

      <button
        onClick={save}
        disabled={saving || saved}
        className="mt-6 rounded-xl bg-slate-900 px-6 py-3 text-white"
      >
        {saved
          ? "Reflection Saved ✓"
          : saving
          ? "Saving..."
          : "Save Reflection"}
      </button>

    </section>
  );
}