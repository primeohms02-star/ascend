type OracleCardProps = {
  title: string;
  message: string;
};

export default function OracleCard({
  title,
  message,
}: OracleCardProps) {
  return (
    <section className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-white p-8 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-2xl text-white shadow-md">
          🔮
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Oracle
          </p>

          <h2 className="text-2xl font-bold text-slate-900">
            {title}
          </h2>
        </div>
      </div>

      <p className="mt-6 text-lg leading-8 text-slate-700">
        {message}
      </p>

      <div className="mt-8 border-t border-orange-100 pt-5">
        <p className="text-sm italic text-slate-500">
          "Wisdom begins with direction."
        </p>
      </div>
    </section>
  );
}