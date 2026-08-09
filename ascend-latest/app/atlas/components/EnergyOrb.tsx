"use client";

export default function EnergyOrb() {
  return (
    <div
      className="
        absolute
        left-1/2
        -translate-x-1/2
        h-6
        w-6
        rounded-full
        bg-cyan-300
        shadow-[0_0_35px_12px_rgba(56,189,248,0.9)]
        animate-atlas-orb
      "
    >
      {/* Inner core */}
      <div className="absolute inset-[5px] rounded-full bg-white" />

      {/* Pulse */}
      <div className="absolute inset-0 animate-ping rounded-full bg-cyan-300 opacity-40" />
    </div>
  );
}