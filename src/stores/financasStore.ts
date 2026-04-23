// src/stores/financasStore.ts
// Store de finanças: transações, cartões, orçamento, parcelas.
// Computed: saldoMes, faturasCartao — centralizados, não inline.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Transaction, Card, FinanceData, TransType } from "@/types/data";
import { saveToStorage } from "@/utils/storage";

// ── Storage adapter ──────────────────────────────────────────────────────────

const vfStorage = createJSONStorage<FinancasStore>(() => ({
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

// ── Input para parcelas ──────────────────────────────────────────────────────

interface ParceladaInput {
  desc:           string;
  totalVal:       number;
  totalParcelas:  number;
  date:           string;
  cat:            string;
  cardId:         number | null;
}

// ── Interface ────────────────────────────────────────────────────────────────

interface FinancasStore extends FinanceData {
  // Computed
  saldoMes:         (mes: string) => number;
  faturasCartao:    (cardId: number, mes: string) => number;
  transacoesMes:    (mes: string) => Transaction[];
  pendentesMes:     (mes: string) => number;
  proximaVencer:    (mes: string) => Transaction | undefined;

  // Actions — Transações
  adicionarTransacao:  (t: Omit<Transaction, "id">) => void;
  adicionarParcelada:  (dados: ParceladaInput) => void;
  removerTransacao:    (id: number) => void;
  togglePago:          (id: number) => void;

  // Actions — Cartões
  adicionarCartao:     (c: Omit<Card, "id">) => void;
  removerCartao:       (id: number) => void;

  // Actions — Orçamento
  definirOrcamento:    (mes: string, valor: number) => void;

  // Actions — Carga
  loadFinance:         (data: Partial<FinanceData>) => void;
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useFinancasStore = create<FinancasStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      transactions: [],
      cards:        [],
      budget:       {},

      // ── Computed ────────────────────────────────────────────────────────────

      saldoMes: (mes) => {
        const ts = get().transactions.filter(t => t.date.slice(0, 7) === mes);
        const entradas = ts
          .filter(t => t.type === "income")
          .reduce((sum, t) => sum + t.val, 0);
        const saidas = ts
          .filter(t => t.type === "expense")
          .reduce((sum, t) => sum + t.val, 0);
        return entradas - saidas;
      },

      faturasCartao: (cardId, mes) =>
        get().transactions
          .filter(t => t.cardId === cardId && t.date.slice(0, 7) === mes)
          .reduce((sum, t) => sum + t.val, 0),

      transacoesMes: (mes) =>
        get().transactions.filter(t => t.date.slice(0, 7) === mes),

      pendentesMes: (mes) =>
        get().transactions
          .filter(t => t.type === "expense" && !t.paid && t.date.slice(0, 7) === mes)
          .reduce((sum, t) => sum + t.val, 0),

      proximaVencer: (mes) =>
        get().transactions
          .filter(t => t.type === "expense" && !t.paid && t.due && t.date.slice(0, 7) === mes)
          .sort((a, b) => (a.due ?? "").localeCompare(b.due ?? ""))[0],

      // ── Transações ──────────────────────────────────────────────────────────

      adicionarTransacao: (t) => set((state) => ({
        transactions: [{ id: Date.now(), ...t }, ...state.transactions],
      })),

      adicionarParcelada: ({ desc, totalVal, totalParcelas, date, cat, cardId }) => {
        const parcVal = Math.round((totalVal / totalParcelas) * 100) / 100;
        const groupId = `grp_${Date.now()}`;

        const items: Transaction[] = Array.from(
          { length: totalParcelas },
          (_, i) => {
            const d = new Date(date);
            d.setMonth(d.getMonth() + i);
            const dateStr = d.toISOString().slice(0, 10);
            return {
              id:          Date.now() + i,
              desc:        `${desc} (${i + 1}/${totalParcelas})`,
              val:         parcVal,
              type:        "expense" as TransType,
              cat,
              date:        dateStr,
              due:         dateStr,
              paid:        i === 0,
              cardId,
              installment: { total: totalParcelas, current: i + 1, groupId },
            };
          }
        );

        set((state) => ({
          transactions: [...items, ...state.transactions],
        }));
      },

      removerTransacao: (id) => set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id),
      })),

      togglePago: (id) => set((state) => ({
        transactions: state.transactions.map(t =>
          t.id === id ? { ...t, paid: !t.paid } : t
        ),
      })),

      // ── Cartões ─────────────────────────────────────────────────────────────

      adicionarCartao: (c) => set((state) => ({
        cards: [...state.cards, { id: Date.now(), ...c }],
      })),

      removerCartao: (id) => set((state) => ({
        cards: state.cards.filter(c => c.id !== id),
      })),

      // ── Orçamento ───────────────────────────────────────────────────────────

      definirOrcamento: (mes, valor) => set((state) => ({
        budget: { ...state.budget, [mes]: valor },
      })),

      // ── Carga ───────────────────────────────────────────────────────────────

      loadFinance: (data) => set((state) => ({
        transactions: data.transactions ?? state.transactions,
        cards:        data.cards        ?? state.cards,
        budget:       data.budget       ?? state.budget,
      })),
    }),
    {
      name: "vidaflor-financas",
      storage: vfStorage,
    }
  )
);
