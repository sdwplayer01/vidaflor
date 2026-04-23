// src/utils/bloom.ts
// Cálculo da Flor do Dia — função pura que lê rotina + água + gratidão.
// Peso: Rotina 40% · Água 30% · Gratidão 30% = 100% máximo.

import type { AppData } from "@/types/data";

/**
 * Calcula a porcentagem de bloom (0–100) para um dia específico.
 *
 * Fórmula:
 *   - Rotina completa no dia   → até 40 pontos
 *   - Hidratação ≥ meta        → até 30 pontos
 *   - 3 gratidões registradas  → até 30 pontos
 *
 * Nunca retorna valor negativo. Sem punição — bloom só sobe.
 */
export function calcBloom(data: AppData, day: string): number {
  // Perfil principal de saúde — fallback para o primeiro perfil
  const mainP = data.health.profiles.find(p => p.id === "eu")
             ?? data.health.profiles[0];

  // ── Rotina (40%) ──────────────────────────────────────────────────────────
  const allT = data.routine.essMode
    ? data.routine.essential
    : [...data.routine.morning, ...data.routine.afternoon, ...data.routine.night];

  const doneIds    = data.routine.done[day] ?? [];
  const routinePct = allT.length > 0
    ? (doneIds.length / allT.length) * 40
    : 0;

  // ── Água (30%) ────────────────────────────────────────────────────────────
  const wNow     = mainP?.water.log[day] ?? 0;
  const wGoal    = mainP?.water.goal ?? 2000;
  const waterPct = Math.min(1, wNow / wGoal) * 30;

  // ── Gratidão (30%) ────────────────────────────────────────────────────────
  const gratCount = data.spirit.gratitude[day]?.length ?? 0;
  const gratPct   = Math.min(1, gratCount / 3) * 30;

  return Math.round(routinePct + waterPct + gratPct);
}

/**
 * Retorna o rótulo emocional da Flor do Dia com base no bloomPct.
 */
export function bloomLabel(pct: number): string {
  if (pct >= 100) return "Florescimento Total! ✨";
  if (pct >= 50)  return "Quase lá, continue! 🌱";
  return "Começando a brotar... 💧";
}

/**
 * Retorna o estágio visual da flor: "leaf" | "flower" | "flower2".
 */
export function bloomStage(pct: number): "leaf" | "flower" | "flower2" {
  if (pct >= 80) return "flower2";
  if (pct >= 40) return "flower";
  return "leaf";
}

/**
 * Calcula a escala de transform da flor (0.80 – 1.30).
 * bloomPct=0   → scale(0.80)
 * bloomPct=100 → scale(1.30)
 */
export function bloomScale(pct: number): number {
  return 0.8 + pct / 200;
}
