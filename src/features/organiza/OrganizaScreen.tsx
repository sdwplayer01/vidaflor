// src/features/organiza/OrganizaScreen.tsx
import { useState } from 'react';
import { ShoppingCart, StickyNote, Bell, type LucideIcon } from 'lucide-react';
import { ShoppingTab }  from './components/ShoppingTab';
import { NotesTab }     from './components/NotesTab';
import { RemindersTab } from './components/RemindersTab';

type Tab = 'compras' | 'notas' | 'lembretes';

const TABS: { key: Tab; label: string; Icon: LucideIcon }[] = [
  { key: 'compras',    label: 'Compras',   Icon: ShoppingCart },
  { key: 'notas',     label: 'Notas',     Icon: StickyNote   },
  { key: 'lembretes', label: 'Lembretes', Icon: Bell         },
];

export function OrganizaScreen() {
  const [tab, setTab] = useState<Tab>('compras');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 4, padding: '12px 16px 0',
        borderBottom: '1px solid var(--vf-bd)', background: 'var(--vf-bg)',
        flexShrink: 0,
      }}>
        {TABS.map(({ key, label, Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 4, padding: '8px 4px 10px',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: active ? '2px solid var(--vf-p)' : '2px solid transparent',
                color: active ? 'var(--vf-p)' : 'var(--vf-tm)',
                fontFamily: 'inherit', fontSize: 11, fontWeight: active ? 700 : 400,
                transition: 'color 0.15s',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon size={18} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {tab === 'compras'    && <ShoppingTab />}
        {tab === 'notas'     && <NotesTab />}
        {tab === 'lembretes' && <RemindersTab />}
      </div>
    </div>
  );
}
