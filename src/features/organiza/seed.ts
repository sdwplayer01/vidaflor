// src/features/organiza/seed.ts
import type { OrganizaState } from "./types";
import { ORGANIZA_VERSION } from "./migrations";

export const seedOrganiza: OrganizaState = {
  shopping: {
    items: [
      { id: 'demo-si1', name: 'Frango',           category: 'Açougue',      quantity: 1, price: 2490,  done: false, createdAt: '2026-06-02' },
      { id: 'demo-si2', name: 'Tomate',           category: 'Hortifrúti',   quantity: 6, price: 120,   done: false, createdAt: '2026-06-02' },
      { id: 'demo-si3', name: 'Arroz 5kg',        category: 'Mercearia',    quantity: 1, price: 2890,  done: true,  createdAt: '2026-06-02' },
      { id: 'demo-si4', name: 'Feijão 1kg',       category: 'Mercearia',    quantity: 2, price: 990,   done: true,  createdAt: '2026-06-02' },
      { id: 'demo-si5', name: 'Leite integral',   category: 'Laticínios',   quantity: 4, price: 560,   done: false, createdAt: '2026-06-02' },
      { id: 'demo-si6', name: 'Detergente',       category: 'Limpeza',      quantity: 2, price: 290,   done: false, createdAt: '2026-06-02' },
      { id: 'demo-si7', name: 'Shampoo',          category: 'Higiene',      quantity: 1, price: 1890,  done: false, createdAt: '2026-06-02' },
      { id: 'demo-si8', name: 'Banana prata',     category: 'Hortifrúti',   quantity: 1, price: 890,   done: false, createdAt: '2026-06-03' },
    ],
  },
  notes: {
    list: [
      {
        id:        'demo-n1',
        title:     'Receita: Bolo de cenoura',
        content:   '3 cenouras, 3 ovos, 1 xícara de óleo, 2 xícaras de açúcar, 2 xícaras de farinha, 1 colher de fermento. Bater tudo no liquidificador exceto a farinha e o fermento. Assar 40 min a 180°C.',
        color:     '#FFF3C8',
        createdAt: '2026-05-20',
        updatedAt: '2026-05-20',
      },
      {
        id:        'demo-n2',
        title:     'Ideias para as férias',
        content:   '- Praia com as crianças\n- Visitar os avós\n- Parque aquático\n- Acampamento familiar',
        color:     '#C8E6FF',
        createdAt: '2026-05-25',
        updatedAt: '2026-06-01',
      },
      {
        id:        'demo-n3',
        title:     'Senhas importantes',
        content:   'Wi-fi: vidaflor2024\nNetflix: conta compartilhada família',
        color:     '#FFD6E0',
        createdAt: '2026-04-10',
        updatedAt: '2026-04-10',
      },
    ],
  },
  reminders: {
    list: [
      {
        id:        'demo-rem1',
        title:     'Consulta pediatra — Maria',
        date:      '2026-06-10',
        time:      '14:30',
        category:  'Saúde',
        priority:  'alta',
        done:      false,
        notes:     'Levar carteirinha de vacinação.',
        createdAt: '2026-05-30',
      },
      {
        id:        'demo-rem2',
        title:     'Pagar fatura Nubank',
        date:      '2026-06-10',
        time:      '10:00',
        category:  'Financeiro',
        priority:  'alta',
        done:      false,
        createdAt: '2026-06-01',
      },
      {
        id:        'demo-rem3',
        title:     'Reunião de pais na escola',
        date:      '2026-06-15',
        time:      '19:00',
        category:  'Escola',
        priority:  'media',
        done:      false,
        notes:     'Levar boletim do João.',
        createdAt: '2026-06-01',
      },
      {
        id:        'demo-rem4',
        title:     'Renovar habilitação',
        date:      '2026-07-01',
        category:  'Pessoal',
        priority:  'baixa',
        done:      false,
        createdAt: '2026-06-01',
      },
    ],
  },
  _version:  ORGANIZA_VERSION,
  _hydrated: false,
};
