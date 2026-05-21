// src/features/kids/seed.ts
import type { KidsState } from './types';
import { KIDS_VERSION } from './migrations';

export const seedKids: KidsState = {
  criancas:    [],
  activeKidId: null,
  done:        {},
  _version:    KIDS_VERSION,
  _hydrated:   false,
};
