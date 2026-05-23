// SectionHeader.tsx — Cabeçalho de seção padronizado do VidaFlor
// Uso: <SectionHeader title="Minhas Tarefas" action={<Btn>+ Nova</Btn>} />

import styles from "./SectionHeader.module.css";
import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className={styles.container}>
      <div className={styles.textGroup}>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
