"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { WorkPartnerLead } from "@/lib/ascend-work/partners";

export default function MissionAcquisition({ initialPartners }: { initialPartners: WorkPartnerLead[] }) {
  const [partners, setPartners] = useState(initialPartners);
  const [selectedId, setSelectedId] = useState(initialPartners[0]?.id ?? "");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const selected = partners.find((lead) => lead.id === selectedId) ?? null;

  const refresh = useCallback(async () => {
    const response = await fetch("/api/work/admin/partners", { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json() as { partners: WorkPartnerLead[] };
    setPartners(payload.partners);
    setSelectedId((current) => current && payload.partners.some((lead) => lead.id === current) ? current : payload.partners[0]?.id ?? "");
  }, []);

  useEffect(() => {
    const firstRefresh = window.setTimeout(() => void refresh(), 0);
    const timer = window.setInterval(() => void refresh(), 10_000);
    return () => { window.clearTimeout(firstRefresh); window.clearInterval(timer); };
  }, [refresh]);

  async function act(body: Record<string, unknown>) {
    if (!selected) return;
    setBusy(true); setNotice("");
    const response = await fetch("/api/work/admin/partners", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id, ...body }) });
    const payload = await response.json().catch(() => null) as { error?: string; partner?: WorkPartnerLead; projectId?: string } | null;
    if (response.ok && payload?.partner) setPartners((items) => items.map((item) => item.id === payload.partner?.id ? payload.partner : item));
    setNotice(response.ok ? (payload?.projectId ? "Private mission draft created. Review it in Mission Control before publication." : "Acquisition record updated.") : payload?.error ?? "Action failed.");
    if (response.ok) await refresh();
    setBusy(false);
  }

  function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    void act({ action: "confirm", fundingAmountMinor: Math.round(Number(form.get("fundingAmount")) * 100), currency: String(form.get("currency") ?? "NGN").toUpperCase(), estimatedHours: String(form.get("estimatedHours")), expectedDeliverables: String(form.get("expectedDeliverables")) });
  }

  return <section className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.025] p-5 sm:p-6">
    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">Mission acquisition engine</p><h2 className="mt-1 text-xl font-black text-white">From verified need to private mission draft</h2><p className="mt-2 text-sm leading-6 text-slate-400">ASCEND prepares the proposal. A real organisation must confirm the contact, scope, deliverables, deadline and payment before a draft can be created. Publication remains a separate admin decision.</p>
    <select value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setNotice(""); }} className="mt-5 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white">{partners.map((lead) => <option key={lead.id} value={lead.id}>{lead.organizationName} — {lead.stage}</option>)}</select>
    {selected ? <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 p-4">
      {!selected.outreachBody ? <button disabled={busy} onClick={() => void act({ action: "prepare_outreach" })} className="rounded-xl bg-violet-400 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50">Prepare personalised outreach</button> : <div><p className="font-bold text-white">{selected.outreachSubject}</p><pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-6 text-slate-300">{selected.outreachBody}</pre></div>}
      {selected.outreachBody && !selected.fundingConfirmed ? <form onSubmit={confirm} className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2"><input name="fundingAmount" type="number" min="1" step="0.01" required placeholder="Confirmed payment" className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white"/><input name="currency" defaultValue="NGN" pattern="[A-Za-z]{3}" required className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white"/><input name="estimatedHours" type="number" min="5" max="20" required placeholder="5–20 hours" className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white"/><textarea name="expectedDeliverables" required rows={3} placeholder="Confirmed deliverables, one per line" className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white sm:col-span-2"/><label className="flex gap-2 text-xs text-slate-300 sm:col-span-2"><input type="checkbox" required/>I verified all five confirmations directly with the organisation.</label><button disabled={busy} className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 sm:w-fit">Record confirmed funding</button></form> : null}
      {selected.fundingConfirmed && !selected.projectId ? <button disabled={busy} onClick={() => void act({ action: "create_draft" })} className="mt-4 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50">Create private mission draft</button> : null}{selected.projectId ? <p className="mt-4 text-sm font-bold text-emerald-300">Private draft created—not published.</p> : null}
    </div> : <p className="mt-4 text-sm text-slate-400">Promote a verified Partner Scout signal to begin.</p>}{notice ? <p className="mt-4 text-sm text-cyan-200">{notice}</p> : null}
  </section>;
}
