// src/features/kids/components/KidProgressRing.tsx

interface Props {
  pct:    number;
  color:  string;
  size?:  number;
}

export function KidProgressRing({ pct, color, size = 48 }: Props) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const fill = circ * (1 - pct / 100);

  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--vf-bd)" strokeWidth={5} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={5}
        strokeDasharray={circ}
        strokeDashoffset={fill}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      <text
        x={size/2} y={size/2 + 4}
        textAnchor="middle" fontSize={10} fontWeight="700" fill={color}
      >
        {pct}%
      </text>
    </svg>
  );
}
