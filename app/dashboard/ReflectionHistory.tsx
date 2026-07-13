type Reflection = {
  id: string;
  reflection: string;
  mood: number;
  created_at: string;
};

type ReflectionHistoryProps = {
  reflections: Reflection[];
};

export default function ReflectionHistory({
  reflections,
}: ReflectionHistoryProps) {
  if (reflections.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="text-2xl font-bold">
          Reflection History
        </h2>

        <p className="mt-3 text-slate-500">
          No reflections yet.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <h2 className="text-2xl font-bold">
        Reflection History
      </h2>

      <div className="mt-6 space-y-5">
        {reflections.map((reflection) => (
          <div
            key={reflection.id}
            className="rounded-2xl border border-slate-200 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-orange-600">
                Mood: {reflection.mood}/5
              </span>

              <span className="text-sm text-slate-400">
                {new Date(
                  reflection.created_at
                ).toLocaleDateString()}
              </span>
            </div>

            <p className="mt-3 text-slate-700 leading-7">
              {reflection.reflection}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}