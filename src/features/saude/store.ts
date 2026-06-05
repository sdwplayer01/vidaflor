// src/features/saude/store.ts
import { create } from 'zustand';
import { persistVidaFlor } from '@/shared/storage/persist-middleware';
import { STORAGE_KEYS } from '@/shared/storage/keys';
import { genId } from '@/shared/utils/id';
import { today } from '@/shared/utils/date';
import { seedSaude } from './seed';
import { migrate, SAUDE_VERSION } from './migrations';
import type { SaudeState, SaudeActions, HealthProfile, Medication, CycleConfig } from './types';
import type { ID, ISODate } from '@/shared/types/common';

type Store = SaudeState & SaudeActions;

function updProfile(
  profiles: HealthProfile[],
  id: ID,
  fn: (p: HealthProfile) => HealthProfile
): HealthProfile[] {
  return profiles.map((p) => (p.id === id ? fn(p) : p));
}

export const useSaudeStore = create<Store>()(
  persistVidaFlor(
    (set, get) => ({
      ...seedSaude,

      trocarPerfilAtivo: (id) => set({ activeProfileId: id }),

      resetParaUsuarioReal: () => set({ activeProfileId: '', profiles: [] }),

      adicionarPerfil: (profile) => {
        const novo: HealthProfile = {
          ...profile,
          id:        genId('prf'),
          meds:      [],
          notes:     {},
          createdAt: today(),
        };
        set((s) => ({ profiles: [...s.profiles, novo] }));
      },

      removerPerfil: (id) =>
        set((s) => {
          const filtered = s.profiles.filter((p) => p.id !== id);
          const newActive =
            s.activeProfileId === id ? (filtered[0]?.id ?? '') : s.activeProfileId;
          return { profiles: filtered, activeProfileId: newActive };
        }),

      atualizarPerfil: (id, patch) =>
        set((s) => ({
          profiles: updProfile(s.profiles, id, (p) => ({ ...p, ...patch })),
        })),

      registrarAgua: (profileId, day, ml) =>
        set((s) => ({
          profiles: updProfile(s.profiles, profileId, (p) => {
            const novoTotal = Math.min(10000, Math.max(0, (p.water.logMl[day] ?? 0) + ml));
            return {
              ...p,
              water: {
                ...p.water,
                logMl: { ...p.water.logMl, [day]: novoTotal },
              },
            };
          }),
        })),

      ajustarMetaAgua: (profileId, goalMl) =>
        set((s) => ({
          profiles: updProfile(s.profiles, profileId, (p) => ({
            ...p,
            water: { ...p.water, goalMl },
          })),
        })),

      zerarAguaDoDia: (profileId, day) =>
        set((s) => ({
          profiles: updProfile(s.profiles, profileId, (p) => {
            const logMl = { ...p.water.logMl };
            delete logMl[day];
            return { ...p, water: { ...p.water, logMl } };
          }),
        })),

      configurarCiclo: (profileId, cfg: CycleConfig) =>
        set((s) => ({
          profiles: updProfile(s.profiles, profileId, (p) => ({ ...p, cycle: cfg })),
        })),

      removerCiclo: (profileId) =>
        set((s) => ({
          profiles: updProfile(s.profiles, profileId, (p) => {
            const { cycle: _c, ...rest } = p;
            return rest as HealthProfile;
          }),
        })),

      adicionarMedicamento: (profileId, med) => {
        const novo: Medication = {
          ...med,
          id:        genId('med'),
          log:       {},
          createdAt: today(),
          active:    true,
        };
        set((s) => ({
          profiles: updProfile(s.profiles, profileId, (p) => ({
            ...p,
            meds: [...p.meds, novo],
          })),
        }));
      },

      removerMedicamento: (profileId, medId) =>
        set((s) => ({
          profiles: updProfile(s.profiles, profileId, (p) => ({
            ...p,
            meds: p.meds.filter((m) => m.id !== medId),
          })),
        })),

      toggleMedicamentoDia: (profileId, medId, day) =>
        set((s) => ({
          profiles: updProfile(s.profiles, profileId, (p) => ({
            ...p,
            meds: p.meds.map((m) =>
              m.id === medId ? { ...m, log: { ...m.log, [day]: !m.log[day] } } : m
            ),
          })),
        })),

      desativarMedicamento: (profileId, medId) =>
        set((s) => ({
          profiles: updProfile(s.profiles, profileId, (p) => ({
            ...p,
            meds: p.meds.map((m) =>
              m.id === medId ? { ...m, active: false } : m
            ),
          })),
        })),

      registrarAnotacaoDia: (profileId, day, text) =>
        set((s) => ({
          profiles: updProfile(s.profiles, profileId, (p) => ({
            ...p,
            notes: { ...p.notes, [day]: text },
          })),
        })),

      registrarMoodDia: (profileId, day, mood) =>
        set((s) => ({
          profiles: updProfile(s.profiles, profileId, (p) => ({
            ...p,
            moodLog: mood
              ? { ...p.moodLog, [day]: mood }
              : Object.fromEntries(Object.entries(p.moodLog ?? {}).filter(([k]) => k !== day)),
          })),
        })),

      registrarSono: (profileId, day, hours) =>
        set((s) => ({
          profiles: updProfile(s.profiles, profileId, (p) => ({
            ...p,
            sleepLog: { ...p.sleepLog, [day]: hours },
          })),
        })),

      registrarPassos: (profileId, day, steps) =>
        set((s) => ({
          profiles: updProfile(s.profiles, profileId, (p) => ({
            ...p,
            stepsLog: { ...p.stepsLog, [day]: steps },
          })),
        })),

      ajustarMetaPassos: (profileId, meta) =>
        set((s) => ({
          profiles: updProfile(s.profiles, profileId, (p) => ({
            ...p,
            metaPassos: meta,
          })),
        })),
    }),
    {
      name:    STORAGE_KEYS.saude,
      version: SAUDE_VERSION,
      migrate,
    }
  )
);
