// src/shared/types/recorrencia.ts
// Tipo de recorrência para tarefas (casa, agenda).
// Distinto de financas/types.ts Recorrencia (recorrência financeira).

export type RecorrenciaTarefa =
  | { tipo: 'diaria' }
  | { tipo: 'semanal'; diasSemana: number[] }
  | { tipo: 'mensal'; diaMes: number }
  | { tipo: 'avulsa' };
