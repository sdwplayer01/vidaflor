// src/components/financas/CartaoCard.tsx
// Card visual de cartão de crédito usado na aba Cartões.
// Refatorado com CSS Module e design tokens

import { CreditCard, X } from "lucide-react";
import type { Card as CardType } from "@/types/data";
import { fmtBRL, fmtMonth } from "@/utils/date";
import styles from "./CartaoCard.module.css";

interface Props {
  card: CardType;
  faturaMes: number;
  futuros: { m: string; v: number }[];
  onOpen: () => void;
  onDelete: () => void;
}

export function CartaoCard({ card, faturaMes, futuros, onOpen, onDelete }: Props) {
  return (
    <div
      className={styles.container}
      onClick={onOpen}
      style={{ background: card.color }}
    >
      {/* Header com nome do cartão */}
      <div className={styles.header}>
        <div>
          <p className={styles.brand}>{card.brand.toUpperCase()}</p>
          <p className={styles.cardName}>{card.name}</p>
        </div>
        <CreditCard size={26} color="currentColor" />
      </div>

      {/* Fatura atual e botão de delete */}
      <div className={styles.footer}>
        <div>
          <p className={styles.label}>FATURA ATUAL</p>
          <p className={styles.amount}>R$ {fmtBRL(faturaMes)}</p>
          <p className={styles.dates}>Fecha dia {card.closeDay} · Vence dia {card.dueDay}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={styles.deleteBtn}
          aria-label="Deletar cartão"
        >
          <X size={14} color="currentColor" />
        </button>
      </div>

      {/* Faturas futuras */}
      {futuros.length > 0 && (
        <div className={styles.futuresContainer}>
          {futuros.map((f) => (
            <div key={f.m} className={styles.futureBadge}>
              {fmtMonth(f.m)}: R$ {fmtBRL(f.v)}
            </div>
          ))}
        </div>
      )}

      {/* Elemento decorativo */}
      <div className={styles.decoration} />

      {/* Label "ver detalhes" */}
      <p className={styles.hintLabel}>ver detalhes</p>
    </div>
  );
}
