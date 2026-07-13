// src/features/financas/types.ts
import type { ID, ISODate, HexColor } from '@/shared/types/common';

export type Money = number;              // CENTAVOS, sempre int
export type TransactionType = 'income' | 'expense';
export type IsoMonth = string;           // 'YYYY-MM'

// ── Recorrência ───────────────────────────────────────────────────────────────
export type RecorrenciaTipo = 'mensal' | 'semanal' | 'anual';

export interface Recorrencia {
  tipo: RecorrenciaTipo;
}

// ── Parcelamento ──────────────────────────────────────────────────────────────
export interface Installment {
  total:       number;
  current:     number;
  groupId:     ID;
  valorBruto?: Money;  // Item 11: preco de etiqueta sem juros (opcional)
}

// ── Transação ─────────────────────────────────────────────────────────────────
export interface Transaction {
  id:             ID;
  desc:           string;
  amount:         Money;
  type:           TransactionType;
  category:       string;
  date:           ISODate;
  due?:           ISODate;
  paid:           boolean;
  cardId:         ID | null;
  installment:    Installment | null;
  createdAt:      ISODate;
  // Item 8: recorrência
  recorrencia?:   Recorrencia;
  // Item 7: referência ao pagamento de fatura (presente na txn de pagamento)
  paidFaturaRef?: string;  // formato: "${cardId}_${mes}"
}

// ── Cartão ────────────────────────────────────────────────────────────────────
export interface Card {
  id:       ID;
  name:     string;
  brand:    string;
  color:    HexColor;
  closeDay: number;
  dueDay:   number;
  active:   boolean;
}

// ── Fatura (entidade derivada) ────────────────────────────────────────────────
export type FaturaStatus = 'aberta' | 'fechada' | 'paga';

export interface Fatura {
  cardId:  ID;
  mes:     IsoMonth;
  periodo: { from: ISODate; to: ISODate };
  items:   Transaction[];
  total:   Money;
  status:  FaturaStatus;
  pagoEm?: ISODate;  // data da txn de pagamento quando status === 'paga'
}

// ── Input de parcelada ────────────────────────────────────────────────────────
export interface AdicionarParceladaInput {
  desc:          string;
  totalAmount:   Money;   // total cobrado (com juros)
  valorBruto?:   Money;   // preco de etiqueta, sem juros (Item 11)
  totalParcelas: number;
  firstDate:     ISODate;
  category:      string;
  cardId:        ID | null;
}

// ── Orçamento ─────────────────────────────────────────────────────────────────
// Item 10: budget expandido por categoria
export interface BudgetEntry {
  total:        Money;
  porCategoria: Record<string, Money>;
}

// ── Revisão (reflexão mensal/anual) ───────────────────────────────────────────
// Foco do mês: objetivo → resultado.
export interface FocoMes {
  objetivo:  string;
  resultado: string;
}

export interface RevisaoState {
  reflexoes:  Record<IsoMonth, Record<string, string>>; // mes    -> { q1..q4 }
  focos:      Record<IsoMonth, FocoMes>;                 // mes    -> objetivo/resultado
  conquistas: Record<string,   Record<string, string>>; // 'YYYY' -> { c1..c3 }
}

// ── Estado e actions do store ─────────────────────────────────────────────────
export interface FinancasState {
  transactions: Transaction[];
  cards:        Card[];
  budget:       Record<IsoMonth, BudgetEntry>;
  revisao:      RevisaoState;
  _version:     number;
  _hydrated:    boolean;
}

export interface FinancasActions {
  adicionarTransacao:         (t: Omit<Transaction, 'id' | 'createdAt' | 'installment'>) => void;
  adicionarParcelada:         (input: AdicionarParceladaInput) => void;
  marcarComoPago:             (id: ID) => void;
  desmarcarPago:              (id: ID) => void;
  concretizarVirtual:         (virtualId: ID) => void;
  desmarcarVirtual:           (virtualId: ID) => void;
  removerTransacao:           (id: ID) => void;
  restaurarTransacao:         (tx: Transaction) => void;
  removerGrupoParcelado:      (groupId: ID) => void;
  // Item 9: editar transação
  atualizarTransacao:         (id: ID, patch: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  adicionarCartao:            (card: Omit<Card, 'id' | 'active'>) => void;
  removerCartao:              (id: ID) => void;
  atualizarCartao:            (id: ID, patch: Partial<Card>) => void;
  // Item 7: pagar fatura
  pagarFatura:                (card: Card, mes: IsoMonth) => void;
  // Item 10: orçamento
  definirOrcamentoMes:        (month: IsoMonth, amount: Money) => void;
  definirOrcamentoCategoria:  (month: IsoMonth, categoria: string, amount: Money) => void;
  removerEnvelope:            (month: IsoMonth, categoria: string) => void;
  limparOrcamentoMes:         (month: IsoMonth) => void;
  // Fatia 2: revisão reflexiva
  setReflexao:                (mes: IsoMonth, qKey: string, valor: string) => void;
  setFoco:                    (mes: IsoMonth, campo: keyof FocoMes, valor: string) => void;
  setConquista:               (ano: string, cKey: string, valor: string) => void;
}
