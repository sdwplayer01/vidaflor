// src/features/espiritual/selectors.ts
// Hooks de leitura — componentes NUNCA calculam, só consomem selectors.
import { today } from '@/shared/utils/date';
import { useEspiritualStore } from './store';
import type { GratidaoEntry, Oracao, Leitura } from './types';

/** Gratidões do dia atual */
export function useGratidoesDoDia(): GratidaoEntry[] {
  return useEspiritualStore((s) => s.gratidao[today()] ?? []);
}

/** Contagem de gratidões do dia atual */
export function useGratidoesDoDiaCount(): number {
  return useEspiritualStore((s) => (s.gratidao[today()] ?? []).length);
}

/** Orações ainda pendentes (não respondidas) */
export function useOracoesPendentes(): Oracao[] {
  return useEspiritualStore((s) => s.oracoes.filter((o) => !o.respondida));
}

/** Orações já respondidas */
export function useOracoesRespondidas(): Oracao[] {
  return useEspiritualStore((s) => s.oracoes.filter((o) => o.respondida));
}

/** Histórico de leituras, mais recentes primeiro */
export function useLeiturasRecentes(limit = 50): Leitura[] {
  return useEspiritualStore((s) => s.leituras.slice(0, limit));
}
