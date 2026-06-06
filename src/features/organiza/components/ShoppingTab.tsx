// src/features/organiza/components/ShoppingTab.tsx
// Fase 3: agrupado por seção + estimativa + elo Mercado
import { useState } from "react";
import { ShoppingCart, ShoppingBag } from "lucide-react";
import { EmptyState }  from "@/shared/ui/EmptyState";
import { ConfirmDel }  from "@/shared/ui/ConfirmDel";
import { Btn }         from "@/shared/ui/Btn";
import { Sheet }       from "@/shared/ui/Sheet";
import { FInput }      from "@/shared/ui/FInput";
import { useOrganizaStore } from "../store";
import {
  useShoppingComprados,
  useComprasPorSecao,
  useEstimativaLista,
  useCarrinhoTotal,
} from "../selectors";
import { useOrcamentoCategoria } from "@/features/financas/selectors";
import { useFinancasStore }      from "@/features/financas/store";
import { formatBRL, parseBRL }   from "@/shared/utils/money";
import { today }                 from "@/shared/utils/date";
import { AddShoppingSheet }      from "./AddShoppingSheet";
import { ShoppingItem as ShoppingItemRow } from "./ShoppingItem";
import type { ShoppingItem } from "../types";
import type { ID } from "@/shared/types/common";

// ── Barra do envelope Mercado ─────────────────────────────────────────────────
function EnvelopeMercadoBar() {
  const MERCADO_CAT = "🛒 Mercado";
  const { disponivel, gasto, pct } = useOrcamentoCategoria(MERCADO_CAT);
  if (disponivel === 0) return null;
  const cor = pct >= 90 ? "var(--vf-er)" : pct >= 70 ? "var(--vf-wn)" : "var(--vf-ok)";
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: "var(--vf-tx-mute)" }}>Envelope Mercado</span>
        <span style={{ fontSize: 11, color: "var(--vf-tx-mute)" }}>
          R$ {formatBRL(gasto)} / R$ {formatBRL(disponivel)}
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "var(--vf-bd)", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 2, background: cor,
          width: `${Math.min(100, pct)}%`, transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  );
}

// ── Sheet de confirmação da compra ────────────────────────────────────────────
interface ConcluirSheetProps {
  estimativa: number;
  onClose:    () => void;
  onConfirm:  (valor: number) => void;
}

function ConcluirCompraSheet({ estimativa, onClose, onConfirm }: ConcluirSheetProps) {
  const [valor, setValor] = useState(estimativa > 0 ? formatBRL(estimativa) : "");
  const valido = parseBRL(valor) > 0;
  return (
    <Sheet title="Concluir compra" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--vf-tx-mute)" }}>
          Quanto você gastou no mercado? O valor será lançado no envelope <strong>🛒 Mercado</strong>.
        </p>
        <FInput
          value={valor}
          onChange={setValor}
          placeholder="Ex: 245,60"
        />
        <EnvelopeMercadoBar />
        <Btn onClick={() => valido && onConfirm(parseBRL(valor))} disabled={!valido}>
          Lançar no orçamento
        </Btn>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Sheet>
  );
}

