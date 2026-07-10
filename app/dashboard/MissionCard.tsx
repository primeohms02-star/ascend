type Props = {
  title: string;
  description: string;
};

export default function MissionCard({
  title,
  description,
}: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Today's Mission
          </p>

          <h2 className="mt-2 text-xl font-bold text-slate-900">
            {title}
          </h2>
        </div>

        <div className="rounded-xl bg-orange-100 px-3 py-2 text-2xl">
          🎯
        </div>
      </div>

      <p className="mt-5 text-slate-600">
        {description}
      </p>

      <button className="mt-6 w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600">
        Start Mission
      </button>
    </section>
  );
}