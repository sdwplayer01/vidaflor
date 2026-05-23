// src/shared/constants/themes.ts
import type { Theme, ThemeKey } from "../types/theme";

/**
 * Mapa oficial dos 5 temas do VidaFlor.
 * Centraliza todas as cores HEX do app para facilitar personalizações e evitar valores dispersos.
 */
export const THEMES: Record<ThemeKey, Theme> = {
  pastel: {
    key: "pastel", name: "Rosa Pastel", e: "🌸",
    bg:   "#FFF0F4", surf: "#FFFFFF", alt:  "#FFE4EE", bd:   "#F9D0DB",
    p:    "#E8799A", pl:   "#F9B8CC", pd:   "#C4567A",
    gh:   "linear-gradient(135deg, #E8799A, #F4B8CC)",
    tx:   "#3D2030", tm:   "#9C7A83",
    ok:   "#66BB6A", wn:   "#FFA726", er:   "#EF5350",
  },
  terra: {
    key: "terra", name: "Terra & Mel", e: "🌿",
    bg:   "#FAF5EE", surf: "#FFFFFF", alt:  "#F2E6D8", bd:   "#E0CCB4",
    p:    "#8B6248", pl:   "#C4967A", pd:   "#5D3D2C",
    gh:   "linear-gradient(135deg, #8B6248, #C4967A)",
    tx:   "#2C1A0E", tm:   "#8C6E57",
    ok:   "#7CAA72", wn:   "#E6A817", er:   "#C0614E",
  },
  lilac: {
    key: "lilac", name: "Lilás & Lavanda", e: "💜",
    bg:   "#F7F3FF", surf: "#FFFFFF", alt:  "#EDE4FF", bd:   "#DDD0F5",
    p:    "#8B5CF6", pl:   "#C4B5FD", pd:   "#6D28D9",
    gh:   "linear-gradient(135deg, #8B5CF6, #C4B5FD)",
    tx:   "#1E1030", tm:   "#7C6FA0",
    ok:   "#66BB6A", wn:   "#FFA726", er:   "#EF5350",
  },
  neutro: {
    key: "neutro", name: "Neutro Elegante", e: "🤍",
    bg:   "#F5F5F3", surf: "#FFFFFF", alt:  "#EEEEEC", bd:   "#D4D4D4",
    p:    "#262626", pl:   "#737373", pd:   "#0A0A0A",
    gh:   "linear-gradient(135deg, #262626, #737373)",
    tx:   "#0A0A0A", tm:   "#737373",
    ok:   "#22C55E", wn:   "#F59E0B", er:   "#EF4444",
  },
  sage: {
    key: "sage", name: "Sage & Céu", e: "🩵",
    bg:   "#F0F7F4", surf: "#FFFFFF", alt:  "#DAF0E8", bd:   "#B2DDD1",
    p:    "#059669", pl:   "#6EE7B7", pd:   "#047857",
    gh:   "linear-gradient(135deg, #059669, #6EE7B7)",
    tx:   "#0D2E25", tm:   "#5E9E8A",
    ok:   "#059669", wn:   "#D97706", er:   "#DC2626",
  },
};

/**
 * Resolve um ThemeKey para o objeto Theme completo.
 * Fallback para "pastel" se a key for inválida.
 */
export function resolveTheme(key: ThemeKey | string): Theme {
  return THEMES[key as ThemeKey] ?? THEMES.pastel;
}

/**
 * Retorna a lista de temas disponíveis.
 */
export function getAvailableThemes(): Theme[] {
  return Object.values(THEMES);
}

/**
 * Aplica um tema ao documento via CSS cascade.
 * Seta apenas o atributo `data-theme` no `<html>`.
 * As CSS Variables são definidas em `tokens.css` pelos seletores [data-theme="..."],
 * eliminando a dupla fonte de verdade.
 */
export function applyTheme(T: Theme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Seta o atributo data-theme para ativar o seletor CSS correspondente
  // O CSS cascade de tokens.css aplicará as variáveis automaticamente
  root.setAttribute("data-theme", T.key);
}
