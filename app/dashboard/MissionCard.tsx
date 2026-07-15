import CompleteMissionButton from "@/app/components/dashboard/CompleteMissionButton";

type MissionCardProps = {
  title: string;
  description: string;
  missionId: string;
};

export default function MissionCard({
  title,
  description,
  missionId,
}: MissionCardProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#0B1220] p-5 shadow-2xl">

      {/* Ambient Glow */}
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative z-10">

        <div className="flex items-start justify-between">

          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
              Today's Mission
            </p>

            <h2 className="mt-3 text-2xl font-bold leading-tight text-white">
              {title}
            </h2>

          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-2xl">
            🎯
          </div>

        </div>

        <p className="mt-5 text-lg leading-8 text-slate-300">
          {description}
        </p>

        <div className="mt-10">
          <CompleteMissionButton missionId={missionId} />
        </div>

      </div>

    </section>
  );
}