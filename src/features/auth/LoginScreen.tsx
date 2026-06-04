import { useState } from 'react';
import { FInput } from '@/shared/ui/FInput';
import { Btn }    from '@/shared/ui/Btn';
import styles     from './LoginScreen.module.css';

interface LoginScreenProps {
  onSubmit?: (email: string, senha: string) => Promise<void>;
  externalError?: string | null;
  externalLoading?: boolean;
}

export function LoginScreen({
  onSubmit,
  externalError,
  externalLoading,
}: LoginScreenProps) {
  const [email,   setEmail]   = useState('');
  const [senha,   setSenha]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const isLoading = externalLoading ?? loading;
  const errorMsg  = externalError  ?? error;

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
          <h1 className={styles.title}>Vida Flor</h1>
          <p className={styles.subtitle}>
            Bem-vinda de volta — entre com seu acesso.
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
