// src/features/organiza/selectors.ts
import { useShallow } from 'zustand/react/shallow';
import { today } from "@/shared/utils/date";
import { useOrganizaStore } from "./store";
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

export function useShoppingPorCategoria(): Record<string, ShoppingItem[]> {
  return useOrganizaStore(
    useShallow((s) => {
      const items = s.shopping.items.filter((i) => !i.done);
      return items.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
        const cat = item.category || "Geral";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      }, {});
    })
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
