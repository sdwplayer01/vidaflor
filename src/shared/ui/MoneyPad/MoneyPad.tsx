import styles from "./MoneyPad.module.css";
import { formatBRL } from "@/shared/utils/money";
import type { Money } from "@/shared/types/common";

interface MoneyPadProps {
  /** Valor atual em centavos (int). */
  value: Money;
  /** Recebe o novo valor em centavos a cada toque. */
  onChange: (cents: Money) => void;
  /** Rótulo opcional acima do visor. */
  label?: string;
  /** Teto de segurança (centavos). Default: R$ 999.999,99 */
  max?: Money;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "back"] as const;

/**
 * Teclado tátil de entrada monetária em centavos.
 * O valor cresce da direita para a esquerda — sem parsing ambíguo de string.
 * Casa com a convenção Money = centavos do projeto.
 */
export function MoneyPad({ value, onChange, label, max = 99_999_999 }: MoneyPadProps) {
  const press = (key: (typeof KEYS)[number]) => {
    if (key === "back") {
      onChange(Math.floor(value / 10));
      return;
    }
    const next = Number(String(value) + key);
    if (next <= max) onChange(next);
  };

  return (
    <div className={styles.wrapper}>
      {label && <span className={styles.label}>{label}</span>}
      <div
        className={[styles.display, value === 0 && styles.placeholder].filter(Boolean).join(" ")}
        aria-live="polite"
      >
        <span className={styles.currency}>R$</span>
        {formatBRL(value)}
      </div>
      <div className={styles.pad} role="group" aria-label="Teclado numérico">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={styles.key}
            onClick={() => press(key)}
            aria-label={key === "back" ? "Apagar" : key}
          >
            {key === "back" ? "⌫" : key}
          </button>
        ))}
      </div>
    </div>
  );
}
