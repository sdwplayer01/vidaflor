// src/features/kids/migrations.ts

export const KIDS_VERSION = 1;

export function migrate(state: any, fromVersion: number): any {
  let s = state;

  if (fromVersion < 1) {
    // legacy kidsStore tinha estrutura diferente
    const kids = (s.kids || s.children || []).map((k: any) => ({
      id:        k.id ? String(k.id) : String(Math.random()),
      name:      k.name ?? '',
      avatar:    k.avatar ?? '\uD83D\uDC76',
      age:       k.age ?? 0,
      color:     k.color ?? '#79B8E8',
      tasks:     (k.tasks || []).map((t: any) => ({
        id:    t.id ? String(t.id) : String(Math.random()),
        task:  t.task ?? t.label ?? '',
        emoji: t.emoji ?? '\u2705',
        time:  t.time,
      })),
      createdAt: '2024-01-01',
    }));
    s = {
      criancas:    kids,
      activeKidId: kids[0]?.id ?? null,
      done:        s.done ?? {},
    };
  }

  return s;
}
