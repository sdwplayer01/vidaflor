// src/features/bloom/utils.ts
import type { BloomBreakdown } from './types';

export function calcBloom(parts: {
  routinePct:    number;
  waterPct:      number;
  espiritualPct: number;
}): BloomBreakdown {
  const total = Math.round(
    parts.routinePct    * 0.4 +
    parts.waterPct      * 0.3 +
    parts.espiritualPct * 0.3
  );
  return { ...parts, total };
}

export type BloomFase = 'inicio' | 'meio' | 'total';

export function getBloomFase(total: number): BloomFase {
  if (total >= 80) return 'total';
  if (total >= 40) return 'meio';
  return 'inicio';
}
