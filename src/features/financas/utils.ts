// src/features/financas/utils.ts
import { genId } from '@/shared/utils/id';
import { today } from '@/shared/utils/date';
import type { Transaction, Card, AdicionarParceladaInput, IsoMonth, Money } from './types';
import type { ID, ISODate } from '@/shared/types/common';

// Soma safe em centavos — nunca usar reduce com floats
export function sumMoney(values: Money[]): Money {
  return values.reduce((acc, v) => acc + v, 0);
}

// Gera parcelas com arredondamento correto: sum === totalAmount exato
export function gerarParcelas(input: AdicionarParceladaInput): Transaction[] {
  const { desc, totalAmount, totalParcelas, firstDate, category, cardId } = input;
  const n       = totalParcelas;
  const base    = Math.floor(totalAmount / n);
  const resto   = totalAmount - base * n;
  const groupId = genId('grp');
  const today_  = today();

  return Array.from({ length: n }, (_, i) => {
    const amount = i === n - 1 ? base + resto : base;

    // data: mesmo dia do mes, avancando mes a mes
    const [y, m] = firstDate.split('-').map(Number) as [number, number];
    const newM   = m + i;
    const year   = y + Math.floor((newM - 1) / 12);
    const month  = ((newM - 1) % 12) + 1;
    const day    = firstDate.split('-')[2];
    const date   = `${year}-${String(month).padStart(2, '0')}-${day}` as ISODate;

    return {
      id:          genId('txn'),
      desc:        `${desc} (${i + 1}/${n})`,
      amount,
      type:        'expense' as const,
      category,
      date,
      due:         date,
      paid:        false,
      cardId,
      installment: { total: n, current: i + 1, groupId },
      createdAt:   today_,
    };
  });
}

// Periodo de fatura de um cartao num mes
export function periodoFatura(card: Card, mes: IsoMonth): { from: ISODate; to: ISODate } {
  const [y, m] = mes.split('-').map(Number) as [number, number];
  const prevM  = m === 1 ? 12 : m - 1;
  const prevY  = m === 1 ? y - 1 : y;
  const from   = `${prevY}-${String(prevM).padStart(2, '0')}-${String(card.closeDay + 1).padStart(2, '0')}` as ISODate;
  const to     = `${y}-${String(m).padStart(2, '0')}-${String(card.closeDay).padStart(2, '0')}` as ISODate;
  return { from, to };
}

// Saldo do mes (entradas - saidas) em centavos
export function calcSaldoMes(
  transactions: Transaction[],
  mes: IsoMonth
): { entradas: Money; saidas: Money; saldo: Money } {
  const do_mes = transactions.filter((t) => t.date.startsWith(mes));
  const entradas = sumMoney(do_mes.filter((t) => t.type === 'income').map((t) => t.amount));
  const saidas   = sumMoney(do_mes.filter((t) => t.type === 'expense').map((t) => t.amount));
  return { entradas, saidas, saldo: entradas - saidas };
}

// Fatura de um cartao num mes
export function calcFatura(transactions: Transaction[], cardId: ID, mes: IsoMonth): Money {
  return sumMoney(
    transactions
      .filter((t) => t.cardId === cardId && t.date.startsWith(mes) && t.type === 'expense')
      .map((t) => t.amount)
  );
}

// Contas proximas a vencer (proximos N dias)
export function proximasContas(transactions: Transaction[], dias = 7): Transaction[] {
  const now     = new Date();
  const limite  = new Date(now.getTime() + dias * 86_400_000);
  const todayStr = today();
  return transactions
    .filter((t) => {
      if (t.paid) return false;
      const due = t.due ?? t.date;
      return due >= todayStr && new Date(due + 'T00:00:00') <= limite;
    })
    .sort((a, b) => (a.due ?? a.date).localeCompare(b.due ?? b.date));
}

// Projecao de saldos futuros
export function projecaoMeses(
  transactions: Transaction[],
  baseMonth: IsoMonth,
  qtd = 3
): { mes: IsoMonth; saldo: Money }[] {
  const [y, m] = baseMonth.split('-').map(Number) as [number, number];
  return Array.from({ length: qtd }, (_, i) => {
    const newM  = m + i;
    const year  = y + Math.floor((newM - 1) / 12);
    const month = ((newM - 1) % 12) + 1;
    const mes   = `${year}-${String(month).padStart(2, '0')}`;
    const { saldo } = calcSaldoMes(transactions, mes);
    return { mes, saldo };
  });
}
