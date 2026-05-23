// src/features/casa/CasaView.tsx
import { useState } from 'react';
import { Plus, Home } from 'lucide-react';
import { TarefaCasaItem }      from './components/TarefaCasaItem';
import { AddTarefaCasaSheet }  from './components/AddTarefaCasaSheet';
import { EmptyState }          from '@/shared/ui/EmptyState';
import { useShallow }          from 'zustand/react/shallow';
import { useTarefasCasaHoje }  from './selectors';
import { useCasaStore }        from './store';
import { today }               from '@/shared/utils/date';

// Fallback estavel — evita novo [] quando nao ha tarefas feitas no dia
const EMPTY_IDS: string[] = [];

export function CasaView() {
  const [addOpen, setAddOpen] = useState(false);
  const tarefas  = useTarefasCasaHoje();
  const toggle   = useCasaStore((s) => s.toggleTarefaCasa);
  const remover  = useCasaStore((s) => s.removerTarefaCasa);
  const doneIds  = useCasaStore(useShallow((s) => s.done[today()] ?? EMPTY_IDS));

  return (
    <div>
      {tarefas.length === 0 ? (
        <EmptyState
          icon={<Home size={24} />}
          title="Casa em dia!"
          desc="Nenhuma tarefa para hoje. Adicione sua rotina de limpeza."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tarefas.map((t) => (
            <TarefaCasaItem
              key={t.id}
              tarefa={t}
              done={doneIds.includes(t.id)}
              onToggle={(id) => toggle(today(), id)}
              onRemove={remover}
            />
          ))}
        </div>
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

      <AddTarefaCasaSheet isOpen={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
