// src/features/agenda/migrations.ts
export const AGENDA_VERSION = 1;

export function migrate(state: any, _fromVersion: number): any {
  // v0 → v1: estrutura inicial — nada a migrar
  return state;
}
