// src/screens/HomeScreen.tsx -- v2 Jardim variant
// Contemplative home: ambient blobs, hero flower, water+mood quick-acts,
// next-task whisper, 6 area cards.

import { Settings, Flame, Check, Calendar, Heart, Sparkles, Users, Folder, Wallet } from "lucide-react";
import { useState as useMoodState } from "react";
import type { TabKey } from "@/features/nav/store";
import { useNavStore }          from "@/features/nav/store";
import { useConfigStore }       from "@/features/config/store";
import { BloomFlower, bloomLabel, bloomPoem } from "@/features/bloom/components/BloomFlower";
import { useBloomDoDia }        from "@/features/bloom/selectors";
import { useProgressoDoDia }    from "@/features/rotina/selectors";
import { useRotinaStore }       from "@/features/rotina/store";
import { useAguaDoDia, usePerfilAtivo } from "@/features/saude/selectors";
import { useSaudeStore }        from "@/features/saude/store";
import { useGratidoesDoDiaCount } from "@/features/espiritual/selectors";
import { useSaldoDoMes }        from "@/features/financas/selectors";
import { today, greet }         from "@/shared/utils/date";
import { formatBRL }            from "@/shared/utils/money";

interface Props { setTab: (t: TabKey) => void; }

// ── Ambient blobs ────────────────────────────────────────────────────────
function Ambient({ vitality }: { vitality: number }) {
  const op = 0.08 + (vitality / 100) * 0.18;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {[
        { top: "-15%", left: "-10%",  w: 280, h: 280, bg: "var(--vf-rose)",       delay: "0s"   },
        { top: "20%",  left: "55%",   w: 220, h: 220, bg: "var(--vf-coral)",      delay: "2s"   },
        { top: "55%",  left: "-5%",   w: 200, h: 200, bg: "var(--vf-lilac)",      delay: "4s"   },
        { top: "75%",  left: "60%",   w: 180, h: 180, bg: "var(--vf-champagne)",  delay: "1.5s" },
      ].map((b, i) => (
        <div key={i} style={{
          position:     "absolute",
          top:          b.top,
          left:         b.left,
          width:        b.w,
          height:       b.h,
          borderRadius: "50%",
          background:   b.bg,
          filter:       "blur(70px)",
          opacity:      op,
          animation:    `vf-drift 18s ${b.delay} ease-in-out infinite alternate`,
        }} />
      ))}
    </div>
  );
}

// ── Screen header ────────────────────────────────────────────────────────
function HomeHeader({ streak }: { streak: number }) {
  const irPara = useNavStore((s) => s.irPara);
  const nome   = useConfigStore((s) => s.name ?? "");
  return (
    <div style={{
      position:       "relative",
      zIndex:         2,
      display:        "flex",
      justifyContent: "space-between",
      alignItems:     "flex-start",
      padding:        "24px 20px 0",
    }}>
      <div>
        <div className="vf-eyebrow">{greet()}</div>
        <div style={{
          fontFamily: "var(--vf-font-display)",
          fontStyle:  "italic",
          fontSize:   26,
          lineHeight: 1.1,
          color:      "var(--vf-tx)",
          marginTop:  2,
        }}>
          {nome || "meu jardim"}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {streak > 0 && (
          <div style={{
            display:    "flex",
            alignItems: "center",
            gap:         4,
            padding:    "5px 10px",
            borderRadius: 99,
            background:  "color-mix(in oklab, var(--vf-coral) 15%, transparent)",
            border:      "1px solid color-mix(in oklab, var(--vf-coral) 25%, transparent)",
          }}>
            <Flame size={12} color="var(--vf-coral)" />
            <span className="vf-mono" style={{ fontSize: 12, color: "var(--vf-coral)" }}>{streak}</span>
          </div>
        )}
        <button
          onClick={() => irPara("config" as TabKey)}
          style={{
            width:        36,
            height:       36,
            borderRadius: 12,
            background:   "var(--vf-glass)",
            border:       "1px solid var(--vf-bd)",
            display:      "grid",
            placeItems:   "center",
            cursor:       "pointer",
            backdropFilter: "blur(12px)",
          }}
        >
          <Settings size={16} color="var(--vf-tx-mute)" />
        </button>
      </div>
    </div>
  );
}

