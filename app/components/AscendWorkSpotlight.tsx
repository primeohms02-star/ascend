import Link from "next/link";
import { ArrowRight, BadgeCheck, Banknote, BriefcaseBusiness, FileCheck2 } from "lucide-react";

const benefits = [
  { icon: BadgeCheck, title: "Reviewed organisations", detail: "Projects are checked before publication." },
  { icon: Banknote, title: "Disclosed payment", detail: "See payment and scope before applying." },
  { icon: FileCheck2, title: "Verified evidence", detail: "Approved work becomes proof of ability." },
];

export default function AscendWorkSpotlight() {
  return (
    <section id="ascend-work" aria-labelledby="work-heading" className="border-t border-white/[0.06] bg-[#05080D] px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-emerald-300/15 bg-gradient-to-br from-emerald-500/[0.08] via-[#09101A] to-cyan-500/[0.06] p-6 sm:p-9 lg:p-11">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
              <BriefcaseBusiness size={16} aria-hidden="true" /> ASCEND Work
            </div>
            <h2 id="work-heading" className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Direction that becomes paid, verified experience.
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-300">
              Paid Missions are short, remote projects from reviewed organisations. Apply through ASCEND, complete the work in a guided workspace and build evidence employers can understand.
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Applications require an active ASCEND subscription or sponsored access. Access does not guarantee selection or income.
            </p>
            <Link href="/ascend-work" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-500">
              Discover ASCEND Work <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>

          <div className="grid gap-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article key={benefit.title} className="flex gap-4 rounded-2xl border border-white/[0.08] bg-slate-950/45 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300"><Icon size={20} aria-hidden="true" /></div>
                  <div><h3 className="font-semibold text-white">{benefit.title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{benefit.detail}</p></div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
