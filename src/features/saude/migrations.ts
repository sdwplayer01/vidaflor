// src/features/saude/migrations.ts
import { PROFILE_COLOR_DEFAULT } from '@/shared/constants/colors';

export const SAUDE_VERSION = 7;

// ID est\u00E1vel para o perfil legado "eu" \u2014 gerado uma vez e reutilizado entre runs.
const LEGACY_EU_STABLE_ID = 'prf_legacy_eu_default';

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

  // v4 -> v5: substituir id "eu" por ID est\u00E1vel para evitar conflito com UUID de Auth
  if (fromVersion < 5) {
    s.profiles = (s.profiles || []).map((p: any) => {
      if (p.id !== 'eu') return p;
      return { ...p, id: LEGACY_EU_STABLE_ID };
    });
    if (s.activeProfileId === 'eu') {
      s.activeProfileId = LEGACY_EU_STABLE_ID;
    }
  }

  // v5 -> v6: add atividadeLog field
  if (fromVersion < 6) {
    s.profiles = (s.profiles || []).map((p: any) => ({
      ...p,
      atividadeLog: p.atividadeLog ?? {},
    }));
  }

  // v6 -> v7: atividadeLog string->string[], notes string->NoteEntry[],
  // weekdays default em meds semanais (preserva comportamento legado)
  if (fromVersion < 7) {
    s.profiles = (s.profiles || []).map((p: any) => {
      const atividadeLog: Record<string, string[]> = {};
      for (const [day, val] of Object.entries(p.atividadeLog ?? {})) {
        if (Array.isArray(val)) {
          atividadeLog[day] = val as string[];
        } else if (typeof val === 'string' && val) {
          atividadeLog[day] = [val];
        }
      }

      const notes: Record<string, any[]> = {};
      for (const [day, val] of Object.entries(p.notes ?? {})) {
        if (Array.isArray(val)) {
          notes[day] = val;
        } else if (typeof val === 'string' && (val as string).trim()) {
          notes[day] = [{
            id: `note_${day}_${Math.random().toString(36).slice(2, 9)}`,
            text: val,
            createdAt: `${day}T00:00:00.000Z`,
          }];
        }
      }

      const meds = (p.meds ?? []).map((m: any) => ({
        ...m,
        weekdays: m.schedule === 'semanal'
          ? (m.weekdays ?? [0, 1, 2, 3, 4, 5, 6])
          : m.weekdays,
      }));

      return { ...p, atividadeLog, notes, meds };
    });
  }

  return s;
}
