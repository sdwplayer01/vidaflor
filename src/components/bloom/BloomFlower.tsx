// src/components/bloom/BloomFlower.tsx
// Componente isolado da Flor do Dia — renderiza o card hero do Bloom
// com ícone animado (scale) e barra de progresso.
// Extraído da HomeScreen para componentização conforme plano.

import { Flower, Flower2, Leaf } from "lucide-react";
import { bloomLabel, bloomStage, bloomScale } from "@/utils/bloom";
import styles from "./BloomFlower.module.css";

// ── Ícone da Flor ────────────────────────────────────────────────────────────

function FlowerIcon({ pct }: { pct: number }) {
  const stage = bloomStage(pct);
  if (stage === "flower2") return <Flower2 size={60} color="#fff" strokeWidth={1.5} />;
  if (stage === "flower")  return <Flower  size={52} color="#fff" strokeWidth={1.5} />;
  return <Leaf size={44} color="#fff" strokeWidth={1.5} />;
}

// ── Componente principal ─────────────────────────────────────────────────────

interface BloomFlowerProps {
  /** Porcentagem de bloom (0–100). */
  pct: number;
}

export function BloomFlower({ pct }: BloomFlowerProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardInner}>
        {/* Texto e progresso */}
        <div className={styles.cardContent}>
          <p className={styles.cardLabel}>FLOR DO DIA</p>
          <h3 className={styles.cardTitle}>{bloomLabel(pct)}</h3>
          <div className={styles.progressRow}>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <span className={styles.progressPct}>{pct}%</span>
          </div>
        </div>

        {/* Flor animada com scale via CSS Module transition */}
        <div
          className={styles.wrapper}
          style={{
            marginLeft: 20,
            transform: `scale(${bloomScale(pct)})`,
          }}
        >
          <FlowerIcon pct={pct} />
        </div>
      </div>

      {/* Decorative circle */}
      <div className={styles.decorCircle} />
    </div>
  );
}
