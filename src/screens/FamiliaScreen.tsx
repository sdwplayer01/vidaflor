// src/screens/FamiliaScreen.tsx
import { useState } from "react";
import { Baby, Heart, Users } from "lucide-react";
import { KidsView }    from "@/features/kids/KidsView";
import { PetsView }    from "@/features/pets/PetsView";
import { ConjugeView } from "./ConjugeView";

type FamiliaTab = "conjuge" | "kids" | "pets";

const TABS: { key: FamiliaTab; label: string; icon: React.ReactNode }[] = [
  { key: "conjuge", label: "Cônjuge", icon: <Users  size={15} strokeWidth={1.8} /> },
  { key: "kids",    label: "Filhos",  icon: <Baby   size={15} strokeWidth={1.8} /> },
  { key: "pets",    label: "Pets",    icon: <Heart  size={15} strokeWidth={1.8} /> },
];

export function FamiliaScreen() {
  const [active, setActive] = useState<FamiliaTab>("conjuge");

  return (
    <div style={{ paddingBottom: 100 }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "12px 20px",
          borderBottom: "1px solid var(--vf-bd)",
          background: "var(--vf-glass)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: "var(--vf-r-full)",
              border: active === key ? "none" : "1.5px solid var(--vf-bd)",
              background: active === key ? "var(--vf-p)" : "transparent",
              color: active === key ? "var(--vf-on-rose)" : "var(--vf-tm)",
              fontWeight: active === key ? 700 : 500,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all var(--vf-trans-normal)",
              WebkitTapHighlightColor: "transparent",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 20px" }}>
        {active === "conjuge" && <ConjugeView />}
        {active === "kids"    && <KidsView />}
        {active === "pets"    && <PetsView />}
      </div>
    </div>
  );
}
