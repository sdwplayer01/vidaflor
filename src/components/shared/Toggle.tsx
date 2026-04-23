// Toggle.tsx — Switch boolean do VidaFlor
// Uso: <Toggle val={true} onChange={setBool} />

import styles from "./Toggle.module.css";

interface ToggleProps {
  val:      boolean;
  onChange: (next: boolean) => void;
}

export function Toggle({ val, onChange }: ToggleProps) {
  return (
    <div
      className={[styles.track, val ? styles.active : ""].filter(Boolean).join(" ")}
      onClick={() => onChange(!val)}
      role="switch"
      aria-checked={val}
    >
      <div
        className={[styles.thumb, val ? styles.thumbActive : ""].filter(Boolean).join(" ")}
      />
    </div>
  );
}
