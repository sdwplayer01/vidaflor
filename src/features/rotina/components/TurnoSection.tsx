// src/features/rotina/components/TurnoSection.tsx
import { useRotinaStore } from '../store';
import { useTarefasDoTurno, useTarefasFeitasDoDia } from '../selectors';
import { TaskItem } from './TaskItem';
import { today } from '@/shared/utils/date';
import type { Turno } from '../types';

const TURNO_LABELS: Record<Turno, string> = {
  manha: 'Manha',
  tarde: 'Tarde',
  noite: 'Noite',
};

interface Props { turno: Turno }

export function TurnoSection({ turno }: Props) {
  const tarefas      = useTarefasDoTurno(turno);
  const feitasIds    = useTarefasFeitasDoDia();
  const toggleTarefa = useRotinaStore((s) => s.toggleTarefa);
  const removerTarefa= useRotinaStore((s) => s.removerTarefa);
  const day          = today();

  if (tarefas.length === 0) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{
        margin: '0 0 8px', fontSize: 11, fontWeight: 700,
        color: 'var(--vf-tm)', textTransform: 'uppercase', letterSpacing: 1,
      }}>
        {TURNO_LABELS[turno]}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tarefas.map((t) => (
          <TaskItem
            key={t.id}
            tarefa={t}
            done={feitasIds.includes(t.id)}
            onToggle={(id) => toggleTarefa(day, id)}
            onRemove={removerTarefa}
          />
        ))}
      </div>
    </div>
  );
}
