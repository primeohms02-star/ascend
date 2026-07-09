"use client";

export default function Compass() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative h-44 w-44 rounded-full border-4 border-slate-300 bg-white shadow-xl">

        {/* Cardinal points */}
        <span className="absolute left-1/2 top-2 -translate-x-1/2 text-sm font-bold">
          N
        </span>

        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm">
          S
        </span>

        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm">
          W
        </span>

        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm">
          E
        </span>

        {/* Needle */}
        <div className="absolute left-1/2 top-1/2 h-24 w-1 -translate-x-1/2 -translate-y-full rounded-full bg-black origin-bottom rotate-12 transition-transform duration-1000" />

        {/* Center */}
        <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500 border-2 border-white" />
      </div>
    </div>
  );
}