// FSelect.tsx — Dropdown/Select padronizado do VidaFlor
// Uso: <FSelect value={cat} onChange={setCat} options={[{ value: "lazer", label: "Lazer" }]} />

import styles from "./FSelect.module.css";
import type { CSSProperties, ReactNode } from "react";

export interface FSelectOption {
  value: string | number;
  label: string;
}

interface FSelectProps {
  value:        string | number;
  onChange:     (val: string) => void;
  options:      FSelectOption[];
  placeholder?: string;
  className?:   string;
  style?:       CSSProperties;
  children?:    ReactNode; // Permite passar options customizadas como children se necessário
}

export function FSelect({
  value,
  onChange,
  options,
  placeholder,
  className = "",
  style,
  children,
}: FSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={style}
      className={[styles.select, className].filter(Boolean).join(" ")}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {children
        ? children
        : options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
    </select>
  );
}
