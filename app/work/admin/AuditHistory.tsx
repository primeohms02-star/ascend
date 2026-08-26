"use client";

import { useEffect, useMemo, useState } from "react";

import type { PaidMissionAdmin, WorkAuditEvent } from "@/lib/ascend-work/types";

function label(value: string) { return value.replaceAll("_", " "); }

export default function AuditHistory({ projects }: { projects: PaidMissionAdmin[] }) {
  const eligible = useMemo(() => projects.filter((project) => !["draft", "review"].includes(project.status)), [projects]);
  const [projectId, setProjectId] = useState(eligible[0]?.id ?? "");
  const [events, setEvents] = useState<WorkAuditEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    const controller = new AbortController();
    void fetch(`/api/work/admin/audit?projectId=${encodeURIComponent(projectId)}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => { const payload = await response.json().catch(() => null) as { events?: WorkAuditEvent[]; error?: string } | null; if (!response.ok) throw new Error(payload?.error ?? "Audit history could not be loaded."); setEvents(payload?.events ?? []); setError(null); })
      .catch((reason: unknown) => { if (reason instanceof DOMException && reason.name === "AbortError") return; setError(reason instanceof Error ? reason.message : "Audit history could not be loaded."); });
    return () => controller.abort();
  }, [projectId]);

  return <section className="rounded-2xl border border-slate-400/20 bg-slate-400/[0.035] p-5 sm:p-6"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">Accountability</p><h2 className="mt-1 text-xl font-bold text-white">Mission audit history</h2><p className="mt-2 text-sm leading-6 text-slate-400">Permanent application and submission events for operational review.</p>
    {!eligible.length ? <p className="mt-5 rounded-xl border border-white/10 p-4 text-sm text-slate-400">Audit history begins after a mission is published.</p> : <><label className="mt-5 block text-xs font-semibold text-slate-300">Paid Mission<select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3.5 py-3 text-sm text-white">{eligible.map((project) => <option key={project.id} value={project.id}>{project.title} — {project.status}</option>)}</select></label>{!events.length && !error ? <p className="mt-5 rounded-xl border border-white/10 p-4 text-sm text-slate-400">No audit events recorded for this mission.</p> : null}<div className="mt-5 grid gap-2">{events.map((event) => <article key={event.id} className="rounded-xl border border-white/10 bg-slate-950/35 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><p className="text-sm font-semibold capitalize text-white">{label(event.eventType)}</p><time className="text-xs text-slate-500">{new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.createdAt))}</time></div><p className="mt-2 text-xs text-slate-400">Actor: {event.actorType}{event.actorUserId ? ` · ${event.actorUserId}` : ""}</p>{event.fromStatus || event.toStatus ? <p className="mt-1 text-xs text-slate-500">{event.fromStatus ? label(event.fromStatus) : "—"} → {event.toStatus ? label(event.toStatus) : "—"}</p> : null}</article>)}</div></>}
    {error ? <p role="alert" className="mt-4 rounded-xl border border-rose-400/20 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
  </section>;
}
