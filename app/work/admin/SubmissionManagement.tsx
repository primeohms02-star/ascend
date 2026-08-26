"use client";

import { useEffect, useMemo, useState } from "react";

import type { PaidMissionAdmin, WorkSubmissionAdmin } from "@/lib/ascend-work/types";

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...options });
  const payload = await response.json().catch(() => null) as (T & { error?: string }) | null;
  if (!response.ok) throw new Error(payload?.error ?? "The request could not be completed.");
  if (!payload) throw new Error("The server returned an empty response.");
  return payload;
}

export default function SubmissionManagement({ projects }: { projects: PaidMissionAdmin[] }) {
  const eligible = useMemo(() => projects.filter((project) => ["published", "paused", "closed", "completed"].includes(project.status)), [projects]);
  const [projectId, setProjectId] = useState(eligible[0]?.id ?? "");
  const [submissions, setSubmissions] = useState<WorkSubmissionAdmin[]>([]);
  const [revisionNotes, setRevisionNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  async function load(id: string) {
    if (!id) { setSubmissions([]); return; }
    const result = await requestJson<{ submissions: WorkSubmissionAdmin[] }>(`/api/work/admin/submissions?projectId=${encodeURIComponent(id)}`);
    setSubmissions(result.submissions);
  }

  useEffect(() => { const controller = new AbortController(); if (projectId) void requestJson<{ submissions: WorkSubmissionAdmin[] }>(`/api/work/admin/submissions?projectId=${encodeURIComponent(projectId)}`, { signal: controller.signal }).then((result) => setSubmissions(result.submissions)).catch((error: unknown) => { if (error instanceof DOMException && error.name === "AbortError") return; setNotice({ tone: "error", message: error instanceof Error ? error.message : "Submissions could not be loaded." }); }); return () => controller.abort(); }, [projectId]);

  async function review(item: WorkSubmissionAdmin, action: "request_revision" | "approve") {
    if (!item.submission) return;
    const revisionNote = revisionNotes[item.submission.id]?.trim() ?? "";
    if (action === "request_revision" && !revisionNote) { setNotice({ tone: "error", message: "Add clear revision guidance first." }); return; }
    const confirmed = window.confirm(action === "approve" ? `Approve ${item.applicantName}'s completed work? This creates verified evidence and marks the application completed.` : `Send this revision request to ${item.applicantName}?`);
    if (!confirmed) return;
    setBusyId(item.submission.id); setNotice(null);
    try {
      await requestJson("/api/work/admin/submissions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ submissionId: item.submission.id, action, revisionNote: revisionNote || undefined }) });
      await load(projectId);
      setNotice({ tone: "success", message: action === "approve" ? `${item.applicantName}'s work was approved and verified evidence was recorded.` : `Revision guidance was sent to ${item.applicantName}.` });
    } catch (error) { setNotice({ tone: "error", message: error instanceof Error ? error.message : "The review could not be recorded." }); }
    finally { setBusyId(null); }
  }

  return <section className="rounded-2xl border border-violet-400/20 bg-violet-400/[0.035] p-5 sm:p-6"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">Delivery control</p><h2 className="mt-1 text-xl font-bold text-white">Review submitted work</h2><p className="mt-2 text-sm leading-6 text-slate-400">Approval creates permanent verified evidence. Revision requests reopen only that student’s private workspace.</p>
    {!eligible.length ? <p className="mt-5 rounded-xl border border-white/10 p-4 text-sm text-slate-400">Submission review becomes available after a mission is published.</p> : <><label className="mt-5 block text-xs font-semibold text-slate-300">Paid Mission<select value={projectId} onChange={(event) => { setProjectId(event.target.value); setNotice(null); }} className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3.5 py-3 text-sm text-white">{eligible.map((project) => <option key={project.id} value={project.id}>{project.title} — {project.status}</option>)}</select></label>
      {!submissions.length ? <p className="mt-5 rounded-xl border border-white/10 p-4 text-sm text-slate-400">No accepted student workspaces exist for this mission.</p> : <div className="mt-5 grid gap-4">{submissions.map((item) => <article key={item.id} className="rounded-xl border border-white/10 bg-slate-950/35 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold text-white">{item.applicantName}</h3><p className="text-xs text-slate-500">{item.applicantEmail ?? item.userId}</p></div><span className="rounded-full border border-violet-400/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-violet-200">{item.submission?.status ?? "workspace missing"}</span></div>
        {item.submission ? <>{item.deliverables.map((deliverable, index) => <div key={deliverable} className="mt-4 border-t border-white/10 pt-4"><p className="text-xs font-semibold text-slate-300">{index + 1}. {deliverable}</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-400">{item.submission?.responses[deliverable] || "No response yet."}</p></div>)}{item.submission.studentNote ? <p className="mt-4 text-sm text-slate-400"><strong className="text-slate-200">Student note:</strong> {item.submission.studentNote}</p> : null}{item.submission.status === "submitted" ? <div className="mt-5 border-t border-white/10 pt-4"><label className="text-xs font-semibold text-slate-300">Revision guidance<textarea value={revisionNotes[item.submission.id] ?? ""} onChange={(event) => setRevisionNotes((current) => ({ ...current, [item.submission!.id]: event.target.value }))} rows={3} maxLength={3000} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3.5 py-3 text-sm text-white" /></label><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => void review(item, "request_revision")} disabled={busyId !== null} className="rounded-lg border border-amber-300/30 px-3.5 py-2 text-xs font-semibold text-amber-200 disabled:opacity-50">Request revision</button><button type="button" onClick={() => void review(item, "approve")} disabled={busyId !== null} className="rounded-lg bg-emerald-400 px-3.5 py-2 text-xs font-bold text-slate-950 disabled:opacity-50">Approve work</button></div></div> : null}</> : null}
      </article>)}</div>}</>}
    {notice ? <p role={notice.tone === "error" ? "alert" : "status"} className={`mt-4 rounded-xl border px-4 py-3 text-sm ${notice.tone === "success" ? "border-emerald-400/20 text-emerald-200" : "border-rose-400/20 text-rose-200"}`}>{notice.message}</p> : null}
  </section>;
}
