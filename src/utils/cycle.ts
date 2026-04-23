// src/utils/cycle.ts
// Cálculo do estado do ciclo menstrual — função pura.

/**
 * Estado completo do ciclo para um dia específico.
 */
export interface CycleState {
  /** Dia do ciclo atual (0-indexed). */
  dc:       number;
  /** Dias restantes para o próximo ciclo. */
  dl:       number;
  /** Está nos 7 dias finais (fase lútea tardia / TPM). */
  isTPM:    boolean;
  /** Está no período fértil estimado (dias 10–16). */
  isFertil: boolean;
  /** Está no período menstrual. */
  isMenses: boolean;
  /** Fase do ciclo: Menstrual, Folicular ou Lútea. */
  phase:    "Menstrual" | "Folicular" | "Lútea";
}

/**
 * Calcula o estado do ciclo menstrual para um dia específico.
 *
 * @param day    - Data alvo no formato "YYYY-MM-DD"
 * @param start  - Data de início do último ciclo "YYYY-MM-DD"
 * @param len    - Duração total do ciclo em dias (tipicamente 28)
 * @param menses - Duração da menstruação em dias (tipicamente 5)
 * @returns Estado completo do ciclo
 */
export function calcCycleState(
  day:    string,
  start:  string,
  len:    number,
  menses: number
): CycleState {
  const ds = Math.floor(
    (new Date(day).getTime() - new Date(start).getTime()) / 86_400_000
  );

  // Módulo positivo — funciona mesmo se day < start
  const dc = ((ds % len) + len) % len;
  const dl = len - dc;

  return {
    dc,
    dl,
    isTPM:    dl <= 7,
    isFertil: dc >= 10 && dc <= 16,
    isMenses: dc < menses,
    phase:    dc < menses ? "Menstrual" : dc < 14 ? "Folicular" : "Lútea",
  };
}

/**
 * Retorna um rótulo amigável para a fase do ciclo.
 */
export function cyclePhaseLabel(state: CycleState): string {
  if (state.isMenses)  return "Período menstrual 🩸";
  if (state.isFertil)  return "Período fértil 🌸";
  if (state.isTPM)     return "Fase lútea — cuide-se com carinho 🍫";
  return `Dia ${state.dc + 1} — ${state.phase}`;
}

/**
 * Retorna a cor semântica ideal para a fase atual.
 * Usa os tokens do tema: er (menstrual), ok (fértil), wn (TPM), p (padrão).
 */
export function cyclePhaseColor(
  state: CycleState,
  tokens: { er: string; ok: string; wn: string; p: string }
): string {
  if (state.isMenses)  return tokens.er;
  if (state.isFertil)  return tokens.ok;
  if (state.isTPM)     return tokens.wn;
  return tokens.p;
}
