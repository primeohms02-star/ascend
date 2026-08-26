"use client";

import { useState } from "react";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";

export default function ApplyPaidMissionButton({
  projectId,
  hasAccess,
  alreadyApplied,
}: {
  projectId: string;
  hasAccess: boolean;
  alreadyApplied: boolean;
}) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(alreadyApplied);
  const [error, setError] = useState("");

  if (!hasAccess) {
    return (
      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-5">
        <p className="font-semibold text-amber-200">ASCEND Work access required</p>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Applications require an active ₦3,500 ASCEND subscription or access sponsored by an approved institution or programme. Access does not guarantee selection or income.
        </p>
      </div>
    );
  }

  if (applied) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5 text-emerald-200">
        <CheckCircle2 size={21} aria-hidden="true" />
        <span className="font-semibold">Application submitted</span>
      </div>
    );
  }

  async function submitApplication() {
    if (submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/work/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, coverNote: note }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Application could not be submitted.");
      setApplied(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Application could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-5">
      <label htmlFor="work-cover-note" className="text-sm font-semibold text-white">
        Why are you a good fit? <span className="font-normal text-slate-500">(optional)</span>
      </label>
      <textarea
        id="work-cover-note"
        value={note}
        onChange={(event) => setNote(event.target.value.slice(0, 1200))}
        rows={5}
        className="mt-3 w-full resize-y rounded-xl border border-white/10 bg-slate-950/70 p-3 text-sm leading-6 text-white outline-none transition focus:border-cyan-400/50"
        placeholder="Briefly connect your skills or experience to the project deliverables."
      />
      <div className="mt-2 flex justify-between text-xs text-slate-600"><span>Do not include sensitive personal information.</span><span>{note.length}/1200</span></div>
      <button
        type="button"
        disabled={submitting}
        onClick={() => void submitApplication()}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-55"
      >
        {submitting ? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
        {submitting ? "Submitting..." : "Apply for Paid Mission"}
      </button>
      {error ? <p role="alert" className="mt-3 text-sm leading-6 text-rose-300">{error}</p> : null}
    </div>
  );
}

