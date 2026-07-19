import Link from "next/link";
import { Recommendation } from "@/lib/engine/recommendations";

type Props = {
  recommendation?: Recommendation;
};

export default function RecommendationCard({
  recommendation,
}: Props) {
  if (!recommendation) {
    return (
      <section className="rounded-3xl border border-blue-500/20 bg-[#0B1220] p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
          Recommended Next
        </p>

        <h2 className="mt-3 text-2xl font-bold text-white">
          No recommendation yet
        </h2>

        <p className="mt-4 text-slate-400">
          Atlas is still preparing your personalized recommendations.
        </p>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#0B1220] p-5 shadow-2xl">
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
              Recommended Next
            </p>

            <h2 className="mt-3 text-3xl font-bold leading-tight text-white">
              {recommendation.title}
            </h2>
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-2xl">
            ✨
          </div>
        </div>

        <p className="mt-5 text-lg leading-8 text-slate-300">
          {recommendation.description}
        </p>

        <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-400">
            Cortex Recommendation
          </p>

          <p className="mt-3 italic leading-7 text-slate-200">
            Small, consistent actions create extraordinary long-term results.
          </p>
        </div>

        <Link
          href={recommendation.href}
          className="mt-6 inline-flex items-center rounded-2xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white transition duration-300 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30"
        >
          {recommendation.action}
          <span className="ml-2">→</span>
        </Link>
      </div>
    </section>
  );
}