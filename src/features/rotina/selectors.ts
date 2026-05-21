// src/features/rotina/selectors.ts
import { useRotinaStore } from './store';
import { calcRotinaPct } from './utils';
import { today } from '@/shared/utils/date';
import type { Turno } from './types';
import type { ISODate, ID } from '@/shared/types/common';

export function useTarefasDoTurno(turno: Turno) {
  return useRotinaStore((s) => s.tarefas[turno]);
}

export function useTarefasFeitasDoDia(day?: ISODate): ID[] {
  return useRotinaStore((s) => s.done[day ?? today()] ?? []);
}

export function useProgressoDoDia(day?: ISODate) {
  return useRotinaStore((s) => {
    const d = day ?? today();
    const doneIds = s.done[d] ?? [];
    const allTasks = s.essMode
      ? s.essential
      : [...s.tarefas.manha, ...s.tarefas.tarde, ...s.tarefas.noite];
    const total  = allTasks.length;
    const feitas = allTasks.filter((t) => doneIds.includes(t.id)).length;
    const pct    = total === 0 ? 0 : Math.round((feitas / total) * 100);
    return { feitas, total, pct };
  });
}
