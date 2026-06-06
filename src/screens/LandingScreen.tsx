import { useEffect, useRef } from "react";
import {
  Calendar,
  Heart,
  Wallet,
  Sparkles,
  Users,
  LayoutDashboard,
  Check,
} from "lucide-react";
import s from "./LandingScreen.module.css";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) { el.classList.add(s.revealed as string); observer.disconnect(); } },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// ─── Preços — editar aqui ─────────────────────────────────────────────────
const PRECO_MENSAL = "19,90";
const PRECO_ANUAL  = "179,90";
const EQUIV_ANUAL  = "14,99";
// ─────────────────────────────────────────────────────────────────────────

interface Props {
  onEntrar:  () => void;
  onAssinar: (plano: "mensal" | "anual") => void;
}

const FEATURES = [
  {
    icon:  <Calendar size={18} strokeWidth={1.6} />,
    color: "var(--vf-rose-soft)",
    fg:    "var(--vf-rose)",
    title: "rotina diária",
    desc:  "planeje seu dia com intenção e colha cada fruto",
  },
  {
    icon:  <Heart size={18} strokeWidth={1.6} />,
    color: "var(--vf-coral-soft)",
    fg:    "var(--vf-coral)",
    title: "saúde & corpo",
    desc:  "registre hábitos, sono e bem-estar em um só lugar",
  },
  {
    icon:  <Wallet size={18} strokeWidth={1.6} />,
    color: "var(--vf-champagne-soft)",
    fg:    "var(--vf-champagne)",
    title: "solo fértil",
    desc:  "cuide das finanças com clareza e leveza",
  },
  {
    icon:  <Sparkles size={18} strokeWidth={1.6} />,
    color: "var(--vf-lilac-soft)",
    fg:    "var(--vf-lilac)",
    title: "conexão espiritual",
    desc:  "gratidão, orações e momentos de presença",
  },
  {
    icon:  <Users size={18} strokeWidth={1.6} />,
    color: "var(--vf-sage-soft)",
    fg:    "var(--vf-sage)",
    title: "família & lar",
    desc:  "organize a vida em casa junto com quem você ama",
  },
  {
    icon:  <LayoutDashboard size={18} strokeWidth={1.6} />,
    color: "var(--vf-surf-soft)",
    fg:    "var(--vf-tx-soft)",
    title: "organização",
    desc:  "listas, lembretes e notas sempre à mão",
  },
];

const ITENS_MENSAL = [
  "todos os 6 pilares",
  "sincronização na nuvem",
  "acesso em qualquer dispositivo",
  "suporte prioritário",
];

const ITENS_ANUAL = [
  "tudo do plano mensal",
  "economia de 25%",
  "acesso antecipado a novas funcionalidades",
  "preço de fundador garantido",
];

function FlowerMark() {
  return (
    <svg
      viewBox="0 0 120 120"
      className={s.flowerSvg}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="lp-bud" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--vf-petal-inner)" />
          <stop offset="100%" stopColor="var(--vf-petal-bud)" />
        </radialGradient>
        <radialGradient id="lp-outer" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="var(--vf-petal-mid)" />
          <stop offset="100%" stopColor="var(--vf-petal-outer)" />
        </radialGradient>
        <filter id="lp-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 8 pétalas externas */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const cx    = 60 + Math.cos(angle) * 26;
        const cy    = 60 + Math.sin(angle) * 26;
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx={10}
            ry={16}
            fill="url(#lp-outer)"
            opacity={0.82}
            transform={`rotate(${(i / 8) * 360} ${cx} ${cy})`}
            filter="url(#lp-glow)"
          />
        );
      })}

      {/* 6 pétalas internas */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
        const cx    = 60 + Math.cos(angle) * 14;
        const cy    = 60 + Math.sin(angle) * 14;
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx={7}
            ry={11}
            fill="var(--vf-petal-inner)"
            opacity={0.9}
            transform={`rotate(${(i / 6) * 360} ${cx} ${cy})`}
          />
        );
      })}

      {/* miolo */}
      <circle cx={60} cy={60} r={12} fill="url(#lp-bud)" />
      <circle cx={60} cy={60} r={5}  fill="var(--vf-petal-inner)" opacity={0.7} />
    </svg>
  );
}

