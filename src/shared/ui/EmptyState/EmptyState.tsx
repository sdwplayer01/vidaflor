// EmptyState.tsx — Estado vazio padronizado do VidaFlor
// Uso: <EmptyState title="Sem tarefas" desc="Você terminou tudo por hoje!" icon={<Check size={24} />} />

import styles from "./EmptyState.module.css";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title?:       string;
  desc?:        string;
  icon?:        ReactNode;
  children?:    ReactNode;
}

export function EmptyState({
  title = "Nada por aqui ainda",
  desc = "Adicione seu primeiro registro para começar a acompanhar!",
  icon,
  children,
}: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        {icon ? icon : <Sparkles size={24} />}
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.desc}>{desc}</p>
      {children && <div style={{ marginTop: 16, width: "100%" }}>{children}</div>}
    </div>
  );
}
