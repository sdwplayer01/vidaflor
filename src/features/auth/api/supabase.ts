import { supabase } from '@/shared/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

export interface AuthResult {
  session: Session;
  user:    User;
}

export interface AuthError {
  error: string;
}

function mapError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Email ou senha inválidos.';
  if (message.includes('Email not confirmed'))        return 'Confirme seu email antes de entrar.';
  return 'Não foi possível entrar. Tente novamente.';
}

export async function signIn(
  email: string,
  password: string
): Promise<AuthResult | AuthError> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) {
    return { error: mapError(error?.message ?? '') };
  }
  return { session: data.session, user: data.user };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export function onAuthChange(
  callback: (session: Session | null) => void
): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => data.subscription.unsubscribe();
}
