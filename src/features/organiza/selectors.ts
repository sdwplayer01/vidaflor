// src/features/organiza/selectors.ts
import { useShallow } from 'zustand/react/shallow';
import { today } from "@/shared/utils/date";
import { useOrganizaStore } from "./store";
import { SECOES_MERCADO } from "./types";
import type { ShoppingItem, Note, Reminder } from "./types";

export function useShoppingPendentes(): ShoppingItem[] {
  return useOrganizaStore(
    useShallow((s) => s.shopping.items.filter((i) => !i.done))
  );
}

export function useShoppingComprados(): ShoppingItem[] {
  return useOrganizaStore(
    useShallow((s) => s.shopping.items.filter((i) => i.done))
  );
}

// Legado — mantido para compatibilidade
export function useShoppingPorCategoria(): Record<string, ShoppingItem[]> {
  return useOrganizaStore(
    useShallow((s) => {
      const items = s.shopping.items.filter((i) => !i.done);
      return items.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
        const cat = item.category || "Outros";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      }, {});
    })
  );
}

// Fase 3: itens pendentes agrupados na ordem de SECOES_MERCADO
export function useComprasPorSecao(): Array<{ secao: string; items: ShoppingItem[] }> {
  return useOrganizaStore(
    useShallow((s) => {
      const pendentes = s.shopping.items.filter((i) => !i.done);
      const map: Record<string, ShoppingItem[]> = {};
      for (const item of pendentes) {
        const sec = item.category || "Outros";
        if (!map[sec]) map[sec] = [];
        map[sec].push(item);
      }
      // Ordem fixa de SECOES_MERCADO; seções extras vão no fim
      const result: Array<{ secao: string; items: ShoppingItem[] }> = [];
      for (const secao of SECOES_MERCADO) {
        if (map[secao]?.length) result.push({ secao, items: map[secao] });
      }
      // Seções não previstas (dados legados)
      for (const [secao, items] of Object.entries(map)) {
        if (!SECOES_MERCADO.includes(secao as any) && items.length) {
          result.push({ secao, items });
        }
      }
      return result;
    })
  );
}

// Fase 3: soma dos preços dos itens pendentes (centavos)
export function useEstimativaLista(): number {
  return useOrganizaStore(
    useShallow((s) =>
      s.shopping.items
        .filter((i) => !i.done)
        .reduce((acc, i) => acc + (i.price ?? 0), 0)
    )
  );
}

export function useNotasOrdenadas(): Note[] {
  return useOrganizaStore(
    useShallow((s) =>
      [...s.notes.list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    )
  );
}

export function useLembretesHoje(): Reminder[] {
  const day = today();
  return useOrganizaStore(
    useShallow((s) => s.reminders.list.filter((r) => r.date === day))
  );
}

export function useLembretesPendentes(): Reminder[] {
  return useOrganizaStore(
    useShallow((s) =>
      s.reminders.list.filter((r) => !r.done).sort((a, b) => a.date.localeCompare(b.date))
    )
  );
}

export function useLembretesUrgentes(): Reminder[] {
  const day = today();
  return useOrganizaStore(
    useShallow((s) =>
      s.reminders.list.filter((r) => !r.done && r.date <= day)
    )
  );
}
