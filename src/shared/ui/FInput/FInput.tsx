// FInput.tsx — Input padronizado do VidaFlor
// Uso: <FInput value={v} onChange={setV} placeholder="Nome" />

import styles from "./FInput.module.css";
import type { CSSProperties } from "react";

interface FInputProps {
  value:        string;
  onChange:     (val: string) => void;
  placeholder?: string;
  type?:        string;
  className?:   string;
  style?:       CSSProperties;
}

export function FInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  style,
}: FInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={style}
      className={[styles.input, className].filter(Boolean).join(" ")}
    />
  );
}
