"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProjectBriefing as Recommendation } from "@/lib/projects/briefing";

export default function ProjectBriefing() {
  const { user } = useUser();
  const userId = user?.id;
  const [result, setResult] = useState<{ userId: string; recommendation: Recommendation | null; status: string } | null>(null);
  useEffect(() => {
    if (!userId) return;
    let disposed = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);
    fetch("/api/projects/briefing", { cache: "no-store", signal: controller.signal })
      .then(response => response.json())
      .then(data => {
        if (!controller.signal.aborted && data) {
          setResult({ userId, recommendation: data.recommendation ?? null, status: data.status ?? "unavailable" });
        }
      }).catch(() => { if (!disposed) setResult({ userId, recommendation: null, status: "unavailable" }); })
      .finally(() => clearTimeout(timeout));
    return () => { disposed = true; controller.abort(); clearTimeout(timeout); };
  }, [userId]);
  const recommendation = result?.userId === userId ? result?.recommendation : null;
  if (!recommendation) {
    if (!userId) return null;
    const status = result?.userId === userId ? result.status : "loading";
    return <div className="mt-3 rounded-xl border border-white/10 p-4 text-sm text-slate-400" role="status">
      <p className="font-semibold text-cyan-300">Atlas · Projects</p>
      <p className="mt-1">{status === "loading" ? "Finding your next project step…" : status === "no_match" ? "No new project matches your saved direction and profile right now." : "Project suggestions couldn’t load. Refresh the page to try again."}</p>
      {status !== "loading" && <Link href="/projects" className="mt-2 inline-block text-cyan-200 underline">Browse projects</Link>}
    </div>;
  }
  return (
    <article className="mt-3 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.04] p-4 sm:flex sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Atlas · Your next project step</p>
        <h3 className="mt-2 break-words text-base font-semibold text-white">{recommendation.title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-300">{recommendation.reason}</p>
        <p className="mt-1 break-words text-sm leading-6 text-slate-400">{recommendation.nextStep}</p>
      </div>
      <Link href={recommendation.href} className="mt-3 inline-flex shrink-0 items-center gap-2 rounded-lg border border-cyan-300/20 px-3 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-300/10 focus-visible:outline-2 focus-visible:outline-cyan-300 sm:mt-0">
        {recommendation.action}<ArrowRight size={15} aria-hidden="true" />
      </Link>
    </article>
  );
}
