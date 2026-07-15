"use client";

export default function NorthStarCard() {
  return (
    <section className="h-60 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0B1220] to-[#111827] p-8">

      <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
        North Star
      </p>

      <h2 className="mt-4 text-3xl font-bold text-white">
        Become a world-class software entrepreneur
      </h2>

      <p className="mt-5 max-w-xl leading-8 text-slate-400">
        Every action inside ASCEND should move you one step closer
        to this vision.
      </p>

      <div className="mt-8 flex items-center gap-4">

        <div className="rounded-xl bg-blue-500/15 px-4 py-2 text-blue-300">
          🎯 Active Vision
        </div>

        <div className="rounded-xl bg-white/5 px-4 py-2 text-slate-300">
          3 Year Goal
        </div>

      </div>

    </section>
  );
}