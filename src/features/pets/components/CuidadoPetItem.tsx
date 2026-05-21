// src/features/pets/components/CuidadoPetItem.tsx
import { Plus, Minus } from 'lucide-react';
import type { CuidadoPet } from '../types';
import type { ID } from '@/shared/types/common';

const TIPO_EMOJI: Record<string, string> = {
  alimentacao: '\uD83C\uDF56',
  agua:        '\uD83D\uDCA7',
  passeio:     '\uD83D\uDC3E',
  medicamento: '\uD83D\uDC8A',
  higiene:     '\uD83D\uDEBF',
  vacina:      '\uD83D\uDC89',
  outros:      '\u2764',
};

interface Props {
  cuidado:    CuidadoPet;
  feito:      number;
  onAdd:      (id: ID) => void;
  onRemove:   (id: ID) => void;
}

export function CuidadoPetItem({ cuidado, feito, onAdd, onRemove }: Props) {
  const completo = feito >= cuidado.frequenciaDia;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px', borderRadius: 14,
      background: completo ? 'color-mix(in srgb, var(--vf-ok) 8%, var(--vf-s2))' : 'var(--vf-s2)',
      border: '1px solid var(--vf-bd)',
    }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{TIPO_EMOJI[cuidado.tipo] ?? '\u2764'}</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--vf-t)' }}>{cuidado.descricao}</p>
        <p style={{ margin: 0, fontSize: 11, color: 'var(--vf-tm)' }}>
          {feito}/{cuidado.frequenciaDia}x
          {cuidado.horario ? ` · ${cuidado.horario}` : ''}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {feito > 0 && (
          <button
            onClick={() => onRemove(cuidado.id)}
            style={{
              width: 30, height: 30, borderRadius: 8,
              border: '1.5px solid var(--vf-bd)', background: 'var(--vf-bg)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Minus size={14} />
          </button>
        )}
        {!completo && (
          <button
            onClick={() => onAdd(cuidado.id)}
            style={{
              width: 30, height: 30, borderRadius: 8,
              border: '1.5px solid var(--vf-p)', background: 'color-mix(in srgb, var(--vf-p) 12%, transparent)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--vf-p)',
            }}
          >
            <Plus size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
