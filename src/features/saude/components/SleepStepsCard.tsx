// src/features/saude/components/SleepStepsCard.tsx
import { useState } from 'react';
import { Moon, Footprints } from 'lucide-react';
import { usePerfilAtivo } from '../selectors';
import { useSaudeStore } from '../store';
import { today } from '@/shared/utils/date';

const SLEEP_OPTIONS = [5, 6, 7, 8, 9];
const STEP_OPTIONS  = [2000, 5000, 8000, 10000];

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 8, borderRadius: 6, background: 'var(--vf-bd)', overflow: 'hidden', marginBottom: 10 }}>
      <div style={{
        height: '100%', borderRadius: 6,
        width: `${Math.min(100, pct)}%`,
        background: color,
        transition: 'width 0.4s ease',
      }} />
    </div>
  );
}

export function SleepStepsCard() {
  const perfil          = usePerfilAtivo();
  const registrarSono   = useSaudeStore((s) => s.registrarSono);
  const registrarPassos = useSaudeStore((s) => s.registrarPassos);
  const [stepInput, setStepInput] = useState('');

  if (!perfil) return null;

  const day        = today();
  const sleepToday = perfil.sleepLog?.[day] ?? 0;
  const stepsToday = perfil.stepsLog?.[day] ?? 0;
  const metaPassos = perfil.metaPassos ?? 8000;
  const sleepPct   = Math.min(100, Math.round((sleepToday / 8) * 100));
  const stepsPct   = metaPassos > 0 ? Math.min(100, Math.round((stepsToday / metaPassos) * 100)) : 0;

  function submitSteps() {
    const n = parseInt(stepInput, 10);
    if (!isNaN(n) && n >= 0) {
      registrarPassos(perfil!.id, day, n);
      setStepInput('');
    }
  }

  return (
    <div style={{
      background: 'var(--vf-s2)', borderRadius: 18, padding: '16px',
      border: '1px solid var(--vf-bd)', display: 'flex', flexDirection: 'column', gap: 18,
    }}>

      {/* Sono */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Moon size={17} color="var(--vf-p)" />
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--vf-t)' }}>Sono</span>
          <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--vf-tm)' }}>
            {sleepToday > 0 ? `${sleepToday}h` : '—'}
          </span>
        </div>
        <ProgressBar pct={sleepPct} color={sleepPct >= 100 ? 'var(--vf-ok)' : 'var(--vf-p)'} />
        <div style={{ display: 'flex', gap: 6 }}>
          {SLEEP_OPTIONS.map((h) => (
            <button
              key={h}
              onClick={() => registrarSono(perfil.id, day, h)}
              style={{
                flex: 1, padding: '7px 4px',
                borderRadius: 10,
                border: sleepToday === h ? 'none' : '1px solid var(--vf-bd)',
                background: sleepToday === h ? 'var(--vf-p)' : 'var(--vf-bg)',
                color: sleepToday === h ? 'var(--vf-on-rose)' : 'var(--vf-t)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      {/* Passos */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Footprints size={17} color="var(--vf-ok)" />
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--vf-t)' }}>Passos</span>
          <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--vf-tm)' }}>
            {stepsToday > 0 ? `${stepsToday.toLocaleString('pt-BR')}` : '—'} / {metaPassos.toLocaleString('pt-BR')}
          </span>
        </div>
        <ProgressBar pct={stepsPct} color={stepsPct >= 100 ? 'var(--vf-ok)' : 'var(--vf-ok)'} />
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {STEP_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => registrarPassos(perfil.id, day, s)}
              style={{
                flex: 1, padding: '7px 4px',
                borderRadius: 10,
                border: stepsToday === s ? 'none' : '1px solid var(--vf-bd)',
                background: stepsToday === s ? 'var(--vf-ok)' : 'var(--vf-bg)',
                color: stepsToday === s ? 'var(--vf-on-rose)' : 'var(--vf-t)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              {(s / 1000).toFixed(0)}k
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="number"
            min={0}
            placeholder="número exato"
            value={stepInput}
            onChange={(e) => setStepInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitSteps()}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 10,
              border: '1px solid var(--vf-bd)', background: 'var(--vf-bg)',
              color: 'var(--vf-t)', fontSize: 13, fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          <button
            onClick={submitSteps}
            style={{
              padding: '8px 14px', borderRadius: 10,
              border: 'none', background: 'var(--vf-p)',
              color: 'var(--vf-on-rose)', fontSize: 13,
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            ok
          </button>
        </div>
      </div>
    </div>
  );
}
