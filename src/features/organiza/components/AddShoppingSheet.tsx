// src/features/organiza/components/AddShoppingSheet.tsx
import { useState } from "react";
import { Sheet }  from "@/shared/ui/Sheet";
import { FInput } from "@/shared/ui/FInput";
import { Btn }    from "@/shared/ui/Btn";
import { useOrganizaStore } from "../store";
import { SECOES_MERCADO, SUGESTOES_POR_SECAO } from "../types";
import { parseBRL, formatBRL, maskAmount } from "@/shared/utils/money";
import type { ShoppingItem } from "../types";

interface Props {
  isOpen:    boolean;
  onClose:   () => void;
  editItem?: ShoppingItem;   // se fornecido, modo edição
}

const DEFAULT_SECAO = "Mercearia";

interface FormProps {
  editItem?: ShoppingItem;
  onSubmit: (payload: Omit<ShoppingItem, "id" | "createdAt">) => void;
  onClose:  () => void;
}

function ShoppingItemForm({ editItem, onSubmit, onClose }: FormProps) {
  const isEdit = Boolean(editItem);
  const [name,  setName]  = useState(editItem?.name ?? "");
  const [secao, setSecao] = useState(editItem?.category || DEFAULT_SECAO);
  const [qty,   setQty]   = useState(editItem?.quantity ? String(editItem.quantity) : "");
  const [preco, setPreco] = useState(
    editItem?.price && editItem.price > 0 ? formatBRL(editItem.price) : ""
  );

  const valido = name.trim().length > 0;

  const sugestoesCategoria = SUGESTOES_POR_SECAO[secao] ?? [];
  const sugestoesFiltradas = name.trim().length > 0
    ? sugestoesCategoria.filter((s) => s.toLowerCase().includes(name.trim().toLowerCase()))
    : sugestoesCategoria;

  const salvar = () => {
    if (!valido) return;
    onSubmit({
      name:     name.trim(),
      category: secao,
      quantity: qty ? parseInt(qty, 10) : undefined,
      price:    preco ? parseBRL(preco) : 0,
      done:     editItem?.done ?? false,
    });
    onClose();
  };

  return (
    <Sheet title={isEdit ? "Editar item" : "Novo item"} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        <FInput
          value={name}
          onChange={setName}
          placeholder="Nome do item"
        />

        {/* Seções em chips */}
        <div>
          <p style={{
            margin: "0 0 6px", fontSize: 11, fontWeight: 700,
            color: "var(--vf-tx-mute)", textTransform: "uppercase", letterSpacing: "0.06em",
          }}>Seção</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {SECOES_MERCADO.map((s) => (
              <button
                key={s}
                onClick={() => setSecao(s)}
                style={{
                  padding: "5px 10px", borderRadius: 99, fontSize: 12,
                  border: `1.5px solid ${secao === s ? "var(--vf-rose)" : "var(--vf-bd)"}`,
                  background: secao === s
                    ? "color-mix(in srgb, var(--vf-rose) 12%, transparent)"
                    : "var(--vf-surf)",
                  color: secao === s ? "var(--vf-rose)" : "var(--vf-tx-mute)",
                  fontWeight: secao === s ? 700 : 400,
                  cursor: "pointer", fontFamily: "inherit",
                  WebkitTapHighlightColor: "transparent",
                }}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* ── Sugestões rápidas / autocomplete ── */}
        {sugestoesFiltradas.length > 0 && (
          <div>
            <p style={{
              margin: "0 0 6px", fontSize: 11, fontWeight: 700,
              color: "var(--vf-tx-mute)", textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              {name.trim().length > 0 ? "Sugestões" : "Itens comuns"}
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {sugestoesFiltradas.map((s) => (
                <button
                  key={s}
                  onClick={() => setName(s)}
                  style={{
                    padding: "4px 10px", borderRadius: 99, fontSize: 12,
                    border: `1.5px solid ${name === s ? "var(--vf-ok)" : "var(--vf-bd)"}`,
                    background: name === s
                      ? "color-mix(in srgb, var(--vf-ok) 15%, transparent)"
                      : "var(--vf-surf)",
                    color: name === s ? "var(--vf-ok)" : "var(--vf-tx-soft)",
                    fontWeight: name === s ? 700 : 400,
                    cursor: "pointer", fontFamily: "inherit",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <FInput
              value={qty}
              onChange={setQty}
              placeholder="Qtd (opcional)"
              type="number"
            />
          </div>
          <div style={{ flex: 1 }}>
            <FInput
              value={preco}
              onChange={(v) => setPreco(maskAmount(v))}
              placeholder="Preço (ex: 8,90)"
              inputMode="numeric"
            />
          </div>
        </div>

        <Btn onClick={salvar} disabled={!valido}>
          {isEdit ? "Salvar" : "Adicionar"}
        </Btn>
      </div>
    </Sheet>
  );
}

export function AddShoppingSheet({ isOpen, onClose, editItem }: Props) {
  const adicionar = useOrganizaStore((s) => s.adicionarItemCompra);
  const atualizar = useOrganizaStore((s) => s.atualizarItemCompra);

  if (!isOpen) return null;

  const handleSubmit = (payload: Omit<ShoppingItem, "id" | "createdAt">) => {
    if (editItem) {
      atualizar(editItem.id, payload);
    } else {
      adicionar(payload);
    }
  };

  return (
    <ShoppingItemForm
      key={editItem?.id ?? "novo"}
      editItem={editItem}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
