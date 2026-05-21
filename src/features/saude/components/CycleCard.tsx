// src/features/saude/components/CycleCard.tsx
import { Moon } from 'lucide-react';
import { useCicloAtual, usePerfilAtivo } from '../selectors';

export function CycleCard() {
  const perfil = usePerfilAtivo();
  const ciclo  = useCicloAtual();

  if (!perfil || perfil.type !== 'adult_f') return null;
  if (!ciclo) {
    return (
      <div style={{
        background: 'var(--vf-s2)', borderRadius: 18, padding: '16px',
        border: '1px solid var(--vf-bd)', textAlign: 'center',
      }}>
        <Moon size={24} color="var(--vf-tm)" style={{ marginBottom: 8 }} />
        <p style={{ margin: 0, fontSize: 13, color: 'var(--vf-tm)' }}>
          Configure seu ciclo para acompanhar suas fases
        </p>
      </div>
    );
  }

  const faseColors: Record<string, string> = {
    Menstrual:   '#E87979',
    Folicular:   '#79B8E8',
    Ovulatoria:  '#79E8A0',
    Lutea:       '#E8C479',
  };
  const cor = faseColors[ciclo.fase] ?? 'var(--vf-p)';

  return (
    <div style={{
      background: 'var(--vf-s2)', borderRadius: 18, padding: '16px',
      border: `1px solid ${cor}40`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Moon size={18} color={cor} />
        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--vf-t)' }}>
          Ciclo
        </span>
        <span style={{
          marginLeft: 'auto', fontSize: 12, fontWeight: 700,
          color: cor, background: `${cor}18`,
          padding: '3px 10px', borderRadius: 20,
        }}>
          {ciclo.fase}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--vf-t)' }}>
            {ciclo.diaCiclo + 1}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--vf-tm)' }}>dia do ciclo</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--vf-t)' }}>
            {ciclo.diasParaProximo}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--vf-tm)' }}>dias p/ proximo</p>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 'auto' }}>
          {ciclo.isMenses  && <span title="Menstruacao" style={{ fontSize: 18 }}>🩸</span>}
          {ciclo.isFertil  && <span title="Periodo fertil" style={{ fontSize: 18 }}>🌿</span>}
          {ciclo.isTPM     && <span title="TPM" style={{ fontSize: 18 }}>⚡</span>}
        </div>
      </div>
    </div>
  );
}
