// src/features/kids/selectors.ts
import { useShallow } from 'zustand/react/shallow';
import { useKidsStore } from './store';
import { calcProgressoCrianca } from './utils';
import { today } from '@/shared/utils/date';
import type { Crianca } from './types';
import type { ID, ISODate } from '@/shared/types/common';

export function useCriancaAtiva(): Crianca | undefined {
  return useKidsStore(
    useShallow((s) => s.criancas.find((k) => k.id === s.activeKidId))
  );
}

export function useProgressoCrianca(
  kidId: ID,
  day?: ISODate
): { feitas: number; total: number; pct: number } {
  return useKidsStore(
    useShallow((s) => {
      const k = s.criancas.find((c) => c.id === kidId);
      if (!k) return { feitas: 0, total: 0, pct: 0 };
      return calcProgressoCrianca(k, s.done, day ?? today());
    })
  );
}

export function useKidsCompletosHoje(): Crianca[] {
  return useKidsStore(
    useShallow((s) => {
      const day = today();
      return s.criancas.filter((k) => {
        if (k.tasks.length === 0) return false;
        const done = s.done[day] ?? [];
        return k.tasks.every((t) => done.includes(t.id));
      });
    })
  );
}
