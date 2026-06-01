// src/shared/types/household.ts
// Fase 5 — Multi-user família (mesma assinatura)
// Arquitetura: Supabase (padrão Walter). Build após validação das fases 1-4.
//
// Escopos de dado:
//   COMPARTILHADO (household_id): agenda, casa, kids, pets, compras, finanças
//   PESSOAL       (user_id):      saude/ciclo, espiritual/gratidão, humor

import type { ID, ISODate } from './common';

export type HouseholdRole = 'dona' | 'parceiro' | 'convidado';

export interface HouseholdMember {
  id:         ID;
  name:       string;
  email:      string;
  avatar?:    string;
  role:       HouseholdRole;
  joinedAt:   ISODate;
}

export interface Household {
  id:         ID;
  name:       string;            // ex: "Família Miranda"
  members:    HouseholdMember[];
  createdAt:  ISODate;
  ownerId:    ID;                // quem criou (dona)
}

// Âncora de dado: indica se o campo pertence ao household ou ao user
export type DataScope = 'household' | 'personal';

// Mapeamento de features para escopo
export const FEATURE_SCOPE: Record<string, DataScope> = {
  financas:   'household',
  organiza:   'household',
  agenda:     'household',
  casa:       'household',
  kids:       'household',
  pets:       'household',
  saude:      'personal',
  espiritual: 'personal',
  config:     'personal',
};
