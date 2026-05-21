// src/features/kids/utils.ts
import type { ISODate, ID } from '@/shared/types/common';
import type { Crianca, KidsState } from './types';

export function calcProgressoCrianca(
  crianca: Crianca,
  done: Record<ISODate, ID[]>,
  day: ISODate
): { feitas: number; total: number; pct: number } {
  const doneIds = done[day] ?? [];
  const total   = crianca.tasks.length;
  const feitas  = crianca.tasks.filter((t) => doneIds.includes(t.id)).length;
  const pct     = total === 0 ? 0 : Math.round((feitas / total) * 100);
  return { feitas, total, pct };
}

export function calcKidsPct(state: KidsState, day: ISODate): number {
  if (state.criancas.length === 0) return 0;
  const total = state.criancas.reduce(
    (sum, k) => sum + calcProgressoCrianca(k, state.done, day).pct,
    0
  );
  return Math.round(total / state.criancas.length);
}
