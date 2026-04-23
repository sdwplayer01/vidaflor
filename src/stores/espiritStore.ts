// src/stores/espiritStore.ts
// Store espiritual: gratidão, leituras, orações.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SpiritData, Reading, Prayer } from "@/types/data";
import { saveToStorage } from "@/utils/storage";

// ── Storage adapter ──────────────────────────────────────────────────────────

const vfStorage = createJSONStorage<EspiritStore>(() => ({
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

interface EspiritStore extends SpiritData {
  // Computed
  gratitudeCount: (day: string) => number;
  gratitudeList:  (day: string) => string[];

  // Actions — Gratidão
  adicionarGratidao: (day: string, text: string) => void;
  removerGratidao:   (day: string, index: number) => void;

  // Actions — Leituras
  adicionarLeitura:  (reading: Omit<Reading, "id">) => void;
  removerLeitura:    (id: number) => void;

  // Actions — Orações
  adicionarOracao:   (prayer: Omit<Prayer, "id" | "answered">) => void;
  removerOracao:     (id: number) => void;
  marcarRespondida:  (id: number) => void;

  // Carga
  loadSpirit:        (data: Partial<SpiritData>) => void;
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useEspiritStore = create<EspiritStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      gratitude: {},
      readings:  [],
      prayers:   [],

      // ── Computed ────────────────────────────────────────────────────────────

      gratitudeCount: (day) => get().gratitude[day]?.length ?? 0,

      gratitudeList: (day) => get().gratitude[day] ?? [],

      // ── Gratidão ────────────────────────────────────────────────────────────

      adicionarGratidao: (day, text) => set((state) => ({
        gratitude: {
          ...state.gratitude,
          [day]: [...(state.gratitude[day] ?? []), text],
        },
      })),

      removerGratidao: (day, index) => set((state) => {
        const list = [...(state.gratitude[day] ?? [])];
        list.splice(index, 1);
        return {
          gratitude: { ...state.gratitude, [day]: list },
        };
      }),

      // ── Leituras ────────────────────────────────────────────────────────────

      adicionarLeitura: (reading) => set((state) => ({
        readings: [{ id: Date.now(), ...reading }, ...state.readings],
      })),

      removerLeitura: (id) => set((state) => ({
        readings: state.readings.filter(r => r.id !== id),
      })),

      // ── Orações ─────────────────────────────────────────────────────────────

      adicionarOracao: (prayer) => set((state) => ({
        prayers: [
          { id: Date.now(), ...prayer, answered: false },
          ...state.prayers,
        ],
      })),

      removerOracao: (id) => set((state) => ({
        prayers: state.prayers.filter(p => p.id !== id),
      })),

      marcarRespondida: (id) => set((state) => ({
        prayers: state.prayers.map(p =>
          p.id === id ? { ...p, answered: !p.answered } : p
        ),
      })),

      // ── Carga ───────────────────────────────────────────────────────────────

      loadSpirit: (data) => set((state) => ({
        gratitude: data.gratitude ?? state.gratitude,
        readings:  data.readings  ?? state.readings,
        prayers:   data.prayers   ?? state.prayers,
      })),
    }),
    {
      name: "vidaflor-espiritual",
      storage: vfStorage,
    }
  )
);
