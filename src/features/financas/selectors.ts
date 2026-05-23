// src/features/financas/selectors.ts
import { useShallow } from 'zustand/react/shallow';
import { useFinancasStore } from './store';
import {
  calcSaldoMes, calcFatura, proximasContas, projecaoMeses,
} from './utils';
import type { Transaction, Money, IsoMonth } from './types';
import type { ID } from '@/shared/types/common';

function currentMonth(): IsoMonth {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function useTransacoesDoMes(mes?: IsoMonth): Transaction[] {
  return useFinancasStore(
    useShallow((s) => {
      const m = mes ?? currentMonth();
      return s.transactions.filter((t) => t.date.startsWith(m));
    })
  );
}

export function useSaldoDoMes(mes?: IsoMonth) {
  return useFinancasStore(
    useShallow((s) => calcSaldoMes(s.transactions, mes ?? currentMonth()))
  );
}

export function useCartoes() {
  return useFinancasStore(
    useShallow((s) => s.cards.filter((c) => c.active))
  );
}

export function useFaturaCartao(cardId: ID, mes?: IsoMonth): Money {
  return useFinancasStore(
    (s) => calcFatura(s.transactions, cardId, mes ?? currentMonth())
  );
}

export function useOrcamentoMes(mes?: IsoMonth) {
  return useFinancasStore(
    useShallow((s) => {
      const m          = mes ?? currentMonth();
      const disponivel = s.budget[m] ?? 0;
      const { saidas } = calcSaldoMes(s.transactions, m);
      const gasto      = saidas;
      const restante   = disponivel - gasto;
      const pct        = disponivel > 0 ? Math.min(100, Math.round((gasto / disponivel) * 100)) : 0;
      return { disponivel, gasto, restante, pct };
    })
  );
}

export function useProximasContas(dias = 7): Transaction[] {
  return useFinancasStore(
    useShallow((s) => proximasContas(s.transactions, dias))
  );
}

export function useProjecaoMeses(qtd = 3) {
  return useFinancasStore(
    useShallow((s) => projecaoMeses(s.transactions, currentMonth(), qtd))
  );
}
