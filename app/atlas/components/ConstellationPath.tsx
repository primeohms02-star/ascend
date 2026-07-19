"use client";

export default function ConstellationPath() {
  return (
    <div className="absolute left-1/2 top-20 h-[700px] w-[4px] -translate-x-1/2">

      {/* Main glowing line */}
      <div className="absolute inset-0 w-[2px] rounded-full bg-gradient-to-b from-white via-sky-300 to-blue-500" />

      {/* Animated energy orb */}
      <div className="absolute left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_30px_10px_rgba(56,189,248,0.9)] animate-atlas-orb" />

    </div>
  );
}