// src/features/saude/types.ts
import type { ID, ISODate, HexColor, Emoji } from '@/shared/types/common';

export type ProfileType = 'adult_f' | 'adult_m' | 'child' | 'pet';

export interface WaterLog {
  goalMl: number;
  logMl:  Record<ISODate, number>;
}

export interface CycleConfig {
  start:   ISODate;
  lenDays: number;
  menses:  number;
}

export interface Medication {
  id:        ID;
  name:      string;
  dose:      string;
  time:      string;           // 'HH:mm'
  schedule:  'diario' | 'sos' | 'semanal';
  log:       Record<ISODate, boolean>;
  createdAt: ISODate;
  active:    boolean;
}

export interface HealthProfile {
  id:        ID;
  name:      string;
  avatar:    Emoji;
  type:      ProfileType;
  color:     HexColor;
  water:     WaterLog;
  cycle?:    CycleConfig;
  meds:      Medication[];
  notes:     Record<ISODate, string>;
  moodLog:   Record<ISODate, string>;  // humor do dia: 'calm'|'happy'|'anx'|'grat'
  createdAt: ISODate;
}

export interface SaudeState {
  activeProfileId: ID;
  profiles:        HealthProfile[];
  _version:        number;
  _hydrated:       boolean;
}

export interface SaudeActions {
  trocarPerfilAtivo:    (id: ID) => void;
  adicionarPerfil:      (profile: Omit<HealthProfile, 'id' | 'createdAt' | 'meds' | 'notes'>) => void;
  removerPerfil:        (id: ID) => void;
  atualizarPerfil:      (id: ID, patch: Partial<HealthProfile>) => void;

  registrarAgua:        (profileId: ID, day: ISODate, ml: number) => void;
  ajustarMetaAgua:      (profileId: ID, goalMl: number) => void;
  zerarAguaDoDia:       (profileId: ID, day: ISODate) => void;

  configurarCiclo:      (profileId: ID, cfg: CycleConfig) => void;
  removerCiclo:         (profileId: ID) => void;

  adicionarMedicamento: (profileId: ID, med: Omit<Medication, 'id' | 'log' | 'createdAt' | 'active'>) => void;
  removerMedicamento:   (profileId: ID, medId: ID) => void;
  toggleMedicamentoDia: (profileId: ID, medId: ID, day: ISODate) => void;
  desativarMedicamento:  (profileId: ID, medId: ID) => void;
  registrarMoodDia:      (profileId: ID, day: ISODate, mood: string | null) => void;

  registrarAnotacaoDia: (profileId: ID, day: ISODate, text: string) => void;
}
