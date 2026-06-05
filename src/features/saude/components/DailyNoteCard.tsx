// src/features/saude/components/DailyNoteCard.tsx
import { useState, useEffect } from 'react';
import { NotebookPen } from 'lucide-react';
import { useAnotacaoDoDia, usePerfilAtivo } from '../selectors';
import { useSaudeStore } from '../store';
import { today } from '@/shared/utils/date';

export function DailyNoteCard() {
  const perfil          = usePerfilAtivo();
  const nota            = useAnotacaoDoDia();
  const registrarNota   = useSaudeStore((s) => s.registrarAnotacaoDia);
  const [texto, setTexto] = useState(nota);
  const [saved, setSaved]  = useState(false);

  // Idempotente: evita re-render extra durante a janela de sync,
  // quando `nota` pode oscilar (ex.: 'olá' → '' → 'olá').
  useEffect(() => {
    setTexto((prev) => (prev === nota ? prev : nota));
  }, [nota]);

  if (!perfil) return null;

  const salvar = () => {
    registrarNota(perfil.id, today(), texto);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div style={{
      background: 'var(--vf-s2)', borderRadius: 18, padding: '16px',
      border: '1px solid var(--vf-bd)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <NotebookPen size={18} color="var(--vf-p)" />
        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--vf-t)' }}>
          Como estou hoje
        </span>
        {saved && (
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--vf-ok)' }}>
            Salvo
          </span>
        )}
      </div>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onBlur={salvar}
        placeholder="Como voce esta se sentindo hoje?"
        rows={3}
        style={{
          width: '100%', padding: '10px 12px', borderRadius: 12,
          border: '1px solid var(--vf-bd)', background: 'var(--vf-bg)',
          color: 'var(--vf-t)', fontSize: 14, fontFamily: 'inherit',
          resize: 'none', outline: 'none', boxSizing: 'border-box',
        }}
      />
    </div>
  );
}
