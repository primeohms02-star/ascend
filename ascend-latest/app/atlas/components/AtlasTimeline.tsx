import EnergyOrb from "./EnergyOrb";

export default function AtlasTimeline() {
  return (
    <div className="absolute left-1/2 top-24 h-[760px] -translate-x-1/2">

      <div className="relative h-full w-[3px] rounded-full bg-gradient-to-b from-white via-cyan-400 to-blue-700 shadow-[0_0_25px_rgba(59,130,246,0.45)]">

        <EnergyOrb />

      </div>

    </div>
  );
}