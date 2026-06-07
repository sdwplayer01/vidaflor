// src/features/saude/selectors.ts
import { useShallow } from 'zustand/react/shallow';
import { useMemo } from 'react';
import { useSaudeStore } from './store';
import { calcAguaPctDoDia, calcCycleState, calcAdesaoMedicamentos } from './utils';
import { today } from '@/shared/utils/date';
import type { ID, ISODate } from '@/shared/types/common';
import type { HealthProfile, Medication, ProfileType, NoteEntry } from './types';
import type { CycleState } from './utils';

// ── Sentinelas congeladas: SEMPRE a mesma referência ─────────────────────────
export const EMPTY_OBJ = Object.freeze({}) as Record<string, never>;
export const EMPTY_ARR = Object.freeze([]) as never[];

export const PERFIL_VAZIO: HealthProfile = Object.freeze({
  id:          '',
  name:        '',
  avatar:      '',
  type:        'adult_f' as const,
  color:       '',
  water:       Object.freeze({ goalMl: 2000, logMl: EMPTY_OBJ }) as HealthProfile['water'],
  meds:        EMPTY_ARR as HealthProfile['meds'],
  notes:       EMPTY_OBJ as HealthProfile['notes'],
  moodLog:     EMPTY_OBJ as HealthProfile['moodLog'],
  sleepLog:    EMPTY_OBJ as HealthProfile['sleepLog'],
  stepsLog:    EMPTY_OBJ as HealthProfile['stepsLog'],
  metaPassos:  8000,
  createdAt:   '',
}) as HealthProfile;

// usePerfilAtivo retorna undefined quando não há perfil ativo (undefined é
// referência estável — Object.is passa — sem risco de loop).
// Callers com `if (!perfil)` continuam funcionando.
export function usePerfilAtivo(): HealthProfile | undefined {
  return useSaudeStore(
    useShallow((s) => s.profiles.find((p) => p.id === s.activeProfileId))
  );
}

// usePerfilAtivoSeguro retorna PERFIL_VAZIO (referência congelada) em vez de
// undefined — use em seletores derivados para evitar fallback inline instável.
export function usePerfilAtivoSeguro(): HealthProfile {
  return useSaudeStore(
    (s) => s.profiles.find((p) => p.id === s.activeProfileId) ?? PERFIL_VAZIO
  );
}

export function usePerfis(): HealthProfile[] {
  return useSaudeStore(useShallow((s) => s.profiles));
}

export function usePerfisPorTipo(tipo: ProfileType): HealthProfile[] {
  return useSaudeStore(
    useShallow((s) => s.profiles.filter((p) => p.type === tipo))
  );
}

export function useAguaDoDia(profileId?: ID): { atual: number; meta: number; pct: number } {
  return useSaudeStore(
    useShallow((s) => {
      const id   = profileId ?? s.activeProfileId;
      const p    = s.profiles.find((pr) => pr.id === id);
      if (!p) return { atual: 0, meta: 2000, pct: 0 };
      const day  = today();
      const atual = p.water.logMl[day] ?? 0;
      const meta  = p.water.goalMl;
      const pct   = calcAguaPctDoDia(p, day);
      return { atual, meta, pct };
    })
  );
}

export function useCicloAtual(profileId?: ID): CycleState | undefined {
  return useSaudeStore(
    useShallow((s) => {
      const id = profileId ?? s.activeProfileId;
      const p  = s.profiles.find((pr) => pr.id === id);
      if (!p || !p.cycle) return undefined;
      return calcCycleState(today(), p.cycle);
    })
  );
}

export function useMedicamentosDoDia(profileId?: ID): Medication[] {
  return useSaudeStore(
    useShallow((s) => {
      const id  = profileId ?? s.activeProfileId;
      const p   = s.profiles.find((pr) => pr.id === id);
      if (!p) return [];
      const dow = new Date(today() + 'T00:00:00').getDay();
      return p.meds.filter((m) =>
        m.active && (
          m.schedule === 'diario' ||
          (m.schedule === 'semanal' && (m.weekdays ?? []).includes(dow))
        )
      );
    })
  );
}

export function useMedicamentosPendentesHoje(): { profile: HealthProfile; meds: Medication[] }[] {
  const profiles = useSaudeStore((s) => s.profiles);
  return useMemo(() => {
    const day = today();
    const dow = new Date(day + 'T00:00:00').getDay();
    return profiles
      .map((p) => ({
        profile: p,
        meds: p.meds.filter(
          (m) =>
            m.active &&
            (
              m.schedule === 'diario' ||
              (m.schedule === 'semanal' && (m.weekdays ?? []).includes(dow))
            ) &&
            !m.log[day]
        ),
      }))
      .filter(({ meds }) => meds.length > 0);
  }, [profiles]);
}

export function useAdesaoMedicamentosHoje(profileId?: ID): {
  tomados: number;
  total: number;
  pct: number;
} {
  return useSaudeStore(
    useShallow((s) => {
      const id = profileId ?? s.activeProfileId;
      const p  = s.profiles.find((pr) => pr.id === id);
      if (!p) return { tomados: 0, total: 0, pct: 100 };
      return calcAdesaoMedicamentos(p, today());
    })
  );
}

export function useAnotacoesDoDia(day?: ISODate, profileId?: ID): NoteEntry[] {
  return useSaudeStore(
    useShallow((s) => {
      const id = profileId ?? s.activeProfileId;
      const p  = s.profiles.find((pr) => pr.id === id);
      const d  = day ?? today();
      return p?.notes[d] ?? (EMPTY_ARR as unknown as NoteEntry[]);
    })
  );
}

export function useTodasAnotacoes(profileId?: ID): { data: ISODate; entries: NoteEntry[] }[] {
  // §4.3 Variante C: extrai ref estável do store → useMemo deriva. Evita loop #185
  // causado por .map(() => ({ ... })) dentro de useShallow (objetos novos a cada chamada).
  const notes = useSaudeStore((s) => {
    const id = profileId ?? s.activeProfileId;
    const p  = s.profiles.find((pr) => pr.id === id);
    return p?.notes ?? (EMPTY_OBJ as HealthProfile['notes']);
  });
  return useMemo(
    () =>
      Object.entries(notes)
        .filter(([, entries]) => entries.length > 0)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([data, entries]) => ({ data, entries })),
    [notes],
  );
}
