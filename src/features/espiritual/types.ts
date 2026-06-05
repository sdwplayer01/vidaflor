// src/features/espiritual/types.ts
import type { ID, ISODate, ISODateTime } from '@/shared/types/common';

export interface GratidaoEntry {
  id:        ID;
  text:      string;
  createdAt: ISODateTime;
}

export interface Oracao {
  id:           ID;
  pessoa:       string;
  pedido:       string;
  respondida:   boolean;
  respondidaEm?: ISODate;
  createdAt:    ISODateTime;
}

export interface Leitura {
  id:         ID;
  livro:      string;
  capitulo:   number;
  versiculo?: string;
  data:       ISODate;
  createdAt:  ISODateTime;
}

export interface EspiritualState {
  /** Gratidões indexadas por dia (YYYY-MM-DD) para leitura rápida */
  gratidao:  Record<ISODate, GratidaoEntry[]>;
  oracoes:   Oracao[];
  leituras:  Leitura[];
  _version:  number;
  _hydrated: boolean;
}

export interface EspiritualActions {
  resetParaUsuarioReal: () => void;

  // Gratidão
  adicionarGratidao:   (day: ISODate, text: string) => void;
  removerGratidao:     (day: ISODate, id: ID) => void;

  // Orações
  adicionarOracao:     (pessoa: string, pedido: string) => void;
  marcarRespondida:    (id: ID) => void;
  desmarcarRespondida: (id: ID) => void;
  removerOracao:       (id: ID) => void;

  // Leituras
  adicionarLeitura:    (livro: string, capitulo: number, versiculo?: string) => void;
  removerLeitura:      (id: ID) => void;
}
