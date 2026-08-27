"use client";

import { useEffect, useMemo, useState } from "react";

import type { PaidMissionAdmin, WorkApplicationAdmin } from "@/lib/ascend-work/types";

type Notice = { tone: "success" | "error"; message: string } | null;

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...options });
  const payload = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok) throw new Error(payload?.error ?? "The request could not be completed.");
  if (!payload) throw new Error("The server returned an empty response.");
  return payload;
}

function statusTone(status: WorkApplicationAdmin["status"]) {
  if (["accepted", "completed"].includes(status)) return "text-emerald-200 border-emerald-400/25 bg-emerald-400/[0.07]";
  if (status === "shortlisted") return "text-amber-200 border-amber-400/25 bg-amber-400/[0.07]";
  if (status === "rejected") return "text-rose-200 border-rose-400/25 bg-rose-400/[0.07]";
  return "text-cyan-200 border-cyan-400/25 bg-cyan-400/[0.07]";
}

export default function ApplicantManagement({ projects }: { projects: PaidMissionAdmin[] }) {
  const eligibleProjects = useMemo(() => projects
    .filter((project) => ["published", "paused", "closed", "completed"].includes(project.status))
    .sort((left, right) => {
      const priority = { published: 0, paused: 1, closed: 2, completed: 3 } as const;
      return priority[left.status as keyof typeof priority] - priority[right.status as keyof typeof priority]
        || new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    }), [projects]);
  const [projectId, setProjectId] = useState(eligibleProjects[0]?.id ?? "");
  const [applications, setApplications] = useState<WorkApplicationAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    let active = true;

    async function selectLatestAttention() {
      if (!eligibleProjects.length) return;
      try {
        const results = await Promise.all(eligibleProjects.map(async (project) => ({
          project,
          applications: (await requestJson<{ applications: WorkApplicationAdmin[] }>(`/api/work/admin/applications?projectId=${encodeURIComponent(project.id)}`)).applications,
        })));
        if (!active) return;
        const attention = results
          .flatMap(({ project, applications: items }) => items
            .filter((item) => ["submitted", "shortlisted"].includes(item.status))
            .map((item) => ({ project, item })))
          .sort((left, right) => new Date(right.item.updatedAt).getTime() - new Date(left.item.updatedAt).getTime())[0];
        const selectedResult = attention
          ? results.find((result) => result.project.id === attention.project.id)
          : results[0];
        if (!selectedResult) return;
        setProjectId(selectedResult.project.id);
        setApplications(selectedResult.applications);
      } catch (error) {
        if (active) setNotice({ tone: "error", message: error instanceof Error ? error.message : "Applicants could not be loaded." });
      }
    }

    void selectLatestAttention();
    const interval = window.setInterval(() => void selectLatestAttention(), 20_000);
    return () => { active = false; window.clearInterval(interval); };
  }, [eligibleProjects]);

  async function loadApplications(selectedProjectId: string) {
    if (!selectedProjectId) {
      setApplications([]);
      return;
    }
    setLoading(true);
    setNotice(null);
    try {
      const result = await requestJson<{ applications: WorkApplicationAdmin[] }>(`/api/work/admin/applications?projectId=${encodeURIComponent(selectedProjectId)}`);
      setApplications(result.applications);
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Applicants could not be loaded." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    if (projectId) {
      void requestJson<{ applications: WorkApplicationAdmin[] }>(`/api/work/admin/applications?projectId=${encodeURIComponent(projectId)}`, { signal: controller.signal })
        .then((result) => setApplications(result.applications))
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setNotice({ tone: "error", message: error instanceof Error ? error.message : "Applicants could not be loaded." });
        });
    }
    return () => controller.abort();
  }, [projectId]);

  async function transition(application: WorkApplicationAdmin, action: "shortlist" | "accept" | "reject") {
    if (action === "accept") {
      const confirmed = window.confirm(`Accept ${application.applicantName} for this Paid Mission?\n\nThis reserves one available slot and creates the student project workspace.`);
      if (!confirmed) return;
    }
    if (action === "reject") {
      const confirmed = window.confirm(`Reject ${application.applicantName}'s application? This action is recorded in the permanent audit history.`);
      if (!confirmed) return;
    }
    setBusyId(application.id);
    setNotice(null);
    try {
      await requestJson("/api/work/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id, action }),
      });
      await loadApplications(projectId);
      const messages = {
        shortlist: `${application.applicantName} was shortlisted.`,
        accept: `${application.applicantName} was accepted and a workspace was created.`,
        reject: `${application.applicantName}'s application was rejected.`,
      };
      setNotice({ tone: "success", message: messages[action] });
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Application could not be updated." });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-blue-400/20 bg-blue-400/[0.035] p-5 sm:p-6" aria-labelledby="applicant-management-heading">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300">Applicant control</p>
      <h2 id="applicant-management-heading" className="mt-1 text-xl font-bold text-white">Review and select applicants</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">Selections reserve project slots atomically. An accepted student receives a private project workspace.</p>

      {!eligibleProjects.length ? (
        <p className="mt-5 rounded-xl border border-white/10 bg-black/10 p-4 text-sm text-slate-400">Applicant management becomes available after a mission is published. The current draft remains private.</p>
      ) : (
        <>
          <label className="mt-5 block text-xs font-semibold text-slate-300">Paid Mission
            <select className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3.5 py-3 text-sm text-white outline-none focus:border-blue-400/40" value={projectId} onChange={(event) => { setProjectId(event.target.value); setNotice(null); }}>
              {eligibleProjects.map((project) => <option key={project.id} value={project.id}>{project.title} — {project.status}</option>)}
            </select>
          </label>

          {loading ? <p className="mt-5 text-sm text-slate-400">Loading applicants…</p> : null}
          {!loading && !applications.length ? <p className="mt-5 rounded-xl border border-white/10 bg-black/10 p-4 text-sm text-slate-400">No applications have been submitted for this mission.</p> : null}
          <div className="mt-5 grid gap-3">
            {applications.map((application) => (
              <article key={application.id} className="rounded-xl border border-white/10 bg-slate-950/35 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{application.applicantName}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">{application.applicantEmail ?? application.userId}</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${statusTone(application.status)}`}>{application.status}</span>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-300">{application.coverNote || "No cover note supplied."}</p>
                {application.status === "submitted" || application.status === "shortlisted" ? (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                    {application.status === "submitted" ? <button type="button" onClick={() => void transition(application, "shortlist")} disabled={busyId !== null} className="rounded-lg border border-amber-300/30 px-3.5 py-2 text-xs font-semibold text-amber-200 disabled:opacity-50">Shortlist</button> : null}
                    <button type="button" onClick={() => void transition(application, "accept")} disabled={busyId !== null} className="rounded-lg bg-emerald-400 px-3.5 py-2 text-xs font-bold text-slate-950 disabled:opacity-50">Accept</button>
                    <button type="button" onClick={() => void transition(application, "reject")} disabled={busyId !== null} className="rounded-lg border border-rose-300/30 px-3.5 py-2 text-xs font-semibold text-rose-200 disabled:opacity-50">Reject</button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </>
      )}

      {notice ? <p role={notice.tone === "error" ? "alert" : "status"} className={`mt-4 rounded-xl border px-4 py-3 text-sm ${notice.tone === "success" ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200" : "border-rose-400/20 bg-rose-400/[0.07] text-rose-200"}`}>{notice.message}</p> : null}
    </section>
  );
}
