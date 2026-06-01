import { KID_COLOR_DEFAULT } from '@/shared/constants/colors';
// src/features/kids/migrations.ts

export const KIDS_VERSION = 1;

export function migrate(state: unknown, fromVersion: number): unknown {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let s = state as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  if (fromVersion < 1) {
    // legacy kidsStore tinha estrutura diferente
    const kids = (s.kids || s.children || []).map((k: any) => ({
      id:        k.id ? String(k.id) : String(Math.random()),
      name:      k.name ?? '',
      avatar:    k.avatar ?? '\uD83D\uDC76',
      age:       k.age ?? 0,
      color:     k.color ?? KID_COLOR_DEFAULT,
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
