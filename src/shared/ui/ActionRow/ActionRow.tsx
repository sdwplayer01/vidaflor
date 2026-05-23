// ActionRow.tsx — Linha de ação com label e controles do VidaFlor
// Uso: <ActionRow label="Notificações" icon={<Bell size={18} />}><Toggle ... /></ActionRow>

import styles from "./ActionRow.module.css";
import type { ReactNode } from "react";

interface ActionRowProps {
  label: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export function ActionRow({ label, description, icon, children }: ActionRowProps) {
  return (
    <div className={styles.container}>
      <div className={styles.left}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <div className={styles.textGroup}>
          <span className={styles.label}>{label}</span>
          {description && <span className={styles.description}>{description}</span>}
        </div>
      </div>
      {children && <div className={styles.right}>{children}</div>}
    </div>
  );
}
