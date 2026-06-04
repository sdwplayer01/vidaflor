// src/features/rotina/seed.ts
import type { RotinaState } from './types';
import { ROTINA_VERSION } from './migrations';

export const seedRotina: RotinaState = {
  tarefas: {
    manha: [
      { id: 'demo-rm1', task: 'Oração e leitura bíblica', time: '06:30', turno: 'manha', createdAt: '2026-01-01' },
      { id: 'demo-rm2', task: 'Exercício físico',         time: '07:00', turno: 'manha', createdAt: '2026-01-01' },
      { id: 'demo-rm3', task: 'Café da manhã em família', time: '07:45', turno: 'manha', createdAt: '2026-01-01' },
      { id: 'demo-rm4', task: 'Tomar medicamentos',       time: '08:00', turno: 'manha', createdAt: '2026-01-01' },
      { id: 'demo-rm5', task: 'Revisar agenda do dia',    time: '08:30', turno: 'manha', createdAt: '2026-01-01' },
    ],
    tarde: [
      { id: 'demo-rt1', task: 'Almoço',                     time: '12:00', turno: 'tarde', createdAt: '2026-01-01' },
      { id: 'demo-rt2', task: 'Descanso (20 min)',           time: '13:00', turno: 'tarde', createdAt: '2026-01-01' },
      { id: 'demo-rt3', task: 'Ajudar com lição de casa',   time: '17:00', turno: 'tarde', createdAt: '2026-01-01' },
    ],
    noite: [
      { id: 'demo-rn1', task: 'Jantar em família',    time: '19:00', turno: 'noite', createdAt: '2026-01-01' },
      { id: 'demo-rn2', task: 'Tempo de qualidade',   time: '20:00', turno: 'noite', createdAt: '2026-01-01' },
      { id: 'demo-rn3', task: 'Leitura pessoal',      time: '21:00', turno: 'noite', createdAt: '2026-01-01' },
      { id: 'demo-rn4', task: 'Gratidão do dia',      time: '21:45', turno: 'noite', createdAt: '2026-01-01' },
    ],
  },
  essential: [
    { id: 'demo-ess1', task: 'Beber 2L de água' },
    { id: 'demo-ess2', task: 'Fazer exercício' },
    { id: 'demo-ess3', task: 'Ler pelo menos 10 minutos' },
  ],
  done: {
    '2026-06-01': ['demo-rm1', 'demo-rm2', 'demo-rm3', 'demo-rm4', 'demo-rt1', 'demo-rn1', 'demo-rn2'],
    '2026-06-02': ['demo-rm1', 'demo-rm2', 'demo-rm3', 'demo-rm4', 'demo-rm5', 'demo-rt1', 'demo-rt2', 'demo-rn1'],
    '2026-06-03': ['demo-rm1', 'demo-rm3', 'demo-rm4'],
  },
  essMode:   false,
  _version:  ROTINA_VERSION,
  _hydrated: false,
};
