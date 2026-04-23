// src/stores/organizaStore.ts
// Store de organização: compras, notas, lembretes.
// Três domínios em um store — compartilham a aba "Organiza".

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ShoppingItem, Note, Reminder, Priority } from "@/types/data";
import { saveToStorage } from "@/utils/storage";
import { today } from "@/utils/date";

// ── Storage adapter ──────────────────────────────────────────────────────────

const vfStorage = createJSONStorage<OrganizaStore>(() => ({
  getItem: (name: string): string | null => {
    try { return localStorage.getItem(name); } catch { return null; }
  },
  setItem: (name: string, value: string): void => {
    saveToStorage(name, JSON.parse(value));
  },
  removeItem: (name: string): void => {
    try { localStorage.removeItem(name); } catch { /* silent */ }
  },
}));

// ── Interface ────────────────────────────────────────────────────────────────

interface OrganizaStore {
  // Estado
  shopping:  ShoppingItem[];
  notes:     Note[];
  reminders: Reminder[];

  // Computed
  remindersPendentes:    (day: string) => number;
  shoppingPendentes:     () => number;

  // Actions — Compras
  adicionarItem:    (item: Omit<ShoppingItem, "id" | "done">) => void;
  removerItem:      (id: number) => void;
  toggleItemDone:   (id: number) => void;
  limparComprados:  () => void;

  // Actions — Notas
  adicionarNota:    (nota: Omit<Note, "id" | "date">) => void;
  removerNota:      (id: number) => void;
  editarNota:       (id: number, updates: Partial<Pick<Note, "title" | "content" | "color">>) => void;

  // Actions — Lembretes
  adicionarLembrete:  (lembrete: Omit<Reminder, "id" | "done">) => void;
  removerLembrete:    (id: number) => void;
  toggleLembreteDone: (id: number) => void;

  // Carga
  loadOrganiza: (data: {
    shopping?:  ShoppingItem[];
    notes?:     Note[];
    reminders?: Reminder[];
  }) => void;
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useOrganizaStore = create<OrganizaStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      shopping:  [],
      notes:     [],
      reminders: [],

      // ── Computed ────────────────────────────────────────────────────────────

      remindersPendentes: (day) =>
        get().reminders.filter(r => !r.done && r.date === day).length,

      shoppingPendentes: () =>
        get().shopping.filter(i => !i.done).length,

      // ── Compras ─────────────────────────────────────────────────────────────

      adicionarItem: (item) => set((state) => ({
        shopping: [...state.shopping, { id: Date.now(), ...item, done: false }],
      })),

      removerItem: (id) => set((state) => ({
        shopping: state.shopping.filter(i => i.id !== id),
      })),

      toggleItemDone: (id) => set((state) => ({
        shopping: state.shopping.map(i =>
          i.id === id ? { ...i, done: !i.done } : i
        ),
      })),

      limparComprados: () => set((state) => ({
        shopping: state.shopping.filter(i => !i.done),
      })),

      // ── Notas ───────────────────────────────────────────────────────────────

      adicionarNota: (nota) => set((state) => ({
        notes: [{ id: Date.now(), ...nota, date: today() }, ...state.notes],
      })),

      removerNota: (id) => set((state) => ({
        notes: state.notes.filter(n => n.id !== id),
      })),

      editarNota: (id, updates) => set((state) => ({
        notes: state.notes.map(n =>
          n.id === id
            ? {
                ...n,
                title:   updates.title   ?? n.title,
                content: updates.content ?? n.content,
                color:   updates.color   ?? n.color,
              }
            : n
        ),
      })),

      // ── Lembretes ───────────────────────────────────────────────────────────

      adicionarLembrete: (lembrete) => set((state) => ({
        reminders: [
          { id: Date.now(), ...lembrete, done: false },
          ...state.reminders,
        ],
      })),

      removerLembrete: (id) => set((state) => ({
        reminders: state.reminders.filter(r => r.id !== id),
      })),

      toggleLembreteDone: (id) => set((state) => ({
        reminders: state.reminders.map(r =>
          r.id === id ? { ...r, done: !r.done } : r
        ),
      })),

      // ── Carga ───────────────────────────────────────────────────────────────

      loadOrganiza: (data) => set((state) => ({
        shopping:  data.shopping  ?? state.shopping,
        notes:     data.notes     ?? state.notes,
        reminders: data.reminders ?? state.reminders,
      })),
    }),
    {
      name: "vidaflor-organiza",
      storage: vfStorage,
    }
  )
);
