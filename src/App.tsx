import { useMemo, useState } from 'react';
import {
  LayoutGrid, Clock, Users, PlusCircle, Calculator, Pill, Settings, Menu, X, UserCircle2, Stethoscope,
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

const MENU = [
  { id: 'painel', rotulo: 'Mapa de internação', icone: LayoutGrid },
  { id: 'agenda', rotulo: 'Agenda de medicações', icone: Clock },
  { id: 'internar', rotulo: 'Nova internação', icone: PlusCircle },
  { id: 'pacientes', rotulo: 'Pacientes', icone: Users },
  { id: 'equipe', rotulo: 'Profissionais', icone: Stethoscope },
  { id: 'calculadoras', rotulo: 'Calculadoras', icone: Calculator },
  { id: 'bulario', rotulo: 'Bulário', icone: Pill },
  { id: 'config', rotulo: 'Configurações', icone: Settings },
];

export default function App() {
  const { partes, params } = useRota();
  const { db, atualizar, agora } = useStore();
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

  let conteudo;
  switch (pagina) {
    case 'agenda': conteudo = <Agenda />; break;
    case 'pacientes': conteudo = <Pacientes />; break;
    case 'internar': conteudo = <Internar boxInicial={params.get('box') ?? undefined} editarId={params.get('editar') ?? undefined} />; break;
    case 'paciente': conteudo = <PacientePage id={partes[1]} aba={partes[2]} />; break;
    case 'calculadoras': conteudo = <Calculadoras />; break;
    case 'bulario': conteudo = <Bulario />; break;
    case 'config': conteudo = <Configuracoes />; break;
    case 'equipe': conteudo = <Equipe />; break;
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
          {MENU.map((m) => {
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
          {equipe.length ? (
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
          <span className="topo-marca"><img src={logoCirculo} alt="" /> <strong>{db.config.clinica.split(' ')[0] || 'VetClin'}</strong></span>
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
