"use client";

import StarterGuidance from "../../StarterGuidance";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { milestoneProgress } from "@/lib/projects/presentation";
import type { CoachingFeedback } from "@/lib/projects/coaching";
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
  const [coaching, setCoaching] = useState<CoachingFeedback|null>(null);
  const [coachingBusy,setCoachingBusy] = useState(false);
  const [finishing,setFinishing] = useState(false);
  const dirty = JSON.stringify(responses)!==JSON.stringify(workspace?.submission?.deliverable_responses??{}) || note!==(workspace?.submission?.participant_note??"");
  const {drafted,next:nextMilestone} = milestoneProgress(workspace?.project.deliverables??[],responses);


  async function load() {
    const response = await fetch(`/api/projects/${projectId}/workspace`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load this workspace.");
    const feedbackResponse = await fetch(`/api/projects/${projectId}/coaching`,{cache:"no-store"}).catch(()=>null);
    const feedbackData = feedbackResponse?.ok ? await feedbackResponse.json().catch(()=>null) : null;
    setCoaching(feedbackData?.feedback??null);
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

  async function askAtlas() {
    setCoachingBusy(true);setError("");
    try {
      const response=await fetch(`/api/projects/${projectId}/coaching`,{method:"POST"});
      const data=await response.json();if(!response.ok)throw new Error(data.error);
      setCoaching(data.feedback??null);
      if(!data.feedback)setMessage("Your draft changed while Atlas was reviewing. Ask again for the latest version.");
    }catch(caught){setError(caught instanceof Error?caught.message:"Atlas is unavailable.");}finally{setCoachingBusy(false);}
  }
  async function finish() {
    if(!window.confirm("Finish this version and save it privately to your portfolio? It will be labelled Completed, not human reviewed. Completed work cannot be edited."))return;
    setFinishing(true);setError("");
    try {
      const response=await fetch(`/api/projects/${projectId}/complete`,{method:"POST"});
      const data=await response.json();if(!response.ok)throw new Error(data.error);
      await load();setMessage("Your completed work is now in your private portfolio.");
    }catch(caught){setError(caught instanceof Error?caught.message:"Could not finish this Project.");}finally{setFinishing(false);}
  }

  if(loading)return <div className="flex min-h-[50vh] items-center justify-center text-slate-400"><LoaderCircle className="mr-2 animate-spin"/>Loading workspace…</div>;
  if(!workspace)return <div className="rounded-2xl border border-rose-300/15 bg-rose-400/[0.05] p-6 text-rose-200">{error||"Workspace unavailable."}</div>;
  const revision = workspace.participation.status === "revision_requested";

  return <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
      {revision&&<div className="mb-5 rounded-xl border border-amber-300/20 bg-amber-300/[0.07] p-4"><p className="flex items-center gap-2 text-sm font-semibold text-amber-200"><TriangleAlert size={17}/>Revision requested</p><p className="mt-2 text-sm leading-6 text-amber-50/70">{workspace.submission?.revision_note}</p>{workspace.submission?.revision_deadline&&<p className="mt-2 text-xs text-amber-200/70">Revision due {new Date(workspace.submission.revision_deadline).toLocaleDateString()}</p>}</div>}
      <h2 className="text-lg font-semibold text-white">{workspace.project.title}</h2>
      <p className="mt-2 text-sm text-cyan-200">{drafted} of {workspace.project.deliverables.length} milestone drafts added</p>
      <p className="mt-1 text-sm text-slate-400">{nextMilestone ? `Next: ${nextMilestone}` : "Review your work and reflect on what you learned."}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">Draft progress tracks responses, not quality. Paste enough of your work for Atlas to give useful feedback; it cannot open links. Keep private information out of your submission.</p>
      <StarterGuidance projectId={projectId}/><div className="mt-5 space-y-5">{workspace.project.deliverables.map((deliverable,index)=><label key={deliverable} className="block"><span className="text-sm font-semibold text-slate-200">{index+1}. {deliverable}</span><textarea disabled={locked || saving!==null || finishing} value={responses[deliverable]??""} onChange={(event)=>setResponses((current)=>({...current,[deliverable]:event.target.value}))} rows={6} placeholder="Add your response, link or delivery notes…" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm leading-6 text-white outline-none focus:border-cyan-400/40 disabled:opacity-60"/></label>)}</div>
      <label className="mt-5 block"><span className="text-sm font-semibold text-slate-200">Reflection: what did you learn, what would you change, and what will you try next?</span><textarea disabled={locked || saving!==null || finishing} value={note} onChange={(event)=>setNote(event.target.value)} rows={3} maxLength={5000} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-cyan-400/40 disabled:opacity-60"/></label>
      {error&&<p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}{message&&<p role="status" className="mt-4 flex items-center gap-2 text-sm text-emerald-300"><CheckCircle2 size={16}/>{message}</p>}
      {!locked&&<div className="mt-5 flex flex-col gap-2 sm:flex-row"><button onClick={()=>save(false)} disabled={saving!==null || coachingBusy || finishing} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white"><Save size={16}/>{saving==="draft"?"Saving…":"Save draft"}</button><button onClick={()=>save(true)} disabled={saving!==null || coachingBusy || finishing} className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950"><Send size={16}/>{saving==="submit"?"Submitting…":revision?"Submit revision":"Request human review"}</button></div>}
      {!locked && <div className="mt-4 border-t border-white/10 pt-4"><button onClick={finish} disabled={dirty || saving!==null || coachingBusy || finishing || revision || drafted!==workspace.project.deliverables.length || note.trim().length<40} className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-40">{finishing?"Finishing…":"Finish and save to portfolio"}</button><p className="mt-2 text-xs leading-5 text-slate-500">Save every milestone and a reflection first. Choose human review above if you want a reviewer to assess this version; that locks it until review. Atlas feedback never counts as human review.</p></div>}
    </section>
    <aside className="space-y-3"><section className="rounded-2xl border border-violet-300/20 bg-violet-300/5 p-5"><h2 className="font-semibold text-violet-200">Atlas coach</h2><p className="mt-2 text-xs leading-5 text-slate-400">AI feedback on the saved text. Check its suggestions against the brief. It does not verify skills or originality.</p><button disabled={dirty || coachingBusy || saving!==null || finishing || !workspace.submission} onClick={askAtlas} className="mt-3 rounded-xl border border-violet-300/30 px-3 py-2 text-sm text-violet-100 disabled:opacity-40">{coachingBusy?"Atlas is reviewing…":"Get draft feedback"}</button>{dirty&&<p className="mt-2 text-xs text-amber-200">Save your changes to get current feedback.</p>}{coaching&&!dirty&&<div className="mt-4 space-y-3 text-sm leading-6 text-slate-300"><h3 className="font-semibold text-white">What is working</h3><ul className="list-disc pl-4">{coaching.strengths.map((text,i)=><li key={i}>{text}</li>)}</ul><h3 className="font-semibold text-white">What to improve</h3><ul className="list-disc pl-4">{coaching.improvements.map((text,i)=><li key={i}>{text}</li>)}</ul><p><strong>Next step: </strong>{coaching.nextStep}</p></div>}</section><div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"><p className="text-xs uppercase tracking-[0.15em] text-slate-500">Status</p><p className="mt-2 font-semibold capitalize text-white">{workspace.participation.status.replaceAll("_"," ")}</p>{workspace.submission&&<p className="mt-1 text-xs text-slate-500">Submission version {workspace.submission.current_version}</p>}</div>{workspace.reviews.map((review)=><div key={review.created_at} className="rounded-2xl border border-violet-300/10 bg-violet-300/[0.04] p-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-300">Reviewer feedback</p>{review.overall_score!==null&&<p className="mt-2 text-2xl font-bold text-white">{review.overall_score}%</p>}<p className="mt-2 text-sm leading-6 text-slate-400">{review.user_feedback||"No written feedback was added."}</p></div>)}{workspace.evidence&&<Link href="/projects/evidence" className="block rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.05] p-5 text-sm font-semibold text-emerald-200">View your portfolio →</Link>}</aside>
  </div>;
}
