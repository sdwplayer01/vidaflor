// src/features/rotina-shell/RotinaScreen.tsx
import { useState } from 'react';
import { MinhaRotinaView } from '@/features/rotina/MinhaRotinaView';
import { KidsView }        from '@/features/kids/KidsView';
import { CasaView }        from '@/features/casa/CasaView';
import { PetsView }        from '@/features/pets/PetsView';

type Aba = 'eu' | 'kids' | 'casa' | 'pets';

const ABAS: { key: Aba; label: string; emoji: string }[] = [
  { key: 'eu',   label: 'Minha',     emoji: '\uD83D\uDC64' },
  { key: 'kids', label: 'Criancas',  emoji: '\uD83D\uDC76' },
  { key: 'casa', label: 'Casa',      emoji: '\uD83C\uDFE0' },
  { key: 'pets', label: 'Pets',      emoji: '\uD83D\uDC3E' },
];

export function RotinaScreen() {
  const [aba, setAba] = useState<Aba>('eu');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex', padding: '10px 16px 0',
        borderBottom: '1px solid var(--vf-bd)',
        background: 'var(--vf-bg)', flexShrink: 0,
      }}>
        {ABAS.map(({ key, label, emoji }) => {
          const active = aba === key;
          return (
            <button
              key={key}
              onClick={() => setAba(key)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 3,
                padding: '6px 4px 10px', background: 'none', border: 'none',
                borderBottom: active ? '2px solid var(--vf-p)' : '2px solid transparent',
                cursor: 'pointer', fontFamily: 'inherit',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span style={{ fontSize: 18 }}>{emoji}</span>
              <span style={{
                fontSize: 10, fontWeight: active ? 700 : 400,
                color: active ? 'var(--vf-p)' : 'var(--vf-tm)',
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {aba === 'eu'   && <MinhaRotinaView />}
        {aba === 'kids' && <KidsView />}
        {aba === 'casa' && <CasaView />}
        {aba === 'pets' && <PetsView />}
      </div>
    </div>
  );
}
