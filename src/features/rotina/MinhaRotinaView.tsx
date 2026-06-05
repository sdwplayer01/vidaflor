// src/features/rotina/MinhaRotinaView.tsx
import { useState } from 'react';
import { Plus, CheckSquare } from 'lucide-react';
import { useShallow }            from 'zustand/react/shallow';
import { TurnoSection }         from './components/TurnoSection';
import { AddTaskSheet }         from './components/AddTaskSheet';
import { EssentialModeToggle }  from './components/EssentialModeToggle';
import { useProgressoDoDia }    from './selectors';
import { useRotinaStore }       from './store';
import { EmptyState }           from '@/shared/ui/EmptyState';

export function MinhaRotinaView() {
  const [addOpen, setAddOpen] = useState(false);
  const { feitas, total, pct } = useProgressoDoDia();
  const essMode = useRotinaStore((s) => s.essMode);
  const essential = useRotinaStore(useShallow((s) => s.essential));
  const tarefas   = useRotinaStore(useShallow((s) => s.tarefas));
  const totalTarefas = essMode
    ? essential.length
    : tarefas.manha.length + tarefas.tarde.length + tarefas.noite.length;

  return (
    <div style={{ padding: '0' }}>
      {/* Header progresso */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <EssentialModeToggle />
        {total > 0 && (
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--vf-p)' }}>
            {feitas}/{total} — {pct}%
          </span>
        )}
      </div>

      {totalTarefas === 0 ? (
        <EmptyState
          icon={<CheckSquare size={24} />}
          title="Nenhuma tarefa"
          desc="Adicione tarefas para sua rotina diaria"
        />
      ) : essMode ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Essential mode usa o mesmo componente mas sem turno */}
          <TurnoSection turno="manha" />
          <TurnoSection turno="tarde" />
          <TurnoSection turno="noite" />
        </div>
      ) : (
        <>
          <TurnoSection turno="manha" />
          <TurnoSection turno="tarde" />
          <TurnoSection turno="noite" />
        </>
      )}

      <button
        onClick={() => setAddOpen(true)}
        style={{
          marginTop: 16, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8, width: '100%',
          padding: '14px', borderRadius: 14, border: '2px dashed var(--vf-bd)',
          background: 'transparent', color: 'var(--vf-tm)',
          fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <Plus size={18} /> Adicionar tarefa
      </button>

      <AddTaskSheet isOpen={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
