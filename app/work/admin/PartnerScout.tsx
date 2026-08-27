"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { ScoutSignal } from "@/lib/ascend-work/partner-scout";

export default function PartnerScout({ initialSignals, initialConfigured }: { initialSignals: ScoutSignal[]; initialConfigured: boolean }) {
  const [signals, setSignals] = useState(initialSignals);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [configured, setConfigured] = useState(initialConfigured);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const visible = useMemo(() => signals.filter((signal) => signal.status !== "dismissed" && signal.status !== "promoted"), [signals]);
  const legacyCount = visible.filter((signal) => signal.precisionVersion < 5).length;
  const selected = visible.find((signal) => signal.id === selectedId) ?? visible[0] ?? null;

  const load = useCallback(async () => {
    const response = await fetch("/api/work/admin/scout", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json() as { signals: ScoutSignal[]; configured: boolean };
    setSignals(data.signals); setConfigured(data.configured);
  }, []);
  useEffect(() => {
    const firstRefresh = window.setTimeout(() => void load(), 0);
    const timer = window.setInterval(() => void load(), 30_000);
    return () => {
      window.clearTimeout(firstRefresh);
      window.clearInterval(timer);
    };
  }, [load]);
  async function run() {
    setBusy("run"); setNotice("");
    const response = await fetch("/api/work/admin/scout", { method: "POST" });
    const data = await response.json().catch(() => null) as { error?: string; run?: { inserted: number } } | null;
    setNotice(response.ok ? `Consensus sourcing completed. ${data?.run?.inserted ?? 0} new signals were added.` : data?.error ?? "Consensus sourcing failed.");
    await load(); setBusy("");
  }
  async function setStatus(status: "reviewing" | "dismissed") {
    if (!selected) return; setBusy(status);
    await fetch("/api/work/admin/scout", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "status", id: selected.id, status }) });
    await load(); setBusy("");
  }
  async function archiveLegacy() {
    if (!window.confirm(`Archive ${legacyCount} pre-consensus signals?`)) return;
    setBusy("archive");
    const response = await fetch("/api/work/admin/scout", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "archiveLegacy" }) });
    const data = await response.json().catch(() => null) as { archived?: number; error?: string } | null;
    setNotice(response.ok ? `${data?.archived ?? 0} older signals archived.` : data?.error ?? "Older signals could not be archived.");
    await load(); setBusy("");
  }
  async function promote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected) return; setBusy("promote"); setNotice("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/work/admin/scout", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "promote", id: selected.id, contactName: form.get("contactName"), contactEmail: form.get("contactEmail"), contactRole: form.get("contactRole") || undefined }) });
    const data = await response.json().catch(() => null) as { error?: string } | null;
    setNotice(response.ok ? "Verified contact promoted into the Organisation Pipeline." : data?.error ?? "Promotion failed.");
    await load(); setBusy("");
  }

  return <section className="rounded-2xl border border-violet-400/15 bg-violet-400/[0.025] p-5 sm:p-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-300">Dual-source acquisition</p><h2 className="mt-1 text-xl font-black text-white">ASCEND Partner Scout</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Tavily and Brave must independently confirm the same official domain. ASCEND then verifies recent organisation-owned evidence, a specific need and an official contact path.</p></div><button type="button" disabled={busy !== "" || !configured} onClick={() => void run()} className="rounded-xl bg-violet-400 px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-50">{busy === "run" ? "Running consensus checks…" : "Run consensus sourcing"}</button></div>
    {legacyCount > 0 && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3"><p className="text-sm text-amber-100">{legacyCount} signals predate dual-source consensus.</p><button type="button" disabled={busy !== ""} onClick={() => void archiveLegacy()} className="rounded-lg border border-amber-300/30 px-3 py-2 text-xs font-bold text-amber-100">{busy === "archive" ? "Archiving…" : "Archive older results"}</button></div>}
    {!configured && <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.07] px-4 py-3 text-sm text-amber-200">Add both TAVILY_API_KEY and BRAVE_SEARCH_API_KEY to Vercel to activate consensus sourcing.</p>}
    {notice && <p role="status" className="mt-4 rounded-xl border border-cyan-400/20 px-4 py-3 text-sm text-cyan-200">{notice}</p>}
    {visible.length === 0 ? <p className="mt-5 rounded-xl border border-white/10 p-5 text-sm text-slate-400">No cross-source-qualified organisation signals yet.</p> : <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="grid content-start gap-2">{visible.map((signal) => <button key={signal.id} onClick={() => setSelectedId(signal.id)} className={`rounded-xl border p-4 text-left ${selected?.id === signal.id ? "border-violet-400/40 bg-violet-400/[0.08]" : "border-white/10 bg-slate-950/40"}`}><span className="text-xs font-bold uppercase text-violet-300">{signal.confidence}% confidence</span><p className="mt-1 font-bold text-white">{signal.organizationName}</p><p className="mt-1 text-xs text-slate-500">{signal.precisionVersion < 5 ? "Pre-consensus signal" : `Source ${signal.sourceQuality}% · Need fit ${signal.opportunityFit}%`}</p></button>)}</div>
      {selected && <article className="rounded-xl border border-white/10 bg-slate-950/45 p-5">
        <div className="flex flex-wrap items-center gap-2"><h3 className="text-xl font-black text-white">{selected.organizationName}</h3>{selected.ownershipVerified && <span className="rounded-full border border-cyan-400/25 bg-cyan-400/[0.08] px-3 py-1 text-xs font-bold text-cyan-200">Official organisation</span>}{selected.crossSourceVerified && <span className="rounded-full border border-violet-400/25 bg-violet-400/[0.08] px-3 py-1 text-xs font-bold text-violet-200">Tavily + Brave confirmed</span>}{selected.qualificationStatus === "potential_need" && <span className="rounded-full border border-amber-400/25 bg-amber-400/[0.08] px-3 py-1 text-xs font-bold text-amber-200">Potential need</span>}</div>
        <div className="mt-2 flex flex-wrap gap-4"><a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-cyan-300">Open Tavily evidence ↗</a>{selected.confirmationUrl && <a href={selected.confirmationUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-violet-300">Open Brave confirmation ↗</a>}{selected.contactUrl && <a href={selected.contactUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-emerald-300">Open official contact path ↗</a>}</div>
        <div className="mt-4 rounded-xl border border-white/10 p-4"><p className="text-xs font-bold uppercase text-slate-500">Recent demonstrated need</p><p className="mt-2 text-sm leading-6 text-slate-300">{selected.demonstratedNeed || selected.evidence}</p></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-cyan-400/15 p-3"><p className="text-xs uppercase text-slate-500">Official-source quality</p><p className="mt-1 text-lg font-black text-cyan-200">{selected.sourceQuality}%</p></div><div className="rounded-xl border border-emerald-400/15 p-3"><p className="text-xs uppercase text-slate-500">Demonstrated-need fit</p><p className="mt-1 text-lg font-black text-emerald-200">{selected.opportunityFit}%</p></div></div>
        <div className="mt-4 rounded-xl border border-blue-400/15 bg-blue-400/[0.05] p-4"><p className="text-xs font-bold uppercase text-blue-300">Why this organisation surfaced</p><p className="mt-2 text-sm leading-6 text-slate-200">{selected.needSignal}</p></div><div className="mt-4 rounded-xl border border-violet-400/15 bg-violet-400/[0.05] p-4"><p className="text-xs font-bold uppercase text-violet-300">Evidence-matched mission—not confirmed</p><p className="mt-2 text-sm leading-6 text-slate-200">{selected.suggestedMission}</p></div>
        <div className="mt-4 flex flex-wrap gap-2"><button disabled={busy !== ""} onClick={() => void setStatus("reviewing")} className="rounded-lg border border-blue-400/25 px-4 py-2 text-sm font-bold text-blue-200">Mark reviewing</button><button disabled={busy !== ""} onClick={() => void setStatus("dismissed")} className="rounded-lg border border-rose-400/25 px-4 py-2 text-sm font-bold text-rose-200">Dismiss</button></div>
        {selected.precisionVersion >= 5 && selected.ownershipVerified && selected.crossSourceVerified && selected.contactUrl && selected.qualificationStatus === "potential_need" && <form onSubmit={promote} className="mt-6 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-2"><p className="text-sm font-bold text-white sm:col-span-2">Promote only after verifying a named decision-maker</p><input name="contactName" required placeholder="Full contact name" className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white" /><input name="contactEmail" required type="email" placeholder="Organisation-domain email" className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white" /><input name="contactRole" placeholder="Role (optional)" className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white sm:col-span-2" /><button disabled={busy !== ""} className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 sm:w-fit sm:col-span-2">{busy === "promote" ? "Verifying and promoting…" : "Verify contact and add to pipeline"}</button></form>}
      </article>}
    </div>}
  </section>;
}
