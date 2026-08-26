import Link from "next/link";
import { BadgeCheck, ArrowRight } from "lucide-react";

import type { WorkVerifiedEvidence } from "@/lib/ascend-work/types";

export default function VerifiedWorkProgressCard({ evidence }: { evidence: WorkVerifiedEvidence[] }) {
  return <section className="mt-4 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">Verified Work</p><h2 className="mt-1 text-xl font-bold text-white">Evidence from Paid Missions</h2><p className="mt-2 text-sm leading-6 text-slate-400">Approved work becomes durable proof of your skills and delivery.</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"><BadgeCheck size={22} /></div></div>
    {evidence.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2">{evidence.slice(0, 2).map((record) => <article key={record.id} className="rounded-xl border border-white/10 bg-slate-950/30 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">Verified</p><h3 className="mt-2 font-semibold leading-6 text-white">{record.title}</h3><p className="mt-1 text-sm text-slate-400">{record.organizationName}</p><p className="mt-3 text-xs text-slate-500">{record.skills.length} verified {record.skills.length === 1 ? "skill" : "skills"}</p></article>)}</div> : <p className="mt-5 rounded-xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-400">Approved Paid Mission work will appear here.</p>}
    <Link href="/work/evidence" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">View all Verified Work <ArrowRight size={15} /></Link>
  </section>;
}
