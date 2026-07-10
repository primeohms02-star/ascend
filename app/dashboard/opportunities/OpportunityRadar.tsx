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
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-slate-900">
          🌍 Opportunity Radar
        </h2>

        <p className="mt-3 text-slate-600">
          No opportunities available yet.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">

      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Opportunity Radar
          </p>

          <h2 className="text-2xl font-bold text-slate-900">
            Top Matches
          </h2>
        </div>
      </div>

      <div className="space-y-4">

        {opportunities.slice(0, 3).map((opportunity) => (
          <div
            key={opportunity.id}
            className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-orange-300 hover:bg-orange-50"
          >
            <div>
              <h3 className="font-semibold text-slate-900">
                {opportunity.title}
              </h3>

              <p className="text-sm text-slate-500">
                {opportunity.provider}
              </p>

              <div className="mt-1 flex gap-3 text-xs text-slate-500">
                <span>{opportunity.category}</span>

                {opportunity.location && (
                  <span>🌍 {opportunity.location}</span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-orange-600">
                {opportunity.score}%
              </div>

              <Link
                href={opportunity.url}
                target="_blank"
                className="mt-2 inline-block rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                View
              </Link>
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}