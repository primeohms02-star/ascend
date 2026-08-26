"use client";

import { FormEvent, useState } from "react";

import type { PaidMissionAdmin } from "@/lib/ascend-work/types";

import MissionManagement from "./MissionManagement";

type Notice = { tone: "success" | "error"; message: string } | null;

const fieldClass = "mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40";
const labelClass = "text-xs font-semibold text-slate-300";
const cardClass = "rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok) throw new Error(payload?.error ?? "The request could not be completed.");
  if (!payload) throw new Error("The server returned an empty response.");
  return payload;
}

function NoticeBox({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return (
    <p role={notice.tone === "error" ? "alert" : "status"} className={`mt-4 rounded-xl border px-4 py-3 text-sm ${notice.tone === "success" ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200" : "border-rose-400/20 bg-rose-400/[0.07] text-rose-200"}`}>
      {notice.message}
    </p>
  );
}

export default function WorkAdminConsole({ initialProjects }: { initialProjects: PaidMissionAdmin[] }) {
  const [organizationId, setOrganizationId] = useState("");
  const [organizationNotice, setOrganizationNotice] = useState<Notice>(null);
  const [projectNotice, setProjectNotice] = useState<Notice>(null);
  const [accessNotice, setAccessNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function createOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("organization");
    setOrganizationNotice(null);
    const form = new FormData(event.currentTarget);
    try {
      const result = await postJson<{ organization: { id: string; name: string; verification_status: string } }>("/api/work/admin/organizations", {
        name: form.get("name"),
        website: form.get("website") || undefined,
        contactName: form.get("contactName") || undefined,
        contactEmail: form.get("contactEmail") || undefined,
        verificationStatus: form.get("verificationStatus"),
        verificationNotes: form.get("verificationNotes") || undefined,
      });
      setOrganizationId(result.organization.id);
      setOrganizationNotice({ tone: "success", message: `${result.organization.name} created. Its ID has been added to the draft form below.` });
    } catch (error) {
      setOrganizationNotice({ tone: "error", message: error instanceof Error ? error.message : "Organisation could not be created." });
    } finally {
      setBusy(null);
    }
  }

  async function createDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("project");
    setProjectNotice(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const skills = String(form.get("requiredSkills") ?? "").split(",").map((value) => value.trim()).filter(Boolean);
    const deliverables = String(form.get("deliverables") ?? "").split("\n").map((value) => value.trim()).filter(Boolean);
    try {
      const result = await postJson<{ project: { id: string; title: string; status: string } }>("/api/work/admin/projects", {
        organizationId: form.get("organizationId"),
        title: form.get("title"),
        summary: form.get("summary"),
        description: form.get("description"),
        category: form.get("category"),
        requiredSkills: skills,
        deliverables,
        paymentAmountMinor: Math.round(Number(form.get("paymentAmount")) * 100),
        currency: String(form.get("currency") ?? "NGN").toUpperCase(),
        estimatedHours: Number(form.get("estimatedHours")),
        availableSlots: Number(form.get("availableSlots")),
        applicationDeadline: new Date(String(form.get("applicationDeadline"))).toISOString(),
        deliveryDeadline: new Date(String(form.get("deliveryDeadline"))).toISOString(),
        status: "draft",
      });
      formElement.reset();
      setProjectNotice({ tone: "success", message: `Draft “${result.project.title}” created. It is not visible to students.` });
    } catch (error) {
      setProjectNotice({ tone: "error", message: error instanceof Error ? error.message : "Draft could not be created." });
    } finally {
      setBusy(null);
    }
  }

  async function grantAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("access");
    setAccessNotice(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const result = await postJson<{ grant: { user_id: string; source: string } }>("/api/work/admin/access", {
        userId: form.get("userId"),
        source: form.get("source"),
        sponsorName: form.get("sponsorName") || undefined,
        endsAt: form.get("endsAt") ? new Date(String(form.get("endsAt"))).toISOString() : undefined,
      });
      formElement.reset();
      setAccessNotice({ tone: "success", message: `Access granted to ${result.grant.user_id} through ${result.grant.source}.` });
    } catch (error) {
      setAccessNotice({ tone: "error", message: error instanceof Error ? error.message : "Access could not be granted." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-8 grid gap-5">
      <MissionManagement initialProjects={initialProjects} />
      <section className={cardClass} aria-labelledby="organization-heading">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Step 1</p>
        <h2 id="organization-heading" className="mt-1 text-xl font-bold text-white">Create the organisation</h2>
        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={createOrganization}>
          <label className={labelClass}>Organisation name<input className={fieldClass} name="name" minLength={2} maxLength={140} required /></label>
          <label className={labelClass}>Website<input className={fieldClass} name="website" type="url" placeholder="https://…" /></label>
          <label className={labelClass}>Contact name<input className={fieldClass} name="contactName" maxLength={140} /></label>
          <label className={labelClass}>Contact email<input className={fieldClass} name="contactEmail" type="email" /></label>
          <label className={labelClass}>Verification status<select className={fieldClass} name="verificationStatus" defaultValue="pending"><option value="pending">Pending review</option><option value="verified">Verified</option></select></label>
          <label className={`${labelClass} sm:col-span-2`}>Verification notes<textarea className={fieldClass} name="verificationNotes" rows={3} maxLength={2000} /></label>
          <button className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-50 sm:w-fit" disabled={busy !== null} type="submit">{busy === "organization" ? "Creating…" : "Create organisation"}</button>
        </form>
        <NoticeBox notice={organizationNotice} />
      </section>

      <section className={cardClass} aria-labelledby="draft-heading">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">Step 2</p>
        <h2 id="draft-heading" className="mt-1 text-xl font-bold text-white">Prepare a private draft mission</h2>
        <p className="mt-2 text-sm text-slate-500">This form always creates a draft. Publishing requires a separate reviewed workflow.</p>
        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={createDraft}>
          <label className={`${labelClass} sm:col-span-2`}>Organisation ID<input className={fieldClass} name="organizationId" value={organizationId} onChange={(event) => setOrganizationId(event.target.value)} required /></label>
          <label className={labelClass}>Mission title<input className={fieldClass} name="title" minLength={4} maxLength={100} required /></label>
          <label className={labelClass}>Category<input className={fieldClass} name="category" minLength={2} maxLength={80} required /></label>
          <label className={`${labelClass} sm:col-span-2`}>Short summary<textarea className={fieldClass} name="summary" minLength={20} maxLength={320} rows={2} required /></label>
          <label className={`${labelClass} sm:col-span-2`}>Full description<textarea className={fieldClass} name="description" minLength={40} maxLength={5000} rows={5} required /></label>
          <label className={labelClass}>Required skills, comma separated<input className={fieldClass} name="requiredSkills" placeholder="Research, Writing, Excel" /></label>
          <label className={labelClass}>Deliverables, one per line<textarea className={fieldClass} name="deliverables" rows={3} required /></label>
          <label className={labelClass}>Advertised payment<input className={fieldClass} name="paymentAmount" type="number" min="1" step="0.01" required /></label>
          <label className={labelClass}>Currency<input className={fieldClass} name="currency" defaultValue="NGN" pattern="[A-Za-z]{3}" maxLength={3} required /></label>
          <label className={labelClass}>Estimated hours<input className={fieldClass} name="estimatedHours" type="number" min="1" max="160" required /></label>
          <label className={labelClass}>Available slots<input className={fieldClass} name="availableSlots" type="number" min="1" max="100" defaultValue="1" required /></label>
          <label className={labelClass}>Application deadline<input className={fieldClass} name="applicationDeadline" type="datetime-local" required /></label>
          <label className={labelClass}>Delivery deadline<input className={fieldClass} name="deliveryDeadline" type="datetime-local" required /></label>
          <button className="rounded-xl bg-violet-400 px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-50 sm:w-fit" disabled={busy !== null} type="submit">{busy === "project" ? "Saving…" : "Save private draft"}</button>
        </form>
        <NoticeBox notice={projectNotice} />
      </section>

      <section className={cardClass} aria-labelledby="access-heading">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">Controlled access</p>
        <h2 id="access-heading" className="mt-1 text-xl font-bold text-white">Grant pilot or sponsored access</h2>
        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={grantAccess}>
          <label className={labelClass}>Clerk user ID<input className={fieldClass} name="userId" minLength={3} maxLength={200} required /></label>
          <label className={labelClass}>Access source<select className={fieldClass} name="source" defaultValue="pilot"><option value="pilot">Pilot</option><option value="individual">Individual subscription</option><option value="university">University</option><option value="corporate">Corporate</option><option value="foundation">Foundation</option></select></label>
          <label className={labelClass}>Sponsor name<input className={fieldClass} name="sponsorName" maxLength={180} /></label>
          <label className={labelClass}>Access ends (optional)<input className={fieldClass} name="endsAt" type="datetime-local" /></label>
          <button className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-50 sm:w-fit" disabled={busy !== null} type="submit">{busy === "access" ? "Granting…" : "Grant access"}</button>
        </form>
        <NoticeBox notice={accessNotice} />
      </section>
    </div>
  );
}
