// src/features/saude/components/CycleConfigSheet.tsx
import { useState } from 'react';
import { Sheet }  from '@/shared/ui/Sheet';
import { FInput } from '@/shared/ui/FInput';
import { Btn }    from '@/shared/ui/Btn';
import { usePerfilAtivo } from '../selectors';
import { useSaudeStore } from '../store';
import { today } from '@/shared/utils/date';

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

export function CycleConfigSheet({ isOpen, onClose }: Props) {
  const perfil         = usePerfilAtivo();
  const configurarCiclo = useSaudeStore((s) => s.configurarCiclo);
  const [form, setForm] = useState({
    start:   perfil?.cycle?.start   ?? today(),
    lenDays: String(perfil?.cycle?.lenDays ?? 28),
    menses:  String(perfil?.cycle?.menses  ?? 5),
  });

  if (!isOpen || !perfil) return null;

  const salvar = () => {
    const len = parseInt(form.lenDays, 10);
    const men = parseInt(form.menses, 10);
    if (!form.start || isNaN(len) || isNaN(men)) return;
    configurarCiclo(perfil.id, { start: form.start, lenDays: len, menses: men });
    onClose();
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
