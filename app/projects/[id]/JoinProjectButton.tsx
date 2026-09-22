"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

export default function JoinProjectButton({ projectId, existingStatus }: { projectId: string; existingStatus?: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (existingStatus) {
    return <button type="button" onClick={() => router.push(`/projects/${projectId}/workspace`)} className="w-full rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400">Open Project workspace</button>;
  }

  async function join() {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/projects/${projectId}/join`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not join this Project.");
      router.push(`/projects/${projectId}/workspace`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not join this Project.");
    } finally { setLoading(false); }
  }

  return <div><button type="button" onClick={join} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60">{loading && <LoaderCircle size={17} className="animate-spin"/>}{loading ? "Joining…" : "Join this Project"}</button>{error&&<p role="alert" className="mt-2 text-sm text-rose-300">{error}</p>}</div>;
}
