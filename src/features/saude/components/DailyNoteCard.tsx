// src/features/saude/components/DailyNoteCard.tsx
import { useState } from 'react';
import { Send, NotebookPen, History, ChevronDown, ChevronUp } from 'lucide-react';
import { FInput } from '@/shared/ui/FInput';
import { ConfirmDel } from '@/shared/ui/ConfirmDel';
import { useAnotacoesDoDia, useTodasAnotacoes, usePerfilAtivo } from '../selectors';
import { useSaudeStore } from '../store';
import { NoteItem } from './NoteItem';
import { today, formatBR } from '@/shared/utils/date';
import type { ID } from '@/shared/types/common';

export function DailyNoteCard() {
  const perfil           = usePerfilAtivo();
  const day              = today();
  const notas            = useAnotacoesDoDia(day);
  const historico        = useTodasAnotacoes();
  const adicionarAnotacao = useSaudeStore((s) => s.adicionarAnotacao);
  const removerAnotacao   = useSaudeStore((s) => s.removerAnotacao);
  const editarAnotacao    = useSaudeStore((s) => s.editarAnotacao);

  const [texto, setTexto]             = useState('');
  const [deletandoId, setDeletandoId] = useState<ID | null>(null);
  const [editandoId, setEditandoId]   = useState<ID | null>(null);
  const [verHistorico, setVerHistorico] = useState(false);

  if (!perfil) return null;

  const diasPassados = historico.filter((h) => h.data !== day);

  const salvar = () => {
    if (!texto.trim()) return;
    adicionarAnotacao(perfil.id, day, texto.trim());
    setTexto('');
  };

  const confirmarRemocao = () => {
    if (deletandoId) removerAnotacao(perfil.id, day, deletandoId);
    setDeletandoId(null);
  };

  const handleSalvarEdicao = (id: ID, text: string) => {
    editarAnotacao(perfil.id, day, id, text);
    setEditandoId(null);
  };

  const entradaDeletando = notas.find((n) => n.id === deletandoId);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <FInput
            value={texto}
            onChange={setTexto}
            placeholder="Como você está se sentindo hoje?"
          />
        </div>
        <button
          onClick={salvar}
          disabled={!texto.trim()}
          style={{
            width: 44, height: 44, borderRadius: 14,
            background: texto.trim() ? 'var(--vf-p)' : 'var(--vf-bd)',
            border: 'none', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: texto.trim() ? 'pointer' : 'default',
            flexShrink: 0, WebkitTapHighlightColor: 'transparent',
            transition: 'background 0.2s',
          }}
          aria-label="Adicionar"
        >
          <Send size={18} color="#fff" />
        </button>
      </div>

      {notas.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notas.map((n) => (
            <NoteItem
              key={n.id}
              entry={n}
              editando={editandoId === n.id}
              onEditar={(id) => setEditandoId(id)}
              onSalvar={handleSalvarEdicao}
              onCancelar={() => setEditandoId(null)}
              onRemover={(id) => setDeletandoId(id)}
            />
          ))}
        </div>
      )}

      {diasPassados.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <button
            onClick={() => setVerHistorico((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--vf-tx-mute)', fontSize: 12, fontWeight: 600,
              padding: '4px 0', WebkitTapHighlightColor: 'transparent',
            }}
          >
            <History size={13} />
            {verHistorico ? 'Ocultar histórico' : `Ver histórico de notas (${diasPassados.length} dias)`}
            {verHistorico ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {verHistorico && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {diasPassados.map(({ data, entries }) => (
                <div key={data}>
                  <p style={{
                    margin: '0 0 6px', fontSize: 11, fontWeight: 700,
                    color: 'var(--vf-tx-mute)', textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {formatBR(data)}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {entries.map((n) => (
                      <div key={n.id} style={{
                        padding: '10px 14px', borderRadius: 12,
                        background: 'var(--vf-surf)', border: '1px solid var(--vf-bd)',
                        fontSize: 13, color: 'var(--vf-tx)',
                      }}>
                        {n.text}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {deletandoId && entradaDeletando && (
        <ConfirmDel
          label={entradaDeletando.text}
          onCancel={() => setDeletandoId(null)}
          onConfirm={confirmarRemocao}
        />
      )}
    </div>
  );
}
