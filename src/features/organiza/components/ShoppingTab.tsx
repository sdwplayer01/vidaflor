// src/features/organiza/components/ShoppingTab.tsx
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ConfirmDel } from "@/shared/ui/ConfirmDel";
import { Btn }        from "@/shared/ui/Btn";
import { useOrganizaStore } from "../store";
import { useShoppingPendentes, useShoppingComprados } from "../selectors";
import { AddShoppingSheet } from "./AddShoppingSheet";
import { ShoppingItem } from "./ShoppingItem";
import type { ID } from "@/shared/types/common";

export function ShoppingTab() {
  const pendentes  = useShoppingPendentes();
  const comprados  = useShoppingComprados();
  const marcarItemComprado    = useOrganizaStore((s) => s.marcarItemComprado);
  const desmarcarItemComprado = useOrganizaStore((s) => s.desmarcarItemComprado);
  const removerItemCompra     = useOrganizaStore((s) => s.removerItemCompra);
  const limparComprados       = useOrganizaStore((s) => s.limparComprados);

  const [sheetAdd, setSheetAdd] = useState(false);
  const [deletandoId, setDeletandoId] = useState<ID | null>(null);

  const todosItens = [...pendentes, ...comprados];
  const itemDeletando = todosItens.find((i) => i.id === deletandoId);

  const handleToggle = (id: ID) => {
    const item = todosItens.find((i) => i.id === id);
    if (!item) return;
    if (item.done) desmarcarItemComprado(id);
    else marcarItemComprado(id);
  };

  if (pendentes.length === 0 && comprados.length === 0) {
    return (
      <>
        <EmptyState icon={<ShoppingCart size={24} />} title="Lista vazia" desc="Adicione itens para comprar" />
        <AddShoppingSheet isOpen={sheetAdd} onClose={() => setSheetAdd(false)} />
      </>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {pendentes.map((item) => (
        <ShoppingItem key={item.id} item={item} onToggle={handleToggle} onRemove={(id) => setDeletandoId(id)} />
      ))}
      {comprados.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 0 4px" }}>
            <p style={{ margin: 0, fontSize: 12, color: "var(--vf-tm)", fontWeight: 600 }}>
              Comprados ({comprados.length})
            </p>
            <button onClick={limparComprados} style={{ fontSize: 11, color: "var(--vf-er)", background: "none", border: "none", cursor: "pointer" }}>
              Limpar
            </button>
          </div>
          {comprados.map((item) => (
            <ShoppingItem key={item.id} item={item} onToggle={handleToggle} onRemove={(id) => setDeletandoId(id)} />
          ))}
        </>
      )}
      {deletandoId && itemDeletando && (
        <ConfirmDel
          label={itemDeletando.name}
          onCancel={() => setDeletandoId(null)}
          onConfirm={() => { removerItemCompra(deletandoId); setDeletandoId(null); }}
        />
      )}
      <AddShoppingSheet isOpen={sheetAdd} onClose={() => setSheetAdd(false)} />
    </div>
  );
}
