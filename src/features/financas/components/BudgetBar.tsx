// src/features/financas/components/BudgetBar.tsx
import { useOrcamentoMes } from '../selectors';
import { formatBRL } from '@/shared/utils/money';

export function BudgetBar() {
  const { disponivel, gasto, restante, pct } = useOrcamentoMes();

  if (disponivel === 0) return null;

  const barColor = pct >= 90 ? 'var(--vf-er)' : pct >= 70 ? '#E8C479' : 'var(--vf-ok)';

  return (
    <div style={{
      background: 'var(--vf-s2)', borderRadius: 16, padding: '14px',
      border: '1px solid var(--vf-bd)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--vf-t)' }}>
          Orcamento do mes
        </span>
        <span style={{ fontSize: 13, color: 'var(--vf-tm)' }}>
          {pct}% usado
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: 'var(--vf-bd)', marginBottom: 8, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 4, background: barColor,
          width: `${Math.min(100, pct)}%`, transition: 'width 0.4s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--vf-tm)' }}>
          Gasto: R$ {formatBRL(gasto)}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: restante >= 0 ? 'var(--vf-ok)' : 'var(--vf-er)' }}>
          Restante: R$ {formatBRL(Math.abs(restante))}
        </span>
      </div>
    </div>
  );
}