// ── Tab principal ─────────────────────────────────────────────────────────────
export function ShoppingTab() {
  const secoes      = useComprasPorSecao();
  const comprados   = useShoppingComprados();
  const estimativa  = useEstimativaLista();
  const noCarrinho  = useCarrinhoTotal();

  const marcarItemComprado    = useOrganizaStore((s) => s.marcarItemComprado);
  const desmarcarItemComprado = useOrganizaStore((s) => s.desmarcarItemComprado);
  const removerItemCompra     = useOrganizaStore((s) => s.removerItemCompra);
  const limparComprados       = useOrganizaStore((s) => s.limparComprados);
  const adicionarTransacao    = useFinancasStore((s) => s.adicionarTransacao);

  const [sheetAdd,       setSheetAdd]       = useState(false);
  const [editItem,       setEditItem]       = useState<ShoppingItem | undefined>(undefined);
  const [deletandoId,    setDeletandoId]    = useState<ID | null>(null);
  const [concluirOpen,   setConcluirOpen]   = useState(false);

  const totalItens = secoes.reduce((n, s) => n + s.items.length, 0);
  const itemDeletando = [...secoes.flatMap((s) => s.items), ...comprados].find((i) => i.id === deletandoId);

  const handleToggle = (id: ID) => {
    const todos = [...secoes.flatMap((s) => s.items), ...comprados];
    const item = todos.find((i) => i.id === id);
    if (!item) return;
    if (item.done) desmarcarItemComprado(id);
    else marcarItemComprado(id);
  };

  const handleConcluir = (valor: number) => {
    adicionarTransacao({
      desc:     "Compra do mercado",
      amount:   valor,
      type:     "expense",
      category: "🛒 Mercado",
      date:     today(),
      paid:     true,
      cardId:   null,
      due:      undefined,
    });
    limparComprados();
    setConcluirOpen(false);
  };

  if (totalItens === 0 && comprados.length === 0) {
    return (
      <>
        <EmptyState
          icon={<ShoppingCart size={24} />}
          title="Lista vazia"
          desc="Adicione itens para comprar"
        />
        <AddShoppingSheet isOpen={sheetAdd} onClose={() => setSheetAdd(false)} />
      </>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

      {/* ── Card estimativa + envelope ───────────────────────── */}
      {totalItens > 0 && (
        <div style={{
          padding: "12px 14px", borderRadius: 14,
          background: "var(--vf-surf)", border: "1px solid var(--vf-bd)",
          marginBottom: 4,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--vf-tx-mute)" }}>
              {totalItens} {totalItens === 1 ? "item" : "itens"}
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--vf-tx)", fontVariantNumeric: "tabular-nums" }}>
              {estimativa > 0 ? `~ R$ ${formatBRL(estimativa)}` : "sem estimativa"}
            </span>
          </div>
          {noCarrinho > 0 && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
              <span style={{ fontSize: 11, color: "var(--vf-ok)", fontVariantNumeric: "tabular-nums" }}>
                no carrinho: R$ {formatBRL(noCarrinho)}
              </span>
            </div>
          )}
          <EnvelopeMercadoBar />
          <Btn
            onClick={() => setConcluirOpen(true)}
            style={{ marginTop: 10, width: "100%" }}
          >
            <ShoppingBag size={14} style={{ marginRight: 6 }} />
            Concluir compra
          </Btn>
        </div>
      )}

      {/* ── Itens agrupados por seção ────────────────────────── */}
      {secoes.map(({ secao, items }) => (
        <div key={secao}>
          <p style={{
            margin: "6px 0 4px 2px", fontSize: 11, fontWeight: 700,
            color: "var(--vf-tx-mute)", textTransform: "uppercase", letterSpacing: "0.05em",
          }}>
            {secao}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {items.map((item) => (
              <ShoppingItemRow
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onEdit={(i) => { setEditItem(i); setSheetAdd(true); }}
                onRemove={(id) => setDeletandoId(id)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* ── Comprados ────────────────────────────────────────── */}
      {comprados.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "6px 0 4px" }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--vf-tx-mute)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Comprados ({comprados.length})
            </p>
            <button
              onClick={limparComprados}
              style={{ fontSize: 11, color: "var(--vf-er)", background: "none", border: "none", cursor: "pointer" }}
            >
              Limpar
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {comprados.map((item) => (
              <ShoppingItemRow
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onEdit={(i) => { setEditItem(i); setSheetAdd(true); }}
                onRemove={(id) => setDeletandoId(id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Modais ───────────────────────────────────────────── */}
      {deletandoId && itemDeletando && (
        <ConfirmDel
          label={itemDeletando.name}
          onCancel={() => setDeletandoId(null)}
          onConfirm={() => { removerItemCompra(deletandoId); setDeletandoId(null); }}
        />
      )}

      <AddShoppingSheet
        isOpen={sheetAdd}
        onClose={() => { setSheetAdd(false); setEditItem(undefined); }}
        editItem={editItem}
      />

      {concluirOpen && (
        <ConcluirCompraSheet
          key={String(estimativa)}
          estimativa={estimativa}
          onClose={() => setConcluirOpen(false)}
          onConfirm={handleConcluir}
        />
      )}
    </div>
  );
}
