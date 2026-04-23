// ProgressBar.tsx — Barra de progresso animada
// Uso: <ProgressBar color="var(--vf-p)" val={75} max={100} />

import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
  color:  string;
  val:    number;
  max:    number;
  h?:     number;
}

export function ProgressBar({ color, val, max, h = 8 }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (val / max) * 100) : 0;

  return (
    <div className={styles.track} style={{ height: h }}>
      <div
        className={styles.fill}
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}
