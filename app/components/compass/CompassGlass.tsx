"use client";

export default function CompassGlass() {
  return (
    <>
      {/* Glass Layer */}

      <div className="absolute inset-[18px] rounded-full bg-white/[0.02]" />

      {/* Top Highlight */}

      <div
        className="
          absolute
          left-1/2
          top-5
          h-5
          w-36
          -translate-x-1/2
          rounded-full
          bg-white/15
          blur-lg
        "
      />

      {/* Soft Side Reflection */}

      <div
        className="
          absolute
          left-[90px]
          top-[80px]
          h-20
          w-20
          rounded-full
          bg-white/5
          blur-2xl
        "
      />

      {/* Inner Rim Highlight */}

      <div
        className="
          absolute
          inset-[10px]
          rounded-full
          border
          border-white/5
          shadow-[inset_0_0_20px_rgba(255,255,255,0.04)]
        "
      />
    </>
  );
}