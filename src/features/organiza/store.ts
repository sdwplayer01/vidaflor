// src/features/organiza/store.ts
import { create } from "zustand";
import { persistVidaFlor } from "@/shared/storage/persist-middleware";
import { STORAGE_KEYS } from "@/shared/storage/keys";
import { genId } from "@/shared/utils/id";
import { today } from "@/shared/utils/date";
import type { ID } from "@/shared/types/common";
import type { OrganizaState, OrganizaActions, ShoppingItem, Note, Reminder } from "./types";
import { seedOrganiza } from "./seed";
import { ORGANIZA_VERSION, migrate } from "./migrations";

export const useOrganizaStore = create<OrganizaState & OrganizaActions>()(
  persistVidaFlor(
    (set) => ({
      ...seedOrganiza,

      // ── Shopping ─────────────────────────────────────────────────────────
      adicionarItemCompra: (item: Omit<ShoppingItem, "id" | "done" | "createdAt">) =>
        set((state) => ({
          shopping: {
            items: [
              ...state.shopping.items,
              {
                id:        genId("shop"),
                done:      false,
                createdAt: today(),
                ...item,
              },
            ],
          },
        })),

      marcarItemComprado: (id: ID) =>
        set((state) => ({
          shopping: {
            items: state.shopping.items.map((i) =>
              i.id === id ? { ...i, done: true } : i
            ),
          },
        })),

      desmarcarItemComprado: (id: ID) =>
        set((state) => ({
          shopping: {
            items: state.shopping.items.map((i) =>
              i.id === id ? { ...i, done: false } : i
            ),
          },
        })),

      removerItemCompra: (id: ID) =>
        set((state) => ({
          shopping: {
            items: state.shopping.items.filter((i) => i.id !== id),
          },
        })),

      limparComprados: () =>
        set((state) => ({
          shopping: {
            items: state.shopping.items.filter((i) => !i.done),
          },
        })),

      // ── Notes ─────────────────────────────────────────────────────────────
      adicionarNota: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) =>
        set((state) => ({
          notes: {
            list: [
              {
                id:        genId("note"),
                createdAt: today(),
                updatedAt: today(),
                ...note,
              },
              ...state.notes.list,
            ],
          },
        })),

      atualizarNota: (id: ID, patch: Partial<Pick<Note, "title" | "content" | "color">>) =>
        set((state) => ({
          notes: {
            list: state.notes.list.map((n) =>
              n.id === id ? { ...n, ...patch, updatedAt: today() } : n
            ),
          },
        })),

      removerNota: (id: ID) =>
        set((state) => ({
          notes: {
            list: state.notes.list.filter((n) => n.id !== id),
          },
        })),

      // ── Reminders ─────────────────────────────────────────────────────────
      adicionarLembrete: (reminder: Omit<Reminder, "id" | "done">) =>
        set((state) => ({
          reminders: {
            list: [
              { id: genId("rem"), done: false, ...reminder },
              ...state.reminders.list,
            ],
          },
        })),

      atualizarLembrete: (id: ID, patch: Partial<Reminder>) =>
        set((state) => ({
          reminders: {
            list: state.reminders.list.map((r) =>
              r.id === id ? { ...r, ...patch } : r
            ),
          },
        })),

      marcarLembreteFeito: (id: ID) =>
        set((state) => ({
          reminders: {
            list: state.reminders.list.map((r) =>
              r.id === id ? { ...r, done: !r.done } : r
            ),
          },
        })),

      removerLembrete: (id: ID) =>
        set((state) => ({
          reminders: {
            list: state.reminders.list.filter((r) => r.id !== id),
          },
        })),
    }),
    {
      name:    STORAGE_KEYS.organiza,
      version: ORGANIZA_VERSION,
      migrate,
    }
  )
);
