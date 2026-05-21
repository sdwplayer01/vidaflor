// src/features/saude/utils.ts
import type { ISODate } from '@/shared/types/common';
import type { HealthProfile, CycleConfig } from './types';

export interface CycleState {
  diaCiclo:        number;
  diasParaProximo: number;
  isTPM:           boolean;
  isFertil:        boolean;
  isMenses:        boolean;
  fase:            'Menstrual' | 'Folicular' | 'Ovulatoria' | 'Lutea';
}

export function calcCycleState(day: ISODate, cfg: CycleConfig): CycleState {
  const start  = new Date(cfg.start + 'T00:00:00');
  const target = new Date(day        + 'T00:00:00');
  const diffMs = target.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  const diaCiclo = ((diffDays % cfg.lenDays) + cfg.lenDays) % cfg.lenDays;
  const diasParaProximo = cfg.lenDays - diaCiclo;

  const isMenses = diaCiclo < cfg.menses;
  // janela fertil: ovulacao ~ dia 14 de um ciclo de 28 (proporcional)
  const ovulation = Math.round((cfg.lenDays * 14) / 28);
  const isFertil  = diaCiclo >= ovulation - 2 && diaCiclo <= ovulation + 2;
  const isTPM     = diaCiclo >= cfg.lenDays - 5;

  let fase: CycleState['fase'];
  if (isMenses)                        fase = 'Menstrual';
  else if (diaCiclo < ovulation - 2)   fase = 'Folicular';
  else if (isFertil)                   fase = 'Ovulatoria';
  else                                 fase = 'Lutea';

  return { diaCiclo, diasParaProximo, isTPM, isFertil, isMenses, fase };
}

export function calcAguaPctDoDia(profile: HealthProfile, day: ISODate): number {
  const atual = profile.water.logMl[day] ?? 0;
  const meta  = profile.water.goalMl;
  if (meta <= 0) return 0;
  return Math.min(100, Math.round((atual / meta) * 100));
}

export function calcAdesaoMedicamentos(
  profile: HealthProfile,
  day: ISODate
): { tomados: number; total: number; pct: number } {
  const meds = profile.meds.filter((m) => m.active && m.schedule === 'diario');
  const total = meds.length;
  if (total === 0) return { tomados: 0, total: 0, pct: 100 };
  const tomados = meds.filter((m) => m.log[day] === true).length;
  return { tomados, total, pct: Math.round((tomados / total) * 100) };
}

export function calcAguaPctPerfilAtivo(
  state: { profiles: HealthProfile[]; activeProfileId: string },
  day: ISODate
): number {
  const p = state.profiles.find((pr) => pr.id === state.activeProfileId);
  if (!p) return 0;
  return calcAguaPctDoDia(p, day);
}
