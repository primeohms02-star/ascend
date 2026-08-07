export default function CompassSVG() {
  /*
   * 120 precision marks create a realistic
   * instrument dial at three-degree intervals.
   */
  const ticks = Array.from(
    {
      length: 120,
    },
    (_, index) => {
      const angle =
        index * 3;

      const cardinal =
        angle % 90 === 0;

      const major =
        angle % 30 === 0;

      const medium =
        angle % 10 === 0;

      const innerY =
        cardinal
          ? 78
          : major
          ? 84
          : medium
          ? 91
          : 98;

      const outerY = 65;

      return (
        <g
          key={index}
          transform={`rotate(${angle} 250 250)`}
        >
          <line
            x1="250"
            y1={outerY}
            x2="250"
            y2={innerY}
            stroke={
              cardinal
                ? "#DBEAFE"
                : major
                ? "#CBD5E1"
                : medium
                ? "#64748B"
                : "#334155"
            }
            strokeWidth={
              cardinal
                ? 2.6
                : major
                ? 2
                : medium
                ? 1.2
                : 0.8
            }
            strokeLinecap="round"
            opacity={
              cardinal
                ? 1
                : major
                ? 0.86
                : medium
                ? 0.58
                : 0.35
            }
          />
        </g>
      );
    }
  );

  const degreeLabels = [
    {
      value: "30",
      angle: 30,
    },
    {
      value: "60",
      angle: 60,
    },
    {
      value: "120",
      angle: 120,
    },
    {
      value: "150",
      angle: 150,
    },
    {
      value: "210",
      angle: 210,
    },
    {
      value: "240",
      angle: 240,
    },
    {
      value: "300",
      angle: 300,
    },
    {
      value: "330",
      angle: 330,
    },
  ];

  return (
    <svg
      viewBox="0 0 500 500"
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label="Animated ASCEND navigation compass"
    >
      <defs>
        {/* Deep instrument dial */}

        <radialGradient
          id="ascend-dial"
          cx="42%"
          cy="35%"
          r="72%"
        >
          <stop
            offset="0%"
            stopColor="#162033"
          />

          <stop
            offset="36%"
            stopColor="#0B1220"
          />

          <stop
            offset="72%"
            stopColor="#070B12"
          />

          <stop
            offset="100%"
            stopColor="#020408"
          />
        </radialGradient>

        {/* Brushed metallic bezel */}

        <linearGradient
          id="ascend-bezel"
          x1="10%"
          y1="4%"
          x2="90%"
          y2="96%"
        >
          <stop
            offset="0%"
            stopColor="#E2E8F0"
          />

          <stop
            offset="8%"
            stopColor="#64748B"
          />

          <stop
            offset="20%"
            stopColor="#111827"
          />

          <stop
            offset="37%"
            stopColor="#94A3B8"
          />

          <stop
            offset="52%"
            stopColor="#1E293B"
          />

          <stop
            offset="70%"
            stopColor="#CBD5E1"
          />

          <stop
            offset="84%"
            stopColor="#334155"
          />

          <stop
            offset="100%"
            stopColor="#0F172A"
          />
        </linearGradient>

        {/* Inner silver ring */}

        <linearGradient
          id="ascend-silver"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop
            offset="0%"
            stopColor="#F8FAFC"
          />

          <stop
            offset="28%"
            stopColor="#64748B"
          />

          <stop
            offset="52%"
            stopColor="#E2E8F0"
          />

          <stop
            offset="76%"
            stopColor="#475569"
          />

          <stop
            offset="100%"
            stopColor="#CBD5E1"
          />
        </linearGradient>

        {/* Sapphire centre */}

        <radialGradient
          id="ascend-jewel"
          cx="36%"
          cy="30%"
          r="68%"
        >
          <stop
            offset="0%"
            stopColor="#EFF6FF"
          />

          <stop
            offset="18%"
            stopColor="#93C5FD"
          />

          <stop
            offset="52%"
            stopColor="#3B82F6"
          />

          <stop
            offset="80%"
            stopColor="#1D4ED8"
          />

          <stop
            offset="100%"
            stopColor="#172554"
          />
        </radialGradient>

        {/* Soft dial illumination */}

        <radialGradient
          id="ascend-blue-light"
          cx="50%"
          cy="50%"
          r="50%"
        >
          <stop
            offset="0%"
            stopColor="#3B82F6"
            stopOpacity="0.13"
          />

          <stop
            offset="58%"
            stopColor="#2563EB"
            stopOpacity="0.05"
          />

          <stop
            offset="100%"
            stopColor="#020617"
            stopOpacity="0"
          />
        </radialGradient>

        <filter
          id="ascend-soft-glow"
          x="-60%"
          y="-60%"
          width="220%"
          height="220%"
        >
          <feGaussianBlur
            stdDeviation="5"
            result="blur"
          />

          <feMerge>
            <feMergeNode
              in="blur"
            />

            <feMergeNode
              in="SourceGraphic"
            />
          </feMerge>
        </filter>

        <filter
          id="ascend-inner-shadow"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feDropShadow
            dx="0"
            dy="5"
            stdDeviation="8"
            floodColor="#000000"
            floodOpacity="0.9"
          />
        </filter>
      </defs>

      {/* Exterior metal bezel */}

      <circle
        cx="250"
        cy="250"
        r="238"
        fill="#020408"
      />

      <circle
        cx="250"
        cy="250"
        r="233"
        fill="url(#ascend-bezel)"
      />

      <circle
        cx="250"
        cy="250"
        r="226"
        fill="#030712"
        stroke="#E2E8F0"
        strokeOpacity="0.22"
        strokeWidth="1.5"
      />

      <circle
        cx="250"
        cy="250"
        r="219"
        fill="none"
        stroke="url(#ascend-silver)"
        strokeWidth="5"
        opacity="0.8"
      />

      {/* Graphite inner housing */}

      <circle
        cx="250"
        cy="250"
        r="212"
        fill="#05070B"
        stroke="#475569"
        strokeWidth="2"
      />

      <circle
        cx="250"
        cy="250"
        r="203"
        fill="url(#ascend-dial)"
        filter="url(#ascend-inner-shadow)"
      />

      {/* Subtle blue illumination */}

      <circle
        cx="250"
        cy="250"
        r="196"
        fill="url(#ascend-blue-light)"
      />

      {/* Precision scale background */}

      <circle
        cx="250"
        cy="250"
        r="190"
        fill="none"
        stroke="#64748B"
        strokeOpacity="0.22"
        strokeWidth="1"
      />

      <circle
        cx="250"
        cy="250"
        r="177"
        fill="none"
        stroke="#94A3B8"
        strokeOpacity="0.13"
        strokeWidth="1"
      />

      {/* Precision tick marks */}

      {ticks}

      {/* Degree labels */}

      {degreeLabels.map(
        ({
          value,
          angle,
        }) => {
          const radians =
            ((angle - 90) *
              Math.PI) /
            180;

          const radius = 142;

         /*
 * Round calculated SVG coordinates so the server
 * and browser produce identical attribute values.
 */
const x =
  Number(
    (
      250 +
      Math.cos(
        radians
      ) *
        radius
    ).toFixed(6)
  );

const y =
  Number(
    (
      250 +
      Math.sin(
        radians
      ) *
        radius
    ).toFixed(6)
  );

          return (
            <text
              key={value}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#64748B"
              fontSize="10"
              fontWeight="500"
              letterSpacing="1"
              opacity="0.68"
            >
              {value}
            </text>
          );
        }
      )}

      {/* Concentric navigation rings */}

      <circle
        cx="250"
        cy="250"
        r="142"
        fill="none"
        stroke="#334155"
        strokeOpacity="0.62"
        strokeWidth="1"
      />

      <circle
        cx="250"
        cy="250"
        r="108"
        fill="none"
        stroke="#1E3A5F"
        strokeOpacity="0.58"
        strokeWidth="1"
      />

      <circle
        cx="250"
        cy="250"
        r="72"
        fill="none"
        stroke="#1E293B"
        strokeOpacity="0.8"
        strokeWidth="1"
      />

      {/* Cross-axis precision lines */}

      <line
        x1="96"
        y1="250"
        x2="404"
        y2="250"
        stroke="#60A5FA"
        strokeOpacity="0.06"
      />

      <line
        x1="250"
        y1="96"
        x2="250"
        y2="404"
        stroke="#60A5FA"
        strokeOpacity="0.08"
      />

      {/* Cardinal markers */}

      <g
        fontFamily="Arial, sans-serif"
        textAnchor="middle"
      >
        <text
          x="250"
          y="55"
          fill="#60A5FA"
          fontSize="25"
          fontWeight="800"
          letterSpacing="2"
          filter="url(#ascend-soft-glow)"
        >
          N
        </text>

        <text
          x="250"
          y="463"
          fill="#94A3B8"
          fontSize="18"
          fontWeight="600"
          letterSpacing="2"
        >
          S
        </text>

        <text
          x="449"
          y="257"
          fill="#94A3B8"
          fontSize="18"
          fontWeight="600"
          letterSpacing="2"
        >
          E
        </text>

        <text
          x="51"
          y="257"
          fill="#94A3B8"
          fontSize="18"
          fontWeight="600"
          letterSpacing="2"
        >
          W
        </text>
      </g>

      {/* Intercardinal labels */}

      <g
        fill="#64748B"
        fontFamily="Arial, sans-serif"
        fontSize="10"
        fontWeight="600"
        textAnchor="middle"
        opacity="0.72"
      >
        <text
          x="359"
          y="148"
        >
          NE
        </text>

        <text
          x="359"
          y="358"
        >
          SE
        </text>

        <text
          x="141"
          y="358"
        >
          SW
        </text>

        <text
          x="141"
          y="148"
        >
          NW
        </text>
      </g>

      {/* Animated directional scanning halo */}

      <circle
        className="ascend-compass-scan-ring"
        cx="250"
        cy="250"
        r="115"
        fill="none"
        stroke="#3B82F6"
        strokeWidth="1.5"
        strokeDasharray="3 16"
        opacity="0.24"
        style={{
          transformOrigin: "250px 250px",
        }}
      />

      {/* Mechanical centre assembly */}

      <circle
        cx="250"
        cy="250"
        r="31"
        fill="#020617"
        stroke="url(#ascend-silver)"
        strokeWidth="3"
      />

      <circle
        cx="250"
        cy="250"
        r="25"
        fill="#0B1220"
        stroke="#64748B"
        strokeWidth="1.5"
      />

      <circle
        cx="250"
        cy="250"
        r="18"
        fill="url(#ascend-jewel)"
        filter="url(#ascend-soft-glow)"
      />

      <circle
        cx="250"
        cy="250"
        r="11"
        fill="#0F172A"
        stroke="#BFDBFE"
        strokeOpacity="0.82"
        strokeWidth="1.5"
      />

      <circle
        cx="250"
        cy="250"
        r="6"
        fill="#60A5FA"
      />

      <circle
        cx="247"
        cy="246"
        r="2.5"
        fill="#FFFFFF"
        opacity="0.82"
      />
    </svg>
  );
}