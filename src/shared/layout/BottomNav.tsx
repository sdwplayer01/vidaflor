// src/shared/layout/BottomNav.tsx -- v2
import { CalendarDays, Heart, Flame, Users, Wallet, Home } from "lucide-react";
import { useNavStore, type TabKey } from "@/features/nav/store";
import { FlowerMark }               from "@/features/bloom/components/BloomFlower";
import { useVitality }              from "@/features/bloom/selectors";
import styles from "./BottomNav.module.css";

interface NavItem { k: TabKey; label: string; icon: React.ReactNode; }

export function BottomNav() {
  const currentTab = useNavStore((s) => s.currentTab);
  const irPara     = useNavStore((s) => s.irPara);
  const vitality   = useVitality();

  const items: NavItem[] = [
    {
      k: "home",
      label: "inicio",
      icon: (
        <span style={{ color: currentTab === "home" ? "var(--vf-rose)" : "var(--vf-tx-mute)" }}>
          <FlowerMark pct={vitality} size={22} />
        </span>
      ),
    },
    { k: "dia",       label: "dia",      icon: <CalendarDays size={20} strokeWidth={1.6} /> },
    { k: "saude",     label: "saude",    icon: <Heart        size={20} strokeWidth={1.6} /> },
    { k: "espiritual",label: "espírito", icon: <Flame        size={20} strokeWidth={1.6} /> },
    { k: "organiza",  label: "listas",   icon: <Users        size={20} strokeWidth={1.6} /> },
    { k: "financas",  label: "finanças", icon: <Wallet       size={20} strokeWidth={1.6} /> },
    { k: "familia",   label: "família",  icon: <Home         size={20} strokeWidth={1.6} /> },
  ];

  return (
    <nav className={styles.nav}>
      {items.map(({ k, label, icon }) => {
        const active = currentTab === k;
        return (
          <button
            key={k}
            className={`${styles.item} ${active ? styles.isActive : ""}`}
            onClick={() => irPara(k)}
          >
            <span className={styles.iconWrap}>{icon}</span>
            <span className={styles.label}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
