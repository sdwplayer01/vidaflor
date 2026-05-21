// src/features/saude/components/MedicationList.tsx
import { useState } from 'react';
import { Pill } from 'lucide-react';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ConfirmDel } from '@/shared/ui/ConfirmDel';
import { useMedicamentosDoDia, usePerfilAtivo } from '../selectors';
import { useSaudeStore } from '../store';
import { MedicationItem } from './MedicationItem';
import type { ID } from '@/shared/types/common';

export function MedicationList() {
  const perfil          = usePerfilAtivo();
  const meds            = useMedicamentosDoDia();
  const removerMed      = useSaudeStore((s) => s.removerMedicamento);
  const [deletandoId, setDeletandoId] = useState<ID | null>(null);

  if (!perfil) return null;

  const medDeletando = meds.find((m) => m.id === deletandoId);

  if (meds.length === 0) {
    return (
      <EmptyState
        icon={<Pill size={24} />}
        title="Nenhum medicamento"
        desc="Adicione seus remedios diarios"
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {meds.map((m) => (
          <MedicationItem
            key={m.id}
            med={m}
            onRemove={(id) => setDeletandoId(id)}
          />
        ))}
      </div>

      {deletandoId && medDeletando && (
        <ConfirmDel
          label={medDeletando.name}
          onCancel={() => setDeletandoId(null)}
          onConfirm={() => {
            removerMed(perfil.id, deletandoId);
            setDeletandoId(null);
          }}
        />
      )}
    </div>
  );
}
