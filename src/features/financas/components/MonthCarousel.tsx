// src/features/financas/components/MonthCarousel.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { IsoMonth } from '../types';

function formatMes(mes: IsoMonth): string {
  const [y, m] = mes.split('-').map(Number) as [number, number];
  const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${MESES[m - 1]} ${y}`;
}

function addMonths(mes: IsoMonth, n: number): IsoMonth {
  const [y, m] = mes.split('-').map(Number) as [number, number];
  const newM   = m + n;
  const year   = y + Math.floor((newM - 1) / 12);
  const month  = ((newM - 1) % 12) + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
}

interface Props {
  mes:    IsoMonth;
  onMes:  (m: IsoMonth) => void;
}

export function MonthCarousel({ mes, onMes }: Props) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      <button
        onClick={() => onMes(addMonths(mes, -1))}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vf-tm)' }}
      >
        <ChevronLeft size={22} />
      </button>
      <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--vf-t)', minWidth: 100, textAlign: 'center' }}>
        {formatMes(mes)}
      </span>
      <button
        onClick={() => onMes(addMonths(mes, 1))}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vf-tm)' }}
      >
        <ChevronRight size={22} />
      </button>
    </div>
  );
}
