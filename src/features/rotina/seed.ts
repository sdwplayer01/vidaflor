// src/features/rotina/seed.ts
import type { RotinaState } from './types';
import { ROTINA_VERSION } from './migrations';

export const seedRotina: RotinaState = {
  tarefas:   { manha: [], tarde: [], noite: [] },
  essential: [],
  done:      {},
  essMode:   false,
  _version:  ROTINA_VERSION,
  _hydrated: false,
};
