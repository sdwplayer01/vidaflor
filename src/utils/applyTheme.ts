// src/utils/applyTheme.ts
// Aplica o tema ativo via JS, atualizando CSS Variables e data-theme.
// Permite troca instantânea de tema sem reload.

import type { Theme, ThemeKey } from "@/types/data";

/**
 * Mapa completo dos 5 temas do VidaFlor.
 * Valores espelham exatamente o T_MAP do App.jsx.
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
 * Aplica um tema ao documento, atualizando:
 * 1. O atributo `data-theme` no `<html>` (para seletores CSS)
 * 2. As CSS Variables individuais (para estilos inline que usam T.*)
 * 3. A sombra do botão primário (derivada da cor primária)
 *
 * Chamar ao inicializar o app e ao trocar de tema:
 * ```ts
 * useEffect(() => applyTheme(THEMES[cfg.theme]), [cfg.theme]);
 * ```
 */
export function applyTheme(T: Theme): void {
  const root = document.documentElement;

  // 1. Atributo data-theme para seletores CSS
  root.setAttribute("data-theme", T.key);

  // 2. CSS Variables individuais para compatibilidade com estilos inline
  const r = root.style;
  r.setProperty("--vf-bg",   T.bg);
  r.setProperty("--vf-surf", T.surf);
  r.setProperty("--vf-alt",  T.alt);
  r.setProperty("--vf-bd",   T.bd);
  r.setProperty("--vf-p",    T.p);
  r.setProperty("--vf-pl",   T.pl);
  r.setProperty("--vf-pd",   T.pd);
  r.setProperty("--vf-gh",   T.gh);
  r.setProperty("--vf-tx",   T.tx);
  r.setProperty("--vf-tm",   T.tm);
  r.setProperty("--vf-ok",   T.ok);
  r.setProperty("--vf-wn",   T.wn);
  r.setProperty("--vf-er",   T.er);

  // 3. Sombra derivada — usa a cor primária com 27% de opacidade
  r.setProperty("--vf-shadow-btn", `0 4px 12px ${T.p}44`);
}

/**
 * Resolve um ThemeKey para o objeto Theme completo.
 * Fallback para "pastel" se a key for inválida.
 */
export function resolveTheme(key: ThemeKey | string): Theme {
  return THEMES[key as ThemeKey] ?? THEMES.pastel;
}

/**
 * Retorna a lista de temas disponíveis para exibição em ConfigScreen.
 */
export function getAvailableThemes(): Theme[] {
  return Object.values(THEMES);
}
