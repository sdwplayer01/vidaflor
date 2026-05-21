// src/features/rotina/migrations.ts

export const ROTINA_VERSION = 1;

export function migrate(state: any, fromVersion: number): any {
  let s = state;

  // v0 (legacy rotinaStore) -> v1: estrutura de tarefas por turno
  if (fromVersion < 1) {
    const mapTurno = (arr: any[], turno: string) =>
      (arr || []).map((t: any) => ({
        id:        t.id ? String(t.id) : String(Math.random()),
        task:      t.task ?? t.label ?? '',
        time:      t.time,
        turno,
        createdAt: '2024-01-01',
      }));

    s = {
      tarefas: {
        manha:  mapTurno(s.morning   ?? [], 'manha'),
        tarde:  mapTurno(s.afternoon ?? [], 'tarde'),
        noite:  mapTurno(s.night     ?? [], 'noite'),
      },
      essential: (s.essential ?? []).map((t: any) => ({
        id:   t.id ? String(t.id) : String(Math.random()),
        task: t.task ?? t.label ?? '',
      })),
      done:    s.done ?? {},
      essMode: s.essMode ?? false,
    };
  }

  return s;
}
