// src/features/rotina/selectors.ts
import { useShallow } from 'zustand/react/shallow';
import { useRotinaStore } from './store';
import { calcRotinaPct } from './utils';
import { today } from '@/shared/utils/date';
import type { Turno } from './types';
import type { ISODate, ID } from '@/shared/types/common';

// Fallback estavel para dias sem tarefas concluidas — evita novo [] a cada render
const EMPTY_IDS: ID[] = [];

export function useTarefasDoTurno(turno: Turno) {
  return useRotinaStore(useShallow((s) => s.tarefas[turno]));
}

export function useTarefasFeitasDoDia(day?: ISODate): ID[] {
  // useShallow garante que se os IDs nao mudaram, a referencia do array e a mesma
  return useRotinaStore(
    useShallow((s) => s.done[day ?? today()] ?? EMPTY_IDS)
  );
}

export function useProgressoDoDia(day?: ISODate) {
  // Retorna objeto — useShallow faz comparacao rasa para evitar re-renders desnecessarios
  return useRotinaStore(
    useShallow((s) => {
      const d       = day ?? today();
      const doneIds = s.done[d] ?? EMPTY_IDS;
      const allTasks = s.essMode
        ? s.essential
        : [...s.tarefas.manha, ...s.tarefas.tarde, ...s.tarefas.noite];
      const total  = allTasks.length;
      const feitas = allTasks.filter((t) => doneIds.includes(t.id)).length;
      const pct    = total === 0 ? 0 : Math.round((feitas / total) * 100);
      return { feitas, total, pct };
    })
  );
}

export function useRotinaPct(day?: ISODate): number {
  return useRotinaStore((s) => calcRotinaPct(s, day ?? today()));
}
