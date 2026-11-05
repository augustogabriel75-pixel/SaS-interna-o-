import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { NUVEM, supabase } from './lib/supabase';

export type Papel = 'admin' | 'veterinario' | 'auxiliar';

export interface Perfil {
  id: string;
  email: string | null;
  nome: string;
  papel: Papel;
  funcao: string;
  crmv: string | null;
  especialidade: string | null;
  telefone: string | null;
  ativo: boolean;
  criado_em?: string;
}

export const PAPEIS: Record<Papel, { r: string; desc: string }> = {
  admin: { r: 'Administrador', desc: 'Acesso total: usuários, configurações, internação, prescrição e alta.' },
  veterinario: { r: 'Médico-veterinário', desc: 'Interna, prescreve, ajusta soro, emite boletim e dá alta.' },
  auxiliar: { r: 'Auxiliar / Enfermagem', desc: 'Vê os pacientes, checa medicações e registra monitoramento e anotações. Não prescreve nem dá alta.' },
};

export interface Permissoes {
  internar: boolean;
  editarPaciente: boolean;
  prescrever: boolean;
  fluido: boolean;
  boletim: boolean;
  alta: boolean;
  aplicar: boolean;
  monitorar: boolean;
  evolucao: boolean;
  configurar: boolean;
  admin: boolean;
}

export function permissoesDe(papel: Papel | 'local'): Permissoes {
  const clinico = papel === 'admin' || papel === 'veterinario' || papel === 'local';
  return {
    internar: clinico,
    editarPaciente: clinico,
    prescrever: clinico,
    fluido: clinico,
    boletim: clinico,
    alta: clinico,
    aplicar: true,
    monitorar: true,
    evolucao: true,
    configurar: papel === 'admin' || papel === 'local',
    admin: papel === 'admin',
  };
}

const CHAVE_PERFIL = 'vetclin:perfil';

interface AuthCtx {
  carregando: boolean;
  sessao: Session | null;
  perfil: Perfil | null;
  recuperacao: boolean;
  pode: Permissoes;
  entrar: (email: string, senha: string) => Promise<string | null>;
  sair: () => Promise<void>;
  recarregarPerfil: () => Promise<void>;
  encerrarRecuperacao: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

function perfilEmCache(): Perfil | null {
  try {
    const s = localStorage.getItem(CHAVE_PERFIL);
    return s ? (JSON.parse(s) as Perfil) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [carregando, setCarregando] = useState(NUVEM);
  const [sessao, setSessao] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [recuperacao, setRecuperacao] = useState(false);

  const buscarPerfil = useCallback(async (s: Session | null) => {
    if (!s) {
      setPerfil(null);
      return;
    }
    const { data, error } = await supabase.from('perfis').select('*').eq('id', s.user.id).maybeSingle();
    if (error) {
      // sem internet: usa o perfil salvo no aparelho
      const c = perfilEmCache();
      setPerfil(c && c.id === s.user.id ? c : null);
      return;
    }
    setPerfil(data as Perfil | null);
    try {
      if (data) localStorage.setItem(CHAVE_PERFIL, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!NUVEM) return;
    let vivo = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!vivo) return;
      setSessao(data.session);
      await buscarPerfil(data.session);
      if (vivo) setCarregando(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((evento, s) => {
      if (evento === 'PASSWORD_RECOVERY') setRecuperacao(true);
      if (evento === 'SIGNED_IN' || evento === 'SIGNED_OUT' || evento === 'USER_UPDATED' || evento === 'PASSWORD_RECOVERY') {
        setSessao(s);
        // fora do callback para não travar o cliente de autenticação
        setTimeout(() => buscarPerfil(s), 0);
      } else if (evento === 'TOKEN_REFRESHED') {
        setSessao(s);
      }
    });
    return () => {
      vivo = false;
      sub.subscription.unsubscribe();
    };
  }, [buscarPerfil]);

  // Mudanças no próprio perfil (ex.: administrador desativou ou mudou o nível de acesso)
  useEffect(() => {
    if (!NUVEM || !sessao) return;
    const canal = supabase
      .channel('meu-perfil')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'perfis', filter: `id=eq.${sessao.user.id}` }, (p) => {
        const novo = p.new as Perfil;
        setPerfil(novo);
        try { localStorage.setItem(CHAVE_PERFIL, JSON.stringify(novo)); } catch { /* ignore */ }
      })
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [sessao?.user.id]);

  const entrar = useCallback(async (email: string, senha: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    if (!error) return null;
    if (/invalid login/i.test(error.message)) return 'E-mail ou senha incorretos.';
    if (/email not confirmed/i.test(error.message)) return 'Confirme o e-mail pelo link enviado para sua caixa de entrada.';
    if (/fetch|network/i.test(error.message)) return 'Sem conexão com a internet. O primeiro acesso em cada aparelho precisa de internet.';
    return error.message;
  }, []);

  const sair = useCallback(async () => {
    try { localStorage.removeItem(CHAVE_PERFIL); } catch { /* ignore */ }
    await supabase.auth.signOut();
    setPerfil(null);
    setSessao(null);
  }, []);

  const value = useMemo<AuthCtx>(() => ({
    carregando,
    sessao,
    perfil,
    recuperacao,
    pode: permissoesDe(NUVEM ? (perfil?.ativo ? perfil.papel : 'auxiliar') : 'local'),
    entrar,
    sair,
    recarregarPerfil: () => buscarPerfil(sessao),
    encerrarRecuperacao: () => setRecuperacao(false),
  }), [carregando, sessao, perfil, recuperacao, entrar, sair, buscarPerfil]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('AuthProvider ausente');
  return c;
}

export const usePode = () => useAuth().pode;
