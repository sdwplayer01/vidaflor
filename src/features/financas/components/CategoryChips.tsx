// src/features/financas/components/CategoryChips.tsx

export const CATEGORIES = [
  'alimentacao', 'transporte', 'saude', 'lazer',
  'educacao', 'moradia', 'vestuario', 'assinatura', 'outros',
] as const;

export type Category = typeof CATEGORIES[number];

interface Props {
  value:    string;
  onChange: (cat: string) => void;
}

export function CategoryChips({ value, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          style={{
            padding: '6px 12px', borderRadius: 20, fontSize: 12,
            border: `1.5px solid ${value === cat ? 'var(--vf-p)' : 'var(--vf-bd)'}`,
            background: value === cat
              ? 'color-mix(in srgb, var(--vf-p) 12%, transparent)'
              : 'var(--vf-bg)',
            color: value === cat ? 'var(--vf-p)' : 'var(--vf-tm)',
            fontWeight: value === cat ? 700 : 400,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
