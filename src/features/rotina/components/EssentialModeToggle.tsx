// src/features/rotina/components/EssentialModeToggle.tsx
import { Zap } from 'lucide-react';
import { useRotinaStore } from '../store';

export function EssentialModeToggle() {
  const essMode       = useRotinaStore((s) => s.essMode);
  const alternarEssMode = useRotinaStore((s) => s.alternarEssMode);

  return (
    <button
      onClick={alternarEssMode}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', borderRadius: 20,
        border: `1.5px solid ${essMode ? 'var(--vf-p)' : 'var(--vf-bd)'}`,
        background: essMode ? 'color-mix(in srgb, var(--vf-p) 12%, transparent)' : 'var(--vf-s2)',
        color: essMode ? 'var(--vf-p)' : 'var(--vf-tm)',
        fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      <Zap size={13} />
      Modo Essencial
    </button>
  );
}
