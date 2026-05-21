// src/features/pets/seed.ts
import type { PetsState } from './types';
import { PETS_VERSION } from './migrations';

export const seedPets: PetsState = {
  pets:        [],
  activePetId: null,
  done:        {},
  _version:    PETS_VERSION,
  _hydrated:   false,
};
