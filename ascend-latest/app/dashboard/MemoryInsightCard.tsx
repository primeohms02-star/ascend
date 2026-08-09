type MemoryInsightCardProps = {
  insight: string;
  averageMood: number;
  totalReflections: number;
};

export default function MemoryInsightCard({
  insight,
  averageMood,
  totalReflections,
}: MemoryInsightCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">

      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
        Atlas Insight
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        What Atlas Learned
      </h2>

      <p className="mt-5 leading-7 text-slate-600">
        {insight}
      </p>

      <div className="mt-6 flex gap-8">

        <div>
          <p className="text-sm text-slate-500">
            Average Mood
          </p>

          <p className="text-3xl font-bold">
            {averageMood}/5
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Reflections
          </p>

          <p className="text-3xl font-bold">
            {totalReflections}
          </p>
        </div>

      </div>

    </section>
  );
}