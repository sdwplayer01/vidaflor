import styles from "./Toggle.module.css";

interface ToggleProps {
  val: boolean;
  onChange: (next: boolean) => void;
}

export function Toggle({ val, onChange }: ToggleProps) {
  const handleToggle = () => onChange(!val);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div
      className={[styles.track, val ? styles.active : ""].filter(Boolean).join(" ")}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      role="switch"
      aria-checked={val}
      tabIndex={0}
    >
      <div
        className={[styles.thumb, val ? styles.thumbActive : ""].filter(Boolean).join(" ")}
      />
    </div>
  );
}
