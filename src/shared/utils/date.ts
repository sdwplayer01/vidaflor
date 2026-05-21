// src/shared/utils/date.ts
import { ISODate, ISODateTime, IsoMonth } from "../types/common";

/**
 * Retorna a data de hoje no formato "YYYY-MM-DD".
 */
export const today = (): ISODate =>
  new Date().toISOString().slice(0, 10);

/**
 * Retorna o carimbo de data/hora atual no formato ISO completo.
 */
export const nowISO = (): ISODateTime =>
  new Date().toISOString();

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
 * Formata "YYYY-MM-DD" para "DD/MM/YYYY".
 */
export const formatBR = (d: ISODate): string => {
  if (!d) return "";
  const parts = d.split("-");
  if (parts.length < 3) return d;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

/**
 * Formata "YYYY-MM-DD" em exibição curta (ex: "2026-04-19" → "19/04").
 */
export const fmtDayShort = (d: ISODate): string => {
  if (!d) return "";
  const parts = d.split("-");
  const day = parts[2] ?? "01";
  const mo = parts[1] ?? "01";
  return `${day}/${mo}`;
};

/**
 * Formata "YYYY-MM" em rótulo curto (ex: "2026-04" → "Abr/26").
 */
export const fmtMonth = (m: IsoMonth): string => {
  if (!m) return "";
  const parts = m.split("-");
  const y = parts[0] ?? "00";
  const mo = parts[1] ?? "1";
  const names = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  const idx = parseInt(mo, 10) - 1;
  return `${names[idx] ?? "???"}/${y.slice(2)}`;
};

/**
 * Adiciona um número de dias a uma data "YYYY-MM-DD" e retorna "YYYY-MM-DD".
 */
export const addDays = (dateStr: ISODate, days: number): ISODate => {
  const d = new Date(`${dateStr}T12:00:00`); // Evita problemas de timezone
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

/**
 * Calcula a diferença em dias entre duas datas "YYYY-MM-DD".
 * Resultado positivo = dateB é depois de dateA.
 */
export const diffDays = (dateA: ISODate, dateB: ISODate): number => {
  const d1 = new Date(`${dateA}T12:00:00`);
  const d2 = new Date(`${dateB}T12:00:00`);
  return Math.round((d2.getTime() - d1.getTime()) / 86_400_000);
};

/**
 * Retorna o primeiro dia do mês no formato "YYYY-MM-DD" (ex: "2026-04" → "2026-04-01").
 */
export const startOfMonth = (monthStr: IsoMonth): ISODate => {
  return `${monthStr}-01`;
};

/**
 * Retorna o último dia do mês no formato "YYYY-MM-DD" (ex: "2026-04" → "2026-04-30").
 */
export const endOfMonth = (monthStr: IsoMonth): ISODate => {
  const parts = monthStr.split("-");
  const year = parseInt(parts[0] ?? "2026", 10);
  const month = parseInt(parts[1] ?? "04", 10);
  // O dia 0 do mês seguinte é o último dia do mês atual
  const d = new Date(year, month, 0);
  return d.toISOString().slice(0, 10);
};

/**
 * Extrai o mês "YYYY-MM" de uma data "YYYY-MM-DD".
 */
export const isoMonth = (dateStr: ISODate): IsoMonth => {
  return dateStr.slice(0, 7);
};

/**
 * Retorna o mês atual no formato "YYYY-MM".
 */
export const currentMonth = (): IsoMonth =>
  today().slice(0, 7);
