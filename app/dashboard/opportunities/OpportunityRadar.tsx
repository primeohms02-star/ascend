import { Opportunity } from "@/lib/engine/opportunities";
import Link from "next/link";

type OpportunityRadarProps = {
  opportunities: Opportunity[];
};

export default function OpportunityRadar({
  opportunities,
}: OpportunityRadarProps) {
  if (opportunities.length === 0) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#0B1220] p-5 shadow-2xl">

        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10">

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
            Opportunity Radar
          </p>

          <h2 className="mt-3 text-3xl font-bold text-white">
            No Opportunities Yet
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-300">
            Cortex is still searching for opportunities that match your
            identity, mission and North Star.
          </p>

        </div>

      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#0B1220] p-8 shadow-2xl">

      {/* Ambient Glow */}

      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10">

        <div className="mb-5 flex items-start justify-between">

          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
              Opportunity Radar
            </p>

            <h2 className="mt-3 text-2xl font-bold text-white">
              Top Matches
            </h2>

            <p className="mt-2 text-slate-400">
              Opportunities personally selected by Cortex.
            </p>

          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-2xl">
            🌍
          </div>

        </div>

        <div className="space-y-5">

          {opportunities.slice(0, 3).map((opportunity) => (
            <div
              key={opportunity.id}
              className="rounded-2xl border border-blue-500/10 bg-white/5 p-5 transition duration-300 hover:border-blue-500/30 hover:bg-white/10"
            >

              <div className="flex items-start justify-between">

                <div>

                  <h3 className="text-xl font-bold text-white">
                    {opportunity.title}
                  </h3>

                  <p className="mt-1 text-slate-400">
                    {opportunity.provider}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">

                    <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1">
                      {opportunity.category}
                    </span>

                    {opportunity.location && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        📍 {opportunity.location}
                      </span>
                    )}

                  </div>

                </div>

                <div className="text-right">

                  <div className="text-3xl font-black text-blue-400">
                    {opportunity.score}%
                  </div>

                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Match
                  </p>

                </div>

              </div>

              <div className="mt-4">

                <Link
                  href={opportunity.url}
                  target="_blank"
                  className="inline-flex items-center rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition duration-300 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30"
                >
                  Explore Opportunity →
                </Link>

              </div>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}