// src/features/bloom/components/BloomCelebration.tsx
import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

interface Props {
  onDismiss: () => void;
}

export function BloomCelebration({ onDismiss }: Props) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.45)',
    }}>
      <div style={{
        background: 'var(--vf-bg)', borderRadius: 24, padding: '32px 28px',
        maxWidth: 300, width: '90%', textAlign: 'center',
        boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
        position: 'relative',
      }}>
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--vf-tm)',
          }}
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <Sparkles size={48} color="#D4A853" style={{ marginBottom: 12 }} />
        <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: 'var(--vf-t)' }}>
          Bloom Completo!
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--vf-tm)', lineHeight: 1.5 }}>
          Voce floresceu hoje! Espiritualidade, saude e rotina em harmonia.
        </p>
        <button
          onClick={onDismiss}
          style={{
            width: '100%', padding: '14px', borderRadius: 14,
            border: 'none', background: 'var(--vf-p)', color: '#fff',
            fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Continuar florescendo
        </button>
      </div>
    </div>
  );
}
