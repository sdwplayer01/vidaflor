// src/features/financas/components/AddTransactionSheet.tsx
// Item 9: modo de edicao via txId opcional
// Item 11: campo valorBruto para parceladas com juros
import { useState } from 'react';
import { Sheet }         from '@/shared/ui/Sheet';
import { FInput }        from '@/shared/ui/FInput';
import { Btn }           from '@/shared/ui/Btn';
import { CategoryChips } from './CategoryChips';
import { useFinancasStore } from '../store';
import { useCartoes, useTransacao } from '../selectors';
import { today }         from '@/shared/utils/date';
import { parseBRL, formatBRL } from '@/shared/utils/money';
import type { Transaction, TransactionType } from '../types';
import type { ID } from '@/shared/types/common';

interface Props {
  isOpen:  boolean;
  onClose: () => void;
  txId?:   ID;   // Item 9: se informado, abre em modo edicao
}

const emptyForm = () => ({
  desc:        '',
  amount:      '',
  valorBruto:  '',  // Item 11
  type:        'expense' as TransactionType,
  category:    'outros',
  date:        today(),
  due:         '',
  parcelado:   false,
  parcelas:    '1',
  cardId:      null as string | null,
});

const fromTx = (tx: Transaction) => ({
  desc:       tx.desc,
  amount:     formatBRL(tx.amount),
  valorBruto: '',
  type:       tx.type,
  category:   tx.category,
  date:       tx.date,
  due:        tx.due ?? '',
  parcelado:  false,
  parcelas:   '1',
  cardId:     tx.cardId,
});

interface FormProps {
  modoEdicao:  boolean;
  txId:        ID | undefined;
  initial:     ReturnType<typeof emptyForm>;
  onSave:      (form: ReturnType<typeof emptyForm>) => void;
  onClose:     () => void;
}

function maskAmount(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const cents = parseInt(digits, 10);
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function TransactionForm({ modoEdicao, txId: _txId, initial, onSave, onClose }: FormProps) {
  const cartoes         = useCartoes();
  const [form, setForm] = useState(initial);

  // Bug 4 fix: parseBRL suporta "1.250,00"
  const amountCents     = parseBRL(form.amount);
  const valorBrutoCents = parseBRL(form.valorBruto);
  const valido          = form.desc.trim().length > 0 && amountCents > 0;

  const salvar = () => {
    if (!valido) return;
    onSave(form);
    onClose();
  };

  const titulo = modoEdicao ? 'Editar Transacao' : 'Nova Transacao';

  return (
    <Sheet title={titulo} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Toggle entrada / saida — nao exibe em modo edicao de parcelada */}
        {!modoEdicao && (
          <div style={{ display: 'flex', gap: 8 }}>
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setForm((f) => ({ ...f, type: t, cardId: null, category: t === 'income' ? '💰 Salário' : '✨ Outros' }))}
                style={{
                  flex: 1, padding: '10px', borderRadius: 12, fontSize: 13,
                  border: `2px solid ${form.type === t
                    ? (t === 'income' ? 'var(--vf-ok)' : 'var(--vf-er)')
                    : 'var(--vf-bd)'}`,
                  background: form.type === t
                    ? (t === 'income'
                      ? 'color-mix(in srgb, var(--vf-ok) 12%, transparent)'
                      : 'color-mix(in srgb, var(--vf-er) 12%, transparent)')
                    : 'var(--vf-bg)',
                  color: form.type === t
                    ? (t === 'income' ? 'var(--vf-ok)' : 'var(--vf-er)')
                    : 'var(--vf-tm)',
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {t === 'income' ? 'Entrada' : 'Saida'}
              </button>
            ))}
          </div>
        )}

        <FInput
          value={form.desc}
          onChange={(v) => setForm((f) => ({ ...f, desc: v }))}
          placeholder="Descricao"
        />
        <FInput
          value={form.amount}
          onChange={(v) => setForm((f) => ({ ...f, amount: maskAmount(v) }))}
          placeholder="0,00"
          inputMode="numeric"
        />
        <FInput
          value={form.date}
          onChange={(v) => setForm((f) => ({ ...f, date: v }))}
          placeholder="Data"
          type="date"
        />
        <CategoryChips
          value={form.category}
          onChange={(c) => setForm((f) => ({ ...f, category: c }))}
          type={form.type}
        />

        {/* Select de cartao — visivel so para despesas */}
        {form.type === 'expense' && cartoes.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--vf-tm)', fontWeight: 600 }}>
              Cartao de credito (opcional)
            </span>
            <select
              value={form.cardId ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, cardId: e.target.value || null }))
              }
              style={{
                padding: '10px 12px', borderRadius: 12, fontSize: 13,
                border: '1.5px solid var(--vf-bd)',
                background: 'var(--vf-bg)',
                color: 'var(--vf-t)',
                fontFamily: 'inherit', cursor: 'pointer',
              }}
            >
              <option value="">(dinheiro/Pix)</option>
              {cartoes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Parcelado — so para despesas novas */}
        {!modoEdicao && form.type === 'expense' && (
          <label style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 13, color: 'var(--vf-t)', cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={form.parcelado}
              onChange={(e) => setForm((f) => ({ ...f, parcelado: e.target.checked }))}
            />
            Parcelado
          </label>
        )}

        {form.parcelado && !modoEdicao && (
          <>
            <FInput
              value={form.parcelas}
              onChange={(v) => setForm((f) => ({ ...f, parcelas: v }))}
              placeholder="Numero de parcelas"
              type="number"
            />
            {/* Item 11: preco de etiqueta para calcular juros */}
            <FInput
              value={form.valorBruto}
              onChange={(v) => setForm((f) => ({ ...f, valorBruto: v }))}
              placeholder="Valor sem juros (opcional)"
            />
            {valorBrutoCents > 0 && amountCents > valorBrutoCents && (
              <p style={{ margin: 0, fontSize: 12, color: 'var(--vf-wn)' }}>
                Juros: R$ {formatBRL(amountCents - valorBrutoCents)} · {Math.round(((amountCents - valorBrutoCents) / valorBrutoCents) * 100)}% ao total
              </p>
            )}
          </>
        )}

        <Btn onClick={salvar} disabled={!valido}>
          {modoEdicao
            ? 'Salvar alteracoes'
            : form.parcelado && parseInt(form.parcelas) > 1
              ? `Criar ${form.parcelas}x`
              : 'Adicionar'}
        </Btn>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Sheet>
  );
}

export function AddTransactionSheet({ isOpen, onClose, txId }: Props) {
  const adicionarTransacao = useFinancasStore((s) => s.adicionarTransacao);
  const adicionarParcelada = useFinancasStore((s) => s.adicionarParcelada);
  const atualizarTransacao = useFinancasStore((s) => s.atualizarTransacao);
  const txParaEditar       = useTransacao(txId);
  const modoEdicao         = !!txId;

  if (!isOpen) return null;

  const initial = txParaEditar ? fromTx(txParaEditar) : emptyForm();

  const handleSave = (form: ReturnType<typeof emptyForm>) => {
    const amountCents     = parseBRL(form.amount);
    const valorBrutoCents = parseBRL(form.valorBruto);

    if (modoEdicao && txId) {
      atualizarTransacao(txId, {
        desc:     form.desc.trim(),
        amount:   amountCents,
        type:     form.type,
        category: form.category,
        date:     form.date,
        due:      form.due || undefined,
        cardId:   form.cardId,
      });
    } else if (form.parcelado && parseInt(form.parcelas) > 1) {
      adicionarParcelada({
        desc:          form.desc.trim(),
        totalAmount:   amountCents,
        valorBruto:    valorBrutoCents > 0 && valorBrutoCents < amountCents ? valorBrutoCents : undefined,
        totalParcelas: parseInt(form.parcelas),
        firstDate:     form.date,
        category:      form.category,
        cardId:        form.cardId,
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
  };

  return (
    <TransactionForm
      key={txId ?? 'nova'}
      modoEdicao={modoEdicao}
      txId={txId}
      initial={initial}
      onSave={handleSave}
      onClose={onClose}
    />
  );
}
