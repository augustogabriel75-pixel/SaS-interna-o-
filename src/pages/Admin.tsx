import { useCallback, useEffect, useState } from 'react';
import { UserPlus, Pencil, RefreshCw, ShieldCheck, Stethoscope, HeartHandshake, Activity, Cloud, CloudOff, Users, Download, Search } from 'lucide-react';
import { supabase, clienteSemSessao } from '../lib/supabase';
import { useAuth, PAPEIS, type Papel, type Perfil } from '../auth';
import { useStore, FUNCOES } from '../store';
import { Abas, Badge, Campo, Chips, Modal, Stat, Vazio, useConfirmar, useToast } from '../components/ui';
import { fmtDataHora, relativo } from '../utils/format';
import type { Funcao } from '../types';

type Aba = 'usuarios' | 'atividades' | 'sistema';

const ICONE_PAPEL: Record<Papel, typeof ShieldCheck> = { admin: ShieldCheck, veterinario: Stethoscope, auxiliar: HeartHandshake };
const TOM_PAPEL: Record<Papel, 'roxo' | 'info' | 'ok'> = { admin: 'roxo', veterinario: 'info', auxiliar: 'ok' };

interface FormUsuario {
  id?: string;
  nome: string;
  email: string;
  senha: string;
  papel: Papel;
  funcao: Funcao;
  crmv: string;
  especialidade: string;
  telefone: string;
  ativo: boolean;
}

const NOVO: FormUsuario = { nome: '', email: '', senha: '', papel: 'auxiliar', funcao: 'auxiliar', crmv: '', especialidade: '', telefone: '', ativo: true };

export default function Admin() {
  const [aba, setAba] = useState<Aba>('usuarios');
  return (
    <div className="pagina">
      <div className="pagina-cab">
        <div>
          <h1>Painel administrativo</h1>
          <p className="sub">Usuários, níveis de acesso e acompanhamento do sistema</p>
        </div>
      </div>
      <Abas<Aba> ativa={aba} onChange={setAba} abas={[
        { id: 'usuarios', rotulo: 'Usuários e acessos', icone: <Users size={16} /> },
        { id: 'atividades', rotulo: 'Atividades', icone: <Activity size={16} /> },
        { id: 'sistema', rotulo: 'Sincronização e backup', icone: <Cloud size={16} /> },
      ]} />
      {aba === 'usuarios' && <Usuarios />}
      {aba === 'atividades' && <Atividades />}
      {aba === 'sistema' && <Sistema />}
    </div>
  );
}

