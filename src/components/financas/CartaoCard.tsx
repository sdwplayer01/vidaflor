// src/components/financas/CartaoCard.tsx
// Card visual de cartao de credito usado na aba Cartoes.
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
      <div className={styles.header}>
        <div>
          <p className={styles.brand}>{card.brand.toUpperCase()}</p>
          <p className={styles.cardName}>{card.name}</p>
        </div>
        <CreditCard size={26} color="currentColor" />
      </div>

      <div className={styles.footer}>
        <div>
          <p className={styles.label}>FATURA ATUAL</p>
          <p className={styles.amount}>R$ {fmtBRL(faturaMes)}</p>
          <p className={styles.dates}>Fecha dia {card.closeDay} - Vence dia {card.dueDay}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={styles.deleteBtn}
          aria-label="Deletar cartao"
        >
          <X size={14} color="currentColor" />
        </button>
      </div>

      {futuros.length > 0 && (
        <div className={styles.futuresContainer}>
          {futuros.map((f) => (
            <div key={f.m} className={styles.futureBadge}>
              {fmtMonth(f.m)}: R$ {fmtBRL(f.v)}
            </div>
          ))}
        </div>
      )}

      <div className={styles.decoration} />

      <p className={styles.hintLabel}>ver detalhes</p>
    </div>
  );
}
