// src/features/financas/components/RevisaoTab.tsx
// Fatia 2 — Revisão reflexiva: reflexão mensal (4 perguntas), foco do mês
// (objetivo → resultado) e conquistas do ano (3 campos).
import { useState, useRef, useEffect } from 'react';
import { PERGUNTAS_REFLEXAO, CONQUISTAS_COUNT } from '../revisao';
import { useReflexaoMes, useFocoMes, useConquistasAno } from '../selectors';
import { useFinancasStore } from '../store';
import type { IsoMonth, FocoMes } from '../types';

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function nomeMes(mes: IsoMonth): string {
  const [, m] = mes.split('-').map(Number) as [number, number];
  return MESES[m - 1] ?? '';
}

// ── Textarea com auto-save debounced ──────────────────────────────────────────
// Estado local semeado 1x (sem efeito-espelho). O remount via `key` no pai
// reseta o valor ao trocar de mês/ano. Commit debounced 400ms + onBlur.
function AutoTextarea({
  inicial, onCommit, label, placeholder,
}: {
  inicial:      string;
  onCommit:     (v: string) => void;
  label:        string;
  placeholder?: string;
}) {
  const [valor, setValor] = useState(inicial);
  const timer     = useRef<ReturnType<typeof setTimeout>>();
  const commitRef = useRef(onCommit);
  commitRef.current = onCommit;

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const handleChange = (v: string) => {
    setValor(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => commitRef.current(v), 400);
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block', fontSize: 13, fontWeight: 600,
        color: 'var(--vf-tx)', marginBottom: 6,
      }}>
        {label}
      </label>
      <textarea
        value={valor}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => commitRef.current(valor)}
        placeholder={placeholder ?? 'Escreva aqui…'}
        rows={2}
        style={{
          width: '100%', boxSizing: 'border-box', resize: 'vertical',
          padding: '10px 12px', borderRadius: 12,
          border: '1.5px solid var(--vf-bd)',
          background: 'var(--vf-s2)', color: 'var(--vf-t)',
          fontSize: 13, fontFamily: 'inherit', lineHeight: 1.5,
          outline: 'none',
        }}
      />
    </div>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--vf-surf)', borderRadius: 'var(--vf-r-xl)',
      border: '1px solid var(--vf-bd)', padding: '16px 16px 4px',
    }}>
      <div className="vf-eyebrow" style={{ marginBottom: 12 }}>{titulo}</div>
      {children}
    </div>
  );
}

export function RevisaoTab({ mes }: { mes: IsoMonth }) {
  const ano = mes.split('-')[0] ?? '';

  const reflexao   = useReflexaoMes(mes);
  const foco       = useFocoMes(mes);
  const conquistas = useConquistasAno(ano);

  const setReflexao  = useFinancasStore((s) => s.setReflexao);
  const setFoco      = useFinancasStore((s) => s.setFoco);
  const setConquista = useFinancasStore((s) => s.setConquista);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Reflexão mensal */}
      <Secao titulo={`reflexão — ${nomeMes(mes)}`}>
        {PERGUNTAS_REFLEXAO.map((pergunta, i) => {
          const qKey = `q${i + 1}`;
          return (
            <AutoTextarea
              key={`${mes}-${qKey}`}
              label={pergunta}
              inicial={reflexao[qKey] ?? ''}
              onCommit={(v) => setReflexao(mes, qKey, v)}
            />
          );
        })}
      </Secao>

      {/* Foco do mês */}
      <Secao titulo="foco do mês">
        <AutoTextarea
          key={`${mes}-foco-objetivo`}
          label="Objetivo financeiro do mês"
          placeholder="Ex.: Quitar parcela X, poupar R$ Y…"
          inicial={foco.objetivo}
          onCommit={(v) => setFoco(mes, 'objetivo' as keyof FocoMes, v)}
        />
        <AutoTextarea
          key={`${mes}-foco-resultado`}
          label="Resultado alcançado"
          placeholder="Como foi na prática?"
          inicial={foco.resultado}
          onCommit={(v) => setFoco(mes, 'resultado' as keyof FocoMes, v)}
        />
      </Secao>

      {/* Conquistas do ano */}
      <Secao titulo={`conquistas de ${ano}`}>
        {Array.from({ length: CONQUISTAS_COUNT }, (_, i) => {
          const cKey = `c${i + 1}`;
          return (
            <AutoTextarea
              key={`${ano}-${cKey}`}
              label={`Conquista ${i + 1}`}
              placeholder="Registre uma vitória do ano…"
              inicial={conquistas[cKey] ?? ''}
              onCommit={(v) => setConquista(ano, cKey, v)}
            />
          );
        })}
      </Secao>
    </div>
  );
}
