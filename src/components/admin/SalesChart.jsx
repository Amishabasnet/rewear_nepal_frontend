import { useState } from "react";
import { formatNPR } from "../../utils/formatCurrency";

export default function SalesChart({ data = [] }) {
  const [hovered, setHovered] = useState(null);

  if (!data.length) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-ink-400">
        No sales data available yet.
      </div>
    );
  }

  const width = 700;
  const height = 240;
  const padding = { top: 16, right: 12, bottom: 28, left: 12 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barGap = 12;
  const barWidth = Math.max((chartWidth - barGap * (data.length - 1)) / data.length, 8);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-56 w-full min-w-[500px]"
        role="img"
        aria-label="Sales revenue chart"
      >
        {/* Baseline */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#D9D3CA"
          strokeWidth="1"
        />

        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * chartHeight;
          const x = padding.left + i * (barWidth + barGap);
          const y = height - padding.bottom - barHeight;
          const isHovered = hovered === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx={4}
                fill={isHovered ? "#A84F22" : "#C4622D"}
                className="transition-colors"
              />
              {isHovered && (
                <g>
                  <rect
                    x={Math.min(Math.max(x - 20, padding.left), width - padding.right - 100)}
                    y={Math.max(y - 34, 0)}
                    width={100}
                    height={26}
                    rx={6}
                    fill="#1C1815"
                  />
                  <text
                    x={Math.min(Math.max(x - 20, padding.left), width - padding.right - 100) + 50}
                    y={Math.max(y - 34, 0) + 17}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill="#FDFBF7"
                  >
                    {formatNPR(d.value)}
                  </text>
                </g>
              )}
              <text
                x={x + barWidth / 2}
                y={height - padding.bottom + 16}
                textAnchor="middle"
                fontSize="10"
                fill="#8A8177"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
