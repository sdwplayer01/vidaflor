// src/features/espiritual/selectors.ts
// Hooks de leitura — componentes NUNCA calculam, so consomem selectors.
import { useShallow } from 'zustand/react/shallow';
import { today } from '@/shared/utils/date';
import { useEspiritualStore } from './store';
import type { GratidaoEntry, Oracao, Leitura } from './types';

const EMPTY_GRATIDAO = Object.freeze([]) as unknown as GratidaoEntry[];

// Gratidoes do dia atual
export function useGratidoesDoDia(): GratidaoEntry[] {
  return useEspiritualStore(
    useShallow((s) => s.gratidao[today()] ?? EMPTY_GRATIDAO)
  );
}

// Contagem de gratidoes do dia atual — primitivo, sem useShallow necessario
export function useGratidoesDoDiaCount(): number {
  return useEspiritualStore((s) => (s.gratidao[today()] ?? []).length);
}

// Oracoes ainda pendentes (nao respondidas)
export function useOracoesPendentes(): Oracao[] {
  return useEspiritualStore(
    useShallow((s) => s.oracoes.filter((o) => !o.respondida))
  );
}

// Oracoes ja respondidas
export function useOracoesRespondidas(): Oracao[] {
  return useEspiritualStore(
    useShallow((s) => s.oracoes.filter((o) => o.respondida))
  );
}

// Historico de leituras, mais recentes primeiro
export function useLeiturasRecentes(limit = 50): Leitura[] {
  return useEspiritualStore(
    useShallow((s) => s.leituras.slice(0, limit))
  );
}
