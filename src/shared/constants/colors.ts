// src/shared/constants/colors.ts
// Paletas de cor não-temáticas (seletores de cor de cartão, notas, fonte do dia).
// Única fonte autorizada para hex literals além de themes.ts e tokens.css.

/** Cores disponíveis para cartões financeiros */
export const CARD_COLORS = [
  '#B8607A', '#79B8E8', '#79E8A0', '#D9B872', '#C879E8', '#E87979',
] as const;

/** Cores disponíveis para notas */
export const NOTE_COLORS = [
  '#FFFFFF', '#FFD6E0', '#C8F7DC', '#C8E6FF', '#FFF3C8', '#EDD9FF',
] as const;

/** Cores padrão para crianças */
export const KID_COLOR_DEFAULT = '#79B8E8';

/** Cor padrão do troféu/conquista */
export const TROPHY_COLOR = '#D4A853';

/** Cores dos indicadores de fonte no DiaScreen */
export const SOURCE_COLORS = {
  casa:  '#7CB9A8',   // sage-água
  kids:  '#F4A261',   // pêssego
  pet:   '#A8D8A8',   // verde-suave
} as const;

/** Cor de alerta médio (envelope 70-90%) — usa var(--vf-wn) no CSS, aqui como fallback JS */
export const COLOR_WARNING = '#D9B872';

/** Cor padrão para pets */
export const PET_COLOR_DEFAULT = '#79E8A0';


/** Cores das fases do ciclo menstrual */
export const CYCLE_PHASE_COLORS: Record<string, string> = {
  Menstrual:  '#E87979',
  Folicular:  '#79B8E8',
  Ovulatoria: '#79E8A0',
  Lutea:      '#E8C479',
};

/** Cor padrão para o perfil principal de saúde */
export const PROFILE_COLOR_DEFAULT = '#B8607A';
