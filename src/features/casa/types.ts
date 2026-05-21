// src/features/casa/types.ts
import type { ID, ISODate } from '@/shared/types/common';

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

export type Recorrencia =
  | { tipo: 'diaria' }
  | { tipo: 'semanal'; diasSemana: number[] }
  | { tipo: 'mensal'; diaMes: number }
  | { tipo: 'avulsa' };

export interface TarefaCasa {
  id:             ID;
  task:           string;
  ambiente:       Ambiente;
  recorrencia:    Recorrencia;
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
