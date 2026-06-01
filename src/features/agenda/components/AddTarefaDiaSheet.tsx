// src/features/agenda/components/AddTarefaDiaSheet.tsx
// 4c: adicionar tarefa ao dia (avulsa ou recorrente)
import { useState } from 'react';
import { Sheet }    from '@/shared/ui/Sheet';
import { FInput }   from '@/shared/ui/FInput';
import { Btn }      from '@/shared/ui/Btn';
import { useAgendaStore }    from '../store';
import { useNovaTarefaData } from '../selectors';
import type { Turno, MemberId } from '../types';
import type { ISODate } from '@/shared/types/common';

interface Props {
  isOpen:  boolean;
  onClose: () => void;
  date:    ISODate;
}

const TURNOS: { key: Turno; label: string; emoji: string }[] = [
  { key: 'manha', label: 'Manhã',  emoji: '🌅' },
  { key: 'tarde', label: 'Tarde',  emoji: '☀️' },
  { key: 'noite', label: 'Noite',  emoji: '🌙' },
];

function ChipBtn({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px', borderRadius: 99, fontSize: 12,
        border: `1.5px solid ${active ? 'var(--vf-rose)' : 'var(--vf-bd)'}`,
        background: active ? 'color-mix(in srgb, var(--vf-rose) 12%, transparent)' : 'var(--vf-surf)',
        color: active ? 'var(--vf-rose)' : 'var(--vf-tx-mute)',
        fontWeight: active ? 700 : 400,
        cursor: 'pointer', fontFamily: 'inherit',
        WebkitTapHighlightColor: 'transparent',
      }}
    >{children}</button>
  );
}

export function AddTarefaDiaSheet({ isOpen, onClose, date }: Props) {
  const adicionarAgenda = useAgendaStore((s) => s.adicionarTarefa);
  const { adicionarTarefaRotina: adicionarRotina, criancas } = useNovaTarefaData();

  const [title,    setTitle]    = useState('');
  const [turno,    setTurno]    = useState<Turno>('manha');
  const [time,     setTime]     = useState('');
  const [assignee, setAssignee] = useState<MemberId>('voce');
  const [repetir,  setRepetir]  = useState(false);

  if (!isOpen) return null;
  const valido = title.trim().length > 0;

  const salvar = () => {
    if (!valido) return;
    if (repetir) {
      // Recorrente → rotina (aparece todos os dias no turno)
      adicionarRotina(turno, title.trim(), time || undefined);
    } else {
      // Avulsa → agenda para a data
      adicionarAgenda({
        title:    title.trim(),
        date,
        turno,
        time:     time || undefined,
        assignee,
      });
    }
    setTitle(''); setTurno('manha'); setTime(''); setAssignee('voce'); setRepetir(false);
    onClose();
  };

  return (
    <Sheet title="Nova tarefa" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        <FInput value={title} onChange={setTitle} placeholder="O que precisa ser feito?" />

        {/* Turno */}
        <div>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: 'var(--vf-tx-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Turno</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {TURNOS.map(({ key, label, emoji }) => (
              <ChipBtn key={key} active={turno === key} onClick={() => setTurno(key)}>
                {emoji} {label}
              </ChipBtn>
            ))}
          </div>
        </div>

        {/* Horário */}
        <FInput value={time} onChange={setTime} placeholder="Horário (opcional)" type="time" />

        {/* Responsável */}
        <div>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: 'var(--vf-tx-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Para quem</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <ChipBtn active={assignee === 'voce'} onClick={() => setAssignee('voce')}>
              🌸 Você
            </ChipBtn>
            {criancas.map((c) => (
              <ChipBtn key={c.id} active={assignee === c.id} onClick={() => setAssignee(c.id)}>
                {c.avatar} {c.name}
              </ChipBtn>
            ))}
          </div>
        </div>

        {/* Repetir toggle */}
        <button
          onClick={() => setRepetir((v) => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12,
            background: 'var(--vf-surf)', border: '1px solid var(--vf-bd)',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <div style={{
            width: 36, height: 20, borderRadius: 10, position: 'relative',
            background: repetir ? 'var(--vf-rose)' : 'var(--vf-bd)',
            transition: 'background 0.2s',
          }}>
            <div style={{
              position: 'absolute', top: 2, left: repetir ? 18 : 2,
              width: 16, height: 16, borderRadius: 8, background: '#fff',
              transition: 'left 0.2s',
            }} />
          </div>
          <span style={{ fontSize: 13, color: 'var(--vf-tx)', fontWeight: 600 }}>
            Repetir todos os dias
          </span>
        </button>

        {repetir && (
          <p style={{ margin: 0, fontSize: 12, color: 'var(--vf-tx-mute)', fontStyle: 'italic', padding: '0 4px' }}>
            A tarefa será adicionada à sua rotina diária no turno escolhido.
          </p>
        )}

        <Btn onClick={salvar} disabled={!valido}>Adicionar</Btn>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Sheet>
  );
}
