// src/features/saude/components/WaterCard.tsx
import { Droplets } from 'lucide-react';
import { useAguaDoDia } from '../selectors';
import { usePerfilAtivo } from '../selectors';
import { useSaudeStore } from '../store';
import { today } from '@/shared/utils/date';

const QUICK_ML = [150, 250, 350, 500];

export function WaterCard() {
  const { atual, meta, pct } = useAguaDoDia();
  const perfil       = usePerfilAtivo();
  const registrarAgua = useSaudeStore((s) => s.registrarAgua);
  const zerarAgua     = useSaudeStore((s) => s.zerarAguaDoDia);

  if (!perfil) return null;

  const day = today();
  const barColor = pct >= 100 ? 'var(--vf-ok)' : 'var(--vf-p)';

  return (
    <div style={{
      background: 'var(--vf-s2)', borderRadius: 18, padding: '16px',
      border: '1px solid var(--vf-bd)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Droplets size={18} color="var(--vf-p)" />
        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--vf-t)' }}>
          Agua
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--vf-tm)' }}>
          {atual} / {meta} ml
        </span>
      </div>

      {/* Barra de progresso */}
      <div style={{
        height: 10, borderRadius: 6, background: 'var(--vf-bd)',
        overflow: 'hidden', marginBottom: 12,
      }}>
        <div style={{
          height: '100%', borderRadius: 6,
          width: `${Math.min(100, pct)}%`,
          background: barColor,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Botoes rapidos */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {QUICK_ML.map((ml) => (
          <button
            key={ml}
            onClick={() => registrarAgua(perfil.id, day, ml)}
            style={{
              flex: 1, minWidth: 60, padding: '8px 4px',
              borderRadius: 12, border: '1px solid var(--vf-bd)',
              background: 'var(--vf-bg)', color: 'var(--vf-t)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            +{ml}ml
          </button>
        ))}
      </div>

      {atual > 0 && (
        <button
          onClick={() => zerarAgua(perfil.id, day)}
          style={{
            marginTop: 10, width: '100%', padding: '8px',
            borderRadius: 12, border: 'none',
            background: 'transparent', color: 'var(--vf-tm)',
            fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Zerar do dia
        </button>
      )}
    </div>
  );
}
