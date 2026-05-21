// src/features/casa/store.ts
import { create } from 'zustand';
import { persistVidaFlor } from '@/shared/storage/persist-middleware';
import { STORAGE_KEYS } from '@/shared/storage/keys';
import { genId } from '@/shared/utils/id';
import { today } from '@/shared/utils/date';
import { seedCasa } from './seed';
import { migrate, CASA_VERSION } from './migrations';
import type { CasaState, CasaActions, TarefaCasa } from './types';
import type { ID, ISODate } from '@/shared/types/common';

type Store = CasaState & CasaActions;

export const useCasaStore = create<Store>()(
  persistVidaFlor(
    (set) => ({
      ...seedCasa,

      adicionarTarefaCasa: (tarefa) =>
        set((s) => ({
          tarefas: [
            ...s.tarefas,
            { ...tarefa, id: genId('cas'), createdAt: today(), active: true },
          ],
        })),

      removerTarefaCasa: (id: ID) =>
        set((s) => ({ tarefas: s.tarefas.filter((t) => t.id !== id) })),

      toggleTarefaCasa: (day: ISODate, id: ID) =>
        set((s) => {
          const current = s.done[day] ?? [];
          const newDone = current.includes(id)
            ? current.filter((i) => i !== id)
            : [...current, id];
          return { done: { ...s.done, [day]: newDone } };
        }),

      desativarTarefaCasa: (id: ID) =>
        set((s) => ({
          tarefas: s.tarefas.map((t) => (t.id === id ? { ...t, active: false } : t)),
        })),
    }),
    {
      name:    STORAGE_KEYS.casa,
      version: CASA_VERSION,
      migrate,
    }
  )
);
