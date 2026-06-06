// src/features/kids/types.ts
import type { ID, ISODate, HexColor, Emoji } from '@/shared/types/common';

export interface CriancaTarefa {
  id:    ID;
  task:  string;
  emoji: Emoji;
  time?: string;
}

export interface Crianca {
  id:        ID;
  name:      string;
  avatar:    Emoji;
  age:       number;
  color:     HexColor;
  tasks:     CriancaTarefa[];
  createdAt: ISODate;
}

export interface KidsState {
  criancas:    Crianca[];
  activeKidId: ID | null;
  done:        Record<ISODate, ID[]>;
  _version:    number;
  _hydrated:   boolean;
}

export interface KidsActions {
  adicionarCrianca:   (crianca: Omit<Crianca, 'id' | 'tasks' | 'createdAt'>) => void;
  editarCrianca:      (id: ID, dados: Partial<Pick<Crianca, 'name' | 'avatar' | 'age' | 'color'>>) => void;
  removerCrianca:     (id: ID) => void;
  trocarCriancaAtiva: (id: ID) => void;
  adicionarTarefaKid: (kidId: ID, task: string, emoji: Emoji, time?: string) => void;
  removerTarefaKid:   (kidId: ID, taskId: ID) => void;
  toggleTarefaKid:    (day: ISODate, taskId: ID) => void;
}
