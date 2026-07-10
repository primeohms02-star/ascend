type OracleCardProps = {
  title: string;
  message: string;
};

export default function OracleCard({
  title,
  message,
}: OracleCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Oracle
          </p>

          <h2 className="mt-2 text-xl font-bold text-slate-900">
            {title}
          </h2>
        </div>

        <div className="rounded-xl bg-orange-100 px-3 py-2 text-2xl">
          🔮
        </div>
      </div>

      <p className="mt-5 text-slate-600 leading-7">
        {message}
      </p>

      <div className="mt-6 rounded-xl bg-orange-50 p-4">
        <p className="text-sm font-medium text-orange-700">
          💡 Wisdom begins with direction.
        </p>
      </div>
    </section>
  );
}