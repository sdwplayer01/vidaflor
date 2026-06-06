// src/features/saude/seed.ts
import { PROFILE_COLOR_DEFAULT } from '@/shared/constants/colors';
import type { SaudeState } from './types';
import { SAUDE_VERSION } from './migrations';

export const seedSaude: SaudeState = {
  activeProfileId: 'demo-ana',
  profiles: [
    {
      id:        'demo-ana',
      name:      'Ana',
      avatar:    '👩',
      type:      'adult_f',
      color:     PROFILE_COLOR_DEFAULT,
      water: {
        goalMl: 2000,
        logMl: {
          '2026-05-28': 1600,
          '2026-05-29': 2000,
          '2026-05-30': 1800,
          '2026-05-31': 2200,
          '2026-06-01': 1400,
          '2026-06-02': 2000,
          '2026-06-03': 800,
        },
      },
      cycle: {
        start:   '2026-05-20',
        lenDays: 28,
        menses:  5,
      },
      meds: [
        {
          id:        'demo-med-vit',
          name:      'Vitamina D',
          dose:      '2000 UI',
          time:      '08:00',
          schedule:  'diario',
          active:    true,
          createdAt: '2026-04-01',
          log: {
            '2026-05-29': true,
            '2026-05-30': true,
            '2026-05-31': true,
            '2026-06-01': true,
            '2026-06-02': true,
            '2026-06-03': false,
          },
        },
        {
          id:        'demo-med-omega',
          name:      'Ômega 3',
          dose:      '1000mg',
          time:      '12:00',
          schedule:  'diario',
          active:    true,
          createdAt: '2026-04-01',
          log: {
            '2026-05-30': true,
            '2026-05-31': true,
            '2026-06-01': true,
            '2026-06-02': true,
          },
        },
      ],
      notes: {
        '2026-06-01': [{ id: 'note_seed_01', text: 'Consulta com cardiologista — tudo bem.', createdAt: '2026-06-01T00:00:00.000Z' }],
        '2026-06-03': [{ id: 'note_seed_03', text: 'Dor de cabeça leve à tarde.', createdAt: '2026-06-03T00:00:00.000Z' }],
      },
      moodLog: {
        '2026-05-28': 'calm',
        '2026-05-29': 'happy',
        '2026-05-30': 'happy',
        '2026-05-31': 'grat',
        '2026-06-01': 'calm',
        '2026-06-02': 'happy',
        '2026-06-03': 'calm',
      },
      sleepLog: {
        '2026-05-28': 7,
        '2026-05-29': 8,
        '2026-05-30': 6.5,
        '2026-05-31': 7.5,
        '2026-06-01': 8,
        '2026-06-02': 7,
        '2026-06-03': 7,
      },
      stepsLog: {
        '2026-05-28': 7200,
        '2026-05-29': 10400,
        '2026-05-30': 5800,
        '2026-05-31': 9100,
        '2026-06-01': 8300,
        '2026-06-02': 11200,
        '2026-06-03': 3100,
      },
      metaPassos: 8000,
      createdAt:  '2026-01-01',
    },
    {
      id:        'demo-carlos',
      name:      'Carlos',
      avatar:    '👨',
      type:      'adult_m',
      color:     '#79B8E8',
      water: {
        goalMl: 2500,
        logMl: {
          '2026-06-01': 2000,
          '2026-06-02': 2500,
          '2026-06-03': 1000,
        },
      },
      cycle:   undefined,
      meds:    [],
      notes:   {},
      moodLog: {
        '2026-06-01': 'calm',
        '2026-06-02': 'happy',
      },
      sleepLog: {
        '2026-06-01': 7,
        '2026-06-02': 6.5,
      },
      stepsLog: {
        '2026-06-01': 6000,
        '2026-06-02': 7800,
      },
      metaPassos: 8000,
      createdAt:  '2026-01-01',
    },
  ],
  _version:  SAUDE_VERSION,
  _hydrated: false,
};
