// src/features/financas/seed.ts
import type { FinancasState } from './types';
import { FINANCAS_VERSION } from './migrations';

export const seedFinancas: FinancasState = {
  transactions: [],
  cards:        [],
  budget:       {},
  _version:     FINANCAS_VERSION,
  _hydrated:    false,
};
