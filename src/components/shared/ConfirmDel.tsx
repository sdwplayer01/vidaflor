// ConfirmDel.tsx — Sheet de confirmação de exclusão
// Regra SCLC: Toda ação destrutiva deve passar por este componente.
// Uso: <ConfirmDel label="Tarefa X" onCancel={close} onConfirm={remove} />

import { Sheet } from "./Sheet";
import { Btn } from "./Btn";

interface ConfirmDelProps {
  label:     string;
  onCancel:  () => void;
  onConfirm: () => void;
}

export function ConfirmDel({ label, onCancel, onConfirm }: ConfirmDelProps) {
  return (
    <Sheet title="Confirmar exclusão" onClose={onCancel}>
      <p style={{ color: "var(--vf-tm)", fontSize: 14, marginBottom: 20 }}>
        Remover <strong style={{ color: "var(--vf-tx)" }}>{label}</strong>?
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn variant="danger" onClick={onConfirm}>Remover</Btn>
      </div>
    </Sheet>
  );
}
