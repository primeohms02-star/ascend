import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { evidenceLabel } from "@/lib/projects/presentation";
export const dynamic="force-dynamic";
export const metadata={title:"Shared Project | ASCEND",robots:{index:false,follow:false},referrer:"no-referrer" as const};
export default async function SharedProject({params}:{params:Promise<{token:string}>}) {
  const {token}=await params;
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token))notFound();
  const {data,error}=await supabaseAdmin.from("ascend_project_evidence").select("title,summary,skills,deliverable_preview,evidence_status,verified_by").eq("share_token",token).eq("visibility","shareable").maybeSingle();
  if(error)throw new Error("Portfolio unavailable");
  if(!data)notFound();
  return <main className="min-h-screen bg-[#020617] px-6 py-12 text-slate-200"><article className="mx-auto max-w-3xl"><Link href="/" className="text-sm font-semibold tracking-widest text-cyan-300">ASCEND</Link><p className="mt-8 text-xs uppercase tracking-widest text-emerald-300">Independent learning project · {evidenceLabel(data.evidence_status,data.verified_by)}</p><h1 className="mt-3 text-3xl font-bold text-white">{data.title}</h1><p className="mt-4 whitespace-pre-wrap leading-7">{data.summary}</p><p className="mt-4 text-sm text-slate-400">Skills practised: {(data.skills as string[]).join(", ")}</p><div className="mt-8 space-y-4">{Object.entries(data.deliverable_preview as Record<string,string>).map(([title,text])=><section key={title} className="rounded-2xl border border-white/10 p-5"><h2 className="font-semibold text-cyan-200">{title}</h2><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7">{text}</p></section>)}</div><p className="mt-8 text-xs leading-6 text-slate-500">Shared by the participant. Completion is not employment, professional certification or a guarantee of skill. AI coaching is not human review. This page does not verify the participant’s legal identity or ownership of linked material.</p></article></main>;
}
