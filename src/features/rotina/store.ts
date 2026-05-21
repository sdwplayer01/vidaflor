// src/features/rotina/store.ts
import { create } from 'zustand';
import { persistVidaFlor } from '@/shared/storage/persist-middleware';
import { STORAGE_KEYS } from '@/shared/storage/keys';
import { genId } from '@/shared/utils/id';
import { today } from '@/shared/utils/date';
import { seedRotina } from './seed';
import { migrate, ROTINA_VERSION } from './migrations';
import type { RotinaState, RotinaActions, Turno } from './types';
import type { ID, ISODate } from '@/shared/types/common';

type Store = RotinaState & RotinaActions;

export const useRotinaStore = create<Store>()(
  persistVidaFlor(
    (set, get) => ({
      ...seedRotina,

      adicionarTarefa: (turno: Turno, task: string, time?: string) =>
        set((s) => ({
          tarefas: {
            ...s.tarefas,
            [turno]: [
              ...s.tarefas[turno],
              { id: genId('trf'), task, time, turno, createdAt: today() },
            ],
          },
        })),

      removerTarefa: (turno: Turno, id: ID) =>
        set((s) => ({
          tarefas: {
            ...s.tarefas,
            [turno]: s.tarefas[turno].filter((t) => t.id !== id),
          },
        })),

      marcarTarefa: (day: ISODate, id: ID) =>
        set((s) => {
          const current = s.done[day] ?? [];
          if (current.includes(id)) return s;
          return { done: { ...s.done, [day]: [...current, id] } };
        }),

      desmarcarTarefa: (day: ISODate, id: ID) =>
        set((s) => ({
          done: { ...s.done, [day]: (s.done[day] ?? []).filter((i) => i !== id) },
        })),

      toggleTarefa: (day: ISODate, id: ID) => {
        const done = get().done[day] ?? [];
        if (done.includes(id)) get().desmarcarTarefa(day, id);
        else                   get().marcarTarefa(day, id);
      },

      adicionarEssencial: (task: string) =>
        set((s) => ({
          essential: [...s.essential, { id: genId('ess'), task }],
        })),

      removerEssencial: (id: ID) =>
        set((s) => ({
          essential: s.essential.filter((t) => t.id !== id),
        })),

      alternarEssMode: () => set((s) => ({ essMode: !s.essMode })),
    }),
    {
      name:    STORAGE_KEYS.rotina,
      version: ROTINA_VERSION,
      migrate,
    }
  )
);
