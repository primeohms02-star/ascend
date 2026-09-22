"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, LoaderCircle, Save, Send, TriangleAlert } from "lucide-react";

type Workspace = {
  project: { id: string; title: string; deliverables: string[]; submission_deadline: string };
  participation: { status: string };
  submission: null | { deliverable_responses: Record<string,string>; participant_note: string; status: string; current_version: number; revision_note: string | null; revision_deadline: string | null; submitted_at: string | null };
  reviews: Array<{ outcome: string; overall_score: number | null; user_feedback: string; created_at: string }>;
  evidence: null | { id: string; evidence_status: string };
};

export default function SubmissionWorkspace({ projectId }: { projectId: string }) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [responses, setResponses] = useState<Record<string,string>>({});
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"draft"|"submit"|null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch(`/api/projects/${projectId}/workspace`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load this workspace.");
    setWorkspace(data); setResponses(data.submission?.deliverable_responses ?? {}); setNote(data.submission?.participant_note ?? "");
  }

  useEffect(() => {
    // Loading remote workspace state is the synchronization performed by this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load().catch((caught)=>setError(caught instanceof Error?caught.message:"Could not load this workspace.")).finally(()=>setLoading(false));
    // The Project ID is the complete identity of this workspace load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);
  const locked = useMemo(()=>workspace ? !["joined","in_progress","revision_requested"].includes(workspace.participation.status) : true,[workspace]);

  async function save(submit: boolean) {
    if (submit && !window.confirm("Submit this version for review? You will only be able to change it if a revision is requested.")) return;
    setSaving(submit?"submit":"draft"); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/projects/${projectId}/submission`, { method: submit?"POST":"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({deliverableResponses:responses,participantNote:note}) });
      const data = await response.json(); if(!response.ok) throw new Error(data.error||"Could not save your work.");
      setMessage(submit?"Your work has been submitted for review.":"Draft saved."); await load();
    } catch(caught){setError(caught instanceof Error?caught.message:"Could not save your work.");} finally{setSaving(null);}
  }

  if(loading)return <div className="flex min-h-[50vh] items-center justify-center text-slate-400"><LoaderCircle className="mr-2 animate-spin"/>Loading workspace…</div>;
  if(!workspace)return <div className="rounded-2xl border border-rose-300/15 bg-rose-400/[0.05] p-6 text-rose-200">{error||"Workspace unavailable."}</div>;
  const revision = workspace.participation.status === "revision_requested";

  return <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
      {revision&&<div className="mb-5 rounded-xl border border-amber-300/20 bg-amber-300/[0.07] p-4"><p className="flex items-center gap-2 text-sm font-semibold text-amber-200"><TriangleAlert size={17}/>Revision requested</p><p className="mt-2 text-sm leading-6 text-amber-50/70">{workspace.submission?.revision_note}</p>{workspace.submission?.revision_deadline&&<p className="mt-2 text-xs text-amber-200/70">Revision due {new Date(workspace.submission.revision_deadline).toLocaleDateString()}</p>}</div>}
      <h2 className="text-lg font-semibold text-white">Your deliverables</h2><p className="mt-1 text-sm text-slate-500">Save as you work. Submit only when every required item is ready.</p>
      <div className="mt-5 space-y-5">{workspace.project.deliverables.map((deliverable,index)=><label key={deliverable} className="block"><span className="text-sm font-semibold text-slate-200">{index+1}. {deliverable}</span><textarea disabled={locked} value={responses[deliverable]??""} onChange={(event)=>setResponses((current)=>({...current,[deliverable]:event.target.value}))} rows={6} placeholder="Add your response, link or delivery notes…" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm leading-6 text-white outline-none focus:border-cyan-400/40 disabled:opacity-60"/></label>)}</div>
      <label className="mt-5 block"><span className="text-sm font-semibold text-slate-200">Note for the reviewer</span><textarea disabled={locked} value={note} onChange={(event)=>setNote(event.target.value)} rows={3} maxLength={5000} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-cyan-400/40 disabled:opacity-60"/></label>
      {error&&<p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}{message&&<p role="status" className="mt-4 flex items-center gap-2 text-sm text-emerald-300"><CheckCircle2 size={16}/>{message}</p>}
      {!locked&&<div className="mt-5 flex flex-col gap-2 sm:flex-row"><button onClick={()=>save(false)} disabled={saving!==null} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white"><Save size={16}/>{saving==="draft"?"Saving…":"Save draft"}</button><button onClick={()=>save(true)} disabled={saving!==null} className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950"><Send size={16}/>{saving==="submit"?"Submitting…":revision?"Submit revision":"Submit for review"}</button></div>}
    </section>
    <aside className="space-y-3"><div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"><p className="text-xs uppercase tracking-[0.15em] text-slate-500">Status</p><p className="mt-2 font-semibold capitalize text-white">{workspace.participation.status.replaceAll("_"," ")}</p>{workspace.submission&&<p className="mt-1 text-xs text-slate-500">Submission version {workspace.submission.current_version}</p>}</div>{workspace.reviews.map((review)=><div key={review.created_at} className="rounded-2xl border border-violet-300/10 bg-violet-300/[0.04] p-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-300">Reviewer feedback</p>{review.overall_score!==null&&<p className="mt-2 text-2xl font-bold text-white">{review.overall_score}%</p>}<p className="mt-2 text-sm leading-6 text-slate-400">{review.user_feedback||"No written feedback was added."}</p></div>)}{workspace.evidence&&<Link href="/projects/evidence" className="block rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.05] p-5 text-sm font-semibold text-emerald-200">View your verified evidence →</Link>}</aside>
  </div>;
}
