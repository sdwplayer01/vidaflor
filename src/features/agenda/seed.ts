// src/features/agenda/seed.ts
import type { AgendaState } from './types';

export const seedAgenda: AgendaState = {
  tarefas:   [],
  done:      {},
  captura:   [],
  _version:  0,
  _hydrated: false,
};
