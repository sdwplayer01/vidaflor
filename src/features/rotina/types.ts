// src/features/rotina/types.ts
import type { ID, ISODate } from '@/shared/types/common';

export type Turno = 'manha' | 'tarde' | 'noite';

export interface Tarefa {
  id:        ID;
  task:      string;
  time?:     string;
  turno:     Turno;
  createdAt: ISODate;
}

export interface TarefaEssencial {
  id:   ID;
  task: string;
}

export interface RotinaState {
  tarefas:   Record<Turno, Tarefa[]>;
  essential: TarefaEssencial[];
  done:      Record<ISODate, ID[]>;
  essMode:   boolean;
  _version:  number;
  _hydrated: boolean;
}

export interface RotinaActions {
  adicionarTarefa:    (turno: Turno, task: string, time?: string) => void;
  removerTarefa:      (turno: Turno, id: ID) => void;
  marcarTarefa:       (day: ISODate, id: ID) => void;
  desmarcarTarefa:    (day: ISODate, id: ID) => void;
  toggleTarefa:       (day: ISODate, id: ID) => void;
  adicionarEssencial: (task: string) => void;
  removerEssencial:   (id: ID) => void;
  alternarEssMode:    () => void;
}
