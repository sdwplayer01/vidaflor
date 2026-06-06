// src/screens/ConjugeView.tsx
import { useState } from 'react';
import { Pencil, Check, Heart } from 'lucide-react';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Btn }        from '@/shared/ui/Btn';
import { Sheet }      from '@/shared/ui/Sheet';
import { FInput }     from '@/shared/ui/FInput';
import { useShallow } from 'zustand/react/shallow';
import { useConfigStore }       from '@/features/config/store';
import { useTarefasDelegadas }  from '@/features/agenda/selectors';
import { useAgendaStore }       from '@/features/agenda/store';
import { today }                from '@/shared/utils/date';

const EMPTY_IDS: string[] = [];

// ── Sheet de cadastro/edição do parceiro ──────────────────────────────────────
interface SheetProps {
  inicial?: { name: string; avatar: string };
  onClose: () => void;
}

function AddParceiroSheet({ inicial, onClose }: SheetProps) {
  const setParceiro = useConfigStore((s) => s.setParceiro);
  const [name,   setName]   = useState(inicial?.name   ?? '');
  const [avatar, setAvatar] = useState(inicial?.avatar ?? '💑');

  const salvar = () => {
    if (!name.trim()) return;
    setParceiro({ name: name.trim(), avatar });
    onClose();
  };

  return (
    <Sheet title={inicial ? 'Editar cônjuge' : 'Adicionar cônjuge'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FInput value={name}   onChange={setName}   placeholder="Nome do parceiro(a)" />
        <FInput value={avatar} onChange={setAvatar} placeholder="Emoji (ex: 👨 👩)" />
        <Btn onClick={salvar} disabled={!name.trim()}>
          {inicial ? 'Salvar' : 'Adicionar'}
        </Btn>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Sheet>
  );
}

// ── View principal ────────────────────────────────────────────────────────────
export function ConjugeView() {
  const parceiro       = useConfigStore((s) => s.parceiro);
  const delegadas      = useTarefasDelegadas('conjuge', today());
  const agendaDoneIds  = useAgendaStore(useShallow((s) => s.done[today()] ?? EMPTY_IDS));
  const toggleDelegada = useAgendaStore((s) => s.toggleTarefa);

  const [sheetOpen, setSheetOpen] = useState(false);

  if (!parceiro) {
    return (
      <>
        <EmptyState
          icon={<Heart size={24} />}
          title="Nenhum cônjuge cadastrado"
          desc="Adicione para delegar tarefas ao seu parceiro(a)"
        />
        <Btn onClick={() => setSheetOpen(true)} style={{ marginTop: 12 }}>
          + Adicionar cônjuge
        </Btn>
        {sheetOpen && <AddParceiroSheet onClose={() => setSheetOpen(false)} />}
      </>
    );
  }

  return (
    <div>
      {/* Perfil */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 16, padding: '12px 14px',
        background: 'var(--vf-s2)', borderRadius: 16, border: '1px solid var(--vf-bd)',
      }}>
        <span style={{ fontSize: 32 }}>{parceiro.avatar}</span>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: 'var(--vf-t)' }}>{parceiro.name}</p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--vf-tm)' }}>Cônjuge</p>
        </div>
        <button
          onClick={() => setSheetOpen(true)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--vf-tm)', padding: 6, borderRadius: 8,
            display: 'flex', alignItems: 'center',
          }}
          aria-label="Editar cônjuge"
        >
          <Pencil size={15} />
        </button>
      </div>

      {/* Tarefas delegadas hoje */}
      {delegadas.length === 0 ? (
        <EmptyState
          icon={<Heart size={24} />}
          title="Nenhuma tarefa delegada hoje"
          desc={`Use a captura rápida no Dia e selecione ${parceiro.name} como responsável`}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ margin: '0 0 6px 2px', fontSize: 11, fontWeight: 700, color: 'var(--vf-tx-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Delegadas hoje
          </p>
          {delegadas.map((t) => {
            const done = agendaDoneIds.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggleDelegada(today(), t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 14px', borderRadius: 12, width: '100%', textAlign: 'left',
                  background: 'var(--vf-surf)', border: '1px solid var(--vf-bd)',
                  cursor: 'pointer', opacity: done ? 0.5 : 1,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                  background: done ? 'var(--vf-ok)' : 'transparent',
                  border: done ? 'none' : '2px solid var(--vf-bd)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {done && <Check size={11} color="#fff" strokeWidth={2.5} />}
                </div>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--vf-tx)', textDecoration: done ? 'line-through' : 'none' }}>
                  {t.title}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {sheetOpen && (
        <AddParceiroSheet
          inicial={parceiro}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  );
}
