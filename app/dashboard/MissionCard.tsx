import CompleteMissionButton from "./CompleteMissionButton";

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
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Today's Mission
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {title}
          </h2>
        </div>

        <div className="rounded-xl bg-orange-100 px-3 py-2 text-2xl">
          🎯
        </div>
      </div>

      <p className="mt-5 leading-7 text-slate-600">
        {description}
      </p>

      <CompleteMissionButton
        missionId={missionId}
      />
    </section>
  );
}