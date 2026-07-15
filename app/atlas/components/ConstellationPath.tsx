"use client";

export default function ConstellationPath() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        id="atlasPath"
     d="M500 180
   C430 300 610 360 500 490
   S390 680 500 800
   S600 900 500 910"
        fill="none"
        stroke="rgba(96,165,250,.45)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <circle
        r="7"
        fill="#38BDF8"
        filter="url(#glow)"
      >
        <animateMotion
          dur="6s"
          repeatCount="indefinite"
          rotate="auto"
          keyPoints="1;0"
          keyTimes="0;1"
          calcMode="linear"
        >
          <mpath href="#atlasPath" />
        </animateMotion>
      </circle>
    </svg>
  );
}