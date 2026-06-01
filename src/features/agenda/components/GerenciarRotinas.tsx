// src/features/agenda/components/GerenciarRotinas.tsx
// 4e: pontos de entrada para gestão de rotina/casa/kids/pets a partir do DiaScreen
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MinhaRotinaView } from '@/features/rotina/MinhaRotinaView';
import { CasaView }        from '@/features/casa/CasaView';
import { KidsView }        from '@/features/kids/KidsView';
import { PetsView }        from '@/features/pets/PetsView';

type Aba = 'rotina' | 'casa' | 'kids' | 'pets';

const ABAS: { key: Aba; label: string; emoji: string }[] = [
  { key: 'rotina', label: 'Rotina',    emoji: '🌸' },
  { key: 'casa',   label: 'Casa',      emoji: '🏡' },
  { key: 'kids',   label: 'Crianças',  emoji: '🌱' },
  { key: 'pets',   label: 'Pets',      emoji: '🐾' },
];

export function GerenciarRotinas() {
  const [aberto,  setAberto]  = useState(false);
  const [aba,     setAba]     = useState<Aba>('rotina');

  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden',
      border: '1px solid var(--vf-bd)', marginTop: 4,
    }}>
      {/* Header colapsável */}
      <button
        onClick={() => setAberto((v) => !v)}
        style={{
          width: '100%', padding: '12px 14px',
          background: 'var(--vf-surf)', border: 'none',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--vf-tx)' }}>
          Gerenciar rotinas
        </span>
        {aberto ? <ChevronUp size={16} color="var(--vf-tx-mute)" /> : <ChevronDown size={16} color="var(--vf-tx-mute)" />}
      </button>

      {aberto && (
        <>
          {/* Tabs de seção */}
          <div style={{
            display: 'flex', borderTop: '1px solid var(--vf-bd)',
            background: 'var(--vf-surf)',
          }}>
            {ABAS.map(({ key, label, emoji }) => {
              const ativo = aba === key;
              return (
                <button
                  key={key}
                  onClick={() => setAba(key)}
                  style={{
                    flex: 1, padding: '8px 0', fontSize: 11, fontWeight: ativo ? 700 : 400,
                    border: 'none', borderBottom: ativo ? '2px solid var(--vf-rose)' : '2px solid transparent',
                    background: 'transparent',
                    color: ativo ? 'var(--vf-rose)' : 'var(--vf-tx-mute)',
                    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {emoji}<br />{label}
                </button>
              );
            })}
          </div>

          {/* View ativa */}
          <div style={{ padding: '16px 14px', background: 'var(--vf-bg)' }}>
            {aba === 'rotina' && <MinhaRotinaView />}
            {aba === 'casa'   && <CasaView />}
            {aba === 'kids'   && <KidsView />}
            {aba === 'pets'   && <PetsView />}
          </div>
        </>
      )}
    </div>
  );
}
