type TimelineItem = {
  icon: string;
  title: string;
  message: string;
  created_at: string;
};

type Props = {
  timeline: TimelineItem[];
  totalCount?: number;
};

function TimelineIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v5l3 2m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

function formatTimelineDate(
  value: string
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function AtlasTimeline({
  timeline,
  totalCount = timeline.length,
}: Props) {
  const hiddenCount = Math.max(
    totalCount - timeline.length,
    0
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/60 p-5 shadow-xl shadow-slate-950/20">
      {/* Header */}

      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-300">
          <TimelineIcon />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
            Recent Milestones
          </p>

          <h2 className="mt-1 text-lg font-semibold text-white">
            Atlas Timeline
          </h2>
        </div>
      </div>

      {/* Timeline preview */}

      {timeline.length > 0 ? (
        <ol className="mt-4 space-y-3">
          {timeline.map((item, index) => (
            <li
              key={`${item.title}-${item.created_at}-${index}`}
              className="flex gap-3 rounded-xl border border-white/10 bg-slate-950/30 p-3.5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-400/25 bg-blue-400/10 text-sm">
                {item.icon}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    {item.title}
                  </h3>

                  <time
                    dateTime={item.created_at}
                    className="text-[11px] text-slate-500"
                  >
                    {formatTimelineDate(
                      item.created_at
                    )}
                  </time>
                </div>

                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                  {item.message}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/30 p-5 text-center">
          <p className="text-sm font-medium text-white">
            Your timeline is ready
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Your latest milestones will appear here.
          </p>
        </div>
      )}

      {hiddenCount > 0 && (
        <p className="mt-4 text-xs leading-5 text-slate-500">
          {hiddenCount} older{" "}
          {hiddenCount === 1
            ? "milestone is"
            : "milestones are"}{" "}
          safely remembered by Atlas.
        </p>
      )}
    </section>
  );
}