import { useEffect, useState, type FormEvent } from 'react';
import { LogIn, Mail, Lock, User, ShieldCheck, ArrowLeft, Eye, EyeOff, Clock3, LogOut, WifiOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth';
import logo from '../assets/logo-vetclin.png';

function Moldura({ children, rodape }: { children: React.ReactNode; rodape?: React.ReactNode }) {
  return (
    <div className="login-fundo">
      <div className="login-caixa">
        <img className="login-logo" src={logo} alt="VetClin Clínica Veterinária" />
        <p className="login-sub">Sistema de internação</p>
        {children}
      </div>
      {rodape && <div className="login-rodape">{rodape}</div>}
    </div>
  );
}

function CampoSenha({ id, valor, onChange, rotulo = 'Senha', auto = 'current-password' }: { id: string; valor: string; onChange: (v: string) => void; rotulo?: string; auto?: string }) {
  const [ver, setVer] = useState(false);
  return (
    <label className="campo" htmlFor={id}>
      <span className="campo-rotulo">{rotulo}</span>
      <div className="input-icone">
        <Lock size={16} />
        <input id={id} type={ver ? 'text' : 'password'} autoComplete={auto} value={valor} onChange={(e) => onChange(e.target.value)} required minLength={6} />
        <button type="button" className="btn-icone" onClick={() => setVer(!ver)} aria-label={ver ? 'Ocultar senha' : 'Mostrar senha'}>{ver ? <EyeOff size={16} /> : <Eye size={16} />}</button>
      </div>
    </label>
  );
}

export default function Login() {
  const { entrar } = useAuth();
  const [modo, setModo] = useState<'entrar' | 'esqueci' | 'primeiro'>('entrar');
  const [semAdmin, setSemAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    supabase.rpc('existe_admin').then(({ data, error }) => {
      if (!error && data === false) {
        setSemAdmin(true);
        setModo('primeiro');
      }
    });
  }, []);

  const submeter = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setAviso('');
    setEnviando(true);
    try {
      if (modo === 'entrar') {
        const r = await entrar(email, senha);
        if (r) setErro(r);
      } else if (modo === 'esqueci') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin + window.location.pathname });
        if (error) setErro(error.message);
        else setAviso('Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha.');
      } else {
        if (!nome.trim()) return setErro('Informe seu nome.');
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: senha, options: { data: { nome: nome.trim() } } });
        if (error) setErro(error.message);
        else if (!data.session) setAviso('Conta criada! Abra o link de confirmação enviado para o seu e-mail e depois entre com sua senha.');
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Moldura rodape={!navigator.onLine && <span><WifiOff size={14} /> Sem internet — o primeiro acesso em cada aparelho precisa de conexão.</span>}>
      {modo === 'primeiro' && (
        <div className="login-destaque">
          <ShieldCheck size={18} />
          <span>Primeiro acesso: crie a conta do <b>administrador</b> da clínica. Depois, os demais profissionais são cadastrados pelo painel administrativo.</span>
        </div>
      )}
      <form className="login-form" onSubmit={submeter}>
        {modo === 'primeiro' && (
          <label className="campo" htmlFor="login-nome">
            <span className="campo-rotulo">Seu nome</span>
            <div className="input-icone"><User size={16} /><input id="login-nome" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" placeholder="Ex.: Dra. Maria Oliveira" required /></div>
          </label>
        )}
        <label className="campo" htmlFor="login-email">
          <span className="campo-rotulo">E-mail</span>
          <div className="input-icone"><Mail size={16} /><input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        </label>
        {modo !== 'esqueci' && <CampoSenha id="login-senha" valor={senha} onChange={setSenha} auto={modo === 'primeiro' ? 'new-password' : 'current-password'} rotulo={modo === 'primeiro' ? 'Crie uma senha (mínimo 6 caracteres)' : 'Senha'} />}
        {erro && <div className="login-erro" role="alert">{erro}</div>}
        {aviso && <div className="login-aviso" role="status">{aviso}</div>}
        <button className="btn btn-primario btn-largo" disabled={enviando}>
          {modo === 'entrar' ? <><LogIn size={18} /> Entrar</> : modo === 'esqueci' ? 'Enviar link de recuperação' : <><ShieldCheck size={18} /> Criar conta de administrador</>}
        </button>
      </form>
      <div className="login-links">
        {modo === 'entrar' && <button className="link" onClick={() => { setModo('esqueci'); setErro(''); setAviso(''); }}>Esqueci minha senha</button>}
        {modo === 'esqueci' && <button className="link" onClick={() => setModo('entrar')}><ArrowLeft size={14} /> Voltar para o login</button>}
        {modo === 'primeiro' && <button className="link" onClick={() => setModo('entrar')}>Já tenho conta</button>}
        {modo === 'entrar' && semAdmin && <button className="link" onClick={() => setModo('primeiro')}>Primeiro acesso</button>}
      </div>
    </Moldura>
  );
}

export function NovaSenha() {
  const { encerrarRecuperacao } = useAuth();
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState(false);
  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) setErro(error.message);
    else setOk(true);
  };
  return (
    <Moldura>
      {ok ? (
        <>
          <div className="login-aviso">Senha alterada com sucesso.</div>
          <button className="btn btn-primario btn-largo" onClick={encerrarRecuperacao}>Continuar</button>
        </>
      ) : (
        <form className="login-form" onSubmit={salvar}>
          <h2>Criar nova senha</h2>
          <CampoSenha id="nova-senha" valor={senha} onChange={setSenha} rotulo="Nova senha (mínimo 6 caracteres)" auto="new-password" />
          {erro && <div className="login-erro">{erro}</div>}
          <button className="btn btn-primario btn-largo">Salvar nova senha</button>
        </form>
      )}
    </Moldura>
  );
}

export function AguardandoLiberacao() {
  const { perfil, sair, recarregarPerfil } = useAuth();
  return (
    <Moldura>
      <div className="login-destaque">
        <Clock3 size={18} />
        <span>Olá{perfil?.nome ? `, ${perfil.nome}` : ''}! Seu acesso ainda não foi liberado. Peça ao administrador da clínica para ativar sua conta no painel administrativo.</span>
      </div>
      <div className="login-form">
        <button className="btn btn-primario btn-largo" onClick={recarregarPerfil}>Já fui liberado — tentar de novo</button>
        <button className="btn btn-secundario btn-largo" onClick={sair}><LogOut size={16} /> Sair</button>
      </div>
    </Moldura>
  );
}

export function Carregando({ texto = 'Carregando...' }: { texto?: string }) {
  return (
    <div className="login-fundo">
      <div className="carregando">
        <img src={logo} alt="" />
        <span>{texto}</span>
      </div>
    </div>
  );
}
