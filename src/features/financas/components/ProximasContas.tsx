// src/features/financas/components/ProximasContas.tsx
import { Bell } from 'lucide-react';
import { useProximasContas } from '../selectors';
import { formatBRL } from '@/shared/utils/money';

export function ProximasContas() {
  const contas = useProximasContas(7);

  if (contas.length === 0) return null;

  return (
    <div style={{
      background: 'color-mix(in srgb, var(--vf-er) 8%, var(--vf-s2))',
      borderRadius: 16, padding: '14px',
      border: '1px solid color-mix(in srgb, var(--vf-er) 20%, transparent)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Bell size={16} color="var(--vf-er)" />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--vf-er)' }}>
          Proximas a vencer (7 dias)
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {contas.map((tx) => (
          <div key={tx.id} style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: 13, color: 'var(--vf-t)' }}>{tx.desc}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--vf-er)' }}>
              R$ {formatBRL(tx.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
