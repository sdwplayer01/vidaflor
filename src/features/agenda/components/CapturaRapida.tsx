// src/features/agenda/components/CapturaRapida.tsx
// 4c: caixa de captura rápida → roteador tarefa/compra
import { useState } from 'react';
import { ArrowRight, ShoppingCart, CheckSquare, X } from 'lucide-react';
import { FInput }          from '@/shared/ui/FInput';
import { Btn }             from '@/shared/ui/Btn';
import { useAgendaStore }   from '../store';
import { useCapturaRouter } from '../selectors';
import { useShallow }       from 'zustand/react/shallow';
import type { Turno, MemberId } from '../types';
import type { ISODate, ID } from '@/shared/types/common';

interface Props {
  date: ISODate;
}

const TURNOS: { key: Turno; label: string }[] = [
  { key: 'manha', label: '🌅 Manhã' },
  { key: 'tarde', label: '☀️ Tarde' },
  { key: 'noite', label: '🌙 Noite' },
];

function MiniChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 10px', borderRadius: 99, fontSize: 11,
        border: `1.5px solid ${active ? 'var(--vf-rose)' : 'var(--vf-bd)'}`,
        background: active ? 'color-mix(in srgb, var(--vf-rose) 12%, transparent)' : 'transparent',
        color: active ? 'var(--vf-rose)' : 'var(--vf-tx-mute)',
        fontWeight: active ? 700 : 400,
        cursor: 'pointer', fontFamily: 'inherit',
      }}
    >{children}</button>
  );
}

interface RouterProps {
  capturaId: ID;
  text:      string;
  date:      ISODate;
  onDone:    () => void;
}

function CapturaRouter({ capturaId, text, date, onDone }: RouterProps) {
  const [modo,     setModo]     = useState<'router' | 'tarefa'>('router');
  const [turno,    setTurno]    = useState<Turno>('manha');
  const [assignee, setAssignee] = useState<MemberId>('voce');

  const removerCaptura  = useAgendaStore((s) => s.removerCaptura);
  const adicionarTarefa = useAgendaStore((s) => s.adicionarTarefa);
  const { adicionarItemCompra: adicionarCompra, criancas } = useCapturaRouter();

  const irCompra = () => {
    adicionarCompra({ name: text, category: "Mercearia" });
    removerCaptura(capturaId);
    onDone();
  };

  const irTarefa = () => {
    if (modo === 'router') { setModo('tarefa'); return; }
    adicionarTarefa({ title: text, date, turno, assignee });
    removerCaptura(capturaId);
    onDone();
  };

  return (
    <div style={{
      padding: '10px 12px', borderRadius: 12,
      background: 'var(--vf-surf)', border: '1px solid var(--vf-bd)',
    }}>
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--vf-tx)' }}>{text}</p>

      {modo === 'tarefa' && (
        <div style={{ marginBottom: 10 }}>
          {/* Turno */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
            {TURNOS.map(({ key, label }) => (
              <MiniChip key={key} active={turno === key} onClick={() => setTurno(key)}>{label}</MiniChip>
            ))}
          </div>
          {/* Responsável */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <MiniChip active={assignee === 'voce'} onClick={() => setAssignee('voce')}>🌸 Você</MiniChip>
            {criancas.map((c) => (
              <MiniChip key={c.id} active={assignee === c.id} onClick={() => setAssignee(c.id)}>
                {c.avatar} {c.name}
              </MiniChip>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={irTarefa}
          style={{
            flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: 'color-mix(in srgb, var(--vf-rose) 12%, transparent)',
            border: '1px solid var(--vf-rose)', color: 'var(--vf-rose)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}
        >
          <CheckSquare size={13} />
          {modo === 'router' ? '→ Tarefa' : 'Confirmar'}
        </button>
        <button
          onClick={irCompra}
          style={{
            flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: 'color-mix(in srgb, var(--vf-source-casa) 12%, transparent)',
            border: '1px solid var(--vf-source-casa)', color: 'var(--vf-source-casa)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}
        >
          <ShoppingCart size={13} />→ Compra
        </button>
      </div>
    </div>
  );
}

export function CapturaRapida({ date }: Props) {
  const captura        = useAgendaStore(useShallow((s) => s.captura));
  const adicionarCaptura = useAgendaStore((s) => s.adicionarCaptura);
  const removerCaptura   = useAgendaStore((s) => s.removerCaptura);

  const [texto,      setTexto]      = useState('');
  const [roteandoId, setRoteandoId] = useState<ID | null>(null);

  const submeter = () => {
    const t = texto.trim();
    if (!t) return;
    adicionarCaptura(t);
    setTexto('');
  };

  return (
    <div style={{
      padding: '12px 14px', borderRadius: 14,
      background: 'var(--vf-surf)', border: '1px solid var(--vf-bd)', marginTop: 4,
    }}>
      <p style={{
        margin: '0 0 8px', fontSize: 11, fontWeight: 700,
        color: 'var(--vf-tx-mute)', textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>Captura rápida</p>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <FInput
            value={texto}
            onChange={setTexto}
            placeholder="Joga aqui o que não pode esquecer…"
          />
        </div>
        <button
          onClick={submeter}
          disabled={!texto.trim()}
          style={{
            padding: '0 14px', borderRadius: 10, flexShrink: 0,
            background: texto.trim() ? 'var(--vf-rose)' : 'var(--vf-bd)',
            border: 'none', color: '#fff', cursor: texto.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center',
          }}
        >
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Lista de capturas */}
      {captura.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {captura.map((c) => (
            roteandoId === c.id
              ? (
                <CapturaRouter
                  key={c.id}
                  capturaId={c.id}
                  text={c.text}
                  date={date}
                  onDone={() => setRoteandoId(null)}
                />
              )
              : (
                <div
                  key={c.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px', borderRadius: 10,
                    background: 'var(--vf-alt)', border: '1px solid var(--vf-bd)',
                  }}
                >
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--vf-tx)' }}>{c.text}</span>
                  <button
                    onClick={() => setRoteandoId(c.id)}
                    style={{
                      padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                      background: 'var(--vf-rose)', border: 'none', color: '#fff',
                      cursor: 'pointer',
                    }}
                  >Rotear</button>
                  <button
                    onClick={() => removerCaptura(c.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--vf-tx-mute)', padding: 2,
                      display: 'flex', alignItems: 'center',
                    }}
                    aria-label="Remover captura"
                  >
                    <X size={13} />
                  </button>
                </div>
              )
          ))}
        </div>
      )}
    </div>
  );
}
