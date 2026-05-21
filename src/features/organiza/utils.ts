// src/features/organiza/utils.ts
// Funcoes puras. Zero React. Zero imports de store.
import type { OrganizaState } from "./types";

/** Conta itens pendentes de compra */
export function countShoppingPendentes(state: OrganizaState): number {
  return state.shopping.items.filter((i) => !i.done).length;
}

/** Conta lembretes urgentes nao feitos */
export function countLembretesUrgentes(state: OrganizaState): number {
  return state.reminders.list.filter((r) => r.priority === "alta" && !r.done).length;
}
