// src/features/saude/seed.ts
import { PROFILE_COLOR_DEFAULT } from '@/shared/constants/colors';
import type { SaudeState } from './types';
import { SAUDE_VERSION } from './migrations';

export const seedSaude: SaudeState = {
  activeProfileId: 'eu',
  profiles: [
    {
      id:        'eu',
      name:      'Voce',
      avatar:    '\uD83D\uDC69',
      type:      'adult_f',
      color:     PROFILE_COLOR_DEFAULT,
      water:     { goalMl: 2000, logMl: {} },
      cycle:     undefined,
      meds:      [],
      notes:     {},
      moodLog:   {},
      createdAt: '2024-01-01',
    },
  ],
  _version:  SAUDE_VERSION,
  _hydrated: false,
};
