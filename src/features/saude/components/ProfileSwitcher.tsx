// src/features/saude/components/ProfileSwitcher.tsx
import { usePerfis } from '../selectors';
import { useSaudeStore } from '../store';
import type { ID } from '@/shared/types/common';

export function ProfileSwitcher() {
  const perfis          = usePerfis();
  const activeId        = useSaudeStore((s) => s.activeProfileId);
  const trocarPerfil    = useSaudeStore((s) => s.trocarPerfilAtivo);

  if (perfis.length <= 1) return null;

  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
      {perfis.map((p) => {
        const active = p.id === activeId;
        return (
          <button
            key={p.id}
            onClick={() => trocarPerfil(p.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, padding: '8px 12px', borderRadius: 14,
              border: active ? `2px solid ${p.color}` : '2px solid var(--vf-bd)',
              background: active ? `${p.color}18` : 'var(--vf-s2)',
              cursor: 'pointer', flexShrink: 0,
              fontFamily: 'inherit',
            }}
          >
            <span style={{ fontSize: 22 }}>{p.avatar}</span>
            <span style={{
              fontSize: 11, fontWeight: active ? 700 : 400,
              color: active ? p.color : 'var(--vf-tm)',
            }}>
              {p.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
