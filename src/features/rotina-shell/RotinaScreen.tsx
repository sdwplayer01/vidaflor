// src/features/rotina-shell/RotinaScreen.tsx — v2
// Header with eyebrow/display/hint, segmented pill tabs, preserve all sub-views.
import { useState }             from 'react';
import { MinhaRotinaView }      from '@/features/rotina/MinhaRotinaView';
import { KidsView }             from '@/features/kids/KidsView';
import { CasaView }             from '@/features/casa/CasaView';
import { PetsView }             from '@/features/pets/PetsView';
import { useProgressoDoDia }    from '@/features/rotina/selectors';

type Aba = 'eu' | 'kids' | 'casa' | 'pets';

const ABAS: { key: Aba; label: string; emoji: string }[] = [
  { key: 'eu',   label: 'minha',    emoji: '🌸' },
  { key: 'kids', label: 'crianças', emoji: '🌱' },
  { key: 'casa', label: 'casa',     emoji: '🏡' },
  { key: 'pets', label: 'pets',     emoji: '🐾' },
];

export function RotinaScreen() {
  const [aba, setAba] = useState<Aba>('eu');
  const { feitas, total, pct } = useProgressoDoDia();

  const hint =
    total === 0
      ? 'plante seu primeiro cuidado'
      : feitas === total
      ? 'tudo cuidado — descanse com leveza'
      : `${total - feitas} cuidado${total - feitas > 1 ? 's' : ''} ainda hoje`;

  return (
    <div style={{ padding: '24px 20px 20px' }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <div className="vf-eyebrow">rotina</div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: 4,
          }}
        >
          <h1
            style={{
              margin: 0, fontSize: 30, lineHeight: 1.05,
              fontFamily: 'var(--vf-font-display)', fontWeight: 400,
              color: 'var(--vf-tx)',
            }}
          >
            Seu dia em ritmo
          </h1>
          {total > 0 && (
            <span
              className="vf-mono"
              style={{ color: 'var(--vf-rose)', fontSize: 15, fontWeight: 700 }}
            >
              {pct}%
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: 14, color: 'var(--vf-tx-soft)',
            marginTop: 6, fontStyle: 'italic',
          }}
        >
          {hint}
        </div>
      </div>

      {/* ── Segmented pill tabs ────────────────────────────────── */}
      <div
        style={{
          display: 'flex', gap: 4,
          background: 'var(--vf-surf-alt)',
          borderRadius: 99, padding: 3,
          marginBottom: 20,
        }}
      >
        {ABAS.map(({ key, label, emoji }) => {
          const active = aba === key;
          return (
            <button
              key={key}
              onClick={() => setAba(key)}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 2,
                padding: '7px 4px',
                borderRadius: 99, border: 'none', cursor: 'pointer',
                background: active ? 'var(--vf-surf)' : 'transparent',
                color: active ? 'var(--vf-rose)' : 'var(--vf-tx-mute)',
                fontFamily: 'var(--vf-font-ui)', fontSize: 10, fontWeight: 600,
                transition: 'all 0.3s var(--vf-ease-spring)',
                boxShadow: active ? '0 2px 8px rgba(0,0,0,0.07)' : 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span style={{ fontSize: 15 }}>{emoji}</span>
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      {aba === 'eu'   && <MinhaRotinaView />}
      {aba === 'kids' && <KidsView />}
      {aba === 'casa' && <CasaView />}
      {aba === 'pets' && <PetsView />}
    </div>
  );
}
