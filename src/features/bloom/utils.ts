// src/features/bloom/utils.ts — v2
// Pure functions. No React. No store imports. Testable in isolation.

import type { BloomBreakdown, BloomFase } from "./types";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Composite vitality formula (weights sum to 1.0).
 * tasksPct  x 0.28  -- rotina concluida
 * waterPct  x 0.18  -- hidratacao
 * stepsPct  x 0.14  -- passos
 * sleepPct  x 0.10  -- sono (4h=0, 8h+=100)
 * moodPct   x 0.10  -- humor registrado
 * spiritPct x 0.20  -- gratidoes + respiros + leituras
 */
export function calcBloom(parts: Omit<BloomBreakdown, "total">): BloomBreakdown {
  const total = Math.round(
    parts.tasksPct  * 0.28 +
    parts.waterPct  * 0.18 +
    parts.stepsPct  * 0.14 +
    parts.sleepPct  * 0.10 +
    parts.moodPct   * 0.10 +
    parts.spiritPct * 0.20
  );
  return { ...parts, total: clamp(total, 0, 100) };
}

export function getBloomFase(total: number): BloomFase {
  if (total >= 75) return "total";
  if (total >= 30) return "meio";
  return "inicio";
}

export function calcSpiritPct(
  gratidoesCount: number,
  breathSessions: number,
  versesRead:     number
): number {
  return clamp(gratidoesCount * 25 + breathSessions * 15 + versesRead * 10, 0, 100);
}

export function calcSleepPct(sleepHours: number): number {
  return clamp(((sleepHours - 4) / 4) * 100, 0, 100);
}
