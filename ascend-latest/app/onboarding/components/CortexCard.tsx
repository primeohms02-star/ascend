"use client";

export default function CortexCard() {
  return (
    <section className="h-52 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0B1220] to-[#111827] p-8">

      <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
        Cortex AI
      </p>

      <h2 className="mt-3 text-2xl font-bold text-white">
        Your AI Mentor
      </h2>

      <p className="mt-4 leading-7 text-slate-400">
        Ask anything about your goals, career, learning,
        productivity or your next step.
      </p>

      <button className="mt-8 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500">
        Ask Cortex →
      </button>

    </section>
  );
}