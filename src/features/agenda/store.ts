// src/features/agenda/store.ts
import { create } from 'zustand';
import { persistVidaFlor } from '@/shared/storage/persist-middleware';
import { STORAGE_KEYS } from '@/shared/storage/keys';
import { genId } from '@/shared/utils/id';
import { today } from '@/shared/utils/date';
import type { AgendaState, AgendaActions, TarefaAvulsa } from './types';
import type { ID, ISODate } from '@/shared/types/common';
import { seedAgenda } from './seed';
import { AGENDA_VERSION, migrate } from './migrations';

type Store = AgendaState & AgendaActions;

export const useAgendaStore = create<Store>()(
  persistVidaFlor(
    (set) => ({
      ...seedAgenda,

      adicionarTarefa: (t: Omit<TarefaAvulsa, 'id' | 'done' | 'createdAt'>) =>
        set((s) => ({
          tarefas: [
            ...s.tarefas,
            { ...t, id: genId('ag'), done: false, createdAt: today() },
          ],
        })),

      removerTarefa: (id: ID) =>
        set((s) => ({ tarefas: s.tarefas.filter((t) => t.id !== id) })),

      toggleTarefa: (date: ISODate, id: ID) =>
        set((s) => {
          const atual = s.done[date] ?? [];
          const done  = atual.includes(id)
            ? atual.filter((i) => i !== id)
            : [...atual, id];
          return { done: { ...s.done, [date]: done } };
        }),

      adicionarCaptura: (text: string) =>
        set((s) => ({
          captura: [...s.captura, { id: genId('cap'), text }],
        })),

      removerCaptura: (id: ID) =>
        set((s) => ({ captura: s.captura.filter((c) => c.id !== id) })),
    }),
    {
      name:    STORAGE_KEYS.agenda,
      version: AGENDA_VERSION,
      migrate,
    }
  )
);
