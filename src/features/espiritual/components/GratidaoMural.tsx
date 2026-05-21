// src/features/espiritual/components/GratidaoMural.tsx
import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { FInput } from '@/shared/ui/FInput';
import { ConfirmDel } from '@/shared/ui/ConfirmDel';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useGratidoesDoDia } from '../selectors';
import { useEspiritualStore } from '../store';
import { GratidaoItem } from './GratidaoItem';
import { today } from '@/shared/utils/date';
import type { ID } from '@/shared/types/common';

export function GratidaoMural() {
  const day   = today();
  const grats = useGratidoesDoDia();
  const adicionarGratidao = useEspiritualStore((s) => s.adicionarGratidao);
  const removerGratidao   = useEspiritualStore((s) => s.removerGratidao);

  const [texto, setTexto]         = useState('');
  const [deletandoId, setDeletandoId] = useState<ID | null>(null);

  const salvar = () => {
    if (!texto.trim()) return;
    adicionarGratidao(day, texto.trim());
    setTexto('');
  };

  const confirmarRemocao = () => {
    if (deletandoId) removerGratidao(day, deletandoId);
    setDeletandoId(null);
  };

  const entradaDeletando = grats.find((g) => g.id === deletandoId);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <FInput
            value={texto}
            onChange={setTexto}
            placeholder="Pelo que voce e grata hoje?"
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

      {grats.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={24} />}
          title="Nenhuma gratidao hoje"
          desc="Agradecer muda a perspectiva do dia"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {grats.map((g) => (
            <GratidaoItem
              key={g.id}
              entry={g}
              onRemove={(id) => setDeletandoId(id)}
            />
          ))}
        </div>
      )}

      {grats.length > 0 && grats.length < 3 && (
        <p style={{ margin: '14px 0 0', fontSize: 12, color: 'var(--vf-tm)', textAlign: 'center' }}>
          {3 - grats.length} a mais para completar 3
        </p>
      )}
      {grats.length >= 3 && (
        <div style={{
          marginTop: 14, textAlign: 'center', padding: '12px 16px', borderRadius: 14,
          background: 'color-mix(in srgb, var(--vf-ok) 10%, transparent)',
          border: '1px solid color-mix(in srgb, var(--vf-ok) 25%, transparent)',
        }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--vf-ok)' }}>
            Gratidao completa!
          </p>
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
