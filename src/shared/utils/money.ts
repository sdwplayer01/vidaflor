// src/shared/utils/money.ts
import { Money } from "../types/common";

/**
 * Converte um valor em reais (float) para centavos (int).
 * Ex: 10.5 -> 1050
 */
export function toCents(val: number): Money {
  if (isNaN(val)) return 0;
  return Math.round(val * 100);
}

/**
 * Converte um valor em centavos (int) para reais (float).
 * Ex: 1050 -> 10.5
 */
export function toReais(amount: Money): number {
  return amount / 100;
}

/**
 * Formata um valor em centavos no formato de moeda BR (ex: 123450 -> "1.234,50").
 */
export function formatBRL(amount: Money): string {
  const reais = toReais(amount);
  return reais.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Converte uma string formatada em reais de volta para centavos.
 * Suporta formatos como "1.234,56", "1234,56", "R$ 1.234,56", etc.
 */
export function parseBRL(val: string): Money {
  if (!val) return 0;
  // Remove tudo que não seja número, vírgula ou sinal de menos
  let clean = val.replace(/[^\d,-]/g, "");
  // Se houver vírgula, substitui por ponto para conversão float padrão
  if (clean.includes(",")) {
    clean = clean.replace(/\./g, "").replace(",", ".");
  }
  const parsed = parseFloat(clean);
  return toCents(parsed);
}

/**
 * Soma com segurança múltiplos valores de Money, evitando erros de float.
 */
export function sumMoney(...amounts: Money[]): Money {
  return amounts.reduce((acc, curr) => acc + curr, 0);
}
