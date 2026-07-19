type TimelineItem = {
  icon: string;
  title: string;
  message: string;
  created_at: string;
};

type Props = {
  timeline: TimelineItem[];
};

export default function AtlasTimeline({
  timeline,
}: Props) {
  return (
    <section className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#0B1220] p-6 shadow-2xl">

      <h2 className="text-2xl font-black text-white">
        Atlas Timeline
      </h2>

      <p className="mt-2 text-slate-400">
        Your journey is being remembered.
      </p>

      <div className="mt-8 space-y-8">

        {timeline.map((item, index) => (

          <div
            key={index}
            className="relative pl-10"
          >

            {/* Vertical line */}

            <div className="absolute left-4 top-8 bottom-0 w-px bg-blue-500/20" />

            {/* Icon */}

            <div className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/15 border border-blue-500/30">
              {item.icon}
            </div>

            {/* Content */}

            <div className="rounded-2xl border border-blue-500/15 bg-blue-500/5 p-4">

              <h3 className="font-bold text-white">
                {item.title}
              </h3>

              <p className="mt-2 text-slate-300">
                {item.message}
              </p>

              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-blue-400">
                {new Date(item.created_at).toLocaleDateString()}
              </p>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}