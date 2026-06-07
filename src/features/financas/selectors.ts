// src/features/financas/selectors.ts
import { useShallow } from 'zustand/react/shallow';
import { useMemo } from 'react';
import { useFinancasStore } from './store';
import {
  calcSaldoMes, calcFatura, proximasContas, projecaoMeses,
  montarFatura, expandirRecorrentes,
} from './utils';
import type { Card, Fatura, Transaction, Money, IsoMonth } from './types';
import type { ID } from '@/shared/types/common';

function currentMonth(): IsoMonth {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Item 8: inclui recorrentes expandidas para o mes
export function useTransacoesDoMes(mes?: IsoMonth): Transaction[] {
  const transactions = useFinancasStore((s) => s.transactions);
  return useMemo(() => {
    const m        = mes ?? currentMonth();
    const proprias = transactions.filter((t) => t.date.startsWith(m));
    const virtuais = expandirRecorrentes(transactions, m);
    return [...proprias, ...virtuais];
  }, [transactions, mes]);
}

export function useSaldoDoMes(mes?: IsoMonth) {
  const transactions = useFinancasStore((s) => s.transactions);
  return useMemo(() => {
    const m    = mes ?? currentMonth();
    const virt = expandirRecorrentes(transactions, m);
    return calcSaldoMes([...transactions, ...virt], m);
  }, [transactions, mes]);
}

export function useCartoes() {
  return useFinancasStore(
    useShallow((s) => s.cards.filter((c) => c.active))
  );
}

export function useCartao(id: ID): Card | undefined {
  return useFinancasStore(
    useShallow((s) => s.cards.find((c) => c.id === id))
  );
}

export function useTransacao(id: ID | undefined): import('./types').Transaction | undefined {
  return useFinancasStore(
    useShallow((s) => id ? s.transactions.find((t) => t.id === id) : undefined)
  );
}

// Bug 1 fix: recebe card completo para que calcFatura use periodoFatura()
export function useFaturaCartao(card: Card, mes?: IsoMonth): Money {
  return useFinancasStore(
    (s) => calcFatura(s.transactions, card, mes ?? currentMonth())
  );
}

// Item 6: fatura como entidade
export function useFatura(card: Card, mes?: IsoMonth): Fatura {
  const transactions = useFinancasStore((s) => s.transactions);
  return useMemo(
    () => montarFatura(card, mes ?? currentMonth(), transactions),
    [card, mes, transactions]
  );
}

// Item 10: orcamento total + por categoria
export function useOrcamentoMes(mes?: IsoMonth) {
  return useFinancasStore(
    useShallow((s) => {
      const m          = mes ?? currentMonth();
      const entry      = s.budget[m];
      const disponivel = entry?.total ?? 0;
      const { saidas } = calcSaldoMes(s.transactions, m);
      const gasto      = saidas;
      const restante   = disponivel - gasto;
      const pct        = disponivel > 0 ? Math.min(100, Math.round((gasto / disponivel) * 100)) : 0;
      return { disponivel, gasto, restante, pct };
    })
  );
}

export function useOrcamentoCategoria(categoria: string, mes?: IsoMonth) {
  return useFinancasStore(
    useShallow((s) => {
      const m          = mes ?? currentMonth();
      const disponivel = s.budget[m]?.porCategoria?.[categoria] ?? 0;
      const do_mes     = s.transactions.filter(
        (t) => t.date.startsWith(m) && t.type === 'expense' && t.category === categoria && t.cardId === null
      );
      const gasto    = do_mes.reduce((acc, t) => acc + t.amount, 0);
      const restante = disponivel - gasto;
      const pct      = disponivel > 0 ? Math.min(100, Math.round((gasto / disponivel) * 100)) : 0;
      return { disponivel, gasto, restante, pct };
    })
  );
}

// Retorna categorias com orcamento definido para o mes
export function useCategoriasComOrcamento(mes?: IsoMonth): string[] {
  return useFinancasStore(
    useShallow((s) => {
      const m   = mes ?? currentMonth();
      const por = s.budget[m]?.porCategoria ?? {};
      return Object.keys(por).filter((cat) => (por[cat] ?? 0) > 0);
    })
  );
}

// Fase 2: lista completa de envelopes do mês com gasto vs limite
export interface EnvelopeInfo {
  categoria: string;
  limite:    Money;
  gasto:     Money;
  restante:  Money;
  pct:       number;
}

export function useEnvelopesDoMes(mes?: IsoMonth): EnvelopeInfo[] {
  const transactions = useFinancasStore((s) => s.transactions);
  const budget       = useFinancasStore((s) => s.budget);
  return useMemo(() => {
    const m   = mes ?? currentMonth();
    const por = budget[m]?.porCategoria ?? {};
    return Object.entries(por)
      .filter(([, limite]) => (limite ?? 0) > 0)
      .map(([categoria, limiteRaw]) => {
        const limite  = limiteRaw ?? 0;
        const gasto   = transactions
          .filter(
            (t) =>
              t.date.startsWith(m) &&
              t.type === 'expense' &&
              t.category === categoria &&
              t.cardId === null
          )
          .reduce((acc, t) => acc + t.amount, 0);
        const restante = limite - gasto;
        const pct      = limite > 0 ? Math.min(100, Math.round((gasto / limite) * 100)) : 0;
        return { categoria, limite, gasto, restante, pct };
      });
  }, [transactions, budget, mes]);
}

export function useProximasContas(dias = 7): Transaction[] {
  return useFinancasStore(
    useShallow((s) => proximasContas(s.transactions, dias))
  );
}

export function useProjecaoMeses(qtd = 3) {
  const transactions = useFinancasStore((s) => s.transactions);
  return useMemo(
    () => projecaoMeses(transactions, currentMonth(), qtd),
    [transactions, qtd]
  );
}
