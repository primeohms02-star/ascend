import { RoadmapStep } from "@/lib/engine/roadmap";

type RoadmapCardProps = {
  roadmap: RoadmapStep[];
};

export default function RoadmapCard({
  roadmap,
}: RoadmapCardProps) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg md:col-span-2">
      <h2 className="text-2xl font-semibold">
        🗺️ Your Roadmap
      </h2>

      <div className="mt-8 space-y-5">
        {roadmap.map((step, index) => (
          <div
            key={index}
            className="flex items-start gap-4"
          >
            <div className="mt-1 text-2xl">
              {step.completed ? "✅" : "⬜"}
            </div>

            <div>
              <p className="text-sm uppercase tracking-widest text-slate-500">
                {step.phase}
              </p>

              <p className="mt-1 text-lg font-medium">
                {step.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}