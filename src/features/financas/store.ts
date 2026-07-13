// src/features/financas/store.ts
import { create } from 'zustand';
import { persistVidaFlor } from '@/shared/storage/persist-middleware';
import { STORAGE_KEYS } from '@/shared/storage/keys';
import { genId } from '@/shared/utils/id';
import { today } from '@/shared/utils/date';
import { seedFinancas } from './seed';
import { migrate, FINANCAS_VERSION } from './migrations';
import { gerarParcelas, periodoFatura } from './utils';
import type {
  FinancasState, FinancasActions,
  Card, AdicionarParceladaInput,
  Transaction, IsoMonth, Money,
} from './types';
import type { ID, ISODate } from '@/shared/types/common';

type Store = FinancasState & FinancasActions;

export const useFinancasStore = create<Store>()(
  persistVidaFlor(
    (set, get) => ({
      ...seedFinancas,

      adicionarTransacao: (t) =>
        set((s) => ({
          transactions: [
            ...s.transactions,
            {
              ...t,
              id:          genId('txn'),
              installment: null,
              createdAt:   today(),
            },
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

      concretizarVirtual: (virtualId: ID) => {
        // Virtual ids follow the pattern "${realId}_v_${mes}" or "${realId}_v_${date}"
        const sepIdx = virtualId.indexOf('_v_');
        if (sepIdx === -1) return;
        const baseId   = virtualId.slice(0, sepIdx) as ID;
        const datePart = virtualId.slice(sepIdx + 3); // mes (YYYY-MM) or date (YYYY-MM-DD)
        const s        = get();
        const origin   = s.transactions.find((t) => t.id === baseId);
        if (!origin) return;
        // Derive the actual date: if datePart is YYYY-MM, use the same day as origin clamped
        const isoDate  = datePart.length === 7
          ? (() => {
              const [y, m] = datePart.split('-').map(Number) as [number, number];
              const [, , d] = origin.date.split('-').map(Number) as [number, number, number];
              const last = new Date(y, m, 0).getDate();
              const day  = Math.min(d, last);
              return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}` as import('@/shared/types/common').ISODate;
            })()
          : datePart as import('@/shared/types/common').ISODate;
        // Avoid duplicates: if a real tx already exists for this virtual, just mark it
        const already = s.transactions.find((t) => t.id === virtualId);
        if (already) {
          set((st) => ({
            transactions: st.transactions.map((t) =>
              t.id === virtualId ? { ...t, paid: true } : t
            ),
          }));
          return;
        }
        const concrete: Transaction = {
          ...origin,
          id:        virtualId,
          date:      isoDate,
          due:       isoDate,
          paid:      true,
          recorrencia: undefined,
          paidFaturaRef: undefined,
        };
        set((st) => ({ transactions: [...st.transactions, concrete] }));
      },

      desmarcarVirtual: (virtualId: ID) => {
        set((s) => ({
          transactions: s.transactions.filter((t) => t.id !== virtualId),
        }));
      },

      removerTransacao: (id: ID) =>
        set((s) => ({
          transactions: s.transactions.filter((t) => t.id !== id),
        })),

      // Desfazer remoção: reinsere a transação preservando id/installment/createdAt
      restaurarTransacao: (tx: Transaction) =>
        set((s) =>
          s.transactions.some((t) => t.id === tx.id)
            ? s
            : { transactions: [...s.transactions, tx] }
        ),

      removerGrupoParcelado: (groupId: ID) =>
        set((s) => ({
          transactions: s.transactions.filter(
            (t) => !t.installment || t.installment.groupId !== groupId
          ),
        })),

      // Item 9: editar transação
      atualizarTransacao: (id: ID, patch) =>
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id ? { ...t, ...patch } : t
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

      // Item 7: pagar fatura
      pagarFatura: (card: Card, mes: IsoMonth) => {
        const { from, to } = periodoFatura(card, mes);
        const refKey = `${card.id}_${mes}` as string;
        const jaExiste = get().transactions.some((t) => t.paidFaturaRef === refKey);
        if (jaExiste) return;

        const faturaItems = get().transactions.filter(
          (t) =>
            t.cardId === card.id &&
            t.type === 'expense' &&
            t.date >= from &&
            t.date <= to
        );
        if (faturaItems.length === 0) return;

        const total = faturaItems.reduce((acc, t) => acc + t.amount, 0);
        const [y, m] = mes.split('-').map(Number) as [number, number];
        const dueDay  = Math.min(card.dueDay, new Date(y, m, 0).getDate());
        const dueDate = `${y}-${String(m).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}` as ISODate;

        const pagamento: Transaction = {
          id:            genId('txn'),
          desc:          `Fatura ${card.name} ${mes}`,
          amount:        total,
          type:          'expense',
          category:      'cartao',
          date:          today(),
          due:           dueDate,
          paid:          true,
          cardId:        null,
          installment:   null,
          createdAt:     today(),
          paidFaturaRef: refKey,
        };

        set((s) => ({
          transactions: [
            ...s.transactions.map((t) =>
              faturaItems.some((fi) => fi.id === t.id) ? { ...t, paid: true } : t
            ),
            pagamento,
          ],
        }));
      },

      // Item 10: orcamento total do mes
      definirOrcamentoMes: (month: IsoMonth, amount: Money) =>
        set((s) => {
          const atual = s.budget[month] ?? { total: 0, porCategoria: {} };
          return { budget: { ...s.budget, [month]: { ...atual, total: amount } } };
        }),

      // Item 10: orcamento por categoria
      definirOrcamentoCategoria: (month: IsoMonth, categoria: string, amount: Money) =>
        set((s) => {
          const atual = s.budget[month] ?? { total: 0, porCategoria: {} };
          return {
            budget: {
              ...s.budget,
              [month]: {
                ...atual,
                porCategoria: { ...atual.porCategoria, [categoria]: amount },
              },
            },
          };
        }),

      removerEnvelope: (month: IsoMonth, categoria: string) =>
        set((s) => {
          const atual = s.budget[month];
          if (!atual) return s;
          const { [categoria]: _removed, ...resto } = atual.porCategoria;
          return {
            budget: {
              ...s.budget,
              [month]: { ...atual, porCategoria: resto },
            },
          };
        }),

      limparOrcamentoMes: (month: IsoMonth) =>
        set((s) => {
          const { [month]: _removed, ...rest } = s.budget;
          return { budget: rest };
        }),

      // Fatia 2: revisão reflexiva — merges imutáveis preservando demais chaves
      setReflexao: (mes: IsoMonth, qKey: string, valor: string) =>
        set((s) => {
          const atual = s.revisao.reflexoes[mes] ?? {};
          return {
            revisao: {
              ...s.revisao,
              reflexoes: { ...s.revisao.reflexoes, [mes]: { ...atual, [qKey]: valor } },
            },
          };
        }),

      setFoco: (mes: IsoMonth, campo, valor: string) =>
        set((s) => {
          const atual = s.revisao.focos[mes] ?? { objetivo: '', resultado: '' };
          return {
            revisao: {
              ...s.revisao,
              focos: { ...s.revisao.focos, [mes]: { ...atual, [campo]: valor } },
            },
          };
        }),

      setConquista: (ano: string, cKey: string, valor: string) =>
        set((s) => {
          const atual = s.revisao.conquistas[ano] ?? {};
          return {
            revisao: {
              ...s.revisao,
              conquistas: { ...s.revisao.conquistas, [ano]: { ...atual, [cKey]: valor } },
            },
          };
        }),
    }),
    {
      name:    STORAGE_KEYS.financas,
      version: FINANCAS_VERSION,
      migrate,
    }
  )
);