export function LandingScreen({ onEntrar, onAssinar }: Props) {
  const refFeatures = useReveal();
  const refPricing  = useReveal();

  return (
    <div className={s.root}>
      {/* noise overlay — SVG data-uri, pointer-events: none */}
      <div className={s.noise} aria-hidden="true" />

      {/* ── nav ── */}
      <nav className={s.nav}>
        <span className={s.logo}>Vida Flor</span>
        <div className={s.navActions}>
          <button className={s.btnEntrar} onClick={onEntrar}>
            entrar
          </button>
          <button className={s.btnComecar} onClick={() => onAssinar("mensal")}>
            começar
          </button>
        </div>
      </nav>

      {/* ── hero ── */}
      <section className={s.hero}>
        <div className={s.flowerWrap}>
          <FlowerMark />
        </div>

        <p className={s.eyebrow}>jardim digital</p>

        <h1 className={s.heroTitle}>
          seu jardim digital{" "}
          <span style={{ color: "var(--vf-rose)" }}>floresce</span>{" "}
          com você
        </h1>

        <p className={s.heroSub}>
          rotina, saúde, finanças, espiritualidade e família — tudo cultivado
          com intenção, num só lugar que cresce contigo.
        </p>

        <div className={s.heroCtas}>
          <button className={s.ctaPrimary} onClick={() => onAssinar("anual")}>
            plantar cuidado
          </button>
          <button className={s.ctaSecondary} onClick={onEntrar}>
            já tenho conta
          </button>
        </div>

        <p className={s.heroBadge}>gratuito para uso local · nuvem no plano premium</p>
      </section>

      <div className={s.divider} />

      {/* ── features ── */}
      <section className={s.section} ref={refFeatures}>
        <p className={s.sectionLabel}>o jardim cuida de tudo</p>
        <h2 className={s.sectionTitle}>seis pilares de uma vida florescendo</h2>

        <div className={s.featuresGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={s.featureCard}>
              <div
                className={s.featureIcon}
                style={{ background: f.color, color: f.fg }}
              >
                {f.icon}
              </div>
              <p className={s.featureTitle}>{f.title}</p>
              <p className={s.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className={s.divider} />

      {/* ── pricing ── */}
      <section className={s.pricingSection} ref={refPricing}>
        <p className={s.sectionLabel}>acesso à nuvem</p>
        <h2 className={s.sectionTitle}>escolha como florescer</h2>

        <div className={s.pricingGrid}>

          {/* mensal */}
          <div className={s.pricingCard}>
            <p className={s.pricingPlan}>mensal</p>

            <div>
              <div className={s.pricingPrice}>
                <span className={s.pricingCurrency}>R$</span>
                <span className={s.pricingAmount} style={{ fontVariantNumeric: "tabular-nums" }}>{PRECO_MENSAL}</span>
                <span className={s.pricingPeriod}>/mês</span>
              </div>
            </div>

            <ul className={s.pricingItems}>
              {ITENS_MENSAL.map((item) => (
                <li key={item} className={s.pricingItem}>
                  <Check
                    size={13}
                    strokeWidth={2.5}
                    className={s.pricingItemCheck}
                  />
                  {item}
                </li>
              ))}
            </ul>

            <button
              className={[s.pricingCta, s.pricingCtaGhost].join(" ")}
              onClick={() => onAssinar("mensal")}
            >
              assinar mensal
            </button>
          </div>

          {/* anual — destaque */}
          <div className={[s.pricingCard, s.pricingCardFeatured].join(" ")}>
            <div className={s.pricingBadge}>economize 25%</div>

            <p className={s.pricingPlan}>anual</p>

            <div>
              <div className={s.pricingPrice}>
                <span className={s.pricingCurrency}>R$</span>
                <span className={s.pricingAmount}>{PRECO_ANUAL}</span>
                <span className={s.pricingPeriod}>/ano</span>
              </div>
              <p className={s.pricingEquiv}>
                equivale a R$ {EQUIV_ANUAL}/mês
              </p>
            </div>

            <ul className={s.pricingItems}>
              {ITENS_ANUAL.map((item) => (
                <li key={item} className={s.pricingItem}>
                  <Check
                    size={13}
                    strokeWidth={2.5}
                    className={s.pricingItemCheck}
                  />
                  {item}
                </li>
              ))}
            </ul>

            <button
              className={[s.pricingCta, s.pricingCtaFeatured].join(" ")}
              onClick={() => onAssinar("anual")}
            >
              plantar agora
            </button>
          </div>
        </div>

        <p className={s.pricingNote}>
          cancele quando quiser · pagamento seguro via Asaas ·
          dado local nunca é perdido
        </p>
      </section>

      {/* ── footer ── */}
      <div className={s.divider} />
      <footer className={s.footer}>
        <span className={s.footerLogo}>Vida Flor</span>
        <p className={s.footerSub}>um jardim que cresce com você</p>
        <button className={s.footerLink} onClick={onEntrar}>
          já tenho conta — entrar
        </button>
      </footer>
    </div>
  );
}
