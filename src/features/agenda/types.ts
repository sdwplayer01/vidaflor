// src/features/agenda/types.ts
import type { ID, ISODate } from '@/shared/types/common';
import type { RecorrenciaTarefa } from '@/shared/types/recorrencia';

export type Turno = 'manha' | 'tarde' | 'noite';

// "voce" = usuária principal; IDs de criança/adulto para delegação (Fase 5)
export type MemberId = 'voce' | string;

export interface TarefaAvulsa {
  id:           ID;
  title:        string;
  date:         ISODate;           // data principal (ou início da recorrência)
  time?:        string;            // HH:MM
  turno:        Turno;
  assignee:     MemberId;
  done:         boolean;           // legado — não usar para recorrentes
  recorrencia?: RecorrenciaTarefa; // se presente → recorrente
  createdAt:    ISODate;
}

// done per date (para tarefas recorrentes)
export type AgendaDone = Record<ISODate, ID[]>;

export interface Captura {
  id:   ID;
  text: string;
}

export interface AgendaState {
  tarefas:  TarefaAvulsa[];
  done:     AgendaDone;
  captura:  Captura[];
  _version: number;
  _hydrated: boolean;
}

export interface AgendaActions {
  adicionarTarefa:  (t: Omit<TarefaAvulsa, 'id' | 'done' | 'createdAt'>) => void;
  atualizarTarefa:  (id: ID, patch: Partial<Omit<TarefaAvulsa, 'id' | 'createdAt'>>) => void;
  removerTarefa:    (id: ID) => void;
  toggleTarefa:     (date: ISODate, id: ID) => void;
  adicionarCaptura: (text: string) => void;
  removerCaptura:   (id: ID) => void;
}

// ── Tipo normalizado retornado por useDia ─────────────────────────────────────
export type DiaSource = 'rotina' | 'casa' | 'crianca' | 'pet' | 'compromisso' | 'tarefa';

export interface DiaItem {
  id:        string;   // fonte:id para evitar colisões
  nativeId:  ID;       // id original na store de origem
  source:    DiaSource;
  turno:     Turno;
  title:     string;
  time?:     string;
  tag?:      string;   // contexto: ambiente, criança, pet, categoria
  assignee?: MemberId;
  done:      boolean;
}