function Usuarios() {
  const { perfil: eu } = useAuth();
  const toast = useToast();
  const confirmar = useConfirmar();
  const [lista, setLista] = useState<Perfil[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState<FormUsuario | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    const { data, error } = await supabase.from('perfis').select('*').order('ativo', { ascending: false }).order('nome');
    if (error) toast(navigator.onLine ? error.message : 'Sem internet: a lista de usuários precisa de conexão', 'erro');
    else setLista(data as Perfil[]);
    setCarregando(false);
  }, [toast]);

  useEffect(() => { carregar(); }, [carregar]);

  const set = <K extends keyof FormUsuario>(k: K, v: FormUsuario[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const salvar = async () => {
    if (!form) return;
    if (!form.nome.trim()) return toast('Informe o nome', 'erro');
    const admins = lista.filter((p) => p.papel === 'admin' && p.ativo);
    if (form.id === eu?.id && (form.papel !== 'admin' || !form.ativo)) return toast('Você não pode tirar seu próprio acesso de administrador', 'erro');
    if (form.id && admins.length === 1 && admins[0].id === form.id && form.papel !== 'admin') return toast('A clínica precisa de pelo menos um administrador', 'erro');
    setSalvando(true);
    try {
      let id = form.id;
      if (!id) {
        if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return toast('Informe um e-mail válido', 'erro');
        if (form.senha.length < 6) return toast('A senha provisória precisa ter pelo menos 6 caracteres', 'erro');
        const { data, error } = await clienteSemSessao().auth.signUp({ email: form.email.trim(), password: form.senha, options: { data: { nome: form.nome.trim() } } });
        if (error) return toast(/registered/i.test(error.message) ? 'Este e-mail já tem conta' : error.message, 'erro');
        if (!data.user || (data.user.identities && data.user.identities.length === 0)) return toast('Este e-mail já tem conta. Edite o usuário existente na lista.', 'erro');
        id = data.user.id;
      }
      const { error } = await supabase.from('perfis').update({
        nome: form.nome.trim(), papel: form.papel, funcao: form.funcao, ativo: form.ativo,
        crmv: form.crmv.trim() || null, especialidade: form.especialidade.trim() || null, telefone: form.telefone.trim() || null,
      }).eq('id', id);
      if (error) return toast(error.message, 'erro');
      toast(form.id ? 'Usuário atualizado' : `Conta de ${form.nome} criada. Envie o e-mail e a senha provisória para a pessoa.`);
      setForm(null);
      carregar();
    } finally {
      setSalvando(false);
    }
  };

  const alternar = async (p: Perfil) => {
    if (p.id === eu?.id) return toast('Você não pode desativar a própria conta', 'erro');
    if (p.ativo && !(await confirmar({ titulo: `Bloquear o acesso de ${p.nome}?`, texto: 'A pessoa não conseguirá mais entrar no sistema. Os registros dela continuam no histórico.', botao: 'Bloquear', perigo: true }))) return;
    const { error } = await supabase.from('perfis').update({ ativo: !p.ativo }).eq('id', p.id);
    if (error) toast(error.message, 'erro');
    else { toast(p.ativo ? 'Acesso bloqueado' : 'Acesso liberado'); carregar(); }
  };

  const pendentes = lista.filter((p) => !p.ativo);

  return (
    <div className="aba-conteudo">
      <div className="papeis">
        {(Object.keys(PAPEIS) as Papel[]).map((k) => {
          const I = ICONE_PAPEL[k];
          return (
            <div key={k} className={`papel-card papel-${k}`}>
              <I size={20} />
              <div><strong>{PAPEIS[k].r}</strong><small>{PAPEIS[k].desc}</small></div>
              <span className="papel-n">{lista.filter((p) => p.papel === k && p.ativo).length}</span>
            </div>
          );
        })}
      </div>

      <div className="secao-cab">
        <h2>Usuários</h2>
        <div className="acoes">
          <button className="btn btn-fantasma" onClick={carregar}><RefreshCw size={16} /> Atualizar</button>
          <button className="btn btn-primario" onClick={() => setForm({ ...NOVO })}><UserPlus size={18} /> Novo usuário</button>
        </div>
      </div>

      {pendentes.length > 0 && <div className="alerta-box info"><ShieldCheck size={16} /> {pendentes.length} conta(s) bloqueada(s) ou aguardando liberação. Clique em Liberar para dar acesso.</div>}

      {carregando ? <p className="muted">Carregando…</p> : lista.length === 0 ? (
        <Vazio icone={<Users size={36} />} titulo="Nenhum usuário" />
      ) : (
        <div className="cartao tabela-wrap">
          <table className="tabela">
            <thead><tr><th>Profissional</th><th>Nível de acesso</th><th>E-mail</th><th>Situação</th><th /></tr></thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.nome}</strong>{p.id === eu?.id && <Badge tom="info">você</Badge>}
                    <small className="bloco muted">{FUNCOES[p.funcao as Funcao] ?? p.funcao}{p.crmv ? ` • ${p.crmv}` : ''}</small>
                  </td>
                  <td><Badge tom={TOM_PAPEL[p.papel]}>{PAPEIS[p.papel].r}</Badge></td>
                  <td className="cel-quebra">{p.email}</td>
                  <td>{p.ativo ? <Badge tom="ok">Ativo</Badge> : <Badge tom="alerta">Bloqueado</Badge>}</td>
                  <td>
                    <div className="acoes-linha">
                      {p.id !== eu?.id && <button className={`btn btn-sm ${p.ativo ? 'btn-secundario' : 'btn-sucesso'}`} onClick={() => alternar(p)}>{p.ativo ? 'Bloquear' : 'Liberar'}</button>}
                      <button className="btn-icone" title="Editar" onClick={() => setForm({ id: p.id, nome: p.nome, email: p.email ?? '', senha: '', papel: p.papel, funcao: (p.funcao as Funcao) ?? 'outro', crmv: p.crmv ?? '', especialidade: p.especialidade ?? '', telefone: p.telefone ?? '', ativo: p.ativo })}><Pencil size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="muted">Para trocar a senha de alguém, a própria pessoa usa “Esqueci minha senha” na tela de login.</p>

      <Modal
        aberto={!!form}
        onFechar={() => setForm(null)}
        titulo={form?.id ? `Editar ${form.nome}` : 'Novo usuário'}
        rodape={<>
          <span className="flex1" />
          <button className="btn btn-secundario" onClick={() => setForm(null)}>Cancelar</button>
          <button className="btn btn-primario" onClick={salvar} disabled={salvando}>{salvando ? 'Salvando…' : form?.id ? 'Salvar' : 'Criar conta'}</button>
        </>}
      >
        {form && (
          <div className="grade-form g2">
            <Campo rotulo="Nome completo *" span={2}><input id="u-nome" value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Ex.: Dra. Maria Oliveira" /></Campo>
            {!form.id && (
              <>
                <Campo rotulo="E-mail de acesso *"><input id="u-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="off" /></Campo>
                <Campo rotulo="Senha provisória *" dica="Mínimo 6 caracteres. A pessoa pode trocar depois."><input id="u-senha" value={form.senha} onChange={(e) => set('senha', e.target.value)} autoComplete="new-password" /></Campo>
              </>
            )}
            <Campo rotulo="Nível de acesso" span={2}>
              <div className="opcoes-papel">
                {(Object.keys(PAPEIS) as Papel[]).map((k) => {
                  const I = ICONE_PAPEL[k];
                  return (
                    <button type="button" key={k} className={`opcao-papel ${form.papel === k ? 'ativo' : ''}`} onClick={() => { set('papel', k); if (k === 'veterinario' || k === 'admin') { if (form.funcao === 'auxiliar') set('funcao', 'veterinario'); } else if (form.funcao === 'veterinario') set('funcao', 'auxiliar'); }}>
                      <I size={18} /><span><strong>{PAPEIS[k].r}</strong><small>{PAPEIS[k].desc}</small></span>
                    </button>
                  );
                })}
              </div>
            </Campo>
            <Campo rotulo="Função" span={2}>
              <Chips<Funcao> permitirLimpar={false} valor={form.funcao} onChange={(v) => v && set('funcao', v)} opcoes={(Object.keys(FUNCOES) as Funcao[]).map((f) => ({ v: f, r: FUNCOES[f] }))} />
            </Campo>
            {form.funcao === 'veterinario' && (
              <>
                <Campo rotulo="CRMV" dica="Sai na assinatura do boletim e da alta"><input id="u-crmv" value={form.crmv} onChange={(e) => set('crmv', e.target.value)} placeholder="CRMV-TO 0000" /></Campo>
                <Campo rotulo="Especialidade"><input id="u-esp" value={form.especialidade} onChange={(e) => set('especialidade', e.target.value)} /></Campo>
              </>
            )}
            <Campo rotulo="Telefone"><input id="u-tel" inputMode="tel" value={form.telefone} onChange={(e) => set('telefone', e.target.value)} /></Campo>
            <Campo rotulo="Acesso">
              <label className="check"><input type="checkbox" checked={form.ativo} onChange={(e) => set('ativo', e.target.checked)} /> Liberado para entrar</label>
            </Campo>
          </div>
        )}
      </Modal>
    </div>
  );
}

interface Atividade { id: number; criado_em: string; usuario_nome: string | null; acao: string; paciente_id: string | null; paciente_nome: string | null }

function Atividades() {
  const { agora } = useStore();
  const [lista, setLista] = useState<Atividade[]>([]);
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState('');
  const carregar = useCallback(async () => {
    const { data, error } = await supabase.from('atividades').select('*').order('criado_em', { ascending: false }).limit(300);
    if (error) setErro(navigator.onLine ? error.message : 'Sem internet: o histórico de atividades precisa de conexão.');
    else { setErro(''); setLista(data as Atividade[]); }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);
  const q = busca.toLowerCase();
  const filtrada = lista.filter((a) => !q || `${a.usuario_nome} ${a.acao} ${a.paciente_nome}`.toLowerCase().includes(q));
  return (
    <div className="aba-conteudo">
      <div className="secao-cab">
        <div className="busca flex1"><Search size={16} /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Filtrar por profissional, paciente ou ação" /></div>
        <button className="btn btn-fantasma" onClick={carregar}><RefreshCw size={16} /> Atualizar</button>
      </div>
      {erro && <div className="alerta-box">{erro}</div>}
      <div className="cartao lista-simples">
        {filtrada.length === 0 && <p className="muted item-simples">Nenhuma atividade registrada ainda.</p>}
        {filtrada.map((a) => (
          <div key={a.id} className="item-simples">
            <span className="ativ-hora"><b>{fmtDataHora(a.criado_em)}</b><small className="muted">{relativo(new Date(a.criado_em), agora)}</small></span>
            <span className="flex1"><b>{a.usuario_nome ?? 'Sistema'}</b> {a.acao}{a.paciente_nome && <> — <a href={`#/paciente/${a.paciente_id}`}>{a.paciente_nome}</a></>}</span>
          </div>
        ))}
      </div>
      <p className="muted">Mostrando as 300 atividades mais recentes.</p>
    </div>
  );
}

function Sistema() {
  const { db, sync, sincronizar, carregarHistorico } = useStore();
  const toast = useToast();
  const internados = db.pacientes.filter((p) => p.status === 'internado').length;
  const exportar = () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vetclin-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div className="aba-conteudo">
      <div className="stats stats-4">
        <Stat rotulo={sync.online ? 'Conectado' : 'Sem internet'} valor={sync.online ? 'Online' : 'Offline'} icone={sync.online ? <Cloud /> : <CloudOff />} tom={sync.online ? 'ok' : 'alerta'} />
        <Stat rotulo="Alterações aguardando envio" valor={sync.pendentes} icone={<RefreshCw />} tom={sync.pendentes ? 'alerta' : 'ok'} />
        <Stat rotulo="Pacientes neste aparelho" valor={db.pacientes.length} icone={<Users />} tom="info" />
        <Stat rotulo="Internados agora" valor={internados} icone={<Activity />} tom="info" />
      </div>
      <div className="cartao">
        <h3 className="cartao-titulo">Sincronização</h3>
        <p className="muted">Última sincronização: {sync.ultimaSync ? fmtDataHora(sync.ultimaSync) : '—'}. As alterações feitas sem internet ficam guardadas neste aparelho e são enviadas automaticamente quando a conexão volta.</p>
        <div className="acoes">
          <button className="btn btn-primario" disabled={!sync.online || sync.sincronizando} onClick={() => sincronizar().then(() => toast('Sincronizado'))}><RefreshCw size={16} /> Sincronizar agora</button>
          <button className="btn btn-secundario" disabled={!sync.online} onClick={() => carregarHistorico().then((n) => toast(`${n} paciente(s) carregados do histórico`)).catch((e) => toast(e.message, 'erro'))}>Baixar histórico completo</button>
        </div>
      </div>
      <div className="cartao">
        <h3 className="cartao-titulo">Backup</h3>
        <p className="muted">Os dados ficam guardados no Supabase. O plano gratuito não guarda cópias automáticas, então baixe um backup em arquivo toda semana e guarde em local seguro (Google Drive, pendrive).</p>
        <button className="btn btn-secundario" onClick={exportar}><Download size={16} /> Baixar backup (.json)</button>
      </div>
    </div>
  );
}
