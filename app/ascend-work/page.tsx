import Link from "next/link";
import { ArrowRight, BadgeCheck, Banknote, BriefcaseBusiness, Building2, FileCheck2, GraduationCap, ShieldCheck } from "lucide-react";

import PublicPageShell from "@/app/components/PublicPageShell";
import { createPublicPageMetadata, SITE_URL } from "@/lib/seo";

const title = "ASCEND Work — Paid Missions and Verified Experience";
const description = "Discover ASCEND Work: reviewed, paid remote projects that help students and early-career talent build real experience and verified evidence of ability.";

export const metadata = createPublicPageMetadata({
  title,
  description,
  path: "/ascend-work",
  socialImageAlt: "ASCEND Work — paid missions and verified experience",
});

const steps = [
  { number: "01", title: "Discover", detail: "Review published Paid Missions with clear scope, requirements, payment and deadlines." },
  { number: "02", title: "Apply", detail: "Use your ASCEND direction and profile to submit a focused application." },
  { number: "03", title: "Deliver", detail: "If selected, complete the project through a private ASCEND workspace." },
  { number: "04", title: "Prove", detail: "Approved work becomes verified evidence in your ASCEND progress record." },
];

export default function AscendWorkPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "ASCEND Work",
    description,
    url: `${SITE_URL}/ascend-work`,
    provider: { "@type": "Organization", name: "ASCEND", url: SITE_URL },
    audience: { "@type": "Audience", audienceType: "Students and early-career professionals" },
    areaServed: "Worldwide",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <PublicPageShell eyebrow="ASCEND Work · Paid Missions" title="Turn direction into paid, verified experience." description={description}>
        <section className="-mt-6 rounded-[2rem] border border-emerald-300/15 bg-gradient-to-br from-emerald-500/[0.09] via-slate-950/90 to-cyan-500/[0.06] p-7 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-center">
            <div>
              <BriefcaseBusiness size={34} className="text-emerald-300" aria-hidden="true" />
              <h2 className="mt-5 text-3xl font-black text-white">Real work, contained inside ASCEND.</h2>
              <p className="mt-4 max-w-2xl leading-8 text-slate-300">Paid Missions are short remote projects from organisations reviewed by ASCEND. Students and emerging professionals can apply, deliver work in a private workspace and preserve approved outcomes as evidence of ability.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 font-semibold text-white transition hover:bg-emerald-500">Join ASCEND <ArrowRight size={18} aria-hidden="true" /></Link>
                <Link href="/work" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 font-semibold text-slate-200 transition hover:bg-white/[0.08]">Open Paid Missions</Link>
              </div>
            </div>
            <div className="space-y-3">
              {[
                [BadgeCheck, "Reviewed organisations"],
                [Banknote, "Payment disclosed before application"],
                [ShieldCheck, "Private application and delivery workflow"],
                [FileCheck2, "Approved outcomes become verified evidence"],
              ].map(([Icon, label]) => {
                const ItemIcon = Icon as typeof BadgeCheck;
                return <div key={label as string} className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/20 p-4"><ItemIcon size={20} className="text-emerald-300" aria-hidden="true" /><span className="font-medium text-slate-200">{label as string}</span></div>;
              })}
            </div>
          </div>
        </section>

        <section className="mt-20" aria-labelledby="work-flow-heading">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">How It Works</p>
          <h2 id="work-flow-heading" className="mt-4 text-center text-3xl font-black text-white sm:text-4xl">One accountable path from application to evidence.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => <article key={step.number} className="rounded-2xl border border-white/[0.09] bg-white/[0.03] p-5"><p className="text-sm font-bold text-cyan-300">{step.number}</p><h3 className="mt-4 text-xl font-bold text-white">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{step.detail}</p></article>)}
          </div>
        </section>

        <section className="mt-20 grid gap-5 lg:grid-cols-3">
          <article className="rounded-3xl border border-blue-300/15 bg-blue-400/[0.04] p-7"><GraduationCap className="text-blue-300" aria-hidden="true" /><h2 className="mt-5 text-2xl font-bold text-white">For students</h2><p className="mt-3 leading-7 text-slate-400">Move beyond certificates by building reviewed work, practical confidence and evidence you can show.</p></article>
          <article className="rounded-3xl border border-violet-300/15 bg-violet-400/[0.04] p-7"><Building2 className="text-violet-300" aria-hidden="true" /><h2 className="mt-5 text-2xl font-bold text-white">For universities</h2><p className="mt-3 leading-7 text-slate-400">Sponsor access that connects career direction with practical experience and visible student outcomes.</p></article>
          <article className="rounded-3xl border border-emerald-300/15 bg-emerald-400/[0.04] p-7"><BriefcaseBusiness className="text-emerald-300" aria-hidden="true" /><h2 className="mt-5 text-2xl font-bold text-white">For organisations</h2><p className="mt-3 leading-7 text-slate-400">Offer well-scoped projects, review emerging talent and receive useful deliverables through a controlled workflow.</p></article>
        </section>

        <section className="mt-20 rounded-3xl border border-amber-300/15 bg-amber-400/[0.045] p-7 text-center sm:p-9">
          <h2 className="text-2xl font-bold text-white">Clear access. Honest expectations.</h2>
          <p className="mx-auto mt-3 max-w-3xl leading-7 text-slate-400">Users may review the Paid Mission catalogue. Applications require an active ASCEND subscription or university-sponsored access. Access and matching do not guarantee selection, work or income.</p>
        </section>
      </PublicPageShell>
    </>
  );
}
