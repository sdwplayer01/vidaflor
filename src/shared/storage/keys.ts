// src/shared/storage/keys.ts
// Fonte única de verdade para chaves de storage do VidaFlor.
// PROIBIDO referenciar essas strings diretamente fora deste arquivo.

export const STORAGE_NAMESPACE = 'vidaflor';

export const STORAGE_KEYS = {
  config:      `${STORAGE_NAMESPACE}:config`,
  nav:         `${STORAGE_NAMESPACE}:nav`,
  rotina:      `${STORAGE_NAMESPACE}:rotina`,
  kids:        `${STORAGE_NAMESPACE}:kids`,
  casa:        `${STORAGE_NAMESPACE}:casa`,
  pets:        `${STORAGE_NAMESPACE}:pets`,
  saude:       `${STORAGE_NAMESPACE}:saude`,
  financas:    `${STORAGE_NAMESPACE}:financas`,
  espiritual:  `${STORAGE_NAMESPACE}:espiritual`,
  organiza:    `${STORAGE_NAMESPACE}:organiza`,
  integrations:`${STORAGE_NAMESPACE}:integrations`,
  agenda:      `${STORAGE_NAMESPACE}:agenda`,
  auth:        `${STORAGE_NAMESPACE}:auth`,
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
