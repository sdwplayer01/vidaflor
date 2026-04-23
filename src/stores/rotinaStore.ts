// src/stores/rotinaStore.ts
// Store da rotina: tarefas por turno, modo essencial, done tracking.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { RotinaTarefa, RoutineData } from "@/types/data";
import { saveToStorage } from "@/utils/storage";

// ── Storage adapter ──────────────────────────────────────────────────────────

const vfStorage = createJSONStorage<RotinaStore>(() => ({
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

type Turno = "morning" | "afternoon" | "night" | "essential";

interface RotinaStore extends RoutineData {
  // Actions
  toggleTarefa:    (day: string, id: number) => void;
  adicionarTarefa: (turno: Turno, tarefa: Omit<RotinaTarefa, "id">) => void;
  removerTarefa:   (turno: Turno, id: number) => void;
  toggleEssMode:   () => void;
  resetDone:       (day: string) => void;
  loadRoutine:     (data: Partial<RoutineData>) => void;
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useRotinaStore = create<RotinaStore>()(
  persist(
    (set) => ({
      // Estado inicial (seed data como no App.jsx)
      morning: [
        { id: 1, task: "Oração da manhã",    time: "06:00" },
        { id: 2, task: "Exercício",           time: "06:30" },
        { id: 3, task: "Café com a família",  time: "07:30" },
        { id: 4, task: "Vitaminas",           time: "08:30" },
      ],
      afternoon: [
        { id: 5, task: "Almoço em família",   time: "12:00" },
        { id: 6, task: "Estudo pessoal",      time: "13:30" },
        { id: 7, task: "Cuidados da casa",    time: "14:30" },
        { id: 8, task: "Lanche das crianças", time: "16:00" },
      ],
      night: [
        { id: 9,  task: "Devocional em família", time: "19:00" },
        { id: 10, task: "Jantar em família",     time: "19:30" },
        { id: 11, task: "Skincare noturno",      time: "20:30" },
        { id: 12, task: "Oração da noite",       time: "22:00" },
      ],
      essential: [
        { id: 101, task: "Oração",             time: "" },
        { id: 102, task: "Tomar água",          time: "" },
        { id: 103, task: "Devocional",          time: "" },
        { id: 104, task: "Refeição em família", time: "" },
        { id: 105, task: "Dormir cedo",         time: "" },
      ],
      done:    {},
      essMode: false,

      // Actions
      toggleTarefa: (day, id) => set((state) => {
        const prev = state.done[day] ?? [];
        const next = prev.includes(id)
          ? prev.filter(x => x !== id)
          : [...prev, id];
        return { done: { ...state.done, [day]: next } };
      }),

      adicionarTarefa: (turno, tarefa) => set((state) => ({
        [turno]: [...state[turno], { id: Date.now(), ...tarefa }],
      })),

      removerTarefa: (turno, id) => set((state) => ({
        [turno]: state[turno].filter(t => t.id !== id),
      })),

      toggleEssMode: () => set((state) => ({ essMode: !state.essMode })),

      resetDone: (day) => set((state) => {
        const copy = { ...state.done };
        delete copy[day];
        return { done: copy };
      }),

      loadRoutine: (data) => set((state) => ({
        morning:   data.morning   ?? state.morning,
        afternoon: data.afternoon ?? state.afternoon,
        night:     data.night     ?? state.night,
        essential: data.essential ?? state.essential,
        done:      data.done      ?? state.done,
        essMode:   data.essMode   ?? state.essMode,
      })),
    }),
    {
      name: "vidaflor-rotina",
      storage: vfStorage,
    }
  )
);
