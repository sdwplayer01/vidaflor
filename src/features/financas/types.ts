// src/features/financas/types.ts
import type { ID, ISODate, HexColor } from '@/shared/types/common';

export type Money = number;              // CENTAVOS, sempre int
export type TransactionType = 'income' | 'expense';
export type IsoMonth = string;           // 'YYYY-MM'

export interface Installment {
  total:   number;
  current: number;
  groupId: ID;
}

export interface Transaction {
  id:          ID;
  desc:        string;
  amount:      Money;
  type:        TransactionType;
  category:    string;
  date:        ISODate;
  due?:        ISODate;
  paid:        boolean;
  cardId:      ID | null;
  installment: Installment | null;
  createdAt:   ISODate;
}

export interface Card {
  id:       ID;
  name:     string;
  brand:    string;
  color:    HexColor;
  closeDay: number;
  dueDay:   number;
  active:   boolean;
}

export interface AdicionarParceladaInput {
  desc:          string;
  totalAmount:   Money;
  totalParcelas: number;
  firstDate:     ISODate;
  category:      string;
  cardId:        ID | null;
}

export interface FinancasState {
  transactions: Transaction[];
  cards:        Card[];
  budget:       Record<IsoMonth, Money>;
  _version:     number;
  _hydrated:    boolean;
}

export interface FinancasActions {
  adicionarTransacao:    (t: Omit<Transaction, 'id' | 'createdAt' | 'installment'>) => void;
  adicionarParcelada:    (input: AdicionarParceladaInput) => void;
  marcarComoPago:        (id: ID) => void;
  desmarcarPago:         (id: ID) => void;
  removerTransacao:      (id: ID) => void;
  removerGrupoParcelado: (groupId: ID) => void;
  adicionarCartao:       (card: Omit<Card, 'id' | 'active'>) => void;
  removerCartao:         (id: ID) => void;
  atualizarCartao:       (id: ID, patch: Partial<Card>) => void;
  definirOrcamentoMes:   (month: IsoMonth, amount: Money) => void;
  limparOrcamentoMes:    (month: IsoMonth) => void;
}
