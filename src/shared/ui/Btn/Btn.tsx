import styles from "./Btn.module.css";
import type { ReactNode, CSSProperties } from "react";

type BtnVariant = "primary" | "ghost" | "danger";
type BtnType = "button" | "submit" | "reset";

interface BtnProps {
  onClick?: () => void;
  variant?: BtnVariant;
  type?: BtnType;
  ariaLabel?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  children: ReactNode;
}

export function Btn({
  onClick,
  variant = "primary",
  type = "button",
  ariaLabel,
  loading = false,
  className = "",
  style,
  disabled,
  children,
}: BtnProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      data-loading={loading}
      style={style}
      className={[
        styles.btn,
        styles[variant],
        className,
      ].filter(Boolean).join(" ")}
    >
      {loading ? (
        <span className={styles.loadingSpinner} />
      ) : (
        children
      )}
    </button>
  );
}
