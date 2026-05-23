// src/features/pets/selectors.ts
import { useShallow } from 'zustand/react/shallow';
import { usePetsStore } from './store';
import { today } from '@/shared/utils/date';
import type { Pet, CuidadoPet } from './types';

export function usePetAtivo(): Pet | undefined {
  return usePetsStore((s) => s.pets.find((p) => p.id === s.activePetId));
}

export function useCuidadosPendentesHoje(): { pet: Pet; cuidado: CuidadoPet; faltam: number }[] {
  return usePetsStore(
    useShallow((s) => {
      const day     = today();
      const doneDay = s.done[day] ?? {};
      const result: { pet: Pet; cuidado: CuidadoPet; faltam: number }[] = [];

      s.pets.forEach((pet) => {
        pet.cuidados.forEach((c) => {
          const feito  = doneDay[c.id] ?? 0;
          const faltam = c.frequenciaDia - feito;
          if (faltam > 0) result.push({ pet, cuidado: c, faltam });
        });
      });

      return result;
    })
  );
}
