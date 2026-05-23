import styles from "./FInput.module.css";
import type { CSSProperties } from "react";

interface FInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function FInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  disabled = false,
  className = "",
  style,
}: FInputProps) {
  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        style={style}
        className={[
          styles.input,
          error && styles.hasError,
          disabled && styles.disabled,
          className,
        ].filter(Boolean).join(" ")}
      />
      {error && (
        <span id={`${id}-error`} className={styles.errorMsg}>
          {error}
        </span>
      )}
    </div>
  );
}
