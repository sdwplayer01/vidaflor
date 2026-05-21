// src/features/espiritual/seed.ts
import type { EspiritualState } from './types';
import { ESPIRITUAL_VERSION } from './migrations';

export const seedEspiritual: EspiritualState = {
  gratidao:  {},
  oracoes:   [],
  leituras:  [],
  _version:  ESPIRITUAL_VERSION,
  _hydrated: false,
};
