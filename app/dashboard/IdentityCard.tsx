type IdentityCardProps = {
  title: string;
  level: number;
};

export default function IdentityCard({
  title,
  level,
}: IdentityCardProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#0B1220] p-5 shadow-2xl">

      {/* Ambient Glow */}

      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative z-10">

        <div className="flex items-start justify-between">

          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
              Identity
            </p>

            <h2 className="mt-3 text-2xl font-bold leading-tight text-white">
              {title}
            </h2>

            <div className="mt-4 inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2">

              <span className="text-sm font-semibold text-blue-300">
                Level {level}
              </span>

            </div>

          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-2xl">
            🧭
          </div>

        </div>

        <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">

          <p className="text-xs uppercase tracking-[0.3em] text-blue-400">
            Identity Evolution
          </p>

          <p className="mt-3 text-lg leading-8 text-slate-300">
            Your identity is not defined by your intentions—it is shaped by the actions you repeat every day. Every completed mission strengthens who you're becoming.
          </p>

        </div>

      </div>

    </section>
  );
}