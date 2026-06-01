// src/features/organiza/OrganizaScreen.tsx — v2
// Header with eyebrow/display/hint, segmented pill tabs with icons.
// Sub-tabs (ShoppingTab, NotesTab, RemindersTab) unchanged.
import { useState }          from 'react';
import { ShoppingCart, StickyNote, Bell, type LucideIcon } from 'lucide-react';
import { ShoppingTab }  from './components/ShoppingTab';
import { NotesTab }     from './components/NotesTab';
import { RemindersTab } from './components/RemindersTab';
import { HEADERS }      from '@/shared/constants/messages';

type Tab = 'compras' | 'notas' | 'lembretes';

const TABS: { key: Tab; label: string; Icon: LucideIcon }[] = [
  { key: 'compras',   label: 'compras',   Icon: ShoppingCart },
  { key: 'notas',     label: 'notas',     Icon: StickyNote   },
  { key: 'lembretes', label: 'lembretes', Icon: Bell         },
];

export function OrganizaScreen() {
  const [tab, setTab] = useState<Tab>('compras');

  return (
    <div style={{ padding: '24px 20px 20px' }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <div className="vf-eyebrow">organiza</div>
        <h1
          style={{
            margin: '4px 0 0', fontSize: 30, lineHeight: 1.05,
            fontFamily: 'var(--vf-font-display)', fontWeight: 400,
            color: 'var(--vf-tx)',
          }}
        >
          {HEADERS.organiza.title}
        </h1>
        <div
          style={{
            fontSize: 14, color: 'var(--vf-tx-soft)',
            marginTop: 6, fontStyle: 'italic',
          }}
        >
          {HEADERS.organiza.hint}
        </div>
      </div>

      {/* ── Segmented pill tabs ────────────────────────────────── */}
      <div
        style={{
          display: 'flex', gap: 4,
          background: 'var(--vf-surf-alt)',
          borderRadius: 99, padding: 3,
          marginBottom: 20,
        }}
      >
        {TABS.map(({ key, label, Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 3,
                padding: '7px 4px',
                borderRadius: 99, border: 'none', cursor: 'pointer',
                background: active ? 'var(--vf-surf)' : 'transparent',
                color: active ? 'var(--vf-rose)' : 'var(--vf-tx-mute)',
                fontFamily: 'var(--vf-font-ui)', fontSize: 10, fontWeight: 600,
                transition: 'all 0.3s var(--vf-ease-spring)',
                boxShadow: active ? '0 2px 8px rgba(0,0,0,0.07)' : 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      {tab === 'compras'   && <ShoppingTab />}
      {tab === 'notas'     && <NotesTab />}
      {tab === 'lembretes' && <RemindersTab />}
    </div>
  );
}
