import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, ShieldCheck, Users } from "lucide-react";

import PublicPageShell from "@/app/components/PublicPageShell";
import { SITE_URL } from "@/lib/seo";
import PartnerIntakeForm from "./PartnerIntakeForm";

export const metadata: Metadata = {
  title: "Hire Emerging Talent Through Paid Missions | ASCEND Work",
  description: "Submit a short, paid project to ASCEND Work and work with matched emerging talent through a structured, verified delivery process.",
  alternates: { canonical: `${SITE_URL}/for-organisations` },
  openGraph: { title: "ASCEND Work for Organisations", description: "Turn real business needs into paid, structured projects for emerging talent.", url: `${SITE_URL}/for-organisations` },
};

const steps = [
  ["1", "Propose", "Tell ASCEND about the business need, expected outcome, timing and budget."],
  ["2", "Verify and structure", "ASCEND verifies your organisation and helps turn the request into a clear, fair Paid Mission."],
  ["3", "Select", "Matched students apply and your organisation reviews screened candidates."],
  ["4", "Receive verified work", "Delivery, revision and approval happen through ASCEND with a recorded outcome."],
];

export default function ForOrganisationsPage() {
  return (
    <PublicPageShell eyebrow="ASCEND Partner Network" title="Real work completed by emerging talent." description="Give students meaningful paid experience while moving a clearly defined project forward inside a structured, accountable workflow.">
      <section className="grid gap-5 md:grid-cols-3">
        {[ [ShieldCheck, "Controlled quality", "Every organisation, scope, payment and deliverable is reviewed before publication."], [Users, "Matched applicants", "Students apply based on direction, skills and readiness—not an uncontrolled public task board."], [BadgeCheck, "Verified outcomes", "Approved work becomes credible evidence of ability while your organisation receives the agreed deliverables."] ].map(([Icon, title, text]) => { const CardIcon = Icon as typeof ShieldCheck; return <article key={String(title)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6"><CardIcon className="text-cyan-300" aria-hidden="true" /><h2 className="mt-4 text-xl font-bold">{String(title)}</h2><p className="mt-3 text-sm leading-7 text-slate-400">{String(text)}</p></article>; })}
      </section>
      <section className="mt-20"><p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-300">How it works</p><h2 className="mt-3 text-3xl font-black">From business need to completed mission</h2><div className="mt-8 grid gap-4 md:grid-cols-2">{steps.map(([number, title, text]) => <article key={number} className="rounded-2xl border border-white/10 bg-slate-900/60 p-6"><span className="text-sm font-black text-cyan-300">{number}</span><h3 className="mt-2 text-xl font-bold">{title}</h3><p className="mt-2 text-sm leading-7 text-slate-400">{text}</p></article>)}</div></section>
      <section className="my-20 rounded-3xl border border-violet-400/20 bg-violet-400/[0.05] p-7 sm:p-10"><div className="flex items-start gap-4"><BriefcaseBusiness className="mt-1 shrink-0 text-violet-300" aria-hidden="true" /><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Good first missions</p><h2 className="mt-2 text-2xl font-black">Short, measurable and genuinely useful</h2><p className="mt-3 max-w-4xl leading-7 text-slate-400">Market research, data verification, customer insight, content audits, website QA, prospect research, catalogue organisation and carefully scoped creative or technical work are strong starting points.</p><a href="#submit-mission" className="mt-5 inline-flex items-center gap-2 font-bold text-cyan-300">Propose a mission <ArrowRight size={16} aria-hidden="true" /></a></div></div></section>
      <PartnerIntakeForm />
    </PublicPageShell>
  );
}
