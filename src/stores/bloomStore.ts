// src/stores/bloomStore.ts
// Hook derivado useBloomPct — lê de 3 stores (rotina, saúde, espiritual).
// Não é um store Zustand com persist — é um hook reativo que recalcula
// automaticamente quando qualquer uma das 3 fontes muda.

import { useRotinaStore }  from "./rotinaStore";
import { useSaudeStore }   from "./saudeStore";
import { useEspiritStore } from "./espiritStore";
import { today }           from "@/utils/date";

/**
 * Hook reativo que calcula o bloom percentage do dia atual.
 *
 * Fórmula:
 *   - Rotina completa → até 40 pontos
 *   - Hidratação ≥ meta → até 30 pontos
 *   - 3 gratidões → até 30 pontos
 *   Total máximo: 100
 *
 * Re-renderiza apenas quando rotina, água ou gratidão muda —
 * não quando outras partes dos stores mudam.
 */
export function useBloomPct(): number {
  const day = today();

  // ── Rotina (40%) ──────────────────────────────────────────────────────────
  const morning   = useRotinaStore((s) => s.morning);
  const afternoon = useRotinaStore((s) => s.afternoon);
  const night     = useRotinaStore((s) => s.night);
  const essential = useRotinaStore((s) => s.essential);
  const essMode   = useRotinaStore((s) => s.essMode);
  const done      = useRotinaStore((s) => s.done);

  const allTasks = essMode
    ? essential
    : [...morning, ...afternoon, ...night];
  const doneIds    = done[day] ?? [];
  const routinePct = allTasks.length > 0
    ? (doneIds.length / allTasks.length) * 40
    : 0;

  // ── Água (30%) ────────────────────────────────────────────────────────────
  const profileAtivo = useSaudeStore((s) => s.profileAtivo);
  const profile      = profileAtivo();
  const wNow   = profile?.water.log[day] ?? 0;
  const wGoal  = profile?.water.goal ?? 2000;
  const waterPct = Math.min(1, wNow / wGoal) * 30;

  // ── Gratidão (30%) ────────────────────────────────────────────────────────
  const gratitudeCount = useEspiritStore((s) => s.gratitudeCount);
  const gratCount      = gratitudeCount(day);
  const gratPct        = Math.min(1, gratCount / 3) * 30;

  return Math.round(routinePct + waterPct + gratPct);
}

/**
 * Hook que retorna o bloom para um dia específico (não apenas hoje).
 * Útil para histórico.
 */
export function useBloomPctForDay(day: string): number {
  const morning   = useRotinaStore((s) => s.morning);
  const afternoon = useRotinaStore((s) => s.afternoon);
  const night     = useRotinaStore((s) => s.night);
  const essential = useRotinaStore((s) => s.essential);
  const essMode   = useRotinaStore((s) => s.essMode);
  const done      = useRotinaStore((s) => s.done);

  const allTasks = essMode ? essential : [...morning, ...afternoon, ...night];
  const doneIds    = done[day] ?? [];
  const routinePct = allTasks.length > 0
    ? (doneIds.length / allTasks.length) * 40
    : 0;

  const profileAtivo = useSaudeStore((s) => s.profileAtivo);
  const profile      = profileAtivo();
  const wNow     = profile?.water.log[day] ?? 0;
  const wGoal    = profile?.water.goal ?? 2000;
  const waterPct = Math.min(1, wNow / wGoal) * 30;

  const gratitudeCount = useEspiritStore((s) => s.gratitudeCount);
  const gratPct        = Math.min(1, gratitudeCount(day) / 3) * 30;

  return Math.round(routinePct + waterPct + gratPct);
}
