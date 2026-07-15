"use client";

export default function TodayCard() {
  const tasks = [
    "Complete React lesson",
    "Apply to 2 internships",
    "Journal today's progress",
  ];

  return (
    <section className="h-60 rounded-3xl border border-white/10 bg-white/5 p-8">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
            Today's Focus
          </p>

          <h2 className="mt-3 text-2xl font-bold text-white">
            Top Priorities
          </h2>
        </div>

        <span className="rounded-xl bg-blue-500/10 px-3 py-1 text-sm text-blue-300">
          3 Tasks
        </span>

      </div>

      <div className="mt-8 space-y-4">

        {tasks.map((task) => (
          <label
            key={task}
            className="flex items-center gap-4 rounded-xl border border-white/5 bg-black/20 p-3 hover:border-blue-500/20 transition"
          >
            <input
              type="checkbox"
              className="h-5 w-5 accent-blue-500"
            />

            <span className="text-slate-300">
              {task}
            </span>
          </label>
        ))}

      </div>

    </section>
  );
}