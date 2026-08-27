"use client";

import { FormEvent, useState } from "react";

const field = "mt-2 w-full rounded-xl border border-white/10 bg-slate-950/75 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50";
const label = "text-sm font-semibold text-slate-200";

export default function PartnerIntakeForm() {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice(null); const formElement = event.currentTarget; const form = new FormData(formElement);
    const body = Object.fromEntries(form.entries());
    const response = await fetch("/api/work/partners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, fundingConfirmed: form.get("fundingConfirmed") === "on", termsAccepted: form.get("termsAccepted") === "on" }) });
    const result = await response.json().catch(() => null) as { error?: string; reference?: string } | null;
    if (response.ok) { formElement.reset(); setNotice({ ok: true, text: `Your Paid Mission proposal has been received. Reference: ${result?.reference}. ASCEND will review it before anything is shown to students.` }); }
    else setNotice({ ok: false, text: result?.error ?? "Your proposal could not be submitted." });
    setBusy(false);
  }
  return (
    <form id="submit-mission" onSubmit={submit} className="grid gap-5 rounded-3xl border border-cyan-400/15 bg-cyan-400/[0.035] p-6 sm:grid-cols-2 sm:p-8">
      <div className="sm:col-span-2"><p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Founding Organisation Pilot</p><h2 className="mt-2 text-3xl font-black text-white">Propose a Paid Mission</h2><p className="mt-3 text-sm leading-6 text-slate-400">A proposal is private until ASCEND verifies your organisation, scope, payment and deliverables.</p></div>
      <label className={label}>Organisation name<input className={field} name="organizationName" required minLength={2} maxLength={140} /></label>
      <label className={label}>Website<input className={field} name="website" type="url" placeholder="https://…" /></label>
      <label className={label}>Contact name<input className={field} name="contactName" required /></label>
      <label className={label}>Work email<input className={field} name="contactEmail" type="email" required /></label>
      <label className={label}>Your role<input className={field} name="contactRole" placeholder="Founder, Operations Lead…" /></label>
      <label className={label}>Organisation type<select className={field} name="organizationType" required defaultValue=""><option value="" disabled>Select one</option><option value="startup">Startup</option><option value="small_business">Small business</option><option value="agency">Agency</option><option value="ngo">NGO or social enterprise</option><option value="university">University</option><option value="research">Research organisation</option><option value="corporate">Corporate organisation</option><option value="other">Other</option></select></label>
      <label className={label}>Task category<select className={field} name="taskCategory" required defaultValue=""><option value="" disabled>Select one</option><option value="research">Research</option><option value="data">Data</option><option value="content">Content</option><option value="design">Design</option><option value="marketing">Marketing</option><option value="technology">Technology</option><option value="operations">Operations</option><option value="other">Other</option></select></label>
      <label className={label}>Estimated work<select className={field} name="estimatedHours" required defaultValue="not-sure"><option value="5-10">5–10 hours</option><option value="10-20">10–20 hours</option><option value="20-40">20–40 hours</option><option value="not-sure">Not sure yet</option></select></label>
      <label className={`${label} sm:col-span-2`}>What needs to be done?<textarea className={field} name="taskSummary" required minLength={40} maxLength={2000} rows={5} placeholder="Describe the problem, task and expected outcome." /></label>
      <label className={`${label} sm:col-span-2`}>Expected deliverables<textarea className={field} name="expectedDeliverables" maxLength={2000} rows={3} placeholder="One deliverable per line" /></label>
      <label className={label}>Proposed budget<select className={field} name="budgetRange" required defaultValue="needs-guidance"><option value="15000-30000">₦15,000–₦30,000</option><option value="30000-50000">₦30,000–₦50,000</option><option value="50000-75000">₦50,000–₦75,000</option><option value="75000-plus">₦75,000+</option><option value="needs-guidance">I need pricing guidance</option></select></label>
      <label className={label}>Preferred start date<input className={field} name="preferredStartDate" type="date" /></label>
      <label className={`${label} sm:col-span-2`}>Preferred student profile<input className={field} name="studentAudience" placeholder="Skills, field of study or experience—only where genuinely required" /></label>
      <label className="hidden" aria-hidden="true">Leave empty<input name="websiteField" tabIndex={-1} autoComplete="off" /></label>
      <label className="flex gap-3 text-sm leading-6 text-slate-300 sm:col-span-2"><input name="fundingConfirmed" type="checkbox" className="mt-1 h-4 w-4" />Funding is already available for this mission.</label>
      <label className="flex gap-3 text-sm leading-6 text-slate-300 sm:col-span-2"><input name="termsAccepted" type="checkbox" required className="mt-1 h-4 w-4" />I confirm this is legitimate paid work, involves no application or recruitment fees, and may be published only after ASCEND review.</label>
      <button disabled={busy} className="rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-black text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50 sm:w-fit" type="submit">{busy ? "Submitting…" : "Submit Paid Mission"}</button>
      {notice && <p role={notice.ok ? "status" : "alert"} className={`rounded-xl border px-4 py-3 text-sm sm:col-span-2 ${notice.ok ? "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-200" : "border-rose-400/25 bg-rose-400/[0.08] text-rose-200"}`}>{notice.text}</p>}
    </form>
  );
}
