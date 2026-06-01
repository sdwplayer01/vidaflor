// src/features/bloom/components/BloomCard.tsx
import { useState, useEffect, useRef } from 'react';
import { useBloomDoDia, useBloomFase } from '../selectors';
import { BloomFlower } from './BloomFlower';
import { BloomCelebration } from './BloomCelebration';

// Bloom breakdown bar colors — using design-system vars
const BREAKDOWN_BARS = [
  { label: 'Rotina',  key: 'tasksPct'  as const, color: 'var(--vf-lilac)' },
  { label: 'Água',    key: 'waterPct'  as const, color: 'var(--vf-sage)'  },
  { label: 'Espírito',key: 'spiritPct' as const, color: 'var(--vf-rose)'  },
];

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
  }, [bloom.total, celebrado]);

  const titleColor =
    fase === 'total' ? 'var(--vf-champagne)'
    : fase === 'meio' ? 'var(--vf-p)'
    : 'var(--vf-tm)';

  return (
    <>
      <div style={{
        background: 'var(--vf-surf)', borderRadius: 20, padding: '18px 16px',
        border: '1px solid var(--vf-bd)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <BloomFlower pct={bloom.total} size={72} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: titleColor }}>
                {bloom.total}% vitalidade
              </span>
            </div>

            {BREAKDOWN_BARS.map(({ label, key, color }) => (
              <div key={key} style={{ marginBottom: 7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 10, color: 'var(--vf-tx-mute)' }}>{label}</span>
                  <span style={{ fontSize: 10, color: 'var(--vf-tx-mute)' }}>{Math.round(bloom[key])}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--vf-bd)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2, background: color,
                    width: `${Math.min(100, bloom[key])}%`,
                    transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
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
