// src/features/bloom/components/BloomHistoricoChart.tsx
// Histórico de vitalidade — últimos 7 dias (Recharts AreaChart)
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useBloomUltimos7Dias } from '../selectors';

export function BloomHistoricoChart() {
  const dados = useBloomUltimos7Dias();

  return (
    <div style={{
      background: 'var(--vf-surf)', borderRadius: 16, padding: '14px 14px 8px',
      border: '1px solid var(--vf-bd)',
    }}>
      <p style={{
        margin: '0 0 10px', fontSize: 11, fontWeight: 700,
        color: 'var(--vf-tx-mute)', textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        Últimos 7 dias
      </p>
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart data={dados} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="bloomGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--vf-rose)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--vf-rose)" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: 'var(--vf-tx-mute)' }}
            axisLine={false} tickLine={false}
          />
          <YAxis domain={[0, 100]} tick={false} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: 'var(--vf-surf)', border: '1px solid var(--vf-bd)',
              borderRadius: 8, fontSize: 11,
            }}
            formatter={(v: number) => [`${v}%`, 'vitalidade']}
            labelStyle={{ color: 'var(--vf-tx-mute)' }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="var(--vf-rose)"
            strokeWidth={2}
            fill="url(#bloomGrad)"
            dot={{ fill: 'var(--vf-rose)', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
