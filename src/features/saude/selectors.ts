// src/features/saude/selectors.ts
import { useShallow } from 'zustand/react/shallow';
import { useSaudeStore } from './store';
import { calcAguaPctDoDia, calcCycleState, calcAdesaoMedicamentos } from './utils';
import { today } from '@/shared/utils/date';
import type { ID, ISODate } from '@/shared/types/common';
import type { HealthProfile, Medication, ProfileType } from './types';
import type { CycleState } from './utils';

export function usePerfilAtivo(): HealthProfile | undefined {
  return useSaudeStore((s) => s.profiles.find((p) => p.id === s.activeProfileId));
}

export function usePerfis(): HealthProfile[] {
  return useSaudeStore((s) => s.profiles);
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
      const id = profileId ?? s.activeProfileId;
      const p  = s.profiles.find((pr) => pr.id === id);
      if (!p) return [];
      return p.meds.filter((m) => m.active && m.schedule === 'diario');
    })
  );
}

export function useMedicamentosPendentesHoje(): { profile: HealthProfile; meds: Medication[] }[] {
  return useSaudeStore(
    useShallow((s) => {
      const day = today();
      return s.profiles
        .map((p) => ({
          profile: p,
          meds: p.meds.filter(
            (m) => m.active && m.schedule === 'diario' && !m.log[day]
          ),
        }))
        .filter(({ meds }) => meds.length > 0);
    })
  );
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

export function useAnotacaoDoDia(day?: ISODate, profileId?: ID): string {
  return useSaudeStore((s) => {
    const id  = profileId ?? s.activeProfileId;
    const p   = s.profiles.find((pr) => pr.id === id);
    const d   = day ?? today();
    return p?.notes[d] ?? '';
  });
}
