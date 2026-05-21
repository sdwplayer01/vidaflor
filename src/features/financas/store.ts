// src/features/financas/store.ts
import { create } from 'zustand';
import { persistVidaFlor } from '@/shared/storage/persist-middleware';
import { STORAGE_KEYS } from '@/shared/storage/keys';
import { genId } from '@/shared/utils/id';
import { today } from '@/shared/utils/date';
import { seedFinancas } from './seed';
import { migrate, FINANCAS_VERSION } from './migrations';
import { gerarParcelas } from './utils';
import type {
  FinancasState, FinancasActions,
  Transaction, Card, AdicionarParceladaInput,
  IsoMonth, Money,
} from './types';
import type { ID } from '@/shared/types/common';

type Store = FinancasState & FinancasActions;

export const useFinancasStore = create<Store>()(
  persistVidaFlor(
    (set) => ({
      ...seedFinancas,

      adicionarTransacao: (t) =>
        set((s) => ({
          transactions: [
            ...s.transactions,
            { ...t, id: genId('txn'), installment: null, createdAt: today() },
          ],
        })),

      adicionarParcelada: (input: AdicionarParceladaInput) => {
        const parcelas = gerarParcelas(input);
        set((s) => ({ transactions: [...s.transactions, ...parcelas] }));
      },

      marcarComoPago: (id: ID) =>
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id ? { ...t, paid: true } : t
          ),
        })),

      desmarcarPago: (id: ID) =>
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id ? { ...t, paid: false } : t
          ),
        })),

      removerTransacao: (id: ID) =>
        set((s) => ({
          transactions: s.transactions.filter((t) => t.id !== id),
        })),

      removerGrupoParcelado: (groupId: ID) =>
        set((s) => ({
          transactions: s.transactions.filter(
            (t) => !t.installment || t.installment.groupId !== groupId
          ),
        })),

      adicionarCartao: (card) =>
        set((s) => ({
          cards: [...s.cards, { ...card, id: genId('crd'), active: true }],
        })),

      removerCartao: (id: ID) =>
        set((s) => ({ cards: s.cards.filter((c) => c.id !== id) })),

      atualizarCartao: (id: ID, patch) =>
        set((s) => ({
          cards: s.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      definirOrcamentoMes: (month: IsoMonth, amount: Money) =>
        set((s) => ({ budget: { ...s.budget, [month]: amount } })),

      limparOrcamentoMes: (month: IsoMonth) =>
        set((s) => {
          const { [month]: _, ...rest } = s.budget;
          return { budget: rest };
        }),
    }),
    {
      name:    STORAGE_KEYS.financas,
      version: FINANCAS_VERSION,
      migrate,
    }
  )
);
