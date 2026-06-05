// src/features/pets/components/PetSwitcher.tsx
import { useShallow } from 'zustand/react/shallow';
import { usePetsStore } from '../store';

export function PetSwitcher() {
  const pets      = usePetsStore(useShallow((s) => s.pets));
  const activeId  = usePetsStore((s) => s.activePetId);
  const trocar    = usePetsStore((s) => s.trocarPetAtivo);

  if (pets.length <= 1) return null;

  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 12 }}>
      {pets.map((p) => {
        const active = p.id === activeId;
        return (
          <button
            key={p.id}
            onClick={() => trocar(p.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, padding: '8px 12px', borderRadius: 14, flexShrink: 0,
              border: active ? `2px solid ${p.color}` : '2px solid var(--vf-bd)',
              background: active ? `${p.color}18` : 'var(--vf-s2)',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <span style={{ fontSize: 22 }}>{p.avatar}</span>
            <span style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? p.color : 'var(--vf-tm)' }}>
              {p.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
