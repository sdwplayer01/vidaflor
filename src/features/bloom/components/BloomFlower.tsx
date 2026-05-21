// src/features/bloom/components/BloomFlower.tsx

interface Props {
  pct:   number;   // 0-100
  size?: number;
}

export function BloomFlower({ pct, size = 80 }: Props) {
  const petals = 6;
  const r      = size / 2;
  const center = r;

  // Cor do bloom: inicio=cinza, meio=rosa, total=dourado
  const color =
    pct >= 80 ? '#D4A853'
    : pct >= 40 ? '#E8799A'
    : '#A0A0B8';

  const opacity = 0.25 + (pct / 100) * 0.75;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0 }}
    >
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (i * 360) / petals;
        const rad   = (angle * Math.PI) / 180;
        const px    = center + Math.cos(rad) * r * 0.38;
        const py    = center + Math.sin(rad) * r * 0.38;
        return (
          <ellipse
            key={i}
            cx={px}
            cy={py}
            rx={r * 0.28}
            ry={r * 0.18}
            fill={color}
            opacity={opacity}
            transform={`rotate(${angle}, ${px}, ${py})`}
          />
        );
      })}
      {/* centro */}
      <circle cx={center} cy={center} r={r * 0.2} fill={color} opacity={opacity + 0.1} />
      {/* percentual */}
      <text
        x={center}
        y={center + 5}
        textAnchor="middle"
        fontSize={size * 0.18}
        fontWeight="800"
        fill={color}
        opacity={Math.min(1, opacity + 0.2)}
      >
        {pct}%
      </text>
    </svg>
  );
}
