// src/features/saude/components/NoteItem.tsx
import { useState } from 'react';
import { NotebookPen, Pencil, Trash2 } from 'lucide-react';
import type { NoteEntry } from '../types';
import type { ID } from '@/shared/types/common';

interface Props {
  entry:      NoteEntry;
  editando:   boolean;
  onEditar:   (id: ID) => void;
  onSalvar:   (id: ID, text: string) => void;
  onCancelar: () => void;
  onRemover:  (id: ID) => void;
}

export function NoteItem({ entry, editando, onEditar, onSalvar, onCancelar, onRemover }: Props) {
  const [texto, setTexto] = useState(entry.text);

  if (editando) {
    return (
      <div style={{
        padding: '14px 16px', borderRadius: 16,
        background: 'var(--vf-surf)', border: '1px solid var(--vf-bd)',
      }}>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          style={{
            width: '100%', padding: '8px 10px', borderRadius: 10,
            border: '1px solid var(--vf-bd)', background: 'var(--vf-bg)',
            color: 'var(--vf-tx)', fontSize: 13, fontFamily: 'inherit',
            resize: 'none', outline: 'none', boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <button
            onClick={() => onSalvar(entry.id, texto)}
            disabled={!texto.trim()}
            style={{
              padding: '6px 14px', borderRadius: 8, border: 'none',
              background: texto.trim() ? 'var(--vf-p)' : 'var(--vf-bd)',
              color: '#fff', fontSize: 12, fontWeight: 700,
              cursor: texto.trim() ? 'pointer' : 'default', fontFamily: 'inherit',
            }}
          >
            Salvar
          </button>
          <button
            onClick={onCancelar}
            style={{
              background: 'none', border: 'none', fontSize: 12,
              color: 'var(--vf-tx-mute)', cursor: 'pointer',
              padding: '6px 0', fontFamily: 'inherit',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px', borderRadius: 16,
      background: 'var(--vf-surf)', border: '1px solid var(--vf-bd)',
    }}>
      <NotebookPen size={16} color="var(--vf-p)" style={{ flexShrink: 0 }} />
      <p style={{ margin: 0, fontSize: 14, color: 'var(--vf-tx)', flex: 1, whiteSpace: 'pre-wrap' }}>
        {entry.text}
      </p>
      <button
        onClick={() => onEditar(entry.id)}
        style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'color-mix(in srgb, var(--vf-p) 12%, transparent)',
          border: 'none', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
        aria-label="Editar nota"
      >
        <Pencil size={13} color="var(--vf-p)" />
      </button>
      <button
        onClick={() => onRemover(entry.id)}
        style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'color-mix(in srgb, var(--vf-er) 10%, transparent)',
          border: 'none', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
        aria-label="Remover nota"
      >
        <Trash2 size={13} color="var(--vf-er)" />
      </button>
    </div>
  );
}
