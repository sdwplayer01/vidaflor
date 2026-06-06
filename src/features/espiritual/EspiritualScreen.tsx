// src/features/espiritual/EspiritualScreen.tsx — v2
// Header with eyebrow/display/hint, gradient plus button, segmented tabs.
// Sub-components unchanged — only the shell is redesigned.
import { useState }                 from 'react';
import { Plus }                     from 'lucide-react';
import { useGratidoesDoDiaCount, useOracoesPendentes } from './selectors';
import { GratidaoMural }    from './components/GratidaoMural';
import { OracaoList }       from './components/OracaoList';
import { LeituraList }      from './components/LeituraList';
import { AddGratidaoSheet } from './components/AddGratidaoSheet';
import { AddLeituraSheet }  from './components/AddLeituraSheet';
import { useEspiritualStore } from './store';
import { useAuthStore }       from '@/features/auth/store';

type SubTab = 'gratidao' | 'leituras' | 'oracoes';

const TABS: { key: SubTab; label: string; emoji: string }[] = [
  { key: 'gratidao', label: 'gratidões', emoji: '🌸' },
  { key: 'leituras', label: 'leituras',  emoji: '📖' },
  { key: 'oracoes',  label: 'orações',   emoji: '💝' },
];

export function EspiritualScreen() {
  // ── Hooks (sempre antes de qualquer return — Rules of Hooks) ──
  const [sub, setSub]             = useState<SubTab>('gratidao');
  const [sheetGrat, setSheetGrat] = useState(false);
  const [sheetLeit, setSheetLeit] = useState(false);

  const gratCount      = useGratidoesDoDiaCount();
  const pendentesCount = useOracoesPendentes().length;
  const hydrated       = useEspiritualStore((s) => s._hydrated);
  const isLoggedIn     = useAuthStore((s) => s.isLoggedIn);

  const abrirSheet = () => {
    if (sub === 'gratidao') setSheetGrat(true);
    else setSheetLeit(true);
  };

  // ── Guard de consistência: logado mas sync ainda não terminou ──
  if (isLoggedIn && !hydrated) {
    return (
      <div style={{ padding: '24px 20px 20px' }}>
        <div
          style={{
            padding: 24, textAlign: 'center',
            color: 'var(--vf-tx-soft)', fontSize: 15,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--vf-font-display)', fontStyle: 'italic',
              fontSize: 20, color: 'var(--vf-tx)', marginBottom: 8,
            }}
          >
            Carregando seu jardim interior
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.5 }}>
            um instante, recolhendo as flores do dia…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 20px 20px' }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <div className="vf-eyebrow">espírito</div>
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
            Jardim interior
          </h1>
          {sub !== 'oracoes' && (
            <button
              onClick={abrirSheet}
              style={{
                width: 40, height: 40, borderRadius: 14,
                background: 'var(--vf-grad-hero)', border: 'none',
                color: 'var(--vf-on-rose)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(184,96,122,0.30)',
                WebkitTapHighlightColor: 'transparent',
              }}
              aria-label="Adicionar"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
        <div
          style={{
            fontSize: 14, color: 'var(--vf-tx-soft)',
            marginTop: 6, fontStyle: 'italic',
          }}
        >
          {gratCount > 0
            ? `${gratCount} flor${gratCount > 1 ? 'es' : ''} de gratidão hoje`
            : 'onde o invisível floresce em silêncio'}
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
        {TABS.map(({ key, label, emoji }) => {
          const active = sub === key;
          const badge  = key === 'oracoes' && pendentesCount > 0;
          return (
            <button
              key={key}
              onClick={() => setSub(key)}
              style={{
                flex: 1, padding: '7px 4px',
                borderRadius: 99, border: 'none', cursor: 'pointer',
                background: active ? 'var(--vf-surf)' : 'transparent',
                color: active ? 'var(--vf-rose)' : 'var(--vf-tx-mute)',
                fontFamily: 'var(--vf-font-ui)', fontSize: 11, fontWeight: 600,
                transition: 'all 0.3s var(--vf-ease-spring)',
                boxShadow: active ? '0 2px 8px rgba(0,0,0,0.07)' : 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {emoji} {label}{badge ? ` (${pendentesCount})` : ''}
            </button>
          );
        })}
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      {sub === 'gratidao' && <GratidaoMural />}
      {sub === 'oracoes'  && <OracaoList />}
      {sub === 'leituras' && <LeituraList />}

      {/* ── Sheets ─────────────────────────────────────────────── */}
      <AddGratidaoSheet isOpen={sheetGrat} onClose={() => setSheetGrat(false)} />
      <AddLeituraSheet  isOpen={sheetLeit} onClose={() => setSheetLeit(false)} />
    </div>
  );
}
