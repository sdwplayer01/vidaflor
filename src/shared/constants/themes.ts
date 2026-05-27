// src/shared/constants/themes.ts — v2
// Two premium themes: Aurora (light) + Crepúsculo (warm dark).

import type { Theme, ThemeKey } from "../types/theme";

export const THEMES: Record<ThemeKey, Theme> = {
  aurora: {
    key:       "aurora",
    name:      "Aurora",
    e:         "🌸",
    bg0:       "#FAF5F0",
    surf:      "#FFFBF6",
    rose:      "#B8607A",
    coral:     "#E89472",
    champagne: "#D9B872",
    tx:        "#2A1A22",
    bg:        "#FAF5F0",
    alt:       "#F8EFE5",
    bd:        "rgba(60, 28, 36, 0.08)",
    p:         "#B8607A",
    pl:        "#E8B0BE",
    pd:        "#8C4760",
    gh:        "linear-gradient(135deg, #E89472 0%, #B8607A 60%, #9477B8 100%)",
    tm:        "#8A7079",
    ok:        "#6AA568",
    wn:        "#D9A84A",
    er:        "#C05068",
  },
  crepusculo: {
    key:       "crepusculo",
    name:      "Crepúsculo",
    e:         "🌙",
    bg0:       "#1A1018",
    surf:      "rgba(48, 30, 50, 0.65)",
    rose:      "#C77897",
    coral:     "#F0A88A",
    champagne: "#E5C892",
    tx:        "#F5E8E0",
    bg:        "#1A1018",
    alt:       "rgba(58, 38, 58, 0.55)",
    bd:        "rgba(232, 180, 200, 0.10)",
    p:         "#C77897",
    pl:        "#D89AB0",
    pd:        "#8E3F5C",
    gh:        "linear-gradient(135deg, #F0A88A 0%, #C77897 50%, #B89AE0 100%)",
    tm:        "#A38FA0",
    ok:        "#A8BFA2",
    wn:        "#E5C892",
    er:        "#D89AB0",
  },
};

/** Resolve a ThemeKey to the full Theme object. Fallback: aurora. */
export function resolveTheme(key: ThemeKey | string): Theme {
  return THEMES[key as ThemeKey] ?? THEMES.aurora;
}

export function getAvailableThemes(): Theme[] {
  return Object.values(THEMES);
}

/**
 * Applies a theme by setting data-theme on <html>.
 * CSS cascade in tokens.css handles the rest.
 */
export function applyTheme(T: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", T.key);
}
