// src/features/bloom/types.ts — v2
// 6-input weighted vitality formula (weights sum to 1.0)

export interface BloomBreakdown {
  tasksPct:  number;  // 0-100, weight 0.28
  waterPct:  number;  // 0-100, weight 0.18
  stepsPct:  number;  // 0-100, weight 0.14
  sleepPct:  number;  // 0-100, weight 0.10
  moodPct:   number;  // 0-100, weight 0.10 (80 if mood registered, 0 otherwise)
  spiritPct: number;  // 0-100, weight 0.20
  total:     number;  // 0-100 composite vitality
}

export type BloomFase = "inicio" | "meio" | "total";
