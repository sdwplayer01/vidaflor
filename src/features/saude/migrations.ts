// src/features/saude/migrations.ts
import { PROFILE_COLOR_DEFAULT } from '@/shared/constants/colors';

export const SAUDE_VERSION = 4;

export function migrate(state: any, fromVersion: number): any {
  let s = state;

  // v0 (legacy main.jsx) -> v1: criar estrutura profiles[]
  if (fromVersion < 1) {
    s = {
      activeProfileId: 'eu',
      profiles: [
        {
          id:        'eu',
          name:      'Voce',
          avatar:    '\uD83D\uDC69',
          type:      'adult_f',
          color:     PROFILE_COLOR_DEFAULT,
          water:     s.water || { goalMl: 2000, logMl: {} },
          cycle: s.cycle
            ? {
                start:   s.cycle.start,
                lenDays: s.cycle.len ?? 28,
                menses:  s.cycle.menses ?? 5,
              }
            : undefined,
          meds:      [],
          notes:     {},
          createdAt: '2024-01-01',
        },
      ],
    };
  }

  // v1 -> v2: campos novos em Medication (schedule, active)
  if (fromVersion < 2) {
    s.profiles = (s.profiles || []).map((p: any) => ({
      ...p,
      meds: (p.meds || []).map((m: any) => ({
        ...m,
        schedule: m.schedule ?? 'diario',
        active:   m.active   ?? true,
      })),
    }));
  }

  // v2 -> v3: add moodLog field to all profiles
  if (fromVersion < 3) {
    s.profiles = (s.profiles || []).map((p: any) => ({
      ...p,
      moodLog: p.moodLog ?? {},
    }));
  }

  // v3 -> v4: add sleepLog, stepsLog, metaPassos
  if (fromVersion < 4) {
    s.profiles = (s.profiles || []).map((p: any) => ({
      ...p,
      sleepLog:   p.sleepLog   ?? {},
      stepsLog:   p.stepsLog   ?? {},
      metaPassos: p.metaPassos ?? 8000,
    }));
  }

  return s;
}
