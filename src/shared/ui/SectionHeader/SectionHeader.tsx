// SectionHeader.tsx — Cabeçalho de seção com título e CTA
// Uso: <SectionHeader title="Minhas Tarefas" onAddClick={() => setSheet('add')} />

import { Plus } from "lucide-react";
import styles from "./SectionHeader.module.css";

interface SectionHeaderProps {
  title: string;
  onAddClick?: () => void;
  hideAddButton?: boolean;
  subtitle?: string;
}

export function SectionHeader({
  title,
  onAddClick,
  hideAddButton = false,
  subtitle,
}: SectionHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && (
          <p className={styles.subtitle}>{subtitle}</p>
        )}
      </div>
      {!hideAddButton && onAddClick && (
        <button
          onClick={onAddClick}
          className={styles.addBtn}
          aria-label={`Adicionar ${title.toLowerCase()}`}
        >
          <Plus size={20} />
        </button>
      )}
    </div>
  );
}
