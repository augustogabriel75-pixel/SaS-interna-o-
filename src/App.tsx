import { useMemo, useState } from 'react';
import {
  LayoutGrid, Clock, Users, PlusCircle, Calculator, Pill, Settings, Menu, X, UserCircle2, Stethoscope, ShieldCheck, LogOut, Cloud, CloudOff, RefreshCw, Lock,
} from 'lucide-react';
import { useRota, ir } from './router';
import { useStore, nomesEquipe } from './store';
import logoCirculo from './assets/logo-vetclin-circulo.png';
import Equipe from './pages/Equipe';
import { dosesPaciente } from './utils/calc';
import Painel from './pages/Painel';
import Agenda from './pages/Agenda';
import Pacientes from './pages/Pacientes';
import Internar from './pages/Internar';
import PacientePage from './pages/paciente/PacientePage';
import Calculadoras from './pages/Calculadoras';
import Bulario from './pages/Bulario';
import Configuracoes from './pages/Configuracoes';
import Admin from './pages/Admin';
import { useAuth, PAPEIS, type Permissoes } from './auth';
import { NUVEM } from './lib/supabase';
import { Vazio } from './components/ui';

type ItemMenu = { id: string; rotulo: string; icone: typeof LayoutGrid; exige?: keyof Permissoes; so?: 'nuvem' | 'local' };

const MENU: ItemMenu[] = [
  { id: 'painel', rotulo: 'Mapa de internação', icone: LayoutGrid },
  { id: 'agenda', rotulo: 'Agenda de medicações', icone: Clock },
  { id: 'internar', rotulo: 'Nova internação', icone: PlusCircle, exige: 'internar' },
  { id: 'pacientes', rotulo: 'Pacientes', icone: Users },
  { id: 'equipe', rotulo: 'Profissionais', icone: Stethoscope, so: 'local' },
  { id: 'calculadoras', rotulo: 'Calculadoras', icone: Calculator },
  { id: 'bulario', rotulo: 'Bulário', icone: Pill },
  { id: 'config', rotulo: 'Configurações', icone: Settings, exige: 'configurar' },
  { id: 'admin', rotulo: 'Painel administrativo', icone: ShieldCheck, exige: 'admin', so: 'nuvem' },
];

const ROTA_EXIGE: Record<string, keyof Permissoes> = { internar: 'internar', config: 'configurar', admin: 'admin' };

function SemPermissao() {
  return (
    <div className="pagina">
      <Vazio icone={<Lock size={36} />} titulo="Seu nível de acesso não permite abrir esta tela" texto="Fale com o administrador da clínica se precisar desta permissão." acao={<a className="btn btn-primario" href="#/painel">Voltar ao mapa</a>} />
    </div>
  );
}

