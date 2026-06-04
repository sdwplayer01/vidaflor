// src/features/espiritual/seed.ts
import type { EspiritualState } from './types';
import { ESPIRITUAL_VERSION } from './migrations';

export const seedEspiritual: EspiritualState = {
  gratidao: {
    '2026-05-30': [
      { id: 'demo-g01', text: 'Família saudável e unida.',        createdAt: '2026-05-30T21:00:00' },
      { id: 'demo-g02', text: 'Trabalho que me sustenta.',         createdAt: '2026-05-30T21:01:00' },
    ],
    '2026-05-31': [
      { id: 'demo-g03', text: 'Um dia tranquilo com as crianças.', createdAt: '2026-05-31T21:00:00' },
      { id: 'demo-g04', text: 'A chuva que refrescou a tarde.',    createdAt: '2026-05-31T21:02:00' },
    ],
    '2026-06-01': [
      { id: 'demo-g05', text: 'Exame médico com resultado ótimo.', createdAt: '2026-06-01T21:00:00' },
    ],
    '2026-06-02': [
      { id: 'demo-g06', text: 'Amizades que edificam.',              createdAt: '2026-06-02T21:00:00' },
      { id: 'demo-g07', text: 'Consegui cumprir minha meta de passos!', createdAt: '2026-06-02T21:05:00' },
    ],
    '2026-06-03': [
      { id: 'demo-g08', text: 'Mais um dia com saúde.',             createdAt: '2026-06-03T21:00:00' },
    ],
  },
  oracoes: [
    {
      id:          'demo-or1',
      pessoa:      'Minha mãe',
      pedido:      'Recuperação da cirurgia com saúde e paz.',
      respondida:  true,
      respondidaEm:'2026-05-28',
      createdAt:   '2026-05-01T10:00:00',
    },
    {
      id:         'demo-or2',
      pessoa:     'Carlos',
      pedido:     'Sabedoria nas decisões de trabalho.',
      respondida: false,
      createdAt:  '2026-05-15T07:30:00',
    },
    {
      id:         'demo-or3',
      pessoa:     'Nossa família',
      pedido:     'Unidade, paz e crescimento espiritual.',
      respondida: false,
      createdAt:  '2026-01-01T06:00:00',
    },
  ],
  leituras: [
    { id: 'demo-l1', livro: 'Salmos',    capitulo: 23,  versiculo: '1-6',  data: '2026-06-03', createdAt: '2026-06-03T06:30:00' },
    { id: 'demo-l2', livro: 'Provérbios',capitulo: 3,   versiculo: '5-6',  data: '2026-06-02', createdAt: '2026-06-02T06:30:00' },
    { id: 'demo-l3', livro: 'João',      capitulo: 15,  versiculo: '1-17', data: '2026-06-01', createdAt: '2026-06-01T06:30:00' },
    { id: 'demo-l4', livro: 'Filipenses',capitulo: 4,   versiculo: '4-7',  data: '2026-05-31', createdAt: '2026-05-31T06:30:00' },
    { id: 'demo-l5', livro: 'Romanos',   capitulo: 8,   versiculo: '28',   data: '2026-05-30', createdAt: '2026-05-30T06:30:00' },
    { id: 'demo-l6', livro: 'Isaías',    capitulo: 40,  versiculo: '31',   data: '2026-05-29', createdAt: '2026-05-29T06:30:00' },
  ],
  _version:  ESPIRITUAL_VERSION,
  _hydrated: false,
};
