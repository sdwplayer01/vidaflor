// src/features/casa/utils.ts
import type { ISODate, ID } from '@/shared/types/common';
import type { TarefaCasa, CasaState } from './types';

function diaSemana(day: ISODate): number {
  return new Date(day + 'T00:00:00').getDay();
}

function diaMes(day: ISODate): number {
  return new Date(day + 'T00:00:00').getDate();
}

export function tarefaAtivaNoDia(tarefa: TarefaCasa, day: ISODate): boolean {
  if (!tarefa.active) return false;
  const rec = tarefa.recorrencia;
  if (rec.tipo === 'diaria')  return true;
  if (rec.tipo === 'semanal') return rec.diasSemana.includes(diaSemana(day));
  if (rec.tipo === 'mensal')  return rec.diaMes === diaMes(day);
  if (rec.tipo === 'avulsa')  return tarefa.createdAt === day;
  return false;
}

export function tarefasDoDia(state: CasaState, day: ISODate): TarefaCasa[] {
  return state.tarefas.filter((t) => tarefaAtivaNoDia(t, day));
}

export function calcCasaPct(state: CasaState, day: ISODate): number {
  const ativas  = tarefasDoDia(state, day);
  if (ativas.length === 0) return 0;
  const doneIds = state.done[day] ?? [];
  const feitas  = ativas.filter((t) => doneIds.includes(t.id)).length;
  return Math.round((feitas / ativas.length) * 100);
}
