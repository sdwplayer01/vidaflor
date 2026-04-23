// Card.tsx — Container padrão do VidaFlor
// Uso: <Card>conteúdo</Card> ou <Card hero onClick={fn}>conteúdo</Card>

import styles from "./Card.module.css";
import type { ReactNode, CSSProperties } from "react";

interface CardProps {
  onClick?:   () => void;
  hero?:      boolean;
  className?: string;
  style?:     CSSProperties;
  children:   ReactNode;
}

export function Card({ onClick, hero, className = "", style, children }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={[
        styles.card,
        onClick ? styles.clickable : "",
        hero    ? styles.hero      : "",
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
