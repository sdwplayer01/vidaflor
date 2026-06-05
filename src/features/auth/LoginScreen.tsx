import { useState } from 'react';
import { FInput } from '@/shared/ui/FInput';
import { Btn } from '@/shared/ui/Btn';
import styles from './LoginScreen.module.css';

interface LoginScreenProps {
  onSubmit?: (email: string, senha: string) => Promise<void>;
  externalError?: string | null;
  externalLoading?: boolean;
}

/**
 * Marca Vida Flor — flor vazada (negativo) num disco de degradê.
 * As cores saem dos tokens (--vf-coral / --vf-rose / --vf-lilac),
 * então o símbolo acompanha o tema: aurora (claro) ou crepúsculo (escuro).
 */
function VidaFlorMark({ size = 84 }: { size?: number }) {
  const ANG = [0, 72, 144, 216, 288];
  const PETAL = 'M100 100 C83 82 79 54 100 28 C121 54 117 82 100 100 Z';
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id="vf-mark-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--vf-coral)" />
          <stop offset="55%" stopColor="var(--vf-rose)" />
          <stop offset="100%" stopColor="var(--vf-lilac)" />
        </linearGradient>
        {/* borda externa esfumada do disco */}
        <radialGradient id="vf-mark-rim" gradientUnits="userSpaceOnUse" cx="100" cy="100" r="96">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="86%" stopColor="#fff" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        <filter id="vf-mark-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        {/* flor + miolo vazado, com recorte suave */}
        <mask id="vf-mark-mask">
          <rect x="0" y="0" width="200" height="200" fill="url(#vf-mark-rim)" />
          <g filter="url(#vf-mark-blur)">
            {ANG.map((a) => (
              <path key={a} d={PETAL} transform={`rotate(${a} 100 100)`} fill="#000" />
            ))}
            <circle cx="100" cy="100" r="16" fill="#000" />
          </g>
        </mask>
      </defs>
      <circle cx="100" cy="100" r="96" fill="url(#vf-mark-fill)" mask="url(#vf-mark-mask)" />
    </svg>
  );
}

export function LoginScreen({
  onSubmit,
  externalError,
  externalLoading,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = externalLoading ?? loading;
  const errorMsg = externalError ?? error;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !senha.trim()) {
      setError('Preencha o email e a senha para continuar.');
      return;
    }

    if (onSubmit) {
      setLoading(true);
      try {
        await onSubmit(email.trim(), senha);
      } finally {
        setLoading(false);
      }
    } else {
      // G2 preview: integração real vem no G3
      console.log('[LoginScreen] submit', { email: email.trim() });
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.mark}>
            <VidaFlorMark size={84} />
          </div>
          <h1 className={styles.title}>Vida Flor</h1>
          <p className={styles.subtitle}>
            Pequenas escolhas, grandes florescimentos.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {errorMsg && (
            <div className={styles.errorBanner} role="alert">
              {errorMsg}
            </div>
          )}

          <FInput
            id="login-email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="seu@email.com"
            disabled={isLoading}
          />

          <FInput
            id="login-senha"
            label="Senha"
            type="password"
            value={senha}
            onChange={setSenha}
            placeholder="Sua senha"
            disabled={isLoading}
          />

          <Btn
            type="submit"
            variant="primary"
            loading={isLoading}
            className={styles.submitBtn}
          >
            Entrar
          </Btn>
        </form>
      </div>
    </div>
  );
}
