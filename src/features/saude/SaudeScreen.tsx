// src/features/saude/SaudeScreen.tsx
import { useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import { ProfileSwitcher }   from './components/ProfileSwitcher';
import { WaterCard }         from './components/WaterCard';
import { CycleCard }         from './components/CycleCard';
import { MedicationList }    from './components/MedicationList';
import { AddMedSheet }       from './components/AddMedSheet';
import { CycleConfigSheet }  from './components/CycleConfigSheet';
import { DailyNoteCard }     from './components/DailyNoteCard';
import { usePerfilAtivo }    from './selectors';

type Tab = 'saude' | 'medicamentos' | 'anotacao';

const TABS: { key: Tab; label: string }[] = [
  { key: 'saude',        label: 'Saude'       },
  { key: 'medicamentos', label: 'Remedios'    },
  { key: 'anotacao',     label: 'Como estou'  },
];

export function SaudeScreen() {
  const [tab, setTab]         = useState<Tab>('saude');
  const [addMed, setAddMed]   = useState(false);
  const [cycleConf, setCycleConf] = useState(false);
  const perfil = usePerfilAtivo();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab bar */}
      <div style={{
        flexShrink: 0, borderBottom: '1px solid var(--vf-bd)',
        background: 'var(--vf-bg)',
      }}>
        <div style={{ display: 'flex', padding: '12px 16px 0' }}>
          {TABS.map(({ key, label }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  flex: 1, padding: '8px 4px 10px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: active ? '2px solid var(--vf-p)' : '2px solid transparent',
                  color: active ? 'var(--vf-p)' : 'var(--vf-tm)',
                  fontSize: 13, fontWeight: active ? 700 : 400,
                  fontFamily: 'inherit', transition: 'color 0.15s',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* Profile switcher (sempre visivel) */}
        <div style={{ marginBottom: 16 }}>
          <ProfileSwitcher />
        </div>

        {tab === 'saude' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <WaterCard />
            {perfil?.type === 'adult_f' && (
              <>
                <CycleCard />
                <button
                  onClick={() => setCycleConf(true)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 6, padding: '10px', borderRadius: 12,
                    border: '1px solid var(--vf-bd)', background: 'var(--vf-s2)',
                    color: 'var(--vf-tm)', fontSize: 13, cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <Settings size={14} />
                  Configurar ciclo
                </button>
              </>
            )}
          </div>
        )}

        {tab === 'medicamentos' && (
          <>
            <MedicationList />
            <button
              onClick={() => setAddMed(true)}
              style={{
                marginTop: 16, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, width: '100%',
                padding: '14px', borderRadius: 14, border: '2px dashed var(--vf-bd)',
                background: 'transparent', color: 'var(--vf-tm)',
                fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <Plus size={18} /> Adicionar medicamento
            </button>
          </>
        )}

        {tab === 'anotacao' && <DailyNoteCard />}
      </div>

      <AddMedSheet      isOpen={addMed}    onClose={() => setAddMed(false)} />
      <CycleConfigSheet isOpen={cycleConf} onClose={() => setCycleConf(false)} />
    </div>
  );
}
