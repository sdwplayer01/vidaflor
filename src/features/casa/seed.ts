// src/features/casa/seed.ts
import type { CasaState } from './types';
import { CASA_VERSION } from './migrations';

export const seedCasa: CasaState = {
  tarefas:   [],
  done:      {},
  _version:  CASA_VERSION,
  _hydrated: false,
};