// ── Water quick-action card ──────────────────────────────────────────────
function WaterCard() {
  const { atual, meta } = useAguaDoDia();
  const toggleAgua      = useSaudeStore((s) => s.registrarAgua);
  const profile         = usePerfilAtivo();
  const d               = today();

  const copos     = Math.round(atual / 250);
  const metaCopos = Math.round(meta / 250);
  const dots      = Array.from({ length: metaCopos });

  return (
    <div style={{
      background:   "var(--vf-glass)",
      backdropFilter: "blur(20px) saturate(140%)",
      border:       "1px solid var(--vf-bd)",
      borderRadius: "var(--vf-r-xl)",
      padding:      16,
    }}>
      <div className="vf-eyebrow" style={{ marginBottom: 8 }}>hidratacao</div>
      <div style={{
        fontFamily: "var(--vf-font-display)",
        fontStyle:  "italic",
        fontSize:   26,
        lineHeight: 1,
        color:      "var(--vf-tx)",
      }}>
        {copos}<span style={{ fontSize: 14, color: "var(--vf-tx-mute)", marginLeft: 3 }}>/ {metaCopos}</span>
      </div>
      <div style={{ display: "flex", gap: 5, marginTop: 12, flexWrap: "wrap" }}>
        {dots.map((_, i) => (
          <div
            key={i}
            onClick={() => profile && toggleAgua(profile.id, d, i < copos ? i * 250 : (i + 1) * 250)}
            style={{
              flex:         "1 0 auto",
              height:       32,
              minWidth:     24,
              borderRadius: 8,
              background:   i < copos
                ? "var(--vf-grad-coral)"
                : "var(--vf-surf-alt)",
              cursor:       "pointer",
              transition:   "all 0.3s var(--vf-ease-spring)",
              border:       "1px solid var(--vf-bd)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Mood quick-action card ───────────────────────────────────────────────
const MOODS = [
  { emoji: "\u{1F33F}", label: "calma",  val: "calm"  },
  { emoji: "\u{1F33C}", label: "alegre", val: "happy" },
  { emoji: "\u{1F32B}", label: "ansios", val: "anx"   },
  { emoji: "\u{1F338}", label: "grata",  val: "grat"  },
] as const;

function MoodCard() {
  const [mood, setMood] = useMoodState<string | null>(null);
  return (
    <div style={{
      background:     "var(--vf-glass)",
      backdropFilter: "blur(20px) saturate(140%)",
      border:         "1px solid var(--vf-bd)",
      borderRadius:   "var(--vf-r-xl)",
      padding:        16,
    }}>
      <div className="vf-eyebrow" style={{ marginBottom: 8 }}>humor</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {MOODS.map((m) => {
          const active = mood === m.val;
          return (
            <button
              key={m.val}
              onClick={() => setMood(active ? null : m.val)}
              style={{
                padding:       "7px 4px",
                borderRadius:  12,
                border:        `1.5px solid ${active ? "var(--vf-rose)" : "var(--vf-bd)"}`,
                background:    active
                  ? "color-mix(in oklab, var(--vf-rose) 12%, transparent)"
                  : "transparent",
                cursor:        "pointer",
                display:       "flex",
                flexDirection: "column",
                alignItems:    "center",
                gap:           2,
                transition:    "all 0.3s var(--vf-ease-spring)",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{ fontSize: 16 }}>{m.emoji}</span>
              <span className="vf-label" style={{ fontSize: 9 }}>{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Area card ────────────────────────────────────────────────────────────
interface AreaCardProps {
  tab:   TabKey;
  label: string;
  icon:  React.ReactNode;
  pct:   number;
  hint:  string;
}

function AreaCard({ tab, label, icon, pct, hint }: AreaCardProps) {
  const irPara = useNavStore((s) => s.irPara);
  return (
    <div
      onClick={() => irPara(tab)}
      style={{
        background:   "var(--vf-surf)",
        border:       "1px solid var(--vf-bd)",
        borderRadius: "var(--vf-r-lg)",
        padding:      16,
        cursor:       "pointer",
        transition:   "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease",
        boxShadow:    "var(--vf-shadow-sm)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform  = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--vf-shadow-md)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform  = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--vf-shadow-sm)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{
          width:        32,
          height:       32,
          borderRadius: 10,
          background:   "var(--vf-surf-alt)",
          display:      "grid",
          placeItems:   "center",
          color:        "var(--vf-rose)",
        }}>
          {icon}
        </div>
        <span className="vf-mono" style={{ color: "var(--vf-tx-mute)" }}>{pct}%</span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--vf-tx)" }}>{label}</div>
      <div className="vf-label" style={{ marginTop: 2, marginBottom: 10 }}>{hint}</div>
      <div style={{ height: 4, background: "var(--vf-surf-soft)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height:       "100%",
          width:        `${pct}%`,
          background:   "var(--vf-grad-hero)",
          borderRadius: 99,
          transition:   "width 1.2s cubic-bezier(0.22,1,0.36,1)",
          position:     "relative",
          overflow:     "hidden",
        }}>
          <div style={{
            position:   "absolute",
            inset:      0,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
            animation:  "vf-shimmer 2.5s linear infinite",
          }} />
        </div>
      </div>
    </div>
  );
}

// ── Next task whisper ────────────────────────────────────────────────────
function NextTaskCard() {
  const d      = today();
  const toggle = useRotinaStore((s) => s.toggleTarefa);
  const next   = useRotinaStore((s) => {
    const all  = [...(s.tarefas.manha ?? []), ...(s.tarefas.tarde ?? []), ...(s.tarefas.noite ?? [])];
    const done = s.done[d] ?? [];
    return all.find((t) => !done.includes(t.id)) ?? null;
  });

  if (!next) return null;

  return (
    <div style={{
      background:   "var(--vf-surf)",
      border:       "1px solid var(--vf-bd)",
      borderRadius: "var(--vf-r-lg)",
      padding:      16,
      boxShadow:    "var(--vf-shadow-sm)",
      marginTop:    12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width:        44,
          height:       44,
          borderRadius: 14,
          background:   "var(--vf-grad-coral)",
          display:      "grid",
          placeItems:   "center",
          fontSize:     20,
          flexShrink:   0,
        }}>
          🌸
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="vf-label" style={{ marginBottom: 2 }}>proximo cuidado</div>
          <div style={{
            fontSize:     15,
            fontWeight:   600,
            color:        "var(--vf-tx)",
            whiteSpace:   "nowrap",
            overflow:     "hidden",
            textOverflow: "ellipsis",
          }}>
            {next.task}
          </div>
        </div>
        <button
          onClick={() => toggle(d, next.id)}
          style={{
            width:        26,
            height:       26,
            borderRadius: 99,
            border:       "1.5px solid var(--vf-bd-strong)",
            display:      "grid",
            placeItems:   "center",
            cursor:       "pointer",
            flexShrink:   0,
            background:   "transparent",
            transition:   "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <Check size={12} color="var(--vf-tx-mute)" />
        </button>
      </div>
    </div>
  );
}

// ── Main HomeScreen ──────────────────────────────────────────────────────

export function HomeScreen({ setTab: _setTab }: Props) {
  const d        = today();
  const bloom    = useBloomDoDia(d);
  const vitality = bloom.total;
  const rotina   = useProgressoDoDia(d);
  const agua     = useAguaDoDia();
  const gratCount = useGratidoesDoDiaCount();

  const mes   = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const saldo = useSaldoDoMes(mes);
  const streak = useRotinaStore((s) => Object.keys(s.done).length);

  const areaCards: AreaCardProps[] = [
    {
      tab:   "rotina",
      label: "Rotina",
      icon:  <Calendar size={16} />,
      pct:   rotina.total > 0 ? Math.round((rotina.feitas / rotina.total) * 100) : 0,
      hint:  `${rotina.feitas}/${rotina.total} hoje`,
    },
    {
      tab:   "saude",
      label: "Saude",
      icon:  <Heart size={16} />,
      pct:   Math.round(bloom.waterPct),
      hint:  `${Math.round(agua.atual / 250)} de ${Math.round(agua.meta / 250)} copos`,
    },
    {
      tab:   "espiritual",
      label: "Espirito",
      icon:  <Sparkles size={16} />,
      pct:   Math.round(bloom.spiritPct),
      hint:  `${gratCount} gratidao${gratCount !== 1 ? "es" : ""}`,
    },
    {
      tab:   "organiza",
      label: "Conexao",
      icon:  <Users size={16} />,
      pct:   60,
      hint:  "vinculos ativos",
    },
    {
      tab:   "organiza",
      label: "Organiza",
      icon:  <Folder size={16} />,
      pct:   45,
      hint:  "listas ativas",
    },
    {
      tab:   "financas",
      label: "Financas",
      icon:  <Wallet size={16} />,
      pct:   Math.max(0, Math.min(100, Math.round((saldo as any).pct ?? 60))),
      hint:  formatBRL(saldo.saldo),
    },
  ];

  return (
    <div style={{ padding: "0 0 8px", position: "relative", minHeight: "100vh" }}>
      <Ambient vitality={vitality} />
      <HomeHeader streak={streak} />

      {/* Hero: Flower + vitality label */}
      <div style={{ position: "relative", zIndex: 2, padding: "16px 20px 4px", textAlign: "center" }}>
        <div className="vf-eyebrow" style={{ marginBottom: 4 }}>flor do dia</div>
        <div
          className="vf-display-it"
          style={{ fontSize: 30, lineHeight: 1.1, margin: "2px 0 4px", color: "var(--vf-tx)" }}
        >
          {bloomLabel(vitality)}
        </div>
        <div style={{ fontSize: 14, color: "var(--vf-tx-mute)", fontStyle: "italic", marginBottom: 10 }}>
          — {bloomPoem(vitality)}
        </div>

        <div style={{ display: "grid", placeItems: "center", margin: "8px auto 4px" }}>
          <BloomFlower pct={vitality} size={240} />
        </div>

        {/* Vitality bar */}
        <div style={{ maxWidth: 280, margin: "12px auto 0" }}>
          <div style={{
            height: 8, background: "var(--vf-surf-soft)",
            borderRadius: 99, overflow: "hidden", position: "relative",
          }}>
            <div style={{
              height:       "100%",
              width:        `${vitality}%`,
              background:   "var(--vf-grad-hero)",
              borderRadius: 99,
              transition:   "width 1.2s cubic-bezier(0.22,1,0.36,1)",
              position:     "relative",
              overflow:     "hidden",
            }}>
              <div style={{
                position:   "absolute",
                inset:      0,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                animation:  "vf-shimmer 2.5s linear infinite",
              }} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span className="vf-label">vitalidade</span>
            <span className="vf-mono" style={{ color: "var(--vf-tx)" }}>{vitality}%</span>
          </div>
        </div>
      </div>

      {/* Quick actions: water + mood */}
      <div style={{
        position:            "relative",
        zIndex:              2,
        display:             "grid",
        gridTemplateColumns: "1.3fr 1fr",
        gap:                 12,
        padding:             "16px 20px 0",
      }}>
        <WaterCard />
        <MoodCard />
      </div>

      {/* Next task whisper */}
      <div style={{ position: "relative", zIndex: 2, padding: "0 20px" }}>
        <NextTaskCard />
      </div>

      {/* Six area cards */}
      <div style={{
        position:            "relative",
        zIndex:              2,
        display:             "grid",
        gridTemplateColumns: "1fr 1fr",
        gap:                 12,
        padding:             "12px 20px 0",
      }}>
        {areaCards.map((c) => (
          <AreaCard key={`${c.tab}-${c.label}`} {...c} />
        ))}
      </div>
    </div>
  );
}
