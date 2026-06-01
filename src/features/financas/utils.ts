// src/features/financas/utils.ts
import { genId } from '@/shared/utils/id';
import { today } from '@/shared/utils/date';
import type { Transaction, Card, Fatura, FaturaStatus, AdicionarParceladaInput, IsoMonth, Money } from './types';
import type { ID, ISODate } from '@/shared/types/common';

// Ultimo dia do mes (year e month 1-indexed)
function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// Soma safe em centavos
export function sumMoney(values: Money[]): Money {
  return values.reduce((acc, v) => acc + v, 0);
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

// Gera parcelas com arredondamento correto: sum === totalAmount exato
// Bug 3 fix: clamp do dia ao ultimo dia do mes destino
export function gerarParcelas(input: AdicionarParceladaInput): Transaction[] {
  const { desc, totalAmount, valorBruto, totalParcelas, firstDate, category, cardId } = input;
  const n       = totalParcelas;
  const base    = Math.floor(totalAmount / n);
  const resto   = totalAmount - base * n;
  const groupId = genId('grp');
  const today_  = today();

  const [y, m, d] = firstDate.split('-').map(Number) as [number, number, number];

  return Array.from({ length: n }, (_, i) => {
    const amount = i === n - 1 ? base + resto : base;

    const newM  = m + i;
    const year  = y + Math.floor((newM - 1) / 12);
    const month = ((newM - 1) % 12) + 1;
    const day   = Math.min(d, lastDayOfMonth(year, month));
    const date  = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` as ISODate;

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
      installment: {
        total:      n,
        current:    i + 1,
        groupId,
        valorBruto: valorBruto != null ? Math.round(valorBruto / n) : undefined,
      },
      createdAt:   today_,
    };
  });
}

// Saldo do mes (entradas - saidas) em centavos
// Bug 2 fix: saidas reais = expense SEM cardId
export function calcSaldoMes(
  transactions: Transaction[],
  mes: IsoMonth
): { entradas: Money; saidas: Money; saldo: Money } {
  const do_mes   = transactions.filter((t) => t.date.startsWith(mes));
  const entradas = sumMoney(
    do_mes.filter((t) => t.type === 'income').map((t) => t.amount)
  );
  const saidas = sumMoney(
    do_mes
      .filter((t) => t.type === 'expense' && t.cardId === null)
      .map((t) => t.amount)
  );
  return { entradas, saidas, saldo: entradas - saidas };
}

// Fatura de um cartao num mes
// Bug 1 fix: usa periodoFatura() em vez de startsWith(mes)
export function calcFatura(
  transactions: Transaction[],
  card: Card,
  mes: IsoMonth
): Money {
  const { from, to } = periodoFatura(card, mes);
  return sumMoney(
    transactions
      .filter(
        (t) =>
          t.cardId === card.id &&
          t.type === 'expense' &&
          t.date >= from &&
          t.date <= to
      )
      .map((t) => t.amount)
  );
}

// Item 6: Fatura como entidade derivada
export function montarFatura(
  card: Card,
  mes: IsoMonth,
  transactions: Transaction[]
): Fatura {
  const periodo = periodoFatura(card, mes);
  const items   = transactions.filter(
    (t) =>
      t.cardId === card.id &&
      t.type === 'expense' &&
      t.date >= periodo.from &&
      t.date <= periodo.to
  );
  const total = sumMoney(items.map((t) => t.amount));

  // Procura o pagamento desta fatura
  const refKey = `${card.id}_${mes}`;
  const pagamento = transactions.find((t) => t.paidFaturaRef === refKey);

  let status: FaturaStatus;
  let pagoEm: ISODate | undefined;

  if (pagamento) {
    status = 'paga';
    pagoEm = pagamento.date;
  } else {
    const todayStr = today();
    const closeDate = `${mes}-${String(card.closeDay).padStart(2, '0')}` as ISODate;
    status = todayStr > closeDate ? 'fechada' : 'aberta';
  }

  return { cardId: card.id, mes, periodo, items, total, status, pagoEm };
}

// Item 8: Expande transações recorrentes para um mes especifico
// Retorna copias virtuais (nao persistidas) para o mes visualizado
export function expandirRecorrentes(
  transactions: Transaction[],
  mes: IsoMonth
): Transaction[] {
  const [y, m] = mes.split('-').map(Number) as [number, number];

  return transactions.flatMap((t) => {
    if (!t.recorrencia) return [];
    const { tipo } = t.recorrencia;
    const [ty, tm, td] = t.date.split('-').map(Number) as [number, number, number];
    const txMes = `${ty}-${String(tm).padStart(2, '0')}`;

    // Nao gerar virtual para o proprio mes de origem
    if (mes === txMes) return [];
    // Nao gerar para meses antes do inicio
    if (mes < txMes) return [];

    if (tipo === 'mensal') {
      const day  = Math.min(td, lastDayOfMonth(y, m));
      const date = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}` as ISODate;
      return [{
        ...t,
        id:   `${t.id}_v_${mes}` as ID,
        date,
        due:  date,
        paid: false,
        paidFaturaRef: undefined,
      }];
    }

    if (tipo === 'anual') {
      if (m !== tm) return [];
      if (y <= ty)  return [];
      const date = `${y}-${String(m).padStart(2, '0')}-${String(td).padStart(2, '0')}` as ISODate;
      return [{
        ...t,
        id:   `${t.id}_v_${mes}` as ID,
        date,
        due:  date,
        paid: false,
        paidFaturaRef: undefined,
      }];
    }

    if (tipo === 'semanal') {
      const originDate = new Date(ty, tm - 1, td);
      const monthEnd   = new Date(y, m, 0);
      const results: Transaction[] = [];
      let curr = new Date(originDate);
      // Avan?a semana a semana ate o inicio do mes alvo
      while (curr < new Date(y, m - 1, 1)) {
        curr = new Date(curr.getTime() + 7 * 86_400_000);
      }
      // Coleta todas as ocorrencias dentro do mes
      while (curr <= monthEnd) {
        const dd    = curr.getDate();
        const mm    = curr.getMonth() + 1;
        const yy    = curr.getFullYear();
        if (mm === m && yy === y) {
          const date = `${yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}` as ISODate;
          results.push({
            ...t,
            id:   `${t.id}_v_${date}` as ID,
            date,
            due:  date,
            paid: false,
            paidFaturaRef: undefined,
          });
        }
        curr = new Date(curr.getTime() + 7 * 86_400_000);
      }
      return results;
    }

    return [];
  });
}

// Contas proximas a vencer (proximos N dias)
export function proximasContas(transactions: Transaction[], dias = 7): Transaction[] {
  const now      = new Date();
  const limite   = new Date(now.getTime() + dias * 86_400_000);
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
