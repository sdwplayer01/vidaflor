// src/shared/constants/messages.ts

export const HEADERS = {
  financas: {
    eyebrow:  'finanças',
    title:    'Suas finanças',
    saldoPos: 'sobra do mês · ',
    saldoNeg: 'no vermelho · ',
    vazioMes: 'Nenhum lançamento ainda — toque em + para registrar',
    register: 'operacional',
  },
  organiza: {
    eyebrow:  'organiza',
    title:    'Suas listas',
    hint:     'tudo o que não pode esquecer',
    register: 'operacional',
  },
  home:     { register: 'contemplativo' },
  espirito: { register: 'contemplativo' },
} as const;

export const MESSAGES = {
  confirmDeleteTitle: "Excluir Item?",
  confirmDeleteDesc: "Tem certeza de que deseja excluir este item? Esta ação não pode ser desfeita.",
  confirmDeleteBtn: "Excluir",
  cancelBtn: "Cancelar",
  saveBtn: "Salvar",
  addBtn: "Adicionar",
  loading: "Carregando...",
  emptyStateTitle: "Nada por aqui ainda",
  emptyStateDesc: "Adicione seu primeiro registro usando o botão abaixo!",
  errors: {
    generic: "Algo deu errado. Por favor, tente novamente.",
    required: "Este campo é obrigatório.",
    invalidAmount: "Valor inválido.",
  }
} as const;
