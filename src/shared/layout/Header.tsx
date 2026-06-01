// src/shared/layout/Header.tsx
import { Settings, Flower } from "lucide-react";
import { useNavStore, TabKey } from "../../features/nav/store";

const SCREEN_LABELS: Record<TabKey, string> = {
  home:       "Início",
  dia:        "Dia",
  saude:      "Saúde",
  espiritual: "Conexão",
  organiza:   "Organização",
  financas:   "Finanças",
  config:     "Configurações",
};

export function Header() {
  const currentTab = useNavStore((s) => s.currentTab);
  const irPara = useNavStore((s) => s.irPara);

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(var(--vf-bg), 0.8)",
        backgroundColor: "var(--vf-bg)", // Fallback se css var blur não suportado
        borderBottom: "1px solid var(--vf-bd)",
        padding: "14px 20px 12px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div
        onClick={() => irPara("home")}
        style={{
          width: 34,
          height: 34,
          borderRadius: 11,
          background: "var(--vf-gh)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--vf-shadow-btn)",
          cursor: "pointer",
        }}
      >
        <Flower size={20} color="#fff" />
      </div>
      <div>
        <p
          style={{
            margin: 0,
            fontSize: 10,
            color: "var(--vf-tm)",
            fontWeight: 800,
            letterSpacing: "0.5px",
          }}
        >
          MINHA VIDA
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 900,
            color: "var(--vf-tx)",
          }}
        >
          {SCREEN_LABELS[currentTab] ?? "VidaFlor"}
        </p>
      </div>
      <button
        onClick={() => irPara("config")}
        style={{
          marginLeft: "auto",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 6,
          WebkitTapHighlightColor: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s",
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "scale(0.9)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <Settings size={20} color="var(--vf-tm)" />
      </button>
    </div>
  );
}
