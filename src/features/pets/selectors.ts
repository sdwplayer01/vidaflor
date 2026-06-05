// src/features/pets/selectors.ts
import { useShallow } from 'zustand/react/shallow';
import { useMemo } from 'react';
import { usePetsStore } from './store';
import { today } from '@/shared/utils/date';
import type { Pet, CuidadoPet } from './types';

const EMPTY_DONE_DAY = Object.freeze({}) as Record<string, number>;

export function usePetAtivo(): Pet | undefined {
  return usePetsStore(
    useShallow((s) => s.pets.find((p) => p.id === s.activePetId))
  );
}

export function useCuidadosPendentesHoje(): { pet: Pet; cuidado: CuidadoPet; faltam: number }[] {
  const pets = usePetsStore((s) => s.pets);
  const done = usePetsStore((s) => s.done);
  return useMemo(() => {
    const day     = today();
    const doneDay = done[day] ?? EMPTY_DONE_DAY;
    const result: { pet: Pet; cuidado: CuidadoPet; faltam: number }[] = [];
    pets.forEach((pet) => {
      pet.cuidados.forEach((c) => {
        const feito  = doneDay[c.id] ?? 0;
        const faltam = c.frequenciaDia - feito;
        if (faltam > 0) result.push({ pet, cuidado: c, faltam });
      });
    });
    return result;
  }, [pets, done]);
}
