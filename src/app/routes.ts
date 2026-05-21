// src/app/routes.ts
import type { ComponentType } from "react";
import { TabKey } from "../features/nav/store";
import { HomeScreen }      from "../screens/HomeScreen";
import { RotinaScreen }    from "../features/rotina-shell/RotinaScreen";
import { SaudeScreen }     from "../features/saude/SaudeScreen";
import { EspiritualScreen } from "../features/espiritual/EspiritualScreen";
import { OrganizaScreen }  from "../features/organiza/OrganizaScreen";
import { FinancasScreen }  from "../features/financas/FinancasScreen";
import { ConfigScreen }    from "../screens/ConfigScreen";

export interface RouteDef {
  key: TabKey;
  label: string;
  component: ComponentType<any>;
}

export const ROUTES: Record<TabKey, RouteDef> = {
  home: {
    key: "home",
    label: "Inicio",
    component: HomeScreen,
  },
  rotina: {
    key: "rotina",
    label: "Rotina",
    component: RotinaScreen,
  },
  saude: {
    key: "saude",
    label: "Saude",
    component: SaudeScreen,
  },
  espiritual: {
    key: "espiritual",
    label: "Conexao",
    component: EspiritualScreen,
  },
  organiza: {
    key: "organiza",
    label: "Organizacao",
    component: OrganizaScreen,
  },
  financas: {
    key: "financas",
    label: "Financas",
    component: FinancasScreen,
  },
  config: {
    key: "config",
    label: "Configuracoes",
    component: ConfigScreen,
  },
};
