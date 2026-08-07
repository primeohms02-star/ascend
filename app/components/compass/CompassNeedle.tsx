type CompassNeedleProps = {
  state?:
    | "lost"
    | "exploring"
    | "growing"
    | "ascending";
};

export default function CompassNeedle({
  state = "exploring",
}: CompassNeedleProps) {
  return (
    <svg
      viewBox="0 0 500 500"
      className="ascend-compass-needle pointer-events-none absolute inset-0 h-full w-full"
      data-state={state}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="north-needle" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="28%" stopColor="#2563EB" />
          <stop offset="52%" stopColor="#BFDBFE" />
          <stop offset="70%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>

        <linearGradient id="south-needle" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="26%" stopColor="#94A3B8" />
          <stop offset="52%" stopColor="#F8FAFC" />
          <stop offset="74%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>

        <filter id="needle-shadow" x="-100%" y="-30%" width="300%" height="180%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.85" />
        </filter>

        <filter id="needle-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g className="ascend-compass-needle-drift" style={{ transformOrigin: "250px 250px" }}>
        <path
          className="ascend-compass-beam"
          d="M250 72 L267 245 L250 232 L233 245 Z"
          fill="#3B82F6"
          opacity="0.13"
          filter="url(#needle-glow)"
        />

        <path
          d="M250 79 L265 250 L250 269 L235 250 Z"
          fill="#000000"
          opacity="0.7"
          filter="url(#needle-shadow)"
          transform="translate(0 5)"
        />

        <path
          d="M250 426 L263 250 L250 267 L237 250 Z"
          fill="url(#south-needle)"
          stroke="#E2E8F0"
          strokeOpacity="0.28"
          strokeWidth="1"
        />
        <path d="M250 426 L250 267 L237 250 Z" fill="#0F172A" opacity="0.48" />
        <path d="M250 426 L255 267 L250 267 Z" fill="#FFFFFF" opacity="0.18" />

        <path
          d="M250 72 L264 250 L250 235 L236 250 Z"
          fill="url(#north-needle)"
          stroke="#93C5FD"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />
        <path d="M250 72 L250 235 L236 250 Z" fill="#172554" opacity="0.58" />
        <path d="M250 72 L255 238 L250 235 Z" fill="#EFF6FF" opacity="0.62" />
        <path
          d="M250 72 L264 250"
          fill="none"
          stroke="#67E8F9"
          strokeWidth="1.4"
          strokeOpacity="0.75"
          filter="url(#needle-glow)"
        />

        <circle cx="250" cy="250" r="27" fill="#000000" opacity="0.58" transform="translate(0 4)" />
        <circle cx="250" cy="250" r="25" fill="#030712" stroke="#CBD5E1" strokeOpacity="0.72" strokeWidth="2" />
        <circle cx="250" cy="250" r="19" fill="#111827" stroke="#475569" strokeWidth="1.5" />
        <circle cx="250" cy="250" r="13" fill="#1D4ED8" stroke="#93C5FD" strokeOpacity="0.8" strokeWidth="1.4" filter="url(#needle-glow)" />
        <circle className="ascend-compass-jewel-pulse" cx="250" cy="250" r="8" fill="#60A5FA" />
        <circle cx="247" cy="246" r="2.5" fill="#FFFFFF" opacity="0.9" />
      </g>
    </svg>
  );
}
