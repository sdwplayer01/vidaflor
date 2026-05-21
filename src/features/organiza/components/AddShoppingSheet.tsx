// src/features/organiza/components/AddShoppingSheet.tsx
import { useState } from "react";
import { Sheet }  from "@/shared/ui/Sheet";
import { FInput } from "@/shared/ui/FInput";
import { Btn }    from "@/shared/ui/Btn";
import { Chip }   from "@/shared/ui/Chip";
import { useOrganizaStore } from "../store";

interface Props { isOpen: boolean; onClose: () => void; }

const CATEGORIAS = ["Alimentacao", "Higiene", "Limpeza", "Pet", "Bebe", "Outros"];

export function AddShoppingSheet({ isOpen, onClose }: Props) {
  const adicionarItemCompra = useOrganizaStore((s) => s.adicionarItemCompra);
  const [form, setForm] = useState({ name: "", category: "Alimentacao", quantity: "" });

  if (!isOpen) return null;

  const salvar = () => {
    if (!form.name.trim()) return;
    adicionarItemCompra({
      name:     form.name.trim(),
      category: form.category,
      quantity: form.quantity ? parseInt(form.quantity, 10) : undefined,
    });
    setForm({ name: "", category: "Alimentacao", quantity: "" });
    onClose();
  };

  return (
    <Sheet title="Novo Item" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FInput value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Nome do item" />
        <FInput value={form.quantity} onChange={(v) => setForm((f) => ({ ...f, quantity: v }))} placeholder="Quantidade (opcional)" type="number" />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIAS.map((cat) => (
            <Chip key={cat} active={form.category === cat} onClick={() => setForm((f) => ({ ...f, category: cat }))}>
              {cat}
            </Chip>
          ))}
        </div>
        <Btn onClick={salvar} disabled={!form.name.trim()}>Adicionar</Btn>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Sheet>
  );
}
