// src/features/saude/components/CycleConfigSheet.tsx
import { useState } from 'react';
import { Sheet }  from '@/shared/ui/Sheet';
import { FInput } from '@/shared/ui/FInput';
import { Btn }    from '@/shared/ui/Btn';
import { usePerfilAtivo } from '../selectors';
import { useSaudeStore } from '../store';
import { today } from '@/shared/utils/date';
import type { CycleConfig } from '../types';

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

interface FormProps {
  perfilId: string;
  cycle:    CycleConfig | undefined;
  onSave:   (cfg: CycleConfig) => void;
  onClose:  () => void;
}

function CycleConfigForm({ perfilId: _perfilId, cycle, onSave, onClose }: FormProps) {
  const [form, setForm] = useState({
    start:   cycle?.start   ?? today(),
    lenDays: String(cycle?.lenDays ?? 28),
    menses:  String(cycle?.menses  ?? 5),
  });

  const salvar = () => {
    const len = parseInt(form.lenDays, 10);
    const men = parseInt(form.menses, 10);
    if (!form.start || isNaN(len) || isNaN(men)) return;
    onSave({ start: form.start, lenDays: len, menses: men });
  };

  const valido =
    form.start.length === 10 &&
    parseInt(form.lenDays, 10) > 0 &&
    parseInt(form.menses, 10) > 0;

  return (
    <Sheet title="Configurar Ciclo" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FInput
          value={form.start}
          onChange={(v) => setForm((f) => ({ ...f, start: v }))}
          placeholder="Inicio do ultimo ciclo (AAAA-MM-DD)"
          type="date"
        />
        <FInput
          value={form.lenDays}
          onChange={(v) => setForm((f) => ({ ...f, lenDays: v }))}
          placeholder="Duracao do ciclo (dias)"
          type="number"
        />
        <FInput
          value={form.menses}
          onChange={(v) => setForm((f) => ({ ...f, menses: v }))}
          placeholder="Dias de menstruacao"
          type="number"
        />
        <Btn onClick={salvar} disabled={!valido}>Salvar</Btn>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Sheet>
  );
}

export function CycleConfigSheet({ isOpen, onClose }: Props) {
  const perfil          = usePerfilAtivo();
  const configurarCiclo = useSaudeStore((s) => s.configurarCiclo);

  if (!isOpen || !perfil) return null;

  return (
    <CycleConfigForm
      key={perfil.id}
      perfilId={perfil.id}
      cycle={perfil.cycle}
      onSave={(cfg) => { configurarCiclo(perfil.id, cfg); onClose(); }}
      onClose={onClose}
    />
  );
}
