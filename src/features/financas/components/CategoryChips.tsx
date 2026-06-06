// src/features/financas/components/CategoryChips.tsx

export const CATEGORIES = [
  '🛒 Mercado',
  '🏠 Casa/contas',
  '🎒 Filhos/escola',
  '💊 Saúde/farmácia',
  '🚗 Transporte',
  '🐾 Pet',
  '👕 Roupas',
  '🌿 Lazer',
  '💆 Autocuidado',
  '📺 Assinaturas',
  '✨ Outros',
] as const;

export const INCOME_CATEGORIES = [
  '💰 Salário',
  '📊 Pró-labore',
  '🛍 Vendas',
  '📈 Lucro',
  '💳 Conta recebida',
  '💹 Rendimentos',
] as const;

export type Category       = typeof CATEGORIES[number];
export type IncomeCategory = typeof INCOME_CATEGORIES[number];

interface Props {
  value:    string;
  onChange: (cat: string) => void;
  type?:    'expense' | 'income';
}

export function CategoryChips({ value, onChange, type = 'expense' }: Props) {
  const list = type === 'income' ? INCOME_CATEGORIES : CATEGORIES;
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {list.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          style={{
            padding: '6px 12px', borderRadius: 20, fontSize: 12,
            border: `1.5px solid ${value === cat ? 'var(--vf-rose)' : 'var(--vf-bd)'}`,
            background: value === cat
              ? 'color-mix(in srgb, var(--vf-rose) 12%, transparent)'
              : 'var(--vf-surf)',
            color: value === cat ? 'var(--vf-rose)' : 'var(--vf-tx-mute)',
            fontWeight: value === cat ? 700 : 400,
            cursor: 'pointer', fontFamily: 'inherit',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
