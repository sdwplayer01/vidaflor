// src/features/saude/components/MedicationItem.tsx
import { Trash2 } from 'lucide-react';
import { useSaudeStore } from '../store';
import { usePerfilAtivo } from '../selectors';
import { today } from '@/shared/utils/date';
import type { Medication } from '../types';
import type { ID } from '@/shared/types/common';

interface Props {
  med:      Medication;
  onRemove: (id: ID) => void;
}

export function MedicationItem({ med, onRemove }: Props) {
  const perfil             = usePerfilAtivo();
  const toggleMedicamento  = useSaudeStore((s) => s.toggleMedicamentoDia);
  const day                = today();
  const tomado             = med.log[day] === true;

  if (!perfil) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px', borderRadius: 14,
      background: 'var(--vf-s2)', border: '1px solid var(--vf-bd)',
    }}>
      <button
        onClick={() => toggleMedicamento(perfil.id, med.id, day)}
        style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          border: `2px solid ${tomado ? 'var(--vf-ok)' : 'var(--vf-bd)'}`,
          background: tomado ? 'var(--vf-ok)' : 'transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label={tomado ? 'Desmarcar' : 'Marcar como tomado'}
      >
        {tomado && <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>✓</span>}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: 14, fontWeight: 600,
          color: 'var(--vf-t)',
          textDecoration: tomado ? 'line-through' : 'none',
        }}>
          {med.name}
        </p>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--vf-tm)' }}>
          {med.dose} · {med.time}
        </p>
      </div>

      <button
        onClick={() => onRemove(med.id)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--vf-tm)', padding: 4, flexShrink: 0,
        }}
        aria-label="Remover medicamento"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
