import { useAuth }       from '@/features/auth/hooks/useAuth';
import { LoginScreen }   from '@/features/auth/LoginScreen';

export function AuthGate() {
  const { signIn, loading, error } = useAuth();

  return (
    <LoginScreen
      onSubmit={signIn}
      externalLoading={loading}
      externalError={error}
    />
  );
}
