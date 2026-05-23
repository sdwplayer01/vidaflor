// FSelect.tsx — Dropdown/Select padronizado do VidaFlor
// Uso: <FSelect id="cat" label="Categoria" value={cat} onChange={setCat} options={[...]} />

import styles from "./FSelect.module.css";
import type { CSSProperties, ReactNode } from "react";

export interface FSelectOption {
  value: string | number;
  label: string;
}

interface FSelectProps {
  id?:          string;
  label?:       string;
  value:        string | number;
  onChange:     (val: string) => void;
  options:      FSelectOption[];
  placeholder?: string;
  error?:       string;
  disabled?:    boolean;
  className?:   string;
  style?:       CSSProperties;
  children?:    ReactNode; // Permite passar options customizadas como children se necessário
}

export function FSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  disabled = false,
  className = "",
  style,
  children,
}: FSelectProps) {
  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        style={style}
        className={[
          styles.select,
          error && styles.hasError,
          disabled && styles.disabled,
          className,
        ].filter(Boolean).join(" ")}
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
      {error && (
        <span id={`${id}-error`} className={styles.errorMsg}>
          {error}
        </span>
      )}
    </div>
  );
}
