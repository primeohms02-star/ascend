type ProgressCardProps = {
  progress: number;
  momentum: string;
  message: string;
};

export default function ProgressCard({
  progress,
  momentum,
  message,
}: ProgressCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Progress
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {progress}%
          </h2>
        </div>

        <div className="rounded-xl bg-orange-100 px-3 py-2 text-2xl">
          📈
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-orange-500 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-sm text-slate-500">
          Momentum
        </span>

        <span className="font-semibold text-orange-600">
          {momentum}
        </span>
      </div>

      <p className="mt-5 text-sm text-slate-600">
        {message}
      </p>
    </section>
  );
}