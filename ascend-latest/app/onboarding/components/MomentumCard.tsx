"use client";

export default function MomentumCard() {
  return (
    <section className="h-52 rounded-3xl border border-white/10 bg-white/5 p-8">

      <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
        Momentum
      </p>

      <div className="mt-6 flex items-end justify-between">

        <div>
          <h2 className="text-5xl font-black text-white">
            27
          </h2>

          <p className="mt-2 text-slate-400">
            Day Streak
          </p>
        </div>

        <div className="rounded-2xl bg-green-500/10 px-4 py-2 text-green-400">
          +12%
        </div>

      </div>

      <div className="mt-8">

        <div className="mb-2 flex justify-between text-sm text-slate-400">
          <span>Progress to next milestone</span>
          <span>82%</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/10">

          <div
            className="h-full rounded-full bg-blue-500"
            style={{ width: "82%" }}
          />

        </div>

      </div>

    </section>
  );
}