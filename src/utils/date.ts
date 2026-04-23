// src/utils/date.ts
// Helpers de data e formatação — funções puras, sem side effects.

/**
 * Retorna a data de hoje no formato "YYYY-MM-DD".
 */
export const today = (): string =>
  new Date().toISOString().slice(0, 10);

/**
 * Retorna a hora atual (0–23).
 */
export const hour = (): number =>
  new Date().getHours();

/**
 * Retorna o turno atual com base na hora.
 */
export const turnoNow = (): "morning" | "afternoon" | "night" =>
  hour() < 12 ? "morning" : hour() < 18 ? "afternoon" : "night";

/**
 * Retorna a saudação adequada ao turno.
 */
export const greet = (): string =>
  hour() < 12 ? "Bom dia" : hour() < 18 ? "Boa tarde" : "Boa noite";

/**
 * Formata um número como moeda BR (ex: 1234.5 → "1.234,50").
 */
export const fmtBRL = (v: number): string =>
  Number(v).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * Formata "YYYY-MM" em rótulo curto (ex: "2026-04" → "Abr/26").
 */
export const fmtMonth = (m: string): string => {
  const parts = m.split("-");
  const y = parts[0] ?? "00";
  const mo = parts[1] ?? "1";
  const names = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  return `${names[parseInt(mo) - 1] ?? "???"}/${y.slice(2)}`;
};

/**
 * Formata "YYYY-MM-DD" em exibição curta (ex: "2026-04-19" → "19/04").
 */
export const fmtDayShort = (d: string): string => {
  const parts = d.split("-");
  const day = parts[2] ?? "01";
  const mo = parts[1] ?? "01";
  return `${day}/${mo}`;
};

/**
 * Retorna o mês atual no formato "YYYY-MM".
 */
export const currentMonth = (): string =>
  today().slice(0, 7);

/**
 * Calcula a diferença em dias entre duas datas "YYYY-MM-DD".
 * Resultado positivo = dateB é depois de dateA.
 */
export const diffDays = (dateA: string, dateB: string): number =>
  Math.floor(
    (new Date(dateB).getTime() - new Date(dateA).getTime()) / 86_400_000
  );
