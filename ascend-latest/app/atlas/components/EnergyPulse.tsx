"use client";

export default function EnergyPulse() {
  return (
    <div
      className="
        atlas-orb
        absolute
        left-1/2
        -translate-x-1/2
        h-5
        w-5
        rounded-full
        bg-cyan-300
        shadow-[0_0_45px_15px_rgba(56,189,248,1)]
      "
    >
      <div className="absolute inset-0 animate-ping rounded-full bg-cyan-300 opacity-40" />
    </div>
  );
}