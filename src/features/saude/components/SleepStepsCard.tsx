// src/features/saude/components/SleepStepsCard.tsx
import { useState } from 'react';
import { Moon, Dumbbell } from 'lucide-react';
import { usePerfilAtivo } from '../selectors';
import { useSaudeStore } from '../store';
import { today } from '@/shared/utils/date';

const SLEEP_OPTIONS = [5, 6, 7, 8, 9];

const ATIVIDADES = ['🚴 Bike', '🚶 Caminhada', '🏃 Corrida', '🏃‍♀️ Esteira'] as const;

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
  const perfil            = usePerfilAtivo();
  const registrarSono     = useSaudeStore((s) => s.registrarSono);
  const registrarAtividade = useSaudeStore((s) => s.registrarAtividade);

  const [outroTexto, setOutroTexto] = useState('');
  const [mostrarOutro, setMostrarOutro] = useState(false);

  if (!perfil) return null;

  const day        = today();
  const sleepToday = perfil.sleepLog?.[day] ?? 0;
  const sleepPct   = Math.min(100, Math.round((sleepToday / 8) * 100));

  const atividadeHoje = perfil.atividadeLog?.[day] ?? '';
  const ativConcluida = atividadeHoje !== '';

  const handleAtividade = (nome: string) => {
    // toggle: clicar no mesmo chip desmarca
    registrarAtividade(perfil.id, day, atividadeHoje === nome ? '' : nome);
  };

  const handleOutro = () => {
    if (!outroTexto.trim()) return;
    registrarAtividade(perfil.id, day, outroTexto.trim());
    setOutroTexto('');
    setMostrarOutro(false);
  };

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
                flex: 1, padding: '7px 4px', borderRadius: 10,
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

      {/* Atividades Físicas */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Dumbbell size={17} color="var(--vf-ok)" />
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--vf-t)' }}>Atividade Física</span>
          <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--vf-tm)' }}>
            {ativConcluida ? atividadeHoje : '—'}
          </span>
        </div>
        <ProgressBar pct={ativConcluida ? 100 : 0} color="var(--vf-ok)" />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {ATIVIDADES.map((a) => (
            <button
              key={a}
              onClick={() => handleAtividade(a)}
              style={{
                padding: '7px 12px', borderRadius: 10, fontSize: 12,
                border: atividadeHoje === a ? 'none' : '1px solid var(--vf-bd)',
                background: atividadeHoje === a ? 'var(--vf-ok)' : 'var(--vf-bg)',
                color: atividadeHoje === a ? '#fff' : 'var(--vf-t)',
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              {a}
            </button>
          ))}
          <button
            onClick={() => setMostrarOutro((v) => !v)}
            style={{
              padding: '7px 12px', borderRadius: 10, fontSize: 12,
              border: mostrarOutro ? 'none' : '1px solid var(--vf-bd)',
              background: mostrarOutro ? 'var(--vf-wn)' : 'var(--vf-bg)',
              color: mostrarOutro ? '#fff' : 'var(--vf-t)',
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            ✏ Outro
          </button>
        </div>

        {mostrarOutro && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              type="text"
              value={outroTexto}
              onChange={(e) => setOutroTexto(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleOutro()}
              placeholder="Qual atividade?"
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 10,
                border: '1px solid var(--vf-bd)', background: 'var(--vf-bg)',
                color: 'var(--vf-t)', fontSize: 13, fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <button
              onClick={handleOutro}
              style={{
                padding: '8px 14px', borderRadius: 10,
                border: 'none', background: 'var(--vf-ok)',
                color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              ok
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
