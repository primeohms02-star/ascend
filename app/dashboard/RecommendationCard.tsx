import { Recommendation } from "@/lib/engine/recommendations";

type Props = {
  recommendation: Recommendation;
};

export default function RecommendationCard({
  recommendation,
}: Props) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">
      <h2 className="text-2xl font-semibold">
        ✨ Recommended Next
      </h2>

      <h3 className="mt-4 text-xl font-semibold">
        {recommendation.title}
      </h3>

      <p className="mt-3 text-slate-600">
        {recommendation.description}
      </p>

      <button className="mt-6 rounded-xl bg-black px-5 py-3 font-medium text-white transition hover:opacity-90">
        {recommendation.action}
      </button>
    </div>
  );
}