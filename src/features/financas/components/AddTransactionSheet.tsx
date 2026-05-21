// src/features/financas/components/AddTransactionSheet.tsx
import { useState } from 'react';
import { Sheet }  from '@/shared/ui/Sheet';
import { FInput } from '@/shared/ui/FInput';
import { Btn }    from '@/shared/ui/Btn';
import { CategoryChips } from './CategoryChips';
import { useFinancasStore } from '../store';
import { today } from '@/shared/utils/date';
import type { TransactionType } from '../types';

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

export function AddTransactionSheet({ isOpen, onClose }: Props) {
  const adicionarTransacao = useFinancasStore((s) => s.adicionarTransacao);
  const adicionarParcelada = useFinancasStore((s) => s.adicionarParcelada);
  const [form, setForm] = useState({
    desc:      '',
    amount:    '',
    type:      'expense' as TransactionType,
    category:  'outros',
    date:      today(),
    due:       '',
    parcelado: false,
    parcelas:  '1',
    cardId:    null as string | null,
  });

  if (!isOpen) return null;

  const amountCents = Math.round(parseFloat(form.amount.replace(',', '.')) * 100) || 0;
  const valido = form.desc.trim().length > 0 && amountCents > 0;

  const salvar = () => {
    if (!valido) return;
    if (form.parcelado && parseInt(form.parcelas) > 1) {
      adicionarParcelada({
        desc:         form.desc.trim(),
        totalAmount:  amountCents,
        totalParcelas:parseInt(form.parcelas),
        firstDate:    form.date,
        category:     form.category,
        cardId:       form.cardId,
      });
    } else {
      adicionarTransacao({
        desc:     form.desc.trim(),
        amount:   amountCents,
        type:     form.type,
        category: form.category,
        date:     form.date,
        due:      form.due || undefined,
        paid:     false,
        cardId:   form.cardId,
      });
    }
    setForm({ desc: '', amount: '', type: 'expense', category: 'outros', date: today(), due: '', parcelado: false, parcelas: '1', cardId: null });
    onClose();
  };

  return (
    <Sheet title="Nova Transacao" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['expense', 'income'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setForm((f) => ({ ...f, type: t }))}
              style={{
                flex: 1, padding: '10px', borderRadius: 12, fontSize: 13,
                border: `2px solid ${form.type === t ? (t === 'income' ? 'var(--vf-ok)' : 'var(--vf-er)') : 'var(--vf-bd)'}`,
                background: form.type === t ? (t === 'income' ? 'color-mix(in srgb, var(--vf-ok) 12%, transparent)' : 'color-mix(in srgb, var(--vf-er) 12%, transparent)') : 'var(--vf-bg)',
                color: form.type === t ? (t === 'income' ? 'var(--vf-ok)' : 'var(--vf-er)') : 'var(--vf-tm)',
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {t === 'income' ? 'Entrada' : 'Saida'}
            </button>
          ))}
        </div>
        <FInput value={form.desc} onChange={(v) => setForm((f) => ({ ...f, desc: v }))} placeholder="Descricao" />
        <FInput value={form.amount} onChange={(v) => setForm((f) => ({ ...f, amount: v }))} placeholder="Valor (ex: 150,00)" type="number" />
        <FInput value={form.date} onChange={(v) => setForm((f) => ({ ...f, date: v }))} placeholder="Data" type="date" />
        <CategoryChips value={form.category} onChange={(c) => setForm((f) => ({ ...f, category: c }))} />

        {form.type === 'expense' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--vf-t)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.parcelado}
              onChange={(e) => setForm((f) => ({ ...f, parcelado: e.target.checked }))}
            />
            Parcelado
          </label>
        )}
        {form.parcelado && (
          <FInput value={form.parcelas} onChange={(v) => setForm((f) => ({ ...f, parcelas: v }))} placeholder="Numero de parcelas" type="number" />
        )}

        <Btn onClick={salvar} disabled={!valido}>
          {form.parcelado && parseInt(form.parcelas) > 1
            ? `Criar ${form.parcelas}x`
            : 'Adicionar'}
        </Btn>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Sheet>
  );
}
