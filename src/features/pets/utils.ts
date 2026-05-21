// src/features/pets/utils.ts
import type { ISODate, ID } from '@/shared/types/common';
import type { Pet, PetsState } from './types';

export function calcPetPct(pet: Pet, done: Record<ISODate, Record<ID, number>>, day: ISODate): number {
  if (pet.cuidados.length === 0) return 0;
  const doneDay = done[day] ?? {};
  const total = pet.cuidados.reduce((sum, c) => sum + c.frequenciaDia, 0);
  const feitos = pet.cuidados.reduce((sum, c) => sum + Math.min(c.frequenciaDia, doneDay[c.id] ?? 0), 0);
  return total === 0 ? 0 : Math.round((feitos / total) * 100);
}

export function calcPetsPct(state: PetsState, day: ISODate): number {
  if (state.pets.length === 0) return 0;
  const soma = state.pets.reduce((sum, p) => sum + calcPetPct(p, state.done, day), 0);
  return Math.round(soma / state.pets.length);
}
