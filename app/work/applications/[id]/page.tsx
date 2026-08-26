import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import AppShell from "@/app/components/navigation/AppShell";
import { getUserWorkApplication } from "@/lib/ascend-work/service";
import SubmissionWorkspace from "./SubmissionWorkspace";
import WorkNavigationLink from "../../WorkNavigationLink";

function money(amountMinor: number, currency: string) { return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(amountMinor / 100); }

export default async function WorkApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth(); if (!userId) redirect("/sign-in");
  const application = await getUserWorkApplication(userId, (await params).id); if (!application) notFound();
  return <AppShell><main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#07121f] to-[#0f172a]"><div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-10"><WorkNavigationLink href="/work/applications" replace className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"><ArrowLeft size={16} />Your applications</WorkNavigationLink><header className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Paid Mission</p><h1 className="mt-2 text-3xl font-black text-white">{application.projectTitle}</h1><p className="mt-2 text-sm font-semibold text-slate-300">{application.organizationName}</p></div><span className="rounded-full border border-cyan-400/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-cyan-200">{application.applicationStatus}</span></div><div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-400"><span>Payment: <strong className="text-emerald-200">{money(application.paymentAmountMinor, application.currency)}</strong></span><span>Delivery: {new Intl.DateTimeFormat("en-NG", { dateStyle: "long" }).format(new Date(application.deliveryDeadline))}</span></div></header><div className="mt-5"><SubmissionWorkspace application={application} /></div></div></main></AppShell>;
}
