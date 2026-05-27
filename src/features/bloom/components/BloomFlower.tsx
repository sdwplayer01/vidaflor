// src/features/bloom/components/BloomFlower.tsx -- v2
// Procedural SVG flower: 3 petal rings, stamen, bud/dew, sage leaves, particles.
// Opens based on composite vitality (0-100). All animations are CSS-driven.

import { useMemo } from "react";

// ── helpers ──────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp  = (a: number, b: number, t: number)   => a + (b - a) * t;

export function ringOpen(pct: number, start: number, end: number): number {
  return clamp((pct - start) / (end - start), 0, 1);
}

const PETAL_PATH = "M 100 100 C 84 84 80 56 100 30 C 120 56 116 84 100 100 Z";

// ── exported label helpers ───────────────────────────────────────────────
export function bloomLabel(pct: number): string {
  if (pct < 8)  return "Botao fechado";
  if (pct < 25) return "Despertando";
  if (pct < 50) return "Abrindo petalas";
  if (pct < 75) return "Florescendo";
  if (pct < 92) return "Plena flor";
  return "Radiante";
}

export function bloomPoem(pct: number): string {
  if (pct < 8)  return "ainda ha orvalho";
  if (pct < 25) return "a luz comeca a tocar";
  if (pct < 50) return "as petalas respiram";
  if (pct < 75) return "a cor sobe ao centro";
  if (pct < 92) return "tudo esta aberto";
  return "viva, inteira, presente";
}

// ── sub-components ───────────────────────────────────────────────────────

interface PetalProps {
  angle:    number;
  scale:    number;
  hue:      string;
  opacity?: number;
}

function Petal({ angle, scale, hue, opacity = 1 }: PetalProps) {
  if (scale <= 0.001) return null;
  return (
    <g
      style={{
        transform:       `rotate(${angle}deg) scale(${scale}, ${scale * 0.95})`,
        transformOrigin: "100px 100px",
        transition:      "transform 1.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.8s ease",
        opacity,
      }}
    >
      <path d={PETAL_PATH} fill={hue} style={{ transition: "fill 1.2s ease" }} />
      <path
        d="M 100 100 C 91 84 90 60 100 38 C 105 60 104 84 100 100 Z"
        fill="rgba(255,251,246,0.22)"
      />
    </g>
  );
}

function Stamen({ pct }: { pct: number }) {
  const t = ringOpen(pct, 40, 95);
  return (
    <g
      style={{
        transform:       `scale(${lerp(0.4, 1, t)})`,
        transformOrigin: "100px 100px",
        transition:      "transform 1.2s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <circle cx="100" cy="100" r="9" fill="var(--vf-champagne)" opacity={lerp(0.4, 1, t)} />
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const rad = (a * Math.PI) / 180;
        return (
          <circle
            key={a}
            cx={100 + Math.cos(rad) * 6}
            cy={100 + Math.sin(rad) * 6}
            r="1.8"
            fill="var(--vf-rose-deep)"
            opacity={lerp(0.3, 0.9, t)}
          />
        );
      })}
      <circle cx="100" cy="100" r="2.4" fill="var(--vf-rose-deep)" opacity={t * 0.8} />
    </g>
  );
}

function Bud({ pct }: { pct: number }) {
  const opacity = clamp(1 - pct / 25, 0, 1);
  if (opacity < 0.01) return null;
  return (
    <g style={{ opacity, transition: "opacity 1s ease" }}>
      <ellipse cx="100" cy="100" rx="14" ry="22" fill="var(--vf-petal-bud)" />
      <ellipse cx="100" cy="98"  rx="10" ry="18"
        fill="color-mix(in oklab, var(--vf-petal-bud) 60%, var(--vf-petal-outer))" />
      <ellipse cx="96" cy="92" rx="3" ry="8" fill="rgba(255,251,246,0.30)" />
      <circle cx="92"    cy="88"   r="2"   fill="rgba(180,220,240,0.85)" />
      <circle cx="91.4"  cy="87.4" r="0.6" fill="rgba(255,255,255,0.95)" />
      <circle cx="106"   cy="96"   r="1.4" fill="rgba(180,220,240,0.75)" />
      <circle cx="105.6" cy="95.6" r="0.4" fill="rgba(255,255,255,0.95)" />
    </g>
  );
}

function Leaves({ pct }: { pct: number }) {
  const s = lerp(0.7, 1.05, pct / 100);
  return (
    <g style={{ transform: `scale(${s})`, transformOrigin: "100px 130px", transition: "transform 1.2s ease" }}>
      <path d="M 100 130 Q 70 122 60 142 Q 78 150 100 138 Z"   fill="var(--vf-sage)" opacity="0.85" />
      <path d="M 100 130 Q 130 122 140 142 Q 122 150 100 138 Z" fill="var(--vf-sage)" opacity="0.85" />
      <path d="M 100 130 Q 88 125 86 148 Q 95 152 100 140 Z"
        fill="color-mix(in oklab, var(--vf-sage) 70%, var(--vf-petal-bud))" />
      <path d="M 100 130 Q 112 125 114 148 Q 105 152 100 140 Z"
        fill="color-mix(in oklab, var(--vf-sage) 70%, var(--vf-petal-bud))" />
      <rect x="98.5" y="116" width="3" height="20" rx="1.5" fill="var(--vf-sage)" />
    </g>
  );
}

