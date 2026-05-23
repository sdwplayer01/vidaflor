// ActionRow.tsx — Linha com ícone, título, valor e ações
// Uso: <ActionRow icon={icon} title="Água" value="8/8 copos" onEdit={fn} onDelete={fn} />

import { Edit2, Trash2 } from "lucide-react";
import styles from "./ActionRow.module.css";
import type { ReactNode } from "react";

interface ActionRowProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  value?: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  className?: string;
}

export function ActionRow({
  icon,
  title,
  subtitle,
  value,
  onEdit,
  onDelete,
  onClick,
  className = "",
}: ActionRowProps) {
  return (
    <div
      className={[styles.row, className].filter(Boolean).join(" ")}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Ícone */}
      {icon && (
        <div className={styles.icon}>
          {icon}
        </div>
      )}

      {/* Conteúdo */}
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        {subtitle && (
          <p className={styles.subtitle}>{subtitle}</p>
        )}
      </div>

      {/* Valor */}
      {value && (
        <div className={styles.value}>
          {value}
        </div>
      )}

      {/* Ações */}
      <div className={styles.actions}>
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className={styles.actionBtn}
            aria-label="Editar"
          >
            <Edit2 size={18} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className={[styles.actionBtn, styles.danger].filter(Boolean).join(" ")}
            aria-label="Deletar"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
