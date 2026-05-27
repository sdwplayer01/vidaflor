// src/shared/types/theme.ts — v2
// 2-theme system: Aurora (light) + Crepúsculo (dark atmospheric)

export type ThemeKey = "aurora" | "crepusculo";

export interface Theme {
  key:  ThemeKey;
  name: string;
  e:    string;
  bg0:  string;
  surf: string;
  rose:       string;
  coral:      string;
  champagne:  string;
  tx:   string;
  // Legacy aliases (kept for backward compat)
  bg:  string;
  alt: string;
  bd:  string;
  p:   string;
  pl:  string;
  pd:  string;
  gh:  string;
  tm:  string;
  ok:  string;
  wn:  string;
  er:  string;
}
