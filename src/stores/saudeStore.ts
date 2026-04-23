// src/stores/saudeStore.ts
// Store de saúde: multi-perfil, água, ciclo, medicamentos, anotações.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  HealthData,
  HealthProfile,
  ProfileType,
  CycleConfig,
  Medication,
} from "@/types/data";
import { saveToStorage } from "@/utils/storage";
import { today } from "@/utils/date";

// ── Storage adapter ──────────────────────────────────────────────────────────

const vfStorage = createJSONStorage<SaudeStore>(() => ({
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

interface SaudeStore extends HealthData {
  // Computed helpers
  profileAtivo: () => HealthProfile | undefined;

  // Actions — Perfil
  switchProfile:   (id: string) => void;
  adicionarPerfil: (perfil: Omit<HealthProfile, "id" | "water" | "meds" | "notes"> & { waterGoal?: number }) => void;
  removerPerfil:   (id: string) => void;
  editarPerfil:    (id: string, updates: Partial<Pick<HealthProfile, "name" | "av" | "color">> & { waterGoal?: number; cycle?: CycleConfig }) => void;

  // Actions — Água
  addWater:        (profileId: string, day: string, ml: number) => void;
  resetWater:      (profileId: string, day: string) => void;
  setWaterGoal:    (profileId: string, goal: number) => void;

  // Actions — Ciclo
  saveCycle:       (profileId: string, cycle: CycleConfig) => void;

  // Actions — Medicamentos
  adicionarMed:    (profileId: string, med: Omit<Medication, "id" | "log">) => void;
  removerMed:      (profileId: string, medId: string) => void;
  toggleMedLog:    (profileId: string, medId: string, day: string) => void;

  // Actions — Notas
  saveNote:        (profileId: string, day: string, text: string) => void;

  // Actions — Carga
  loadHealth:      (data: Partial<HealthData>) => void;
}

// ── Helper para atualizar um perfil por ID ───────────────────────────────────

function updateProfile(
  profiles: HealthProfile[],
  id: string,
  fn: (p: HealthProfile) => HealthProfile
): HealthProfile[] {
  return profiles.map(p => p.id === id ? fn(p) : p);
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useSaudeStore = create<SaudeStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      activeProfile: "eu",
      profiles: [
        {
          id:    "eu",
          name:  "Você",
          av:    "👩",
          type:  "adult_f" as ProfileType,
          color: "#E8799A",
          water: { goal: 2000, log: {} },
          cycle: { start: today(), len: 28, menses: 5 },
          meds:  [],
          notes: {},
        },
      ],

      // Computed
      profileAtivo: () => {
        const s = get();
        return s.profiles.find(p => p.id === s.activeProfile)
            ?? s.profiles[0];
      },

      // ── Perfil ──────────────────────────────────────────────────────────────

      switchProfile: (id) => set({ activeProfile: id }),

      adicionarPerfil: (input) => {
        const id = `p_${Date.now()}`;
        const profile: HealthProfile = {
          id,
          name:  input.name,
          av:    input.av,
          type:  input.type,
          color: input.color,
          water: { goal: input.waterGoal ?? 2000, log: {} },
          meds:  [],
          notes: {},
        };
        if (input.type === "adult_f") {
          profile.cycle = { start: today(), len: 28, menses: 5 };
        }
        set((state) => ({
          profiles:      [...state.profiles, profile],
          activeProfile: id,
        }));
      },

      removerPerfil: (id) => set((state) => {
        if (state.profiles.length <= 1) return state;
        const remaining = state.profiles.filter(p => p.id !== id);
        return {
          profiles:      remaining,
          activeProfile: remaining[0]?.id ?? "eu",
        };
      }),

      editarPerfil: (id, updates) => set((state) => ({
        profiles: updateProfile(state.profiles, id, (p) => ({
          ...p,
          name:  updates.name  ?? p.name,
          av:    updates.av    ?? p.av,
          color: updates.color ?? p.color,
          water: updates.waterGoal != null ? { ...p.water, goal: updates.waterGoal } : p.water,
          cycle: updates.cycle !== undefined ? updates.cycle : p.cycle,
        })),
      })),

      // ── Água ────────────────────────────────────────────────────────────────

      addWater: (profileId, day, ml) => set((state) => ({
        profiles: updateProfile(state.profiles, profileId, (p) => ({
          ...p,
          water: {
            ...p.water,
            log: { ...p.water.log, [day]: (p.water.log[day] ?? 0) + ml },
          },
        })),
      })),

      resetWater: (profileId, day) => set((state) => ({
        profiles: updateProfile(state.profiles, profileId, (p) => ({
          ...p,
          water: {
            ...p.water,
            log: { ...p.water.log, [day]: 0 },
          },
        })),
      })),

      setWaterGoal: (profileId, goal) => set((state) => ({
        profiles: updateProfile(state.profiles, profileId, (p) => ({
          ...p,
          water: { ...p.water, goal },
        })),
      })),

      // ── Ciclo ───────────────────────────────────────────────────────────────

      saveCycle: (profileId, cycle) => set((state) => ({
        profiles: updateProfile(state.profiles, profileId, (p) => ({
          ...p,
          cycle,
        })),
      })),

      // ── Medicamentos ────────────────────────────────────────────────────────

      adicionarMed: (profileId, med) => set((state) => ({
        profiles: updateProfile(state.profiles, profileId, (p) => ({
          ...p,
          meds: [...p.meds, { id: `m_${Date.now()}`, ...med, log: {} }],
        })),
      })),

      removerMed: (profileId, medId) => set((state) => ({
        profiles: updateProfile(state.profiles, profileId, (p) => ({
          ...p,
          meds: p.meds.filter(m => m.id !== medId),
        })),
      })),

      toggleMedLog: (profileId, medId, day) => set((state) => ({
        profiles: updateProfile(state.profiles, profileId, (p) => ({
          ...p,
          meds: p.meds.map(m =>
            m.id === medId
              ? { ...m, log: { ...m.log, [day]: !m.log[day] } }
              : m
          ),
        })),
      })),

      // ── Notas ───────────────────────────────────────────────────────────────

      saveNote: (profileId, day, text) => set((state) => ({
        profiles: updateProfile(state.profiles, profileId, (p) => ({
          ...p,
          notes: { ...p.notes, [day]: text },
        })),
      })),

      // ── Carga ───────────────────────────────────────────────────────────────

      loadHealth: (data) => set((state) => ({
        activeProfile: data.activeProfile ?? state.activeProfile,
        profiles:      data.profiles      ?? state.profiles,
      })),
    }),
    {
      name: "vidaflor-saude",
      storage: vfStorage,
    }
  )
);
