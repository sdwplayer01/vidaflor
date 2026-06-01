// src/features/agenda/DiaScreen.tsx — Fase 4 completa (4b+4c+4d+4e)
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAgendaStore }   from './store';
import { useDia, useDiaPct, useDiaActions } from './selectors';
import { today, formatBR, addDays } from '@/shared/utils/date';
import { AddTarefaDiaSheet } from './components/AddTarefaDiaSheet';
import { CapturaRapida }     from './components/CapturaRapida';
import { PreparaAmanha }     from './components/PreparaAmanha';
import { GerenciarRotinas }  from './components/GerenciarRotinas';
import type { DiaItem, DiaSource, Turno } from './types';
import type { ISODate } from '@/shared/types/common';

// ── Cores e labels por fonte ──────────────────────────────────────────────────
const SOURCE_COLOR: Record<DiaSource, string> = {
  rotina:      'var(--vf-rose)',
  casa:        'var(--vf-source-casa)',
  crianca:     'var(--vf-source-kids)',
  pet:         'var(--vf-source-pet)',
  compromisso: 'var(--vf-wn)',
  tarefa:      'var(--vf-tx-mute)',
};
const SOURCE_LABEL: Record<DiaSource, string> = {
  rotina:      'rotina',
  casa:        'casa',
  crianca:     'kids',
  pet:         'pet',
  compromisso: 'agenda',
  tarefa:      'tarefa',
};
const TURNO_LABEL: Record<Turno, string> = {
  manha: '🌅 Manhã',
  tarde: '☀️ Tarde',
  noite: '🌙 Noite',
};

// ── DayRow ────────────────────────────────────────────────────────────────────
function DayRow({ item, onToggle }: { item: DiaItem; onToggle: (item: DiaItem) => void }) {
  const color = SOURCE_COLOR[item.source];
  return (
    <button
      onClick={() => onToggle(item)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 14px', borderRadius: 12, width: '100%', textAlign: 'left',
        background: 'var(--vf-surf)', border: '1px solid var(--vf-bd)',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        opacity: item.done ? 0.5 : 1,
      }}
    >
      <span style={{ width: 3, height: 28, borderRadius: 2, background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--vf-tx)',
          textDecoration: item.done ? 'line-through' : 'none',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {item.title}
        </p>
        {(item.time || item.tag) && (
          <div style={{ display: 'flex', gap: 6, marginTop: 2, alignItems: 'center' }}>
            {item.time && (
              <span style={{ fontSize: 11, color: 'var(--vf-tx-mute)', fontVariantNumeric: 'tabular-nums' }}>
                {item.time}
              </span>
            )}
            {item.tag && <span style={{ fontSize: 11, color: 'var(--vf-tx-mute)' }}>{item.tag}</span>}
          </div>
        )}
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
        color, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>
        {SOURCE_LABEL[item.source]}
      </span>
    </button>
  );
}

// ── WeekStrip ─────────────────────────────────────────────────────────────────
function WeekStrip({ selected, onSelect }: { selected: ISODate; onSelect: (d: ISODate) => void }) {
  const todayStr = today();
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + i);
    return d.toISOString().slice(0, 10) as ISODate;
  });
  const labels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
      {dias.map((d, i) => {
        const isSelected = d === selected;
        const isToday    = d === todayStr;
        return (
          <button
            key={d}
            onClick={() => onSelect(d)}
            style={{
              flex: 1, padding: '6px 0', borderRadius: 10, textAlign: 'center',
              background: isSelected ? 'var(--vf-rose)' : 'var(--vf-surf)',
              border: isToday && !isSelected ? '1.5px solid var(--vf-rose)' : '1px solid var(--vf-bd)',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            }}
          >
            <p style={{ margin: 0, fontSize: 10, color: isSelected ? '#fff' : 'var(--vf-tx-mute)', fontWeight: 700 }}>
              {labels[i]}
            </p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: isSelected ? '#fff' : 'var(--vf-tx)' }}>
              {new Date(d + 'T00:00:00').getDate()}
            </p>
          </button>
        );
      })}
    </div>
  );
}

