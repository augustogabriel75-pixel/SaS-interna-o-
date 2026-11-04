import { ArrowLeft, Pencil, MessageCircle, Phone, ShieldAlert, AlertTriangle, LayoutDashboard, Pill, CalendarClock, Activity, Droplets, FileText, LogOut } from 'lucide-react';
import { useStore, nomeBox } from '../../store';
import { Abas, Badge, Vazio } from '../../components/ui';
import { GRAV, IconeEspecie } from '../Painel';
import { fmtData, tempoInternado, especieRotulo, sexoRotulo, linkWhatsApp } from '../../utils/format';
import { dosesPaciente, fmtNum } from '../../utils/calc';
import { ir } from '../../router';
import AbaResumo from './AbaResumo';
import AbaPrescricao from './AbaPrescricao';
import AbaExecucao from './AbaExecucao';
import AbaMonitoramento from './AbaMonitoramento';
import AbaFluido from './AbaFluido';
import AbaBoletim from './AbaBoletim';
import AbaAlta from './AbaAlta';

type AbaId = 'resumo' | 'prescricao' | 'execucao' | 'monitoramento' | 'fluido' | 'boletim' | 'alta';

export default function PacientePage({ id, aba }: { id: string; aba?: string }) {
  const { db, paciente, agora } = useStore();
  const p = paciente(id);
  if (!p) return <div className="pagina"><Vazio titulo="Paciente não encontrado" acao={<button className="btn btn-primario" onClick={() => ir('/painel')}>Voltar ao mapa</button>} /></div>;

  const ativa = (['resumo', 'prescricao', 'execucao', 'monitoramento', 'fluido', 'boletim', 'alta'].includes(aba ?? '') ? aba : 'resumo') as AbaId;
  const atrasadas = dosesPaciente(p, new Date(agora.getTime() - 24 * 3600_000), agora, agora).filter((d) => d.status === 'atrasado').length;
  const g = GRAV[p.gravidade];
  const internado = p.status === 'internado';

  return (
    <div className="pagina">
      <div className="cab-paciente cartao">
        <button className="btn-icone voltar" onClick={() => ir('/painel')} aria-label="Voltar"><ArrowLeft size={20} /></button>
        <div className={`avatar avatar-lg avatar-${p.especie}`}><IconeEspecie especie={p.especie} size={28} /></div>
        <div className="cp-info">
          <div className="cp-nome">
            <h1>{p.nome}</h1>
            {internado ? <Badge tom={g.tom}>{g.r}</Badge> : <Badge tom="neutro">{p.status === 'alta' ? 'Alta' : p.status === 'obito' ? 'Óbito' : 'Transferido'}</Badge>}
            {p.isolamento && <Badge tom="alerta"><ShieldAlert size={12} /> Isolamento</Badge>}
            {p.jejum && <Badge>Jejum</Badge>}
          </div>
          <div className="cp-dados">
            <span>{especieRotulo(p.especie)} • {p.raca} • {sexoRotulo(p.sexo, p.castrado)}{p.idade && ` • ${p.idade}`}</span>
            <span className="cp-peso">{fmtNum(p.peso)} kg</span>
          </div>
          <div className="cp-dados muted">
            {internado && <span>📍 {nomeBox(db.config, p.boxId)}</span>}
            <span>Entrada {fmtData(p.dataEntrada)} ({tempoInternado(p.dataEntrada, agora)})</span>
            {p.altaPrevista && internado && <span>Alta prevista {fmtData(p.altaPrevista)}</span>}
            <span>🩺 {p.veterinario}</span>
          </div>
          {p.diagnosticos.length > 0 && <div className="cp-diag">{p.diagnosticos.join(' • ')}</div>}
        </div>
        <div className="cp-acoes">
          <div className="cp-tutor">
            <small>Tutor</small>
            <strong>{p.tutor.nome}</strong>
          </div>
          <div className="acoes">
            {p.tutor.telefone && <a className="btn-icone" href={`tel:${p.tutor.telefone.replace(/\D/g, '')}`} title="Ligar"><Phone size={18} /></a>}
            {p.tutor.telefone && <a className="btn-icone whats" href={linkWhatsApp(p.tutor.telefone, `Olá, ${p.tutor.nome}! Aqui é da ${db.config.clinica}, sobre o(a) ${p.nome}.`)} target="_blank" rel="noreferrer" title="WhatsApp"><MessageCircle size={18} /></a>}
            <button className="btn btn-sm btn-secundario" onClick={() => ir(`/internar?editar=${p.id}`)}><Pencil size={14} /> Editar dados</button>
          </div>
        </div>
      </div>

      {(p.alergias || p.alertas) && (
        <div className="alerta-box">
          <AlertTriangle size={16} />
          <span>{p.alergias && <><b>Alergias:</b> {p.alergias}. </>}{p.alertas && <><b>Alerta:</b> {p.alertas}</>}</span>
        </div>
      )}

      <Abas<AbaId>
        ativa={ativa}
        onChange={(a) => ir(`/paciente/${p.id}/${a}`)}
        abas={[
          { id: 'resumo', rotulo: 'Resumo', icone: <LayoutDashboard size={16} /> },
          { id: 'prescricao', rotulo: 'Prescrição', icone: <Pill size={16} />, contador: p.prescricoes.filter((x) => x.ativa).length },
          { id: 'execucao', rotulo: 'Execução', icone: <CalendarClock size={16} />, contador: atrasadas },
          { id: 'monitoramento', rotulo: 'Monitoramento', icone: <Activity size={16} /> },
          { id: 'fluido', rotulo: 'Soro / Fluido', icone: <Droplets size={16} /> },
          { id: 'boletim', rotulo: 'Boletim', icone: <FileText size={16} /> },
          { id: 'alta', rotulo: internado ? 'Alta' : 'Saída', icone: <LogOut size={16} /> },
        ]}
      />

      {ativa === 'resumo' && <AbaResumo key={p.id} p={p} />}
      {ativa === 'prescricao' && <AbaPrescricao p={p} />}
      {ativa === 'execucao' && <AbaExecucao p={p} />}
      {ativa === 'monitoramento' && <AbaMonitoramento p={p} />}
      {ativa === 'fluido' && <AbaFluido p={p} />}
      {ativa === 'boletim' && <AbaBoletim p={p} />}
      {ativa === 'alta' && <AbaAlta key={p.id + p.status} p={p} />}
    </div>
  );
}