function Particles({ pct }: { pct: number }) {
  if (pct < 70) return null;
  const intensity = clamp((pct - 70) / 30, 0, 1);
  const count = Math.floor(lerp(3, 9, intensity));
  const dots = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        x:     40 + Math.random() * 120,
        y:     60 + Math.random() * 80,
        dx:    (Math.random() - 0.5) * 50,
        dy:    -30 - Math.random() * 60,
        delay: Math.random() * 6,
        size:  2 + Math.random() * 3,
      })),
    [count]
  );
  return (
    <g>
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.x} cy={d.y} r={d.size}
          fill="var(--vf-champagne)"
          style={{
            filter:             "blur(0.4px)",
            transformOrigin:    `${d.x}px ${d.y}px`,
            animation:          `vf-particle-rise 6s ${d.delay}s infinite cubic-bezier(0.22,1,0.36,1)`,
            ["--dx" as string]: `${d.dx}px`,
            ["--dy" as string]: `${d.dy}px`,
            opacity:            0,
          } as React.CSSProperties}
        />
      ))}
    </g>
  );
}

// ── Main BloomFlower ─────────────────────────────────────────────────────

export interface BloomFlowerProps {
  pct?:           number;
  size?:          number;
  withGlow?:      boolean;
  withParticles?: boolean;
}

export function BloomFlower({
  pct = 0,
  size = 200,
  withGlow = true,
  withParticles = true,
}: BloomFlowerProps) {
  const p = clamp(pct, 0, 100);

  const outerT = ringOpen(p, 8,  45);
  const midT   = ringOpen(p, 28, 72);
  const innerT = ringOpen(p, 55, 95);

  const outerHue = p < 15 ? "var(--vf-petal-bud)" : "var(--vf-petal-outer)";
  const midHue   = p < 35 ? "var(--vf-petal-bud)" : "var(--vf-petal-mid)";
  const innerHue = p < 60 ? "var(--vf-petal-mid)" : "var(--vf-petal-inner)";

  const saturation = lerp(0.55, 1.05, p / 100);

  return (
    <div
      style={{
        display:    "grid",
        placeItems: "center",
        position:   "relative",
        width:      size,
        height:     size,
        filter:     `saturate(${saturation})`,
      }}
    >
      {withGlow && (
        <div
          style={{
            position:      "absolute",
            inset:         "-20%",
            borderRadius:  "50%",
            background:    "radial-gradient(circle, var(--vf-petal-glow), transparent 60%)",
            pointerEvents: "none",
            filter:        "blur(20px)",
            opacity:       lerp(0.15, 1, p / 100),
            transition:    "opacity 1.2s ease",
            animation:     "vf-breathe 5s ease-in-out infinite",
          }}
        />
      )}
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        style={{
          position:  "relative",
          zIndex:    1,
          overflow:  "visible",
          animation: "vf-sway 8s ease-in-out infinite",
        }}
      >
        <Leaves pct={p} />
        {[0,72,144,216,288].map((a,i) => (
          <Petal key={`o${i}`} angle={a} scale={outerT * 0.95} hue={outerHue} />
        ))}
        {[36,108,180,252,324].map((a,i) => (
          <Petal key={`m${i}`} angle={a} scale={midT * 0.78} hue={midHue} />
        ))}
        {[0,72,144,216,288].map((a,i) => (
          <Petal key={`i${i}`} angle={a} scale={innerT * 0.55} hue={innerHue} opacity={0.95} />
        ))}
        <Stamen pct={p} />
        <Bud    pct={p} />
        {withParticles && <Particles pct={p} />}
      </svg>
    </div>
  );
}

// ── FlowerMark -- tiny inline version for BottomNav ──────────────────────

export interface FlowerMarkProps {
  pct?:  number;
  size?: number;
}

export function FlowerMark({ pct = 50, size = 22 }: FlowerMarkProps) {
  const p    = clamp(pct, 0, 100);
  const open = ringOpen(p, 10, 80);
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse
          key={a}
          cx="12" cy="12"
          rx="3.2"
          ry={lerp(2.5, 6, open)}
          fill="currentColor"
          opacity={lerp(0.5, 0.95, open)}
          style={{
            transform:       `rotate(${a}deg) translateY(${-lerp(0, 4, open)}px)`,
            transformOrigin: "12px 12px",
            transition:      "all 0.8s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />
      ))}
      <circle cx="12" cy="12" r={lerp(1.2, 1.8, open)} fill="currentColor" opacity="0.9" />
    </svg>
  );
}
