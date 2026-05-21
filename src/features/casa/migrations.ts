// src/features/casa/migrations.ts

export const CASA_VERSION = 1;

export function migrate(state: any, fromVersion: number): any {
  let s = state;

  if (fromVersion < 1) {
    s = {
      tarefas: (s.tarefas || s.chores || []).map((t: any) => ({
        id:          t.id ? String(t.id) : String(Math.random()),
        task:        t.task ?? t.label ?? '',
        ambiente:    t.ambiente ?? 'geral',
        recorrencia: t.recorrencia ?? { tipo: 'diaria' },
        estimativaMin: t.estimativaMin,
        createdAt:   t.createdAt ?? '2024-01-01',
        active:      t.active ?? true,
      })),
      done: s.done ?? {},
    };
  }

  return s;
}
