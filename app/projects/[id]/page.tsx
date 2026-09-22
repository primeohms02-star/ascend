import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Bot, CheckCircle2, FileCheck2, ShieldCheck, Trophy } from "lucide-react";

import AppShell from "@/app/components/navigation/AppShell";
import { formatProjectDate, formatProjectDuration, formatRewardAmount, projectDifficultyLabel, projectTypeLabel } from "@/lib/projects/presentation";
import { getPublishedProject } from "@/lib/projects/service";
import JoinProjectButton from "./JoinProjectButton";

type ProjectDetail = {
  id:string; project_type:"practice"|"reward"; difficulty:"beginner"|"intermediate"|"advanced"; category:string; title:string; summary:string; brief:string;
  deliverables:string[]; ai_policy:string; ai_policy_detail:string|null; usage_terms:string; estimated_minutes:number; submission_deadline:string; feedback_level:string;
};
type ProjectReward = { amount_minor:number|null; currency:string|null; non_cash_description:string|null; recipient_count:number; funding_status:string };
type ProjectCriterion = { id:string; title:string; description:string; weight:number };
type ProjectParticipation = { status:string };

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth(); if (!userId) redirect("/sign-in");
  const { id } = await params;
  const result = await getPublishedProject(id, userId).catch(() => null);
  if (!result) notFound();
  const project = result.project as unknown as ProjectDetail;
  const reward = result.reward as ProjectReward | null;
  const amount = reward ? formatRewardAmount(Number(reward.amount_minor), reward.currency) : null;

  return <AppShell><main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a]"><div className="mx-auto max-w-6xl px-5 py-7 sm:px-6 sm:py-9">
    <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16}/>Back to Projects</Link>
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
      <article>
        <div className="flex flex-wrap gap-2"><span className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-3 py-1 text-xs font-semibold text-cyan-200">{projectTypeLabel(project.project_type)}</span><span className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-slate-300">{projectDifficultyLabel(project.difficulty)}</span><span className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-slate-300">{project.category}</span></div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">{project.title}</h1><p className="mt-3 text-base leading-7 text-slate-300">{project.summary}</p>
        <section className="mt-7 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"><h2 className="text-lg font-semibold text-white">The brief</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-400">{project.brief}</p></section>
        <section className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"><h2 className="flex items-center gap-2 text-lg font-semibold text-white"><FileCheck2 size={19} className="text-cyan-300"/>What you will deliver</h2><ul className="mt-4 space-y-3">{(project.deliverables as string[]).map((item)=><li key={item} className="flex gap-3 text-sm leading-6 text-slate-300"><CheckCircle2 size={17} className="mt-1 shrink-0 text-cyan-300"/>{item}</li>)}</ul></section>
        <section className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"><h2 className="text-lg font-semibold text-white">How your work is evaluated</h2><div className="mt-4 space-y-3">{(result.criteria as ProjectCriterion[]).map((criterion)=><div key={criterion.id} className="rounded-xl bg-white/[0.035] p-3"><div className="flex justify-between gap-3"><p className="text-sm font-semibold text-white">{criterion.title}</p><span className="text-xs font-semibold text-cyan-300">{criterion.weight}%</span></div>{criterion.description&&<p className="mt-1 text-xs leading-5 text-slate-500">{criterion.description}</p>}</div>)}</div></section>
        <section className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"><Bot size={19} className="text-violet-300"/><h2 className="mt-3 text-sm font-semibold text-white">AI use</h2><p className="mt-1 text-xs leading-5 text-slate-500">{String(project.ai_policy).replace("_"," ")} — {project.ai_policy_detail || "Follow the brief and be transparent about assistance."}</p></div><div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"><ShieldCheck size={19} className="text-emerald-300"/><h2 className="mt-3 text-sm font-semibold text-white">Your rights</h2><p className="mt-1 text-xs leading-5 text-slate-500">{project.usage_terms}</p></div></section>
      </article>
      <aside className="lg:sticky lg:top-6 lg:self-start"><div className="rounded-2xl border border-cyan-300/15 bg-[#081525] p-5 shadow-xl"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Project overview</p><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-3"><span className="text-slate-500">Time</span><span className="font-medium text-white">{formatProjectDuration(project.estimated_minutes)}</span></div><div className="flex justify-between gap-3"><span className="text-slate-500">Deadline</span><span className="font-medium text-white">{formatProjectDate(project.submission_deadline)}</span></div><div className="flex justify-between gap-3"><span className="text-slate-500">Feedback</span><span className="font-medium capitalize text-white">{String(project.feedback_level).replace("_"," ")}</span></div>{reward&&<div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.06] p-3"><Trophy size={17} className="text-amber-300"/><p className="mt-2 text-sm font-semibold text-white">{amount || reward.non_cash_description}</p><p className="mt-1 text-xs text-amber-100/60">{reward.recipient_count} recipient{reward.recipient_count===1?"":"s"} · funding {reward.funding_status}</p></div>}</div><div className="mt-5"><JoinProjectButton projectId={id} existingStatus={(result.participation as ProjectParticipation|null)?.status}/></div><p className="mt-3 text-center text-[11px] leading-5 text-slate-500">Joining does not guarantee a reward. Review every term before you begin.</p></div>
      <Link href={`/atlas?project=${id}`} className="mt-3 flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 text-sm text-slate-300"><span>Ask Atlas about this Project</span><Bot size={17} className="text-violet-300"/></Link></aside>
    </div>
  </div></main></AppShell>;
}
