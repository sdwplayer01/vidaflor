// src/stores/kidsStore.ts
// Store de Crianças: perfis, tarefas por criança, done tracking diário.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Kid, KidTask, KidsData } from "@/types/data";
import { saveToStorage } from "@/utils/storage";

// ── Storage adapter ──────────────────────────────────────────────────────────

const vfStorage = createJSONStorage<KidsStore>(() => ({
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

// ── Tipos ────────────────────────────────────────────────────────────────────

interface KidsStore extends KidsData {
  // Actions — Crianças
  addChild:       (child: Omit<Kid, "id">) => void;
  removeChild:    (id: number) => void;
  updateChild:    (id: number, updates: Partial<Omit<Kid, "id">>) => void;

  // Actions — Tarefas da criança
  addTaskToChild:    (childId: number, task: Omit<KidTask, "id">) => void;
  removeTaskFromChild: (childId: number, taskId: number) => void;

  // Actions — Done tracking
  toggleKidTask:  (day: string, taskId: number) => void;
  resetKidsDone:  (day: string) => void;

  // Computed
  childProgress:  (childId: number, day: string) => { done: number; total: number };

  // Hydration
  loadKids:       (data: Partial<KidsData>) => void;
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useKidsStore = create<KidsStore>()(
  persist(
    (set, get) => ({
      // Estado inicial — seed data com uma criança exemplo
      children: [
        {
          id:    1,
          name:  "Sofia",
          av:    "👧",
          age:   6,
          color: "#F9A8D4",
          tasks: [
            { id: 1, task: "Escovar os dentes",  ic: "🦷" },
            { id: 2, task: "Arrumar a cama",     ic: "🛏️" },
            { id: 3, task: "Guardar brinquedos",  ic: "🧸" },
            { id: 4, task: "Tomar banho",         ic: "🛁" },
            { id: 5, task: "Ler 10 minutos",      ic: "📖" },
          ],
        },
      ],
      done: {},

      // ── Actions — Crianças ───────────────────────────────────────────────

      addChild: (child) => set((state) => ({
        children: [...state.children, { id: Date.now(), ...child }],
      })),

      removeChild: (id) => set((state) => ({
        children: state.children.filter(c => c.id !== id),
      })),

      updateChild: (id, updates) => set((state) => ({
        children: state.children.map(c =>
          c.id === id ? { ...c, ...updates } : c
        ),
      })),

      // ── Actions — Tarefas ────────────────────────────────────────────────

      addTaskToChild: (childId, task) => set((state) => ({
        children: state.children.map(c =>
          c.id === childId
            ? { ...c, tasks: [...c.tasks, { id: Date.now(), ...task }] }
            : c
        ),
      })),

      removeTaskFromChild: (childId, taskId) => set((state) => ({
        children: state.children.map(c =>
          c.id === childId
            ? { ...c, tasks: c.tasks.filter(t => t.id !== taskId) }
            : c
        ),
      })),

      // ── Actions — Done ───────────────────────────────────────────────────

      toggleKidTask: (day, taskId) => set((state) => {
        const prev = state.done[day] ?? [];
        const next = prev.includes(taskId)
          ? prev.filter(x => x !== taskId)
          : [...prev, taskId];
        return { done: { ...state.done, [day]: next } };
      }),

      resetKidsDone: (day) => set((state) => {
        const copy = { ...state.done };
        delete copy[day];
        return { done: copy };
      }),

      // ── Computed ─────────────────────────────────────────────────────────

      childProgress: (childId, day) => {
        const state = get();
        const child = state.children.find(c => c.id === childId);
        if (!child) return { done: 0, total: 0 };
        const doneIds = state.done[day] ?? [];
        const childDone = child.tasks.filter(t => doneIds.includes(t.id)).length;
        return { done: childDone, total: child.tasks.length };
      },

      // ── Hydration ────────────────────────────────────────────────────────

      loadKids: (data) => set((state) => ({
        children: data.children ?? state.children,
        done:     data.done     ?? state.done,
      })),
    }),
    {
      name: "vidaflor-kids",
      storage: vfStorage,
    }
  )
);
