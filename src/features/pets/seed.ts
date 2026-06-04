// src/features/pets/seed.ts
import type { PetsState } from './types';
import { PETS_VERSION } from './migrations';

export const seedPets: PetsState = {
  pets: [
    {
      id:         'demo-pet-rex',
      name:       'Rex',
      avatar:     '🐕',
      especie:    'cao',
      raca:       'Labrador',
      nascimento: '2023-03-15',
      color:      '#79E8A0',
      createdAt:  '2023-04-01',
      cuidados: [
        { id: 'demo-pc1', tipo: 'alimentacao', descricao: 'Ração premium', horario: '07:00', frequenciaDia: 1 },
        { id: 'demo-pc2', tipo: 'alimentacao', descricao: 'Ração premium', horario: '18:00', frequenciaDia: 1 },
        { id: 'demo-pc3', tipo: 'agua',        descricao: 'Trocar água',   horario: '08:00', frequenciaDia: 1 },
        { id: 'demo-pc4', tipo: 'passeio',     descricao: 'Caminhada',     horario: '07:30', frequenciaDia: 1 },
      ],
    },
  ],
  activePetId: 'demo-pet-rex',
  done: {
    '2026-06-02': {
      'demo-pc1': 1,
      'demo-pc2': 1,
      'demo-pc3': 1,
      'demo-pc4': 1,
    },
    '2026-06-03': {
      'demo-pc1': 1,
      'demo-pc3': 1,
    },
  },
  _version:  PETS_VERSION,
  _hydrated: false,
};