export default function App() {
  const { partes, params } = useRota();
  const { db, atualizar, agora, sync, sincronizar } = useStore();
  const { perfil, pode, sair } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const pagina = partes[0] || 'painel';
  const equipe = nomesEquipe(db.config);

  const atrasadas = useMemo(() => {
    const de = new Date(agora.getTime() - 24 * 3600_000);
    return db.pacientes
      .filter((p) => p.status === 'internado')
      .flatMap((p) => dosesPaciente(p, de, agora, agora))
      .filter((d) => d.status === 'atrasado').length;
  }, [db.pacientes, agora]);

  const menu = MENU.filter((m) => (!m.exige || pode[m.exige]) && (!m.so || (m.so === 'nuvem') === NUVEM));
  const editando = pagina === 'internar' && params.get('editar');
  const bloqueado = (ROTA_EXIGE[pagina] && !pode[ROTA_EXIGE[pagina]] && !(editando && pode.editarPaciente)) || (pagina === 'admin' && !NUVEM) || (pagina === 'equipe' && NUVEM);

  let conteudo;
  if (bloqueado) conteudo = <SemPermissao />;
  else switch (pagina) {
    case 'agenda': conteudo = <Agenda />; break;
    case 'pacientes': conteudo = <Pacientes />; break;
    case 'internar': conteudo = <Internar boxInicial={params.get('box') ?? undefined} editarId={params.get('editar') ?? undefined} />; break;
    case 'paciente': conteudo = <PacientePage id={partes[1]} aba={partes[2]} />; break;
    case 'calculadoras': conteudo = <Calculadoras />; break;
    case 'bulario': conteudo = <Bulario />; break;
    case 'config': conteudo = <Configuracoes />; break;
    case 'equipe': conteudo = <Equipe />; break;
    case 'admin': conteudo = <Admin />; break;
    default: conteudo = <Painel />;
  }

  return (
    <div className="app">
      <aside className={`lateral ${menuAberto ? 'aberta' : ''}`}>
        <div className="marca">
          <img className="marca-logo" src={logoCirculo} alt="VetClin" />
          <div>
            <strong>{db.config.clinica.split(' ')[0] || 'VetClin'}</strong>
            <small>Internação</small>
          </div>
          <button className="btn-icone so-mobile" onClick={() => setMenuAberto(false)} aria-label="Fechar menu"><X size={20} /></button>
        </div>
        <nav>
          {menu.map((m) => {
            const Icone = m.icone;
            const ativo = pagina === m.id || (m.id === 'pacientes' && pagina === 'paciente');
            return (
              <a key={m.id} href={`#/${m.id}`} className={`nav-item ${ativo ? 'ativo' : ''}`} onClick={() => setMenuAberto(false)}>
                <Icone size={19} />
                <span>{m.rotulo}</span>
                {m.id === 'agenda' && atrasadas > 0 && <span className="nav-alerta">{atrasadas}</span>}
              </a>
            );
          })}
        </nav>
        <div className="lateral-rodape">
          {NUVEM && perfil ? (
            <>
              <div className="usuario-logado">
                <UserCircle2 size={22} />
                <div className="flex1">
                  <strong>{perfil.nome}</strong>
                  <small>{PAPEIS[perfil.papel].r}</small>
                </div>
                <button className="btn-icone" onClick={sair} title="Sair" aria-label="Sair"><LogOut size={18} /></button>
              </div>
              <button className={`status-sync ${sync.online ? (sync.pendentes ? 'pendente' : 'ok') : 'offline'}`} onClick={() => sincronizar()} title="Sincronizar agora">
                {sync.online ? (sync.sincronizando ? <RefreshCw size={14} className="girando" /> : <Cloud size={14} />) : <CloudOff size={14} />}
                {!sync.online ? `Sem internet${sync.pendentes ? ` • ${sync.pendentes} pendente(s)` : ' • salvo no aparelho'}` : sync.pendentes ? `Enviando ${sync.pendentes} alteração(ões)…` : 'Sincronizado'}
              </button>
            </>
          ) : equipe.length ? (
            <label className="usuario">
              <UserCircle2 size={20} />
              <select value={db.usuarioAtual} onChange={(e) => atualizar((d) => { d.usuarioAtual = e.target.value; })} aria-label="Profissional de plantão">
                {!equipe.includes(db.usuarioAtual) && <option value="">Quem está de plantão?</option>}
                {equipe.map((u) => <option key={u}>{u}</option>)}
              </select>
            </label>
          ) : (
            <a className="btn btn-sm btn-secundario" href="#/equipe" onClick={() => setMenuAberto(false)}>Cadastrar profissionais</a>
          )}
          <small>Plantão: {agora.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })} • {agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small>
        </div>
      </aside>
      {menuAberto && <div className="lateral-fundo" onClick={() => setMenuAberto(false)} />}

      <div className="principal">
        <header className="topo so-mobile">
          <button className="btn-icone" onClick={() => setMenuAberto(true)} aria-label="Abrir menu"><Menu size={22} /></button>
          <span className="topo-marca"><img src={logoCirculo} alt="" /> <strong>{db.config.clinica.split(' ')[0] || 'VetClin'}</strong>{NUVEM && !sync.online && <CloudOff size={16} className="txt-alerta" aria-label="Sem internet" />}</span>
          <button className="btn-icone" onClick={() => ir('/agenda')} aria-label="Agenda">
            <Clock size={20} />
            {atrasadas > 0 && <span className="ponto-alerta">{atrasadas}</span>}
          </button>
        </header>
        <main className="conteudo">{conteudo}</main>
      </div>
    </div>
  );
}
