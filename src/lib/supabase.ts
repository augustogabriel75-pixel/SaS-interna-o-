import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** true quando o sistema está ligado ao Supabase (versão em nuvem com login) */
export const NUVEM = !!(url && chave);

export const supabase: SupabaseClient = NUVEM
  ? createClient(url!, chave!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : (null as unknown as SupabaseClient);

/** Cliente separado, sem sessão, para o administrador criar contas sem sair da própria */
export function clienteSemSessao() {
  return createClient(url!, chave!, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'vetclin-temp' } });
}
