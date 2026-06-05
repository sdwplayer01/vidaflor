// src/features/kids/components/KidSwitcher.tsx
import { useShallow } from 'zustand/react/shallow';
import { useKidsStore } from '../store';

export function KidSwitcher() {
  const criancas    = useKidsStore(useShallow((s) => s.criancas));
  const activeKidId = useKidsStore((s) => s.activeKidId);
  const trocar      = useKidsStore((s) => s.trocarCriancaAtiva);

  if (criancas.length <= 1) return null;

  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 12 }}>
      {criancas.map((k) => {
        const active = k.id === activeKidId;
        return (
          <button
            key={k.id}
            onClick={() => trocar(k.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, padding: '8px 12px', borderRadius: 14, flexShrink: 0,
              border: active ? `2px solid ${k.color}` : '2px solid var(--vf-bd)',
              background: active ? `${k.color}18` : 'var(--vf-s2)',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <span style={{ fontSize: 22 }}>{k.avatar}</span>
            <span style={{
              fontSize: 11, fontWeight: active ? 700 : 400,
              color: active ? k.color : 'var(--vf-tm)',
            }}>
              {k.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
