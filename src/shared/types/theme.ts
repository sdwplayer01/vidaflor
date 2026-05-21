// src/shared/types/theme.ts

export type ThemeKey = "pastel" | "terra" | "lilac" | "neutro" | "sage";

export interface Theme {
  key:  ThemeKey;
  name: string;
  e:    string;
  bg:   string;
  surf: string;
  alt:  string;
  bd:   string;
  p:    string;
  pl:   string;
  pd:   string;
  gh:   string;
  tx:   string;
  tm:   string;
  ok:   string;
  wn:   string;
  er:   string;
}
