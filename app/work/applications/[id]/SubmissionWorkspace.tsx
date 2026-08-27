"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";

import type { WorkApplicationWorkspace } from "@/lib/ascend-work/types";
import ContextualAtlasLink from "@/app/components/atlas/ContextualAtlasLink";

export default function SubmissionWorkspace({ application }: { application: WorkApplicationWorkspace }) {
  const router = useRouter();
  const submission = application.submission;
  const [responses, setResponses] = useState<Record<string, string>>(submission?.responses ?? {});
  const [studentNote, setStudentNote] = useState(submission?.studentNote ?? "");
  const [busy, setBusy] = useState<"save" | "submit" | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const editable = application.applicationStatus === "accepted" && !!submission && ["draft", "revision_requested"].includes(submission.status);

  async function save(submit: boolean) {
    if (submit && !window.confirm("Submit these deliverables for review? You cannot edit them again unless ASCEND requests a revision.")) return;
    setBusy(submit ? "submit" : "save"); setNotice(null);
    try {
      const response = await fetch("/api/work/submissions", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ applicationId: application.id, responses, studentNote, submit }) });
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error ?? "The submission could not be saved.");
      setNotice({ tone: "success", message: submit ? "Deliverables submitted for ASCEND review." : "Draft saved." });
      router.refresh();
    } catch (error) { setNotice({ tone: "error", message: error instanceof Error ? error.message : "The submission could not be saved." }); }
    finally { setBusy(null); }
  }

  if (!submission || application.applicationStatus !== "accepted") return <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-slate-400">A private delivery workspace is created only after your application is accepted.</p>;
  const atlasContext = `ASCEND Work Paid Mission: ${application.projectTitle}\nOrganisation: ${application.organizationName}\nDelivery deadline: ${application.deliveryDeadline}\nDeliverables:\n${application.deliverables.map((item) => `- ${item}`).join("\n")}\nSubmission status: ${submission.status}`;
  return <form className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.035] p-5 sm:p-6" onSubmit={(event: FormEvent) => { event.preventDefault(); void save(true); }}>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Private workspace</p><h2 className="mt-1 text-xl font-bold text-white">Project deliverables</h2></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-300">{submission.status.replaceAll("_", " ")}</span></div>
    {submission.revisionNote ? <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-200">Revision requested</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-amber-50">{submission.revisionNote}</p></div> : null}
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <Link href="/action" className="inline-flex items-center justify-between gap-3 rounded-xl border border-orange-400/20 bg-orange-400/[0.06] px-4 py-3 text-sm font-semibold text-orange-200">
        <span className="inline-flex items-center gap-2"><Target size={17} aria-hidden="true" />Continue Growth Mission</span><ArrowRight size={15} aria-hidden="true" />
      </Link>
      <ContextualAtlasLink prompt="Help me plan my next step for this Paid Mission without doing or submitting the work for me." context={atlasContext} className="inline-flex items-center justify-between gap-3 rounded-xl border border-blue-400/20 bg-blue-400/[0.06] px-4 py-3 text-left text-sm font-semibold text-blue-200">
        <span>Ask Atlas about this work</span><ArrowRight size={15} aria-hidden="true" />
      </ContextualAtlasLink>
    </div>
    <div className="mt-5 grid gap-5">{application.deliverables.map((deliverable, index) => <label key={deliverable} className="text-sm font-semibold text-slate-200"><span>{index + 1}. {deliverable}</span><textarea disabled={!editable} value={responses[deliverable] ?? ""} onChange={(event) => setResponses((current) => ({ ...current, [deliverable]: event.target.value }))} rows={5} maxLength={5000} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-normal leading-6 text-white outline-none focus:border-cyan-400/40 disabled:opacity-70" placeholder="Add the result, evidence link, or delivery notes for this requirement." /></label>)}</div>
    <label className="mt-5 block text-sm font-semibold text-slate-200">Note to ASCEND reviewer<textarea disabled={!editable} value={studentNote} onChange={(event) => setStudentNote(event.target.value)} rows={3} maxLength={2000} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-normal text-white outline-none focus:border-cyan-400/40 disabled:opacity-70" /></label>
    {editable ? <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => void save(false)} disabled={busy !== null} className="rounded-xl border border-cyan-300/30 px-5 py-3 text-sm font-semibold text-cyan-200 disabled:opacity-50">{busy === "save" ? "Saving…" : "Save draft"}</button><button type="submit" disabled={busy !== null} className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-50">{busy === "submit" ? "Submitting…" : submission.status === "revision_requested" ? "Resubmit for review" : "Submit for review"}</button></div> : <p className="mt-5 text-sm text-slate-400">This submission is locked while ASCEND reviews it.</p>}
    {notice ? <p role={notice.tone === "error" ? "alert" : "status"} className={`mt-4 rounded-xl border px-4 py-3 text-sm ${notice.tone === "success" ? "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-200" : "border-rose-400/20 bg-rose-400/[0.06] text-rose-200"}`}>{notice.message}</p> : null}
  </form>;
}
