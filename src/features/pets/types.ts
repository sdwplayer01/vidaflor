// src/features/pets/types.ts
import type { ID, ISODate, HexColor, Emoji } from '@/shared/types/common';

export type EspeciePet = 'cao' | 'gato' | 'ave' | 'outro';

export type TipoCuidado =
  | 'alimentacao'
  | 'agua'
  | 'passeio'
  | 'medicamento'
  | 'higiene'
  | 'vacina'
  | 'outros';

export interface CuidadoPet {
  id:            ID;
  tipo:          TipoCuidado;
  descricao:     string;
  horario?:      string;
  frequenciaDia: number;
}

export interface Pet {
  id:          ID;
  name:        string;
  avatar:      Emoji;
  especie:     EspeciePet;
  raca?:       string;
  nascimento?: ISODate;
  color:       HexColor;
  cuidados:    CuidadoPet[];
  createdAt:   ISODate;
}

export interface PetsState {
  pets:        Pet[];
  activePetId: ID | null;
  done:        Record<ISODate, Record<ID, number>>;
  _version:    number;
  _hydrated:   boolean;
}

export interface PetsActions {
  adicionarPet:     (pet: Omit<Pet, 'id' | 'cuidados' | 'createdAt'>) => void;
  removerPet:       (id: ID) => void;
  trocarPetAtivo:   (id: ID) => void;
  adicionarCuidado: (petId: ID, cuidado: Omit<CuidadoPet, 'id'>) => void;
  removerCuidado:   (petId: ID, cuidadoId: ID) => void;
  registrarFeito:   (day: ISODate, cuidadoId: ID) => void;
  desfazerFeito:    (day: ISODate, cuidadoId: ID) => void;
}
