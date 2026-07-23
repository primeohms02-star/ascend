export default function AtlasInsights() {
  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/50 p-6">

      <h2 className="text-xl font-semibold text-white">
        🧠 Atlas Insights
      </h2>

      <div className="mt-6 space-y-5">

        <div>
          <p className="text-sm text-slate-400">
            Trending Skills
          </p>

          <p className="mt-1 text-white">
            Python • TypeScript • AI
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-400">
            Fastest Growing Industry
          </p>

          <p className="mt-1 text-white">
            Artificial Intelligence
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-400">
            Recommended Certification
          </p>

          <p className="mt-1 text-white">
            AWS Cloud Practitioner
          </p>
        </div>

      </div>

    </div>
  );
}