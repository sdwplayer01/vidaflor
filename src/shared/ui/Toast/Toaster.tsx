// src/shared/ui/Toast/Toaster.tsx
import styles from './Toaster.module.css';
import { useToastStore } from './toast-store';

/** Renderiza o toast atual (um por vez). Montar uma única vez na raiz da app. */
export function Toaster() {
  const current = useToastStore((s) => s.current);
  const dismiss = useToastStore((s) => s.dismiss);

  if (!current) return null;

  return (
    <div className={styles.root} role="status" aria-live="polite">
      <div className={styles.toast} key={current.id}>
        <span className={styles.msg}>{current.message}</span>
        {current.actionLabel && (
          <button
            type="button"
            className={styles.action}
            onClick={() => {
              current.onAction?.();
              dismiss();
            }}
          >
            {current.actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
