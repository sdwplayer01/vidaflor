// src/features/kids/seed.ts
import type { KidsState } from './types';
import { KIDS_VERSION } from './migrations';

export const seedKids: KidsState = {
  criancas: [
    {
      id:        'demo-kid-maria',
      name:      'Maria',
      avatar:    '👧',
      age:       8,
      color:     '#FFD6E0',
      createdAt: '2026-01-01',
      tasks: [
        { id: 'demo-kt-m1', task: 'Escovar os dentes',    emoji: '🦷', time: '07:30' },
        { id: 'demo-kt-m2', task: 'Fazer lição de casa',  emoji: '📚', time: '16:00' },
        { id: 'demo-kt-m3', task: 'Arrumar o quarto',     emoji: '🛏️', time: '17:00' },
        { id: 'demo-kt-m4', task: 'Escovar os dentes',    emoji: '🦷', time: '21:00' },
      ],
    },
    {
      id:        'demo-kid-joao',
      name:      'João',
      avatar:    '👦',
      age:       5,
      color:     '#C8E6FF',
      createdAt: '2026-01-01',
      tasks: [
        { id: 'demo-kt-j1', task: 'Escovar os dentes',      emoji: '🦷', time: '07:30' },
        { id: 'demo-kt-j2', task: 'Guardar os brinquedos',  emoji: '🧸', time: '18:00' },
        { id: 'demo-kt-j3', task: 'Escovar os dentes',      emoji: '🦷', time: '21:00' },
      ],
    },
  ],
  activeKidId: 'demo-kid-maria',
  done: {
    '2026-06-02': ['demo-kt-m1', 'demo-kt-m2', 'demo-kt-m3', 'demo-kt-j1', 'demo-kt-j2'],
    '2026-06-03': ['demo-kt-m1', 'demo-kt-j1'],
  },
  _version:  KIDS_VERSION,
  _hydrated: false,
};
