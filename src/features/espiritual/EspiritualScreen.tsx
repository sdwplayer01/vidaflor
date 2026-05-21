// src/features/espiritual/EspiritualScreen.tsx
// Screen orquestradora — sem lógica de domínio, sem useState de dados.
// Só gerencia: qual sub-tab está ativa e quais sheets estão abertas.
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Chip } from '@/shared/ui/Chip';
import { useOracoesPendentes } from './selectors';
import { GratidaoMural }    from './components/GratidaoMural';
import { OracaoList }       from './components/OracaoList';
import { LeituraList }      from './components/LeituraList';
import { AddGratidaoSheet } from './components/AddGratidaoSheet';
import { AddOracaoSheet }   from './components/AddOracaoSheet';
import { AddLeituraSheet }  from './components/AddLeituraSheet';

type SubTab = 'gratidao' | 'leituras' | 'oracoes';

export function EspiritualScreen() {
  const [sub, setSub]           = useState<SubTab>('gratidao');
  const [sheetGrat, setSheetGrat]   = useState(false);
  const [sheetOrac, setSheetOrac]   = useState(false);
  const [sheetLeit, setSheetLeit]   = useState(false);

  const pendentesCount = useOracoesPendentes().length;

  const abrirSheet = () => {
    if (sub === 'gratidao') setSheetGrat(true);
    else if (sub === 'oracoes') setSheetOrac(true);
    else setSheetLeit(true);
  };

  return (
    <div style={{ padding: '24px 20px 20px' }}>

      {/* Cabeçalho */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 20,
      }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--vf-tx)', fontSize: 22, fontWeight: 900 }}>
            Conexão
          </h2>
          <p style={{ margin: '2px 0 0', color: 'var(--vf-tm)', fontSize: 13 }}>
            Cultive sua paz interior
          </p>
        </div>
        <button
          onClick={abrirSheet}
          style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'var(--vf-p)', border: 'none', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 12px color-mix(in srgb, var(--vf-p) 35%, transparent)',
            WebkitTapHighlightColor: 'transparent',
          }}
          aria-label="Adicionar"
        >
          <Plus size={22} />
        </button>
      </div>

      {/* Sub-tabs */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 18,
        overflowX: 'auto', paddingBottom: 4,
      }}>
        <Chip active={sub === 'gratidao'} onClick={() => setSub('gratidao')}>
          🙏 Gratidão
        </Chip>
        <Chip active={sub === 'leituras'} onClick={() => setSub('leituras')}>
          📖 Leituras
        </Chip>
        <Chip active={sub === 'oracoes'} onClick={() => setSub('oracoes')}>
          💝 Orações{pendentesCount > 0 ? ` (${pendentesCount})` : ''}
        </Chip>
      </div>

      {/* Conteúdo da sub-tab */}
      {sub === 'gratidao' && <GratidaoMural />}
      {sub === 'oracoes'  && <OracaoList filter="pendente" />}
      {sub === 'leituras' && <LeituraList />}

      {/* Sheets */}
      <AddGratidaoSheet isOpen={sheetGrat} onClose={() => setSheetGrat(false)} />
      <AddOracaoSheet   isOpen={sheetOrac} onClose={() => setSheetOrac(false)} />
      <AddLeituraSheet  isOpen={sheetLeit} onClose={() => setSheetLeit(false)} />
    </div>
  );
}
