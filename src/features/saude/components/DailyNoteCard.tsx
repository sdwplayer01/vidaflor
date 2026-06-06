// src/features/saude/components/DailyNoteCard.tsx
import { useState } from 'react';
import { NotebookPen, Pencil, Trash2 } from 'lucide-react';
import { useAnotacaoDoDia, usePerfilAtivo } from '../selectors';
import { useSaudeStore } from '../store';
import { today } from '@/shared/utils/date';

function NoteViewer({
  nota,
  onEditar,
  onApagar,
}: {
  nota:     string;
  onEditar: () => void;
  onApagar: () => void;
}) {
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
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button
            onClick={onEditar}
            aria-label="Editar nota"
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'color-mix(in srgb, var(--vf-p) 12%, transparent)',
              border: 'none', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Pencil size={13} color="var(--vf-p)" />
          </button>
          <button
            onClick={onApagar}
            aria-label="Apagar nota"
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'color-mix(in srgb, var(--vf-er) 10%, transparent)',
              border: 'none', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Trash2 size={13} color="var(--vf-er)" />
          </button>
        </div>
      </div>
      <p style={{
        margin: 0, fontSize: 14, color: 'var(--vf-t)',
        lineHeight: 1.55, whiteSpace: 'pre-wrap',
      }}>
        {nota}
      </p>
    </div>
  );
}

function NoteEditor({
  inicial,
  onSalvar,
  onCancelar,
}: {
  inicial:    string;
  onSalvar:   (t: string) => void;
  onCancelar?: () => void;
}) {
  const [texto, setTexto] = useState(inicial);
  const [saved, setSaved] = useState(false);

  const salvar = () => {
    if (!texto.trim()) return;
    onSalvar(texto);
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
        placeholder="Como você está se sentindo hoje?"
        rows={3}
        style={{
          width: '100%', padding: '10px 12px', borderRadius: 12,
          border: '1px solid var(--vf-bd)', background: 'var(--vf-bg)',
          color: 'var(--vf-t)', fontSize: 14, fontFamily: 'inherit',
          resize: 'none', outline: 'none', boxSizing: 'border-box',
        }}
      />
      {onCancelar && (
        <button
          onClick={onCancelar}
          style={{
            marginTop: 8, background: 'none', border: 'none',
            fontSize: 12, color: 'var(--vf-tx-mute)', cursor: 'pointer',
            padding: '4px 0', WebkitTapHighlightColor: 'transparent',
          }}
        >
          Cancelar
        </button>
      )}
    </div>
  );
}

export function DailyNoteCard() {
  const perfil        = usePerfilAtivo();
  const nota          = useAnotacaoDoDia();
  const registrarNota = useSaudeStore((s) => s.registrarAnotacaoDia);
  const [editando, setEditando] = useState(false);

  if (!perfil) return null;

  const dia = today();

  const handleSalvar = (texto: string) => {
    registrarNota(perfil.id, dia, texto);
    setEditando(false);
  };

  const handleApagar = () => {
    registrarNota(perfil.id, dia, '');
    setEditando(false);
  };

  if (nota && !editando) {
    return (
      <NoteViewer
        nota={nota}
        onEditar={() => setEditando(true)}
        onApagar={handleApagar}
      />
    );
  }

  return (
    <NoteEditor
      key={`${perfil.id}:${dia}:edit`}
      inicial={nota}
      onSalvar={handleSalvar}
      onCancelar={nota ? () => setEditando(false) : undefined}
    />
  );
}
