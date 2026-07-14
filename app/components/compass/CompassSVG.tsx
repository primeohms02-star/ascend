"use client";

export default function CompassSVG() {
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const angle = i * 5;
    const major = angle % 30 === 0;

    return (
      <g
        key={i}
        transform={`rotate(${angle} 250 250)`}
      >
        <line
          x1="250"
          y1={major ? 48 : 60}
          x2="250"
          y2={major ? 82 : 74}
          stroke={major ? "#E2E8F0" : "#64748B"}
          strokeWidth={major ? 2 : 1}
          strokeLinecap="round"
          opacity={major ? 0.9 : 0.35}
        />
      </g>
    );
  });

  return (
    <svg
      viewBox="0 0 500 500"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <radialGradient id="dial">
          <stop offset="0%" stopColor="#121821" />
          <stop offset="70%" stopColor="#0A0F16" />
          <stop offset="100%" stopColor="#05070B" />
        </radialGradient>

        <linearGradient
          id="bezel"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="20%" stopColor="#334155" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="80%" stopColor="#334155" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>

        <radialGradient id="jewel">
          <stop offset="0%" stopColor="#BFDBFE" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </radialGradient>
      </defs>

      {/* Outer Bezel */}

      <circle
        cx="250"
        cy="250"
        r="225"
        fill="url(#bezel)"
      />

      {/* Metallic Rim */}

      <circle
        cx="250"
        cy="250"
        r="219"
        fill="none"
        stroke="#CBD5E1"
        strokeOpacity=".15"
        strokeWidth="2"
      />

      {/* Inner Bezel */}

      <circle
        cx="250"
        cy="250"
        r="210"
        fill="#0A0F16"
      />

      {/* Dial */}

      <circle
        cx="250"
        cy="250"
        r="190"
        fill="url(#dial)"
      />

      {/* Tick Marks */}

      {ticks}

      {/* Rings */}

      <circle
        cx="250"
        cy="250"
        r="170"
        fill="none"
        stroke="#334155"
        strokeOpacity=".6"
      />

      <circle
        cx="250"
        cy="250"
        r="135"
        fill="none"
        stroke="#1E293B"
      />

      <circle
        cx="250"
        cy="250"
        r="95"
        fill="none"
        stroke="#1E293B"
      />

      {/* Cardinal Letters */}

      <text
        x="250"
        y="42"
        textAnchor="middle"
        fill="#3B82F6"
        fontSize="24"
        fontWeight="700"
      >
        N
      </text>

      <text
        x="250"
        y="472"
        textAnchor="middle"
        fill="#94A3B8"
        fontSize="18"
      >
        S
      </text>

      <text
        x="458"
        y="258"
        textAnchor="middle"
        fill="#94A3B8"
        fontSize="18"
      >
        E
      </text>

      <text
        x="42"
        y="258"
        textAnchor="middle"
        fill="#94A3B8"
        fontSize="18"
      >
        W
      </text>

      {/* Sapphire Ring */}

      <circle
        cx="250"
        cy="250"
        r="23"
        fill="#0B1220"
        stroke="#64748B"
        strokeWidth="2"
      />

      {/* Center Jewel */}

      <circle
        cx="250"
        cy="250"
        r="13"
        fill="url(#jewel)"
      />

      {/* Highlight */}

      <circle
        cx="246"
        cy="246"
        r="4"
        fill="white"
        opacity=".45"
      />
    </svg>
  );
}