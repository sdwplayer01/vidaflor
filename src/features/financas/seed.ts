// src/features/financas/seed.ts
import type { FinancasState } from './types';
import { FINANCAS_VERSION } from './migrations';

export const seedFinancas: FinancasState = {
  cards: [
    {
      id:       'demo-card-nu',
      name:     'Nubank',
      brand:    'Mastercard',
      color:    '#C879E8',
      closeDay: 3,
      dueDay:   10,
      active:   true,
    },
    {
      id:       'demo-card-inter',
      name:     'Inter',
      brand:    'Mastercard',
      color:    '#D9B872',
      closeDay: 15,
      dueDay:   22,
      active:   true,
    },
  ],
  transactions: [
    // ── Maio ─────────────────────────────────────────────
    {
      id: 'demo-t01', desc: 'Salário', amount: 550000, type: 'income',
      category: 'Renda', date: '2026-05-05', paid: true,
      cardId: null, installment: null, createdAt: '2026-05-05',
    },
    {
      id: 'demo-t02', desc: 'Aluguel', amount: 180000, type: 'expense',
      category: 'Moradia', date: '2026-05-10', paid: true,
      cardId: null, installment: null, createdAt: '2026-05-10',
    },
    {
      id: 'demo-t03', desc: 'Supermercado', amount: 42800, type: 'expense',
      category: 'Alimentação', date: '2026-05-12', paid: true,
      cardId: 'demo-card-nu', installment: null, createdAt: '2026-05-12',
    },
    {
      id: 'demo-t04', desc: 'Plano de saúde', amount: 38000, type: 'expense',
      category: 'Saúde', date: '2026-05-15', paid: true,
      cardId: null, installment: null, createdAt: '2026-05-15',
    },
    {
      id: 'demo-t05', desc: 'Netflix', amount: 5590, type: 'expense',
      category: 'Lazer', date: '2026-05-18', paid: true,
      cardId: 'demo-card-nu', installment: null, createdAt: '2026-05-18',
    },
    {
      id: 'demo-t06', desc: 'Conta de luz', amount: 21500, type: 'expense',
      category: 'Moradia', date: '2026-05-20', paid: true,
      cardId: null, installment: null, createdAt: '2026-05-20',
    },
    {
      id: 'demo-t07', desc: 'Combustível', amount: 19800, type: 'expense',
      category: 'Transporte', date: '2026-05-22', paid: true,
      cardId: 'demo-card-inter', installment: null, createdAt: '2026-05-22',
    },
    {
      id: 'demo-t08', desc: 'Escola', amount: 85000, type: 'expense',
      category: 'Educação', date: '2026-05-05', paid: true,
      cardId: null, installment: null, createdAt: '2026-05-05',
    },
    {
      id: 'demo-t09', desc: 'Restaurante família', amount: 14700, type: 'expense',
      category: 'Alimentação', date: '2026-05-25', paid: true,
      cardId: 'demo-card-nu', installment: null, createdAt: '2026-05-25',
    },
    {
      id: 'demo-t10', desc: 'Farmácia', amount: 6800, type: 'expense',
      category: 'Saúde', date: '2026-05-28', paid: true,
      cardId: 'demo-card-nu', installment: null, createdAt: '2026-05-28',
    },
    // ── Junho ─────────────────────────────────────────────
    {
      id: 'demo-t11', desc: 'Salário', amount: 550000, type: 'income',
      category: 'Renda', date: '2026-06-05', paid: false,
      cardId: null, installment: null, createdAt: '2026-06-01',
    },
    {
      id: 'demo-t12', desc: 'Supermercado', amount: 38500, type: 'expense',
      category: 'Alimentação', date: '2026-06-01', paid: true,
      cardId: 'demo-card-nu', installment: null, createdAt: '2026-06-01',
    },
    {
      id: 'demo-t13', desc: 'Aluguel', amount: 180000, type: 'expense',
      category: 'Moradia', date: '2026-06-10', paid: false,
      cardId: null, installment: null, createdAt: '2026-06-01',
    },
    {
      id: 'demo-t14', desc: 'Internet', amount: 9990, type: 'expense',
      category: 'Moradia', date: '2026-06-03', paid: true,
      cardId: null, installment: null, createdAt: '2026-06-03',
    },
    {
      id: 'demo-t15', desc: 'Farmácia', amount: 4200, type: 'expense',
      category: 'Saúde', date: '2026-06-02', paid: true,
      cardId: 'demo-card-inter', installment: null, createdAt: '2026-06-02',
    },
    // Parcelado: notebook 12x
    {
      id: 'demo-t16', desc: 'Notebook (3/12)', amount: 28333, type: 'expense',
      category: 'Tecnologia', date: '2026-05-10', paid: true,
      cardId: 'demo-card-inter',
      installment: { total: 12, current: 3, groupId: 'demo-grp-notebook', valorBruto: 320000 },
      createdAt: '2026-03-10',
    },
    {
      id: 'demo-t17', desc: 'Notebook (4/12)', amount: 28333, type: 'expense',
      category: 'Tecnologia', date: '2026-06-10', paid: false,
      cardId: 'demo-card-inter',
      installment: { total: 12, current: 4, groupId: 'demo-grp-notebook', valorBruto: 320000 },
      createdAt: '2026-03-10',
    },
  ],
  budget: {
    '2026-05': {
      total: 450000,
      porCategoria: {
        'Alimentação': 80000,
        'Moradia':     220000,
        'Saúde':       50000,
        'Educação':    90000,
        'Transporte':  30000,
        'Lazer':       20000,
      },
    },
    '2026-06': {
      total: 450000,
      porCategoria: {
        'Alimentação': 80000,
        'Moradia':     220000,
        'Saúde':       50000,
        'Educação':    90000,
        'Transporte':  30000,
        'Lazer':       20000,
      },
    },
  },
  revisao: {
    reflexoes:  {},
    focos:      {},
    conquistas: {},
  },
  _version:  FINANCAS_VERSION,
  _hydrated: false,
};
