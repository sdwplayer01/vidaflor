// src/features/kids/store.ts
import { create } from 'zustand';
import { persistVidaFlor } from '@/shared/storage/persist-middleware';
import { STORAGE_KEYS } from '@/shared/storage/keys';
import { genId } from '@/shared/utils/id';
import { today } from '@/shared/utils/date';
import { seedKids } from './seed';
import { migrate, KIDS_VERSION } from './migrations';
import type { KidsState, KidsActions, Crianca } from './types';
import type { ID, ISODate, Emoji } from '@/shared/types/common';

type Store = KidsState & KidsActions;

export const useKidsStore = create<Store>()(
  persistVidaFlor(
    (set) => ({
      ...seedKids,

      adicionarCrianca: (crianca) => {
        const nova: Crianca = {
          ...crianca,
          id:        genId('kid'),
          tasks:     [],
          createdAt: today(),
        };
        set((s) => ({
          criancas:    [...s.criancas, nova],
          activeKidId: s.activeKidId ?? nova.id,
        }));
      },

      removerCrianca: (id: ID) =>
        set((s) => {
          const filtered = s.criancas.filter((k) => k.id !== id);
          return {
            criancas:    filtered,
            activeKidId: s.activeKidId === id ? (filtered[0]?.id ?? null) : s.activeKidId,
          };
        }),

      trocarCriancaAtiva: (id: ID) => set({ activeKidId: id }),

      adicionarTarefaKid: (kidId: ID, task: string, emoji: Emoji, time?: string) =>
        set((s) => ({
          criancas: s.criancas.map((k) =>
            k.id === kidId
              ? { ...k, tasks: [...k.tasks, { id: genId('ktsk'), task, emoji, time }] }
              : k
          ),
        })),

      removerTarefaKid: (kidId: ID, taskId: ID) =>
        set((s) => ({
          criancas: s.criancas.map((k) =>
            k.id === kidId
              ? { ...k, tasks: k.tasks.filter((t) => t.id !== taskId) }
              : k
          ),
        })),

      toggleTarefaKid: (day: ISODate, taskId: ID) =>
        set((s) => {
          const current = s.done[day] ?? [];
          const newDone = current.includes(taskId)
            ? current.filter((i) => i !== taskId)
            : [...current, taskId];
          return { done: { ...s.done, [day]: newDone } };
        }),
    }),
    {
      name:    STORAGE_KEYS.kids,
      version: KIDS_VERSION,
      migrate,
    }
  )
);
