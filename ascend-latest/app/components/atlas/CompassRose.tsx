export default function CompassRose() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      <svg
        aria-hidden="true"
        className="h-[760px] w-[760px] opacity-[0.075] sm:h-[900px] sm:w-[900px]"
        viewBox="0 0 1000 1000"
        fill="none"
      >
        <circle
          cx="500"
          cy="500"
          r="430"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="2"
        />
        <circle
          cx="500"
          cy="500"
          r="320"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
        <line
          x1="500"
          y1="80"
          x2="500"
          y2="920"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="2"
        />
        <line
          x1="80"
          y1="500"
          x2="920"
          y2="500"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="2"
        />
        <line
          x1="180"
          y1="180"
          x2="820"
          y2="820"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1.5"
        />
        <line
          x1="820"
          y1="180"
          x2="180"
          y2="820"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1.5"
        />
        <polygon
          points="500,120 520,500 500,455 480,500"
          fill="rgba(255,255,255,0.45)"
        />
        <polygon
          points="500,880 520,500 500,545 480,500"
          fill="rgba(255,255,255,0.08)"
        />
        <polygon
          points="880,500 500,520 545,500 500,480"
          fill="rgba(255,255,255,0.08)"
        />
        <polygon
          points="120,500 500,520 455,500 500,480"
          fill="rgba(255,255,255,0.08)"
        />
        <circle cx="500" cy="500" r="8" fill="rgba(255,255,255,0.55)" />
      </svg>
    </div>
  );
}
