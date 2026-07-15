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
    <section className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#0B1220] p-5 shadow-2xl">

      {/* Ambient Glow */}

      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10">

        <div className="flex items-start justify-between">

          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
              Progress
            </p>

            <h2 className="mt-3 text-4xl font-black text-white">
              {progress}%
            </h2>

          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-2xl">
            📈
          </div>

        </div>

        {/* Progress Bar */}

        <div className="mt-6">

          <div className="mb-3 flex items-center justify-between">

            <span className="text-sm uppercase tracking-[0.15em] text-slate-400">
              Ascension Progress
            </span>

            <span className="text-sm font-bold text-blue-400">
              {progress}%
            </span>

          </div>

          <div className="relative h-4 overflow-hidden rounded-full bg-slate-800">

            <div className="absolute inset-0 rounded-full bg-blue-500/5" />

            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400 transition-all duration-1000 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
              style={{ width: `${progress}%` }}
            />

          </div>

        </div>

        {/* Momentum */}

        <div className="mt-8 flex items-center justify-between rounded-2xl border border-blue-500/20 bg-blue-500/5 px-5 py-4">

          <span className="text-sm uppercase tracking-[0.2em] text-slate-400">
            Momentum
          </span>

          <span className="text-lg font-bold text-blue-400">
            {momentum}
          </span>

        </div>

        {/* Message */}

        <p className="mt-8 text-lg leading-8 text-slate-300">
          {message}
        </p>

      </div>

    </section>
  );
}