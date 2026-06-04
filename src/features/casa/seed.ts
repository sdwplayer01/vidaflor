// src/features/casa/seed.ts
import type { CasaState } from './types';
import { CASA_VERSION } from './migrations';

export const seedCasa: CasaState = {
  tarefas: [
    {
      id:            'demo-cs1',
      task:          'Lavar louça',
      ambiente:      'cozinha',
      recorrencia:   { tipo: 'diaria' },
      estimativaMin: 20,
      active:        true,
      createdAt:     '2026-01-01',
    },
    {
      id:            'demo-cs2',
      task:          'Arrumar camas',
      ambiente:      'quarto_casal',
      recorrencia:   { tipo: 'diaria' },
      estimativaMin: 10,
      active:        true,
      createdAt:     '2026-01-01',
    },
    {
      id:            'demo-cs3',
      task:          'Aspirar a sala',
      ambiente:      'sala',
      recorrencia:   { tipo: 'semanal', diasSemana: [1, 4] },
      estimativaMin: 30,
      active:        true,
      createdAt:     '2026-01-01',
    },
    {
      id:            'demo-cs4',
      task:          'Limpar banheiro',
      ambiente:      'banheiro',
      recorrencia:   { tipo: 'semanal', diasSemana: [3, 6] },
      estimativaMin: 25,
      active:        true,
      createdAt:     '2026-01-01',
    },
    {
      id:            'demo-cs5',
      task:          'Lavar roupa',
      ambiente:      'lavanderia',
      recorrencia:   { tipo: 'semanal', diasSemana: [2, 5] },
      estimativaMin: 15,
      active:        true,
      createdAt:     '2026-01-01',
    },
    {
      id:            'demo-cs6',
      task:          'Limpar fogão',
      ambiente:      'cozinha',
      recorrencia:   { tipo: 'mensal', diaMes: 1 },
      estimativaMin: 20,
      active:        true,
      createdAt:     '2026-01-01',
    },
  ],
  done: {
    '2026-06-02': ['demo-cs1', 'demo-cs2', 'demo-cs5'],
    '2026-06-03': ['demo-cs1', 'demo-cs2'],
  },
  _version:  CASA_VERSION,
  _hydrated: false,
};