// ── DiaScreen ─────────────────────────────────────────────────────────────────
export function DiaScreen() {
  const [view,       setView]       = useState<'hoje' | 'semana'>('hoje');
  const [dataSel,    setDataSel]    = useState<ISODate>(today());
  const [addOpen,    setAddOpen]    = useState(false);

  const date = view === 'hoje' ? today() : dataSel;
  const items = useDia(date);
  const { feitos, total, pct } = useDiaPct(date);

  const handleToggle = useDiaActions(date);

  // Navegar para amanhã (4d)
  const verAmanha = (d: ISODate) => {
    setView('semana');
    setDataSel(d);
  };

  // Agrupar por turno
  const por: Record<Turno, DiaItem[]> = { manha: [], tarde: [], noite: [] };
  for (const item of items) por[item.turno].push(item);

  const isHoje    = date === today();
  const dateLabel = isHoje ? 'hoje' : formatBR(date);

  return (
    <div style={{ padding: '24px 20px 100px' }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <div className="vf-eyebrow">dia</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
          <h1 style={{
            margin: 0, fontSize: 28, lineHeight: 1.1,
            fontFamily: 'var(--vf-font-display)', fontWeight: 400, color: 'var(--vf-tx)',
          }}>
            {dateLabel}
          </h1>
          {total > 0 && (
            <span className="vf-mono" style={{ color: 'var(--vf-rose)', fontSize: 14, fontWeight: 700 }}>
              {feitos}/{total} · {pct}%
            </span>
          )}
        </div>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--vf-tx-mute)' }}>
          {total === 0
            ? 'nenhuma tarefa ainda'
            : feitos === total
            ? 'tudo feito — descanse com leveza'
            : `${total - feitos} tarefa${total - feitos > 1 ? 's' : ''} restante${total - feitos > 1 ? 's' : ''}`}
        </p>
      </div>

      {/* ── Toggle Hoje / Semana ─────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 14,
        background: 'var(--vf-surf)', borderRadius: 12, padding: 4,
        border: '1px solid var(--vf-bd)',
      }}>
        {(['hoje', 'semana'] as const).map((v) => (
          <button
            key={v}
            onClick={() => { setView(v); if (v === 'hoje') setDataSel(today()); }}
            style={{
              flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: view === v ? 'var(--vf-rose)' : 'transparent',
              color: view === v ? '#fff' : 'var(--vf-tx-mute)',
              border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            }}
          >
            {v === 'hoje' ? 'Hoje' : 'Semana'}
          </button>
        ))}
      </div>

      {/* ── Week strip ───────────────────────────────────────── */}
      {view === 'semana' && (
        <WeekStrip selected={dataSel} onSelect={setDataSel} />
      )}

      {/* ── Tarefas por turno ────────────────────────────────── */}
      {total === 0 ? (
        <p style={{
          textAlign: 'center', color: 'var(--vf-tx-mute)', fontStyle: 'italic',
          fontSize: 13, margin: '28px 0',
        }}>
          Nenhuma tarefa para este dia. Toque em + para adicionar.
        </p>
      ) : (
        (['manha', 'tarde', 'noite'] as Turno[]).map((turno) => {
          if (por[turno].length === 0) return null;
          return (
            <div key={turno} style={{ marginBottom: 20 }}>
              <p style={{
                margin: '0 0 8px 2px', fontSize: 11, fontWeight: 700,
                color: 'var(--vf-tx-mute)', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {TURNO_LABEL[turno]}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {por[turno].map((item) => (
                  <DayRow key={item.id} item={item} onToggle={handleToggle} />
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* ── Captura rápida ───────────────────────────────────── */}
      <CapturaRapida date={date} />

      {/* ── Preparar o amanhã (só "hoje") ───────────────────── */}
      {isHoje && (
        <div style={{ marginTop: 10 }}>
          <PreparaAmanha onVerAmanha={verAmanha} />
        </div>
      )}

      {/* ── Gerenciar rotinas (4e) ───────────────────────────── */}
      <div style={{ marginTop: 10 }}>
        <GerenciarRotinas />
      </div>

      {/* ── Sheet add tarefa ─────────────────────────────────── */}
      <AddTarefaDiaSheet
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        date={date}
      />

      {/* ── FAB + tarefa ─────────────────────────────────────── */}
      <button
        onClick={() => setAddOpen(true)}
        style={{
          position: 'fixed', bottom: 88, right: 20,
          width: 52, height: 52, borderRadius: 26,
          background: 'var(--vf-rose)', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px color-mix(in srgb, var(--vf-rose) 40%, transparent)',
          cursor: 'pointer', zIndex: 50,
          WebkitTapHighlightColor: 'transparent',
        }}
        aria-label="Adicionar tarefa"
      >
        <Plus size={22} color="#fff" strokeWidth={2.5} />
      </button>
    </div>
  );
}
