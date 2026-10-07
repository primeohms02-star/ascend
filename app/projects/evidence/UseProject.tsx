"use client";
import { useState } from "react";
import ContextualAtlasLink from "@/app/components/atlas/ContextualAtlasLink";
import { buildApplicationMaterial, type ApplicationEvidence } from "@/lib/projects/application-material";
export default function UseProject({ evidence }: { evidence: ApplicationEvidence }) {
  const material = buildApplicationMaterial(evidence);
  const [kind, setKind] = useState<"cv" | "portfolio" | "interview">("cv");
  const [drafts, setDrafts] = useState({cv:material.cv,portfolio:material.portfolio,interview:material.interview});
  const [message, setMessage] = useState("");
  return <details className="mt-4 rounded-xl border border-cyan-300/20 p-4 text-sm text-slate-300">
    <summary className="cursor-pointer font-semibold text-cyan-200">Use this project</summary>
    <p className="mt-3 text-xs leading-5">These editable starter drafts use your saved work. Check every claim, replace bracketed prompts and disclose simulations and AI assistance. Edits here stay on this page until copied or downloaded.</p>
    <label className="mt-3 block">Draft format<select value={kind} onChange={e=>{setKind(e.target.value as typeof kind);setMessage("");}} className="mt-2 block w-full rounded-lg bg-slate-900 p-2"><option value="cv">CV bullet</option><option value="portfolio">Portfolio case study</option><option value="interview">Interview example</option></select></label>
    <label className="mt-3 block">Your editable draft<textarea rows={12} value={drafts[kind]} onChange={e=>setDrafts({...drafts,[kind]:e.target.value})} className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 p-3 text-sm text-white"/></label>
    <div className="mt-3 flex flex-wrap gap-3"><button type="button" className="text-cyan-200 underline" onClick={async()=>{try{await navigator.clipboard.writeText(drafts[kind]);setMessage("Copied.");}catch{setMessage("Select the draft text and copy it manually.");}}}>Copy draft</button>
    <button type="button" className="text-cyan-200 underline" onClick={()=>{const url=URL.createObjectURL(new Blob([drafts[kind]],{type:"text/plain;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=`ascend-${kind}-draft.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}>Download draft</button>
    <ContextualAtlasLink className="text-cyan-200 underline" prompt={`Help me write a truthful ${kind === "cv" ? "CV bullet" : kind === "portfolio" ? "portfolio case study" : "interview example"} from my completed learning project. Ask for missing details; do not invent results or call it employment.`} context={material.atlasContext}>Refine with Atlas</ContextualAtlasLink></div>
    <p className="mt-2 text-xs" role="status">{message}</p><p className="mt-2 text-xs text-slate-500">Atlas receives saved evidence excerpts, not edits in this box. Copy your edited draft if you want to discuss those changes.</p>
  </details>;
}
