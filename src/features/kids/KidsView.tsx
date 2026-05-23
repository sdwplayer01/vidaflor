// src/features/kids/KidsView.tsx
import { useState } from 'react';
import { Plus, Baby } from 'lucide-react';
import { KidSwitcher }       from './components/KidSwitcher';
import { KidTaskItem }       from './components/KidTaskItem';
import { KidProgressRing }   from './components/KidProgressRing';
import { AddKidSheet }       from './components/AddKidSheet';
import { AddKidTaskSheet }   from './components/AddKidTaskSheet';
import { EmptyState }        from '@/shared/ui/EmptyState';
import { useShallow } from 'zustand/react/shallow';
import { useCriancaAtiva, useProgressoCrianca } from './selectors';
import { useKidsStore } from './store';
import { today } from '@/shared/utils/date';

// Fallback estavel para dias sem tarefas concluidas — evita novo [] por render
const EMPTY_IDS: string[] = [];

export function KidsView() {
  const [addKid,  setAddKid]  = useState(false);
  const [addTask, setAddTask] = useState(false);
  const crianca  = useCriancaAtiva();
  const prog     = useProgressoCrianca(crianca?.id ?? '', today());
  const doneIds  = useKidsStore(useShallow((s) => s.done[today()] ?? EMPTY_IDS));
  const toggle   = useKidsStore((s) => s.toggleTarefaKid);
  const remover  = useKidsStore((s) => s.removerTarefaKid);

  if (!crianca) {
    return (
      <>
        <EmptyState
          icon={<Baby size={24} />}
          title="Nenhuma crianca cadastrada"
          desc="Adicione os pequenos para acompanhar a rotina deles"
        />
        <button
          onClick={() => setAddKid(true)}
          style={{
            marginTop: 16, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8, width: '100%',
            padding: '14px', borderRadius: 14, border: '2px dashed var(--vf-bd)',
            background: 'transparent', color: 'var(--vf-tm)',
            fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <Plus size={18} /> Adicionar crianca
        </button>
        <AddKidSheet isOpen={addKid} onClose={() => setAddKid(false)} />
      </>
    );
  }

  return (
    <div>
      <KidSwitcher />

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

      <AddKidSheet isOpen={addKid} onClose={() => setAddKid(false)} />
      <AddKidTaskSheet kidId={crianca.id} isOpen={addTask} onClose={() => setAddTask(false)} />
    </div>
  );
}
