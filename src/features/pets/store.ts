// src/features/pets/store.ts
import { create } from 'zustand';
import { persistVidaFlor } from '@/shared/storage/persist-middleware';
import { STORAGE_KEYS } from '@/shared/storage/keys';
import { genId } from '@/shared/utils/id';
import { today } from '@/shared/utils/date';
import { seedPets } from './seed';
import { migrate, PETS_VERSION } from './migrations';
import type { PetsState, PetsActions, Pet, CuidadoPet } from './types';
import type { ID, ISODate } from '@/shared/types/common';

type Store = PetsState & PetsActions;

export const usePetsStore = create<Store>()(
  persistVidaFlor(
    (set) => ({
      ...seedPets,

      adicionarPet: (pet) => {
        const novo: Pet = { ...pet, id: genId('pet'), cuidados: [], createdAt: today() };
        set((s) => ({
          pets:        [...s.pets, novo],
          activePetId: s.activePetId ?? novo.id,
        }));
      },

      editarPet: (id: ID, dados) =>
        set((s) => ({
          pets: s.pets.map((p) => (p.id === id ? { ...p, ...dados } : p)),
        })),

      removerPet: (id: ID) =>
        set((s) => {
          const filtered = s.pets.filter((p) => p.id !== id);
          return {
            pets:        filtered,
            activePetId: s.activePetId === id ? (filtered[0]?.id ?? null) : s.activePetId,
          };
        }),

      trocarPetAtivo: (id: ID) => set({ activePetId: id }),

      adicionarCuidado: (petId: ID, cuidado: Omit<CuidadoPet, 'id'>) =>
        set((s) => ({
          pets: s.pets.map((p) =>
            p.id === petId
              ? { ...p, cuidados: [...p.cuidados, { ...cuidado, id: genId('cui') }] }
              : p
          ),
        })),

      removerCuidado: (petId: ID, cuidadoId: ID) =>
        set((s) => ({
          pets: s.pets.map((p) =>
            p.id === petId
              ? { ...p, cuidados: p.cuidados.filter((c) => c.id !== cuidadoId) }
              : p
          ),
        })),

      registrarFeito: (day: ISODate, cuidadoId: ID) =>
        set((s) => {
          const doneDay = s.done[day] ?? {};
          return {
            done: {
              ...s.done,
              [day]: { ...doneDay, [cuidadoId]: (doneDay[cuidadoId] ?? 0) + 1 },
            },
          };
        }),

      desfazerFeito: (day: ISODate, cuidadoId: ID) =>
        set((s) => {
          const doneDay = s.done[day] ?? {};
          const val     = Math.max(0, (doneDay[cuidadoId] ?? 0) - 1);
          return {
            done: { ...s.done, [day]: { ...doneDay, [cuidadoId]: val } },
          };
        }),
    }),
    {
      name:    STORAGE_KEYS.pets,
      version: PETS_VERSION,
      migrate,
    }
  )
);
