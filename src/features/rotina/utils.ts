// src/features/rotina/utils.ts
import type { ISODate } from '@/shared/types/common';
import type { RotinaState, Turno } from './types';

export function turnoAtual(): Turno {
  const h = new Date().getHours();
  if (h < 12) return 'manha';
  if (h < 18) return 'tarde';
  return 'noite';
}

export function calcRotinaPct(state: RotinaState, day: ISODate): number {
  const doneIds = state.done[day] ?? [];
  const allTasks = state.essMode
    ? state.essential
    : [
        ...state.tarefas.manha,
        ...state.tarefas.tarde,
        ...state.tarefas.noite,
      ];
  if (allTasks.length === 0) return 0;
  const feitas = allTasks.filter((t) => doneIds.includes(t.id)).length;
  return Math.round((feitas / allTasks.length) * 100);
}
