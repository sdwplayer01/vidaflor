// src/features/bloom/components/BloomCard.tsx
import { useState, useEffect, useRef } from 'react';
import { useBloomDoDia, useBloomFase } from '../selectors';
import { BloomFlower } from './BloomFlower';
import { BloomCelebration } from './BloomCelebration';

export function BloomCard() {
  const bloom = useBloomDoDia();
  const fase  = useBloomFase();
  const [celebrado, setCelebrado] = useState(false);
  const prevTotal = useRef(bloom.total);

  useEffect(() => {
    if (bloom.total >= 100 && prevTotal.current < 100 && !celebrado) {
      setCelebrado(true);
    }
    prevTotal.current = bloom.total;
  }, [bloom.total]);

  const rows: { label: string; pct: number; color: string }[] = [
    { label: 'Rotina',       pct: bloom.routinePct,    color: '#79B8E8' },
    { label: 'Agua',         pct: bloom.waterPct,      color: '#79C9E8' },
    { label: 'Espiritual',   pct: bloom.espiritualPct, color: '#E8799A' },
  ];

  const titleColor =
    fase === 'total' ? '#D4A853'
    : fase === 'meio' ? 'var(--vf-p)'
    : 'var(--vf-tm)';

  return (
    <>
      <div style={{
        background: 'var(--vf-s2)', borderRadius: 20, padding: '18px 16px',
        border: '1px solid var(--vf-bd)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <BloomFlower pct={bloom.total} size={72} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--vf-tm)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Bloom do dia
            </p>
            <p style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 800, color: titleColor }}>
              {fase === 'total' ? 'Floresceu!' : fase === 'meio' ? 'Crescendo' : 'Iniciando'}
            </p>

            {rows.map(({ label, pct, color }) => (
              <div key={label} style={{ marginBottom: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 11, color: 'var(--vf-tm)' }}>{label}</span>
                  <span style={{ fontSize: 11, color: 'var(--vf-tm)' }}>{pct}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 3, background: 'var(--vf-bd)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${pct}%`,
                    background: color,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {celebrado && (
        <BloomCelebration onDismiss={() => setCelebrado(false)} />
      )}
    </>
  );
}
