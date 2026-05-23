// src/features/casa/selectors.ts
import { useShallow } from 'zustand/react/shallow';
import { useCasaStore } from './store';
import { tarefasDoDia } from './utils';
import { today } from '@/shared/utils/date';
import type { Ambiente, TarefaCasa } from './types';

export function useTarefasCasaHoje(): TarefaCasa[] {
  return useCasaStore(
    useShallow((s) => tarefasDoDia(s, today()))
  );
}

export function useTarefasCasaPorAmbiente(): Record<Ambiente, TarefaCasa[]> {
  return useCasaStore(
    useShallow((s) => {
      const dia = tarefasDoDia(s, today());
      const result = {} as Record<Ambiente, TarefaCasa[]>;
      dia.forEach((t) => {
        if (!result[t.ambiente]) result[t.ambiente] = [];
        result[t.ambiente].push(t);
      });
      return result;
    })
  );
}

export function useCronogramaSemanal(): Record<number, TarefaCasa[]> {
  return useCasaStore(
    useShallow((s) => {
      const cron: Record<number, TarefaCasa[]> = {};
      for (let d = 0; d <= 6; d++) cron[d] = [];
      s.tarefas.filter((t) => t.active).forEach((t) => {
        if (t.recorrencia.tipo === 'semanal') {
          t.recorrencia.diasSemana.forEach((d) => { if (cron[d]) cron[d].push(t); });
        }
      });
      return cron;
    })
  );
}
