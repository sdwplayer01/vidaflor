// src/features/espiritual/store.ts
import { create } from 'zustand';
import { persistVidaFlor } from '@/shared/storage/persist-middleware';
import { STORAGE_KEYS } from '@/shared/storage/keys';
import { genId } from '@/shared/utils/id';
import { nowISO, today } from '@/shared/utils/date';
import type { ID, ISODate } from '@/shared/types/common';
import type { EspiritualState, EspiritualActions } from './types';
import { seedEspiritual } from './seed';
import { ESPIRITUAL_VERSION, migrate } from './migrations';

export const useEspiritualStore = create<EspiritualState & EspiritualActions>()(
  persistVidaFlor(
    (set) => ({
      ...seedEspiritual,

      // ── Gratidão ──────────────────────────────────────────────────────────

      adicionarGratidao: (day: ISODate, text: string) =>
        set((state) => {
          const existing = state.gratidao[day] ?? [];
          return {
            gratidao: {
              ...state.gratidao,
              [day]: [
                ...existing,
                {
                  id:        genId('grat'),
                  text:      text.trim(),
                  createdAt: nowISO(),
                },
              ],
            },
          };
        }),

      removerGratidao: (day: ISODate, id: ID) =>
        set((state) => ({
          gratidao: {
            ...state.gratidao,
            [day]: (state.gratidao[day] ?? []).filter((g) => g.id !== id),
          },
        })),

      // ── Orações ───────────────────────────────────────────────────────────

      adicionarOracao: (pessoa: string, pedido: string) =>
        set((state) => ({
          oracoes: [
            {
              id:        genId('orac'),
              pessoa:    pessoa.trim(),
              pedido:    pedido.trim(),
              respondida: false,
              createdAt: nowISO(),
            },
            ...state.oracoes,
          ],
        })),

      marcarRespondida: (id: ID) =>
        set((state) => ({
          oracoes: state.oracoes.map((o) =>
            o.id === id
              ? { ...o, respondida: true, respondidaEm: today() }
              : o
          ),
        })),

      desmarcarRespondida: (id: ID) =>
        set((state) => ({
          oracoes: state.oracoes.map((o) =>
            o.id === id
              ? { ...o, respondida: false, respondidaEm: undefined }
              : o
          ),
        })),

      removerOracao: (id: ID) =>
        set((state) => ({
          oracoes: state.oracoes.filter((o) => o.id !== id),
        })),

      // ── Leituras ──────────────────────────────────────────────────────────

      adicionarLeitura: (livro: string, capitulo: number, versiculo?: string) =>
        set((state) => ({
          leituras: [
            {
              id:        genId('leit'),
              livro:     livro.trim(),
              capitulo,
              versiculo: versiculo?.trim(),
              data:      today(),
              createdAt: nowISO(),
            },
            ...state.leituras,
          ],
        })),

      removerLeitura: (id: ID) =>
        set((state) => ({
          leituras: state.leituras.filter((l) => l.id !== id),
        })),
    }),
    {
      name:    STORAGE_KEYS.espiritual,
      version: ESPIRITUAL_VERSION,
      migrate,
    }
  )
);
