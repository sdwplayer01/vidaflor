// src/features/saude/SaudeScreen.tsx — v2
// Header with eyebrow/display/hint, segmented pill tabs, preserve all sub-components.
import { useState }             from 'react';
import { Plus, Settings }       from 'lucide-react';
import { ProfileSwitcher }      from './components/ProfileSwitcher';
import { WaterCard }            from './components/WaterCard';
import { CycleCard }            from './components/CycleCard';
import { MedicationList }       from './components/MedicationList';
import { AddMedSheet }          from './components/AddMedSheet';
import { CycleConfigSheet }     from './components/CycleConfigSheet';
import { DailyNoteCard }        from './components/DailyNoteCard';
import { SleepStepsCard }       from './components/SleepStepsCard';
import { usePerfilAtivo }       from './selectors';

type Tab = 'saude' | 'medicamentos' | 'anotacao';

const TABS: { key: Tab; label: string }[] = [
  { key: 'saude',        label: 'corpo'      },
  { key: 'medicamentos', label: 'remédios'   },
  { key: 'anotacao',     label: 'como estou' },
];

export function SaudeScreen() {
  const [tab, setTab]             = useState<Tab>('saude');
  const [addMed, setAddMed]       = useState(false);
  const [cycleConf, setCycleConf] = useState(false);
  const perfil = usePerfilAtivo();

  return (
    <div style={{ padding: '24px 20px 20px' }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <div className="vf-eyebrow">saúde</div>
        <h1
          style={{
            margin: '4px 0 0', fontSize: 30, lineHeight: 1.05,
            fontFamily: 'var(--vf-font-display)', fontWeight: 400,
            color: 'var(--vf-tx)',
          }}
        >
          Corpo em florescimento
        </h1>
        <div
          style={{
            fontSize: 14, color: 'var(--vf-tx-soft)',
            marginTop: 6, fontStyle: 'italic',
          }}
        >
          pequenos cuidados, grandes colheitas
        </div>
      </div>

      {/* ── Profile switcher (always visible) ─────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <ProfileSwitcher />
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
        {TABS.map(({ key, label }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1, padding: '7px 8px',
                borderRadius: 99, border: 'none', cursor: 'pointer',
                background: active ? 'var(--vf-surf)' : 'transparent',
                color: active ? 'var(--vf-rose)' : 'var(--vf-tx-mute)',
                fontFamily: 'var(--vf-font-ui)', fontSize: 12, fontWeight: 600,
                transition: 'all 0.3s var(--vf-ease-spring)',
                boxShadow: active ? '0 2px 8px rgba(0,0,0,0.07)' : 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      {tab === 'saude' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <WaterCard />
          <SleepStepsCard />
          {perfil?.type === 'adult_f' && (
            <>
              <CycleCard />
              <button
                onClick={() => setCycleConf(true)}
                style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 6,
                  padding: '10px', borderRadius: 12,
                  border: '1px solid var(--vf-bd)',
                  background: 'var(--vf-surf-alt)',
                  color: 'var(--vf-tx-mute)', fontSize: 13,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <Settings size={14} />
                configurar ciclo
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
              marginTop: 16,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, width: '100%',
              padding: '14px', borderRadius: 14,
              border: '2px dashed var(--vf-bd)',
              background: 'transparent', color: 'var(--vf-tx-mute)',
              fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <Plus size={18} /> adicionar remédio
          </button>
        </>
      )}

      {tab === 'anotacao' && <DailyNoteCard />}

      <AddMedSheet      isOpen={addMed}    onClose={() => setAddMed(false)} />
      <CycleConfigSheet isOpen={cycleConf} onClose={() => setCycleConf(false)} />
    </div>
  );
}
