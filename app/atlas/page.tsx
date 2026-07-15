import AtlasBackground from "./components/AtlasBackground";
import NorthStar from "./components/NorthStar";
import JourneyNode from "./components/JourneyNode";
import EnergyPulse from "./components/EnergyPulse";
import ConstellationPath from "./components/ConstellationPath";
import { atlasData } from "@/lib/atlas/data";

export default function AtlasPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020611] text-white">

      {/* Background */}
      <AtlasBackground />

      <div className="relative z-10 flex min-h-screen items-center justify-center">

    {/* North Star Label */}
<div className="absolute top-2 left-1/2 -translate-x-1/2 text-center">
  <h1 className="text-2xl font-bold tracking-tight text-white">
    Your North Star
  </h1>

  <p className="mt-1 text-sm text-slate-400">
    Build a Global Company
  </p>
</div>

{/* North Star */}
<div className="absolute top-16 left-1/2 -translate-x-1/2">
  <NorthStar />
</div>

  

        {/* Journey Path */}
       <ConstellationPath />



        {/* Current Mission */}
        <div className="absolute top-[33%] -translate-x-48">
          <JourneyNode
            icon="🎯"
            title={atlasData.currentMission.title}
            subtitle={`${atlasData.currentMission.progress}% Complete`}
            href="/dashboard"
          />
        </div>

        {/* Skill Growth */}
        <div className="absolute top-[52%] translate-x-48">
          <JourneyNode
            icon="📚"
            title="Skill Growth"
            subtitle={atlasData.skills.join(" • ")}
            href="/dashboard"
          />
        </div>

        {/* Opportunity */}
        <div className="absolute top-[72%] -translate-x-48">
          <JourneyNode
            icon="🌍"
            title={atlasData.opportunity.title}
            subtitle={`Deadline • ${atlasData.opportunity.deadline}`}
            href="/dashboard"
          />
        </div>

        {/* Current Position */}
        <div className="absolute bottom-0s flex flex-col items-center">

          <div className="h-8 w-8 rounded-full bg-blue-500 shadow-[0_0_45px_12px_rgba(59,130,246,0.9)]" />

          <p className="mt-8 text-xl font-bold tracking-[0.25em] text-blue-300">
            YOU ARE HERE
          </p>

        </div>

      </div>

    </main>
  );
}