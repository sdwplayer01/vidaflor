// src/features/organiza/types.ts
import type { ID, ISODate, HexColor } from "@/shared/types/common";
import type { Money } from "@/features/financas/types";

// ── Seções do mercado ─────────────────────────────────────────────────────────
export const SECOES_MERCADO = [
  "Hortifrúti",
  "Açougue",
  "Mercearia",
  "Laticínios",
  "Limpeza",
  "Higiene",
  "Padaria",
  "Bebidas",
  "Outros",
] as const;

export type SecaoMercado = typeof SECOES_MERCADO[number];

export const SUGESTOES_POR_SECAO: Record<string, readonly string[]> = {
  "Hortifrúti":  ["Banana", "Batata", "Cebola", "Tomate", "Maçã", "Alface", "Cenoura", "Laranja", "Abacate", "Limão"],
  "Açougue":     ["Carne Moída", "Frango", "Costela", "Coxão Mole", "Linguiça", "Contrafilé", "Coxinha da Asa", "Salsicha"],
  "Mercearia":   ["Arroz", "Feijão", "Macarrão", "Óleo de Soja", "Açúcar", "Café", "Farinha de Trigo", "Molho de Tomate", "Sal", "Leite em Pó"],
  "Laticínios":  ["Leite", "Queijo", "Iogurte", "Manteiga", "Requeijão", "Nata", "Ovos"],
  "Limpeza":     ["Detergente", "Sabão em Pó", "Desinfetante", "Água Sanitária", "Esponja", "Amaciante", "Limpador Multiuso"],
  "Higiene":     ["Shampoo", "Condicionador", "Sabonete", "Pasta de Dente", "Desodorante", "Papel Higiênico", "Absorvente"],
  "Padaria":     ["Pão Francês", "Pão de Forma", "Bolo", "Rosca", "Biscoito"],
  "Bebidas":     ["Água", "Suco", "Refrigerante", "Cerveja", "Vinho", "Café Solúvel", "Chá"],
  "Outros":      [],
};

// --- SHOPPING ---
export interface ShoppingItem {
  id:        ID;
  name:      string;
  category:  string;        // seção do mercado
  quantity?: number;
  price?:    Money;         // centavos; ausente = 0
  done:      boolean;
  createdAt: ISODate;
}

export interface ShoppingSlice {
  items: ShoppingItem[];
}

// --- NOTES ---
export interface Note {
  id:        ID;
  title:     string;
  content:   string;
  color:     HexColor;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface NotesSlice {
  list: Note[];
}

// --- REMINDERS ---
export type ReminderPriority = "baixa" | "media" | "alta";

export interface Reminder {
  id:        ID;
  title:     string;
  date:      ISODate;
  time?:     string;
  category:  string;
  priority:  ReminderPriority;
  done:      boolean;
  notes?:    string;
  createdAt: ISODate;
}

export interface RemindersSlice {
  list: Reminder[];
}

// --- STATE ---
export interface OrganizaState {
  shopping:  ShoppingSlice;
  notes:     NotesSlice;
  reminders: RemindersSlice;
  _version:  number;
  _hydrated: boolean;
}

export interface OrganizaActions {
  // Shopping
  adicionarItemCompra:   (item: Omit<ShoppingItem, "id" | "done" | "createdAt">) => void;
  atualizarItemCompra:   (id: ID, patch: Partial<Omit<ShoppingItem, "id" | "createdAt">>) => void;
  marcarItemComprado:    (id: ID) => void;
  desmarcarItemComprado: (id: ID) => void;
  removerItemCompra:     (id: ID) => void;
  limparComprados:       () => void;

  // Notes
  adicionarNota:         (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  atualizarNota:         (id: ID, patch: Partial<Pick<Note, "title" | "content" | "color">>) => void;
  removerNota:           (id: ID) => void;

  // Reminders
  adicionarLembrete:     (reminder: Omit<Reminder, "id" | "done" | "createdAt">) => void;
  atualizarLembrete:     (id: ID, patch: Partial<Reminder>) => void;
  marcarLembreteFeito:   (id: ID) => void;
  removerLembrete:       (id: ID) => void;
}
