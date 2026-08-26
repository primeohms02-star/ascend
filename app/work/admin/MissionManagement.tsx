"use client";

import { FormEvent, useCallback, useState } from "react";

import type { PaidMissionAdmin } from "@/lib/ascend-work/types";

type Notice = { tone: "success" | "error"; message: string } | null;

const fieldClass = "mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-60";
const labelClass = "text-xs font-semibold text-slate-300";

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...options });
  const payload = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok) throw new Error(payload?.error ?? "The request could not be completed.");
  if (!payload) throw new Error("The server returned an empty response.");
  return payload;
}

function localDateTime(value: string) {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function statusClass(status: PaidMissionAdmin["status"]) {
  if (status === "published") return "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-200";
  if (status === "review") return "border-amber-400/25 bg-amber-400/[0.08] text-amber-200";
  return "border-violet-400/25 bg-violet-400/[0.08] text-violet-200";
}

export default function MissionManagement({ initialProjects }: { initialProjects: PaidMissionAdmin[] }) {
  const [projects, setProjects] = useState<PaidMissionAdmin[]>(initialProjects);
  const [selectedId, setSelectedId] = useState<string | null>(initialProjects[0]?.id ?? null);
  const [busy, setBusy] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const loadProjects = useCallback(async (preferredId?: string) => {
    try {
      const result = await requestJson<{ projects: PaidMissionAdmin[] }>("/api/work/admin/projects");
      setProjects(result.projects);
      setSelectedId((current) => {
        const candidate = preferredId ?? current;
        return candidate && result.projects.some((project) => project.id === candidate)
          ? candidate
          : result.projects[0]?.id ?? null;
      });
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Paid Missions could not be loaded." });
    }
  }, []);

  const selected = projects.find((project) => project.id === selectedId) ?? null;

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setBusy("save");
    setNotice(null);
    const form = new FormData(event.currentTarget);
    try {
      await requestJson("/api/work/admin/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          action: "save",
          title: form.get("title"),
          summary: form.get("summary"),
          description: form.get("description"),
          category: form.get("category"),
          requiredSkills: String(form.get("requiredSkills") ?? "").split(",").map((value) => value.trim()).filter(Boolean),
          deliverables: String(form.get("deliverables") ?? "").split("\n").map((value) => value.trim()).filter(Boolean),
          paymentAmountMinor: Math.round(Number(form.get("paymentAmount")) * 100),
          currency: String(form.get("currency") ?? "NGN").toUpperCase(),
          estimatedHours: Number(form.get("estimatedHours")),
          availableSlots: Number(form.get("availableSlots")),
          applicationDeadline: new Date(String(form.get("applicationDeadline"))).toISOString(),
          deliveryDeadline: new Date(String(form.get("deliveryDeadline"))).toISOString(),
        }),
      });
      await loadProjects(selected.id);
      setDirty(false);
      setNotice({ tone: "success", message: "Draft details saved." });
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Draft could not be saved." });
    } finally {
      setBusy(null);
    }
  }

  async function transition(action: "submit_review" | "return_draft" | "publish") {
    if (!selected) return;
    if (action === "publish") {
      const payment = new Intl.NumberFormat("en-NG", { style: "currency", currency: selected.currency, maximumFractionDigits: 0 }).format(selected.paymentAmountMinor / 100);
      const confirmed = window.confirm(
        `Publish “${selected.title}” from ${selected.organizationName} for ${payment}?\n\nThis makes the mission visible to eligible users and allows applications. Confirm funding, scope and deadlines before continuing.`,
      );
      if (!confirmed) return;
    }
    setBusy(action);
    setNotice(null);
    try {
      await requestJson("/api/work/admin/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, action }),
      });
      await loadProjects(selected.id);
      setDirty(false);
      const messages = {
        submit_review: "Mission moved to review. It remains private.",
        return_draft: "Mission returned to draft.",
        publish: "Mission published and is now visible to eligible users.",
      };
      setNotice({ tone: "success", message: messages[action] });
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Mission status could not be changed." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.035] p-5 sm:p-6" aria-labelledby="mission-management-heading">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Mission control</p>
      <h2 id="mission-management-heading" className="mt-1 text-xl font-bold text-white">Review and manage Paid Missions</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">Drafts and review records remain private. Only a reviewed mission from a verified organisation can be published.</p>

      {!projects.length ? <p className="mt-5 rounded-xl border border-white/10 bg-black/10 p-4 text-sm text-slate-400">No Paid Missions have been created.</p> : null}

      {projects.length ? (
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(220px,0.65fr)_minmax(0,1.35fr)]">
          <div className="grid content-start gap-2" aria-label="Paid Missions">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => { setSelectedId(project.id); setDirty(false); setNotice(null); }}
                className={`rounded-xl border p-4 text-left transition ${selectedId === project.id ? "border-cyan-300/35 bg-cyan-300/[0.08]" : "border-white/10 bg-black/10 hover:border-white/20"}`}
              >
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${statusClass(project.status)}`}>{project.status}</span>
                <span className="mt-2 block text-sm font-semibold leading-5 text-white">{project.title}</span>
                <span className="mt-1 block text-xs text-slate-500">{project.organizationName}</span>
              </button>
            ))}
          </div>

          {selected ? (
            <form key={`${selected.id}-${selected.updatedAt}`} className="grid gap-4 rounded-xl border border-white/10 bg-slate-950/35 p-4 sm:grid-cols-2 sm:p-5" onChange={() => setDirty(true)} onSubmit={saveProject}>
              <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{selected.organizationName}</p>
                  <p className="mt-0.5 text-xs text-slate-500">Organisation: {selected.organizationVerificationStatus}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${statusClass(selected.status)}`}>{selected.status}</span>
              </div>
              <label className={labelClass}>Mission title<input className={fieldClass} name="title" defaultValue={selected.title} minLength={4} maxLength={100} disabled={selected.status === "published"} required /></label>
              <label className={labelClass}>Category<input className={fieldClass} name="category" defaultValue={selected.category} minLength={2} maxLength={80} disabled={selected.status === "published"} required /></label>
              <label className={`${labelClass} sm:col-span-2`}>Short summary<textarea className={fieldClass} name="summary" defaultValue={selected.summary} minLength={20} maxLength={320} rows={2} disabled={selected.status === "published"} required /></label>
              <label className={`${labelClass} sm:col-span-2`}>Full description<textarea className={fieldClass} name="description" defaultValue={selected.description} minLength={40} maxLength={5000} rows={5} disabled={selected.status === "published"} required /></label>
              <label className={labelClass}>Required skills<input className={fieldClass} name="requiredSkills" defaultValue={selected.requiredSkills.join(", ")} disabled={selected.status === "published"} /></label>
              <label className={labelClass}>Deliverables<textarea className={fieldClass} name="deliverables" defaultValue={selected.deliverables.join("\n")} rows={4} disabled={selected.status === "published"} required /></label>
              <label className={labelClass}>Advertised payment<input className={fieldClass} name="paymentAmount" type="number" min="1" step="0.01" defaultValue={selected.paymentAmountMinor / 100} disabled={selected.status === "published"} required /></label>
              <label className={labelClass}>Currency<input className={fieldClass} name="currency" defaultValue={selected.currency} pattern="[A-Za-z]{3}" maxLength={3} disabled={selected.status === "published"} required /></label>
              <label className={labelClass}>Estimated hours<input className={fieldClass} name="estimatedHours" type="number" min="1" max="160" defaultValue={selected.estimatedHours} disabled={selected.status === "published"} required /></label>
              <label className={labelClass}>Available slots<input className={fieldClass} name="availableSlots" type="number" min="1" max="100" defaultValue={selected.availableSlots} disabled={selected.status === "published"} required /></label>
              <label className={labelClass}>Application deadline<input className={fieldClass} name="applicationDeadline" type="datetime-local" defaultValue={localDateTime(selected.applicationDeadline)} disabled={selected.status === "published"} required /></label>
              <label className={labelClass}>Delivery deadline<input className={fieldClass} name="deliveryDeadline" type="datetime-local" defaultValue={localDateTime(selected.deliveryDeadline)} disabled={selected.status === "published"} required /></label>

              <div className="sm:col-span-2 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                {selected.status !== "published" ? <button type="submit" disabled={busy !== null} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy === "save" ? "Saving…" : "Save changes"}</button> : null}
                {selected.status === "draft" ? <button type="button" onClick={() => void transition("submit_review")} disabled={busy !== null || dirty} className="rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50">{busy === "submit_review" ? "Moving…" : "Move to review"}</button> : null}
                {selected.status === "review" ? <button type="button" onClick={() => void transition("return_draft")} disabled={busy !== null || dirty} className="rounded-xl border border-violet-300/30 px-4 py-2.5 text-sm font-semibold text-violet-200 disabled:opacity-50">Return to draft</button> : null}
                {selected.status === "review" ? <button type="button" onClick={() => void transition("publish")} disabled={busy !== null || dirty} className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50">{busy === "publish" ? "Publishing…" : "Publish mission"}</button> : null}
                {dirty ? <span className="self-center text-xs text-amber-300">Save changes before changing status.</span> : null}
              </div>
            </form>
          ) : null}
        </div>
      ) : null}

      {notice ? <p role={notice.tone === "error" ? "alert" : "status"} className={`mt-4 rounded-xl border px-4 py-3 text-sm ${notice.tone === "success" ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200" : "border-rose-400/20 bg-rose-400/[0.07] text-rose-200"}`}>{notice.message}</p> : null}
    </section>
  );
}
