// src/features/pets/PetsView.tsx
import { useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { PetSwitcher }      from './components/PetSwitcher';
import { CuidadoPetItem }   from './components/CuidadoPetItem';
import { AddPetSheet }      from './components/AddPetSheet';
import { EmptyState }       from '@/shared/ui/EmptyState';
import { useShallow }       from 'zustand/react/shallow';
import { usePetAtivo }      from './selectors';
import { usePetsStore }     from './store';
import { today }            from '@/shared/utils/date';
import type { Pet } from './types';

const EMPTY_DONE: Record<string, number> = {};

export function PetsView() {
  const [addPetOpen,  setAddPetOpen]  = useState(false);
  const [petEditando, setPetEditando] = useState<Pet | undefined>(undefined);
  const pet      = usePetAtivo();
  const doneDay  = usePetsStore(useShallow((s) => s.done[today()] ?? EMPTY_DONE));
  const registrar= usePetsStore((s) => s.registrarFeito);
  const desfazer = usePetsStore((s) => s.desfazerFeito);
  const day      = today();

  const abrirAdicionarPet = () => { setPetEditando(undefined); setAddPetOpen(true); };
  const abrirEditarPet    = (p: Pet) => { setPetEditando(p); setAddPetOpen(true); };

  if (!pet) {
    return (
      <>
        <EmptyState
          icon={<span style={{ fontSize: 24 }}>🐾</span>}
          title="Nenhum pet cadastrado"
          desc="Adicione seu companheiro de quatro patas"
        />
        <button
          onClick={abrirAdicionarPet}
          style={{
            marginTop: 16, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8, width: '100%',
            padding: '14px', borderRadius: 14, border: '2px dashed var(--vf-bd)',
            background: 'transparent', color: 'var(--vf-tm)',
            fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <Plus size={18} /> Adicionar pet
        </button>
        <AddPetSheet isOpen={addPetOpen} onClose={() => setAddPetOpen(false)} petEditando={petEditando} />
      </>
    );
  }

  return (
    <div>
      <PetSwitcher onAdd={abrirAdicionarPet} />

      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 16, padding: '12px 14px',
        background: 'var(--vf-s2)', borderRadius: 16, border: '1px solid var(--vf-bd)',
      }}>
        <span style={{ fontSize: 36 }}>{pet.avatar}</span>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: 'var(--vf-t)' }}>{pet.name}</p>
          {pet.raca && <p style={{ margin: 0, fontSize: 12, color: 'var(--vf-tm)' }}>{pet.raca}</p>}
        </div>
        <button
          onClick={() => abrirEditarPet(pet)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--vf-tm)', padding: 6, borderRadius: 8,
            display: 'flex', alignItems: 'center',
          }}
          aria-label="Editar pet"
        >
          <Pencil size={15} />
        </button>
      </div>

      {pet.cuidados.length === 0 ? (
        <EmptyState
          icon={<span style={{ fontSize: 24 }}>🐾</span>}
          title="Sem cuidados cadastrados"
          desc="Adicione alimentação, água, passeio..."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pet.cuidados.map((c) => (
            <CuidadoPetItem
              key={c.id}
              cuidado={c}
              feito={doneDay[c.id] ?? 0}
              onAdd={(id) => registrar(day, id)}
              onRemove={(id) => desfazer(day, id)}
            />
          ))}
        </div>
      )}

      <AddPetSheet isOpen={addPetOpen} onClose={() => { setAddPetOpen(false); setPetEditando(undefined); }} petEditando={petEditando} />
    </div>
  );
}
