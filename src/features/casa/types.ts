// src/features/casa/types.ts
import type { ID, ISODate } from '@/shared/types/common';
export type { RecorrenciaTarefa } from '@/shared/types/recorrencia';

// Re-exporta como Recorrencia para não quebrar código existente de casa
export type { RecorrenciaTarefa as Recorrencia } from '@/shared/types/recorrencia';

export type Ambiente =
  | 'cozinha'
  | 'sala'
  | 'banheiro'
  | 'quarto_casal'
  | 'quarto_kids'
  | 'lavanderia'
  | 'area_externa'
  | 'escritorio'
  | 'geral';

export interface TarefaCasa {
  id:             ID;
  task:           string;
  ambiente:       Ambiente;
  recorrencia:    import('@/shared/types/recorrencia').RecorrenciaTarefa;
  estimativaMin?: number;
  createdAt:      ISODate;
  active:         boolean;
}

export interface CasaState {
  tarefas:   TarefaCasa[];
  done:      Record<ISODate, ID[]>;
  _version:  number;
  _hydrated: boolean;
}

export interface CasaActions {
  adicionarTarefaCasa: (tarefa: Omit<TarefaCasa, 'id' | 'createdAt' | 'active'>) => void;
  removerTarefaCasa:   (id: ID) => void;
  toggleTarefaCasa:    (day: ISODate, id: ID) => void;
  desativarTarefaCasa: (id: ID) => void;
}
