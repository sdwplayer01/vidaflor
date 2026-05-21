// src/shared/layout/BottomNav.tsx — Navegação inferior do VidaFlor v2
// CSS Module, sem cores hardcoded, tap feedback via :active.

import {
  Home, LayoutGrid, Heart, DollarSign, Star, ShoppingCart,
} from "lucide-react";
import { useNavStore, TabKey } from "../../features/nav/store";
import styles from "./BottomNav.module.css";

const NAV_ITEMS: { k: TabKey; I: typeof Home; lb: string }[] = [
  { k: "home",       I: Home,         lb: "Início" },
  { k: "rotina",     I: LayoutGrid,   lb: "Rotina" },
  { k: "saude",      I: Heart,        lb: "Saúde" },
  { k: "espiritual", I: Star,         lb: "Conexão" },
  { k: "organiza",   I: ShoppingCart, lb: "Organiza" },
  { k: "financas",   I: DollarSign,   lb: "Finanças" },
];

export function BottomNav() {
  const currentTab = useNavStore((s) => s.currentTab);
  const irPara = useNavStore((s) => s.irPara);

  return (
    <nav className={styles.nav}>
      {NAV_ITEMS.map(({ k, I, lb }) => {
        const active = currentTab === k;
        return (
          <button key={k} className={styles.tab} onClick={() => irPara(k)}>
            <div className={styles.pill} data-active={active}>
              <I
                size={18}
                color={active ? "#fff" : "var(--vf-tm)"}
                strokeWidth={active ? 2.5 : 2}
              />
            </div>
            <span className={styles.label} data-active={active}>
              {lb}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
