// src/features/kids/KidsView.tsx
import { useState } from 'react';
import { Plus, Baby, Pencil, Check } from 'lucide-react';
import { KidSwitcher }       from './components/KidSwitcher';
import { KidTaskItem }       from './components/KidTaskItem';
import { KidProgressRing }   from './components/KidProgressRing';
import { AddKidSheet }       from './components/AddKidSheet';
import { AddKidTaskSheet }   from './components/AddKidTaskSheet';
import { EmptyState }        from '@/shared/ui/EmptyState';
import { useShallow }        from 'zustand/react/shallow';
import { useCriancaAtiva, useProgressoCrianca } from './selectors';
import { useKidsStore }      from './store';
import { useTarefasDelegadas } from '@/features/agenda/selectors';
import { useAgendaStore }    from '@/features/agenda/store';
import { today }             from '@/shared/utils/date';
import type { Crianca }      from './types';

const EMPTY_IDS: string[] = [];

export function KidsView() {
  const [addKid,       setAddKid]       = useState(false);
  const [editandoKid,  setEditandoKid]  = useState<Crianca | undefined>(undefined);
  const [addTask,      setAddTask]      = useState(false);

  const crianca  = useCriancaAtiva();
  const prog     = useProgressoCrianca(crianca?.id ?? '', today());
  const doneIds  = useKidsStore(useShallow((s) => s.done[today()] ?? EMPTY_IDS));
  const toggle   = useKidsStore((s) => s.toggleTarefaKid);
  const remover  = useKidsStore((s) => s.removerTarefaKid);

  // Tarefas delegadas via CapturaRapida — hooks ANTES do early return (regra de hooks)
  const delegadas       = useTarefasDelegadas(crianca?.id ?? '', today());
  const agendaDoneIds   = useAgendaStore(useShallow((s) => s.done[today()] ?? EMPTY_IDS));
  const toggleDelegada  = useAgendaStore((s) => s.toggleTarefa);

  const abrirAdicionarKid = () => { setEditandoKid(undefined); setAddKid(true); };
  const abrirEditarKid    = (c: Crianca) => { setEditandoKid(c); setAddKid(true); };

  if (!crianca) {
    return (
      <>
        <EmptyState
          icon={<Baby size={24} />}
          title="Nenhuma criança cadastrada"
          desc="Adicione os pequenos para acompanhar a rotina deles"
        />
        <button
          onClick={abrirAdicionarKid}
          style={{
            marginTop: 16, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8, width: '100%',
            padding: '14px', borderRadius: 14, border: '2px dashed var(--vf-bd)',
            background: 'transparent', color: 'var(--vf-tm)',
            fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <Plus size={18} /> Adicionar criança
        </button>
        <AddKidSheet isOpen={addKid} onClose={() => setAddKid(false)} criancaEditando={editandoKid} />
      </>
    );
  }

  return (
    <div>
      <KidSwitcher onAdd={abrirAdicionarKid} />

      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 16, padding: '12px 14px',
        background: 'var(--vf-s2)', borderRadius: 16,
        border: '1px solid var(--vf-bd)',
      }}>
        <span style={{ fontSize: 32 }}>{crianca.avatar}</span>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: 'var(--vf-t)' }}>{crianca.name}</p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--vf-tm)' }}>{crianca.age} anos</p>
        </div>
        <button
          onClick={() => abrirEditarKid(crianca)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--vf-tm)', padding: 6, borderRadius: 8,
            display: 'flex', alignItems: 'center',
          }}
          aria-label="Editar criança"
        >
          <Pencil size={15} />
        </button>
        <KidProgressRing pct={prog.pct} color={crianca.color} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {crianca.tasks.map((t) => (
          <KidTaskItem
            key={t.id}
            tarefa={t}
            done={doneIds.includes(t.id)}
            onToggle={(id) => toggle(today(), id)}
            onRemove={(id) => remover(crianca.id, id)}
          />
        ))}
      </div>

      {delegadas.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <p style={{ margin: '0 0 6px 2px', fontSize: 11, fontWeight: 700, color: 'var(--vf-tx-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Delegadas hoje
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {delegadas.map((t) => {
              const done = agendaDoneIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleDelegada(today(), t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 14px', borderRadius: 12, width: '100%', textAlign: 'left',
                    background: 'var(--vf-surf)', border: '1px solid var(--vf-bd)',
                    cursor: 'pointer', opacity: done ? 0.5 : 1,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    background: done ? 'var(--vf-ok)' : 'transparent',
                    border: done ? 'none' : '2px solid var(--vf-bd)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {done && <Check size={11} color="#fff" strokeWidth={2.5} />}
                  </div>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--vf-tx)', textDecoration: done ? 'line-through' : 'none' }}>
                    {t.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => setAddTask(true)}
        style={{
          marginTop: 12, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8, width: '100%',
          padding: '12px', borderRadius: 14, border: '2px dashed var(--vf-bd)',
          background: 'transparent', color: 'var(--vf-tm)',
          fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <Plus size={18} /> Tarefa
      </button>

      <AddKidSheet isOpen={addKid} onClose={() => { setAddKid(false); setEditandoKid(undefined); }} criancaEditando={editandoKid} />
      <AddKidTaskSheet kidId={crianca.id} isOpen={addTask} onClose={() => setAddTask(false)} />
    </div>
  );
}
