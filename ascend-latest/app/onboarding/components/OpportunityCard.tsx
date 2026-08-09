"use client";

export default function OpportunityCard() {
  return (
    <section className="h-52 rounded-3xl border border-white/10 bg-white/5 p-8">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
            Opportunities
          </p>

          <h2 className="mt-3 text-2xl font-bold text-white">
            Recommended
          </h2>

        </div>

        <span className="rounded-xl bg-blue-500/10 px-3 py-1 text-sm text-blue-300">
          8 New
        </span>

      </div>

      <div className="mt-8 space-y-3">

        <div className="rounded-xl border border-white/5 bg-black/20 p-3">
          <p className="font-medium text-white">
            Google Software Internship
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Deadline in 6 days
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-black/20 p-3">
          <p className="font-medium text-white">
            Mastercard Foundation Scholarship
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Deadline in 14 days
          </p>
        </div>

      </div>

    </section>
  );
}