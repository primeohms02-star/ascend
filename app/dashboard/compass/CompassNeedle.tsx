type CompassNeedleProps = {
  alignment: number;
};

export default function CompassNeedle({
  alignment,
}: CompassNeedleProps) {
  const safeAlignment =
    Math.max(
      0,
      Math.min(
        100,
        Number.isFinite(
          alignment
        )
          ? alignment
          : 0
      )
    );

  /*
   * As level progress increases, the needle settles
   * more precisely toward North.
   */
  const rotation =
    (100 - safeAlignment) *
    0.28;

  const ticks = Array.from(
    {
      length: 72,
    },
    (_, index) => {
      const angle =
        index * 5;

      const cardinal =
        angle % 90 === 0;

      const major =
        angle % 30 === 0;

      return (
        <g
          key={index}
          transform={`rotate(${angle} 250 250)`}
        >
          <line
            x1="250"
            y1="58"
            x2="250"
            y2={
              cardinal
                ? 92
                : major
                ? 84
                : 75
            }
            stroke={
              cardinal
                ? "#DBEAFE"
                : major
                ? "#94A3B8"
                : "#475569"
            }
            strokeWidth={
              cardinal
                ? 2.5
                : major
                ? 1.7
                : 1
            }
            strokeLinecap="round"
            opacity={
              cardinal
                ? 1
                : major
                ? 0.74
                : 0.4
            }
          />
        </g>
      );
    }
  );

  return (
    <div className="relative flex h-64 w-64 items-center justify-center">
      {/* Instrument illumination */}

      <div
        aria-hidden="true"
        className="absolute inset-[-12%] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.22),rgba(37,99,235,0.08)_48%,transparent_74%)]"
      />

      <div
        aria-hidden="true"
        className="absolute inset-x-[12%] bottom-[-8%] h-[18%] rounded-full bg-black/75 blur-2xl"
      />

      {/* External precision ring */}

      <div
        aria-hidden="true"
        className="absolute inset-[-3%] rounded-full border border-dashed border-cyan-300/10"
      >
        <span className="absolute left-1/2 top-[-3px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(103,232,249,0.9)]" />
      </div>

      {/* Metallic housing */}

      <div className="relative h-full w-full rounded-full border border-slate-200/25 bg-[conic-gradient(from_210deg,#111827,#94a3b8_10%,#1e293b_21%,#e2e8f0_30%,#334155_42%,#cbd5e1_52%,#0f172a_66%,#64748b_78%,#e2e8f0_88%,#111827)] p-[5px] shadow-[0_24px_55px_rgba(0,0,0,0.72),0_0_38px_rgba(37,99,235,0.23),inset_0_1px_1px_rgba(255,255,255,0.35)]">
        <div className="relative h-full w-full overflow-hidden rounded-full border border-white/10 bg-[#03060C] p-[10px] shadow-[inset_0_0_35px_rgba(0,0,0,0.95)]">
          <svg
            viewBox="0 0 500 500"
            className="h-full w-full"
            role="img"
            aria-label={`${Math.round(
              safeAlignment
            )}% level-progress compass`}
          >
            <defs>
              <radialGradient
                id="dashboard-dial"
                cx="42%"
                cy="34%"
                r="72%"
              >
                <stop
                  offset="0%"
                  stopColor="#172033"
                />

                <stop
                  offset="42%"
                  stopColor="#0B1220"
                />

                <stop
                  offset="78%"
                  stopColor="#050911"
                />

                <stop
                  offset="100%"
                  stopColor="#010307"
                />
              </radialGradient>

              <linearGradient
                id="dashboard-north-needle"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  stopColor="#172554"
                />

                <stop
                  offset="28%"
                  stopColor="#2563EB"
                />

                <stop
                  offset="52%"
                  stopColor="#DBEAFE"
                />

                <stop
                  offset="72%"
                  stopColor="#3B82F6"
                />

                <stop
                  offset="100%"
                  stopColor="#172554"
                />
              </linearGradient>

              <linearGradient
                id="dashboard-south-needle"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  stopColor="#1E293B"
                />

                <stop
                  offset="30%"
                  stopColor="#94A3B8"
                />

                <stop
                  offset="52%"
                  stopColor="#F8FAFC"
                />

                <stop
                  offset="76%"
                  stopColor="#64748B"
                />

                <stop
                  offset="100%"
                  stopColor="#0F172A"
                />
              </linearGradient>

              <radialGradient
                id="dashboard-jewel"
                cx="35%"
                cy="30%"
                r="70%"
              >
                <stop
                  offset="0%"
                  stopColor="#EFF6FF"
                />

                <stop
                  offset="24%"
                  stopColor="#93C5FD"
                />

                <stop
                  offset="58%"
                  stopColor="#3B82F6"
                />

                <stop
                  offset="100%"
                  stopColor="#172554"
                />
              </radialGradient>

              <filter
                id="dashboard-glow"
                x="-80%"
                y="-80%"
                width="260%"
                height="260%"
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
                id="dashboard-shadow"
                x="-60%"
                y="-30%"
                width="220%"
                height="180%"
              >
                <feDropShadow
                  dx="0"
                  dy="7"
                  stdDeviation="6"
                  floodColor="#000000"
                  floodOpacity="0.9"
                />
              </filter>
            </defs>

            {/* Instrument face */}

            <circle
              cx="250"
              cy="250"
              r="237"
              fill="#020408"
              stroke="#94A3B8"
              strokeOpacity="0.28"
              strokeWidth="2"
            />

            <circle
              cx="250"
              cy="250"
              r="225"
              fill="url(#dashboard-dial)"
              stroke="#475569"
              strokeWidth="2"
            />

            <circle
              cx="250"
              cy="250"
              r="205"
              fill="none"
              stroke="#64748B"
              strokeOpacity="0.28"
            />

            {/* Precision scale */}

            {ticks}

            {/* Navigation rings */}

            <circle
              cx="250"
              cy="250"
              r="165"
              fill="none"
              stroke="#334155"
              strokeOpacity="0.72"
            />

            <circle
              cx="250"
              cy="250"
              r="125"
              fill="none"
              stroke="#1E3A5F"
              strokeOpacity="0.58"
            />

            <circle
              cx="250"
              cy="250"
              r="82"
              fill="none"
              stroke="#1E293B"
              strokeOpacity="0.85"
            />

            {/* Axis guides */}

            <line
              x1="90"
              y1="250"
              x2="410"
              y2="250"
              stroke="#60A5FA"
              strokeOpacity="0.06"
            />

            <line
              x1="250"
              y1="90"
              x2="250"
              y2="410"
              stroke="#60A5FA"
              strokeOpacity="0.08"
            />

            {/* Cardinal directions */}

            <g
              fontFamily="Arial, sans-serif"
              textAnchor="middle"
            >
              <text
                x="250"
                y="52"
                fill="#60A5FA"
                fontSize="27"
                fontWeight="800"
                letterSpacing="3"
                filter="url(#dashboard-glow)"
              >
                N
              </text>

              <text
                x="250"
                y="466"
                fill="#94A3B8"
                fontSize="19"
                fontWeight="600"
                letterSpacing="2"
              >
                S
              </text>

              <text
                x="455"
                y="258"
                fill="#94A3B8"
                fontSize="19"
                fontWeight="600"
                letterSpacing="2"
              >
                E
              </text>

              <text
                x="45"
                y="258"
                fill="#94A3B8"
                fontSize="19"
                fontWeight="600"
                letterSpacing="2"
              >
                W
              </text>
            </g>

            {/* Alignment needle */}

            <g transform={`rotate(${rotation} 250 250)`}>
              {/* Needle shadow */}

              <path
                d="M250 76 L265 250 L250 426 L235 250 Z"
                fill="#000000"
                opacity="0.65"
                filter="url(#dashboard-shadow)"
                transform="translate(0 5)"
              />

              {/* South needle */}

              <path
                d="M250 425 L264 250 L250 268 L236 250 Z"
                fill="url(#dashboard-south-needle)"
                stroke="#E2E8F0"
                strokeOpacity="0.25"
              />

              <path
                d="M250 425 L250 268 L236 250 Z"
                fill="#0F172A"
                opacity="0.5"
              />

              {/* North needle */}

              <path
                d="M250 73 L264 250 L250 235 L236 250 Z"
                fill="url(#dashboard-north-needle)"
                stroke="#93C5FD"
                strokeOpacity="0.62"
                strokeWidth="1.2"
              />

              <path
                d="M250 73 L250 235 L236 250 Z"
                fill="#172554"
                opacity="0.58"
              />

              <path
                d="M250 73 L255 238 L250 235 Z"
                fill="#EFF6FF"
                opacity="0.68"
              />

              <path
                d="M250 73 L264 250"
                fill="none"
                stroke="#67E8F9"
                strokeWidth="1.5"
                strokeOpacity="0.72"
                filter="url(#dashboard-glow)"
              />

              {/* Mechanical hub */}

              <circle
                cx="250"
                cy="250"
                r="29"
                fill="#000000"
                opacity="0.6"
                transform="translate(0 4)"
              />

              <circle
                cx="250"
                cy="250"
                r="26"
                fill="#030712"
                stroke="#CBD5E1"
                strokeOpacity="0.7"
                strokeWidth="2"
              />

              <circle
                cx="250"
                cy="250"
                r="19"
                fill="#111827"
                stroke="#475569"
                strokeWidth="1.5"
              />

              <circle
                cx="250"
                cy="250"
                r="13"
                fill="url(#dashboard-jewel)"
                stroke="#BFDBFE"
                strokeOpacity="0.72"
                filter="url(#dashboard-glow)"
              />

              <circle
                cx="247"
                cy="246"
                r="2.5"
                fill="#FFFFFF"
                opacity="0.9"
              />
            </g>

            {/* Curved glass reflection */}

            <path
              d="M105 145 C155 72 322 48 395 130 C322 103 190 110 105 145 Z"
              fill="#FFFFFF"
              opacity="0.055"
            />

            <path
              d="M145 113 C205 79 302 76 354 106"
              fill="none"
              stroke="#FFFFFF"
              strokeOpacity="0.16"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>

          {/* Glass surface */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-[4%] rounded-full border border-white/[0.06] bg-[radial-gradient(circle_at_35%_24%,rgba(255,255,255,0.09),transparent_34%)] shadow-[inset_0_2px_2px_rgba(255,255,255,0.08),inset_0_-16px_35px_rgba(0,0,0,0.32)]"
          />
        </div>
      </div>
    </div>
  );
}