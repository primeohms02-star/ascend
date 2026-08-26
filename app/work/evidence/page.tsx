import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck, CheckCircle2 } from "lucide-react";

import AppShell from "@/app/components/navigation/AppShell";
import { listUserVerifiedWork } from "@/lib/ascend-work/service";
import WorkNavigationLink from "../WorkNavigationLink";

function verifiedDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "long" }).format(new Date(value));
}

export default async function VerifiedWorkPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const evidence = await listUserVerifiedWork(userId);

  return (
    <AppShell>
      <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#07121f] to-[#0f172a]">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-10">
          <WorkNavigationLink href="/work" replace className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white">
            <ArrowLeft size={16} aria-hidden="true" />Back to ASCEND Work
          </WorkNavigationLink>

          <header className="mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.05] p-6 sm:p-8">
            <BadgeCheck className="text-emerald-300" size={28} aria-hidden="true" />
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">Verified Work</p>
            <h1 className="mt-1 text-3xl font-black text-white sm:text-4xl">Evidence of work you completed</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              Approved Paid Mission outcomes become verified evidence of your skills and delivery. Only you can view this private record here.
            </p>
          </header>

          <section className="mt-6 grid gap-5" aria-label="Verified work records">
            {evidence.length ? evidence.map((record) => (
              <article key={record.id} className="rounded-2xl border border-emerald-400/15 bg-white/[0.035] p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-300">Verified by ASCEND</p>
                    <h2 className="mt-2 text-xl font-bold leading-8 text-white">{record.title}</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-300">{record.organizationName}</p>
                  </div>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-xs font-semibold text-emerald-200">
                    {verifiedDate(record.verifiedAt)}
                  </span>
                </div>

                <p className="mt-5 text-sm leading-7 text-slate-300">{record.summary}</p>

                {record.skills.length ? (
                  <div className="mt-5">
                    <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Verified skills</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {record.skills.map((skill) => <span key={skill} className="rounded-full border border-blue-400/20 bg-blue-400/[0.06] px-3 py-1.5 text-xs font-semibold text-blue-200">{skill}</span>)}
                    </div>
                  </div>
                ) : null}

                <div className="mt-5 border-t border-white/10 pt-5">
                  <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Approved deliverables</h3>
                  <div className="mt-3 grid gap-4">
                    {Object.entries(record.deliverables).map(([deliverable, response]) => (
                      <div key={deliverable} className="rounded-xl border border-white/10 bg-slate-950/35 p-4">
                        <p className="flex gap-2 text-sm font-semibold leading-6 text-white"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={17} aria-hidden="true" />{deliverable}</p>
                        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-400">{response}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            )) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <h2 className="font-semibold text-white">No verified work yet</h2>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">Approved Paid Mission submissions will appear here as evidence of your completed work.</p>
                <Link href="/work/applications" className="mt-4 inline-flex text-sm font-semibold text-cyan-300">View your applications</Link>
              </div>
            )}
          </section>
        </div>
      </main>
    </AppShell>
  );
}
