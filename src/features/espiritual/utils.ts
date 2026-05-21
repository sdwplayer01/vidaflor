// src/features/espiritual/utils.ts
// Funções puras. Zero React. Zero imports de store. Testáveis isoladamente.
import type { EspiritualState } from './types';
import type { ISODate } from '@/shared/types/common';

/**
 * Calcula a contribuição espiritual para o Bloom (0–100).
 * Regra: 3 ou mais gratidões = 100. 2 = 66. 1 = 33. 0 = 0.
 */
export function calcEspiritualPct(state: EspiritualState, day: ISODate): number {
  const count = (state.gratidao[day] ?? []).length;
  if (count >= 3) return 100;
  if (count === 2) return 66;
  if (count === 1) return 33;
  return 0;
}
