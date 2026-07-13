// src/features/config/types.ts
import { ThemeKey } from "@/shared/types/theme";

export interface DashConfig {
  bloom:     boolean;
  water:     boolean;
  routine:   boolean;
  finance:   boolean;
  cycle:     boolean;
  spirit:    boolean;
  reminders: boolean;
  meds:      boolean;
  kids:      boolean;
  casa:      boolean;
  pets:      boolean;
}

export interface Parceiro {
  name:   string;
  avatar: string;
}

export interface AppConfig {
  theme:        ThemeKey;
  name:         string;
  dash:         DashConfig;
  parceiro?:    Parceiro;
  hideBalance?: boolean;   // oculta valores monetários sensíveis em telas públicas
}
