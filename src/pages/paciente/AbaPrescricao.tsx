import { useState } from 'react';
import { usePode } from '../../auth';
import { Plus, Pencil, PauseCircle, PlayCircle, Trash2, Zap, Pill, Printer } from 'lucide-react';
import type { Paciente, Prescricao } from '../../types';
import { useStore } from '../../store';
import { Badge, Vazio, useToast, useConfirmar, PODE_IMPRIMIR } from '../../components/ui';
import { rotuloFrequencia } from '../../data/medicamentos';
import { textoQuantidade, fmtNum, unidadeAtivo, horariosPrescricao } from '../../utils/calc';
import { fmtDataHora, fmtHora, uid } from '../../utils/format';
import PrescricaoForm from './PrescricaoForm';

export default function AbaPrescricao({ p }: { p: Paciente }) {
  const { atualizarPaciente, db, agora } = useStore();
  const toast = useToast();
  const pode = usePode();
  const confirmar = useConfirmar();
  const [form, setForm] = useState<{ editar?: Prescricao } | null>(null);
  const ativas = p.prescricoes.filter((x) => x.ativa);
  const inativas = p.prescricoes.filter((x) => !x.ativa);

  const suspender = (pr: Prescricao) => atualizarPaciente(p.id, (x) => {
    const r = x.prescricoes.find((i) => i.id === pr.id)!;
    r.ativa = false;
    r.suspensaEm = new Date().toISOString();
  });
  const reativar = (pr: Prescricao) => atualizarPaciente(p.id, (x) => {
    const r = x.prescricoes.find((i) => i.id === pr.id)!;
    r.ativa = true;
    r.suspensaEm = undefined;
  });
  const excluir = async (pr: Prescricao) => {
    if (!(await confirmar({ titulo: `Excluir a prescrição de ${pr.nome}?`, texto: 'Os registros de aplicação desta medicação também serão removidos. Para manter o histórico, use Suspender.', botao: 'Excluir', perigo: true }))) return;
    atualizarPaciente(p.id, (x) => {
      x.prescricoes = x.prescricoes.filter((i) => i.id !== pr.id);
      x.aplicacoes = x.aplicacoes.filter((a) => a.prescricaoId !== pr.id);
    });
  };
  const aplicarSOS = (pr: Prescricao) => {
    const agoraIso = new Date().toISOString();
    atualizarPaciente(p.id, (x) => {
      x.aplicacoes.push({ id: uid(), prescricaoId: pr.id, horario: agoraIso, status: 'aplicado', realizadoEm: agoraIso, responsavel: db.usuarioAtual, obs: 'Dose SOS' });
    });
    toast(`${pr.nome} (SOS) aplicado às ${fmtHora(agoraIso)}`);
  };

  const Linha = ({ pr }: { pr: Prescricao }) => {
    const prox = horariosPrescricao(pr, agora, new Date(agora.getTime() + 14 * 86400_000))[0];
    const fim = pr.duracaoDias > 0 ? new Date(new Date(pr.inicio).getTime() + pr.duracaoDias * 86400_000) : null;
    return (
      <div className={`linha-rx ${!pr.ativa ? 'inativa' : ''}`}>
        <div className="rx-principal">
          <div className="rx-nome">
            <strong>{pr.nome}</strong>
            {pr.classe && <Badge>{pr.classe}</Badge>}
            {pr.seNecessario && <Badge tom="roxo">SOS</Badge>}
            {!pr.ativa && <Badge tom="alerta">Suspensa</Badge>}
          </div>
          <div className="rx-dose">
            <span className="rx-qtd">{textoQuantidade(pr, p.peso)}</span>
            <span className="rx-via">{pr.via}</span>
            <span>{pr.seNecessario ? 'se necessário' : rotuloFrequencia(pr.frequenciaHoras)}</span>
          </div>
          <small className="muted">
            {fmtNum(pr.dose, 3)} {pr.unidadeDose} ({fmtNum(pr.dose * p.peso, 2)} {unidadeAtivo(pr.unidadeDose)})
            {pr.unidadeDose !== 'mL/kg' && ` • ${fmtNum(pr.concentracao, 3)} ${unidadeAtivo(pr.unidadeDose)}/${pr.forma}`}
            {' • '}Início {fmtDataHora(pr.inicio)}{fim ? ` • até ${fmtDataHora(fim)}` : ' • contínuo'}
            {pr.prescritor && ` • ${pr.prescritor}`}
          </small>
          {(pr.diluicao || pr.observacoes) && <small className="rx-obs">{[pr.diluicao, pr.observacoes].filter(Boolean).join(' • ')}</small>}
          {pr.ativa && prox && <small className="rx-prox">Próxima dose: {fmtDataHora(prox)}</small>}
        </div>
        <div className="rx-acoes nao-imprimir">
          {pr.ativa && pr.seNecessario && <button className="btn btn-sm btn-sucesso" onClick={() => aplicarSOS(pr)}><Zap size={14} /> Aplicar agora</button>}
          {pode.prescrever && <>
          <button className="btn-icone" title="Editar" onClick={() => setForm({ editar: pr })}><Pencil size={17} /></button>
          {pr.ativa ? (
            <button className="btn-icone" title="Suspender" onClick={() => suspender(pr)}><PauseCircle size={17} /></button>
          ) : (
            <button className="btn-icone" title="Reativar" onClick={() => reativar(pr)}><PlayCircle size={17} /></button>
          )}
          <button className="btn-icone perigo" title="Excluir" onClick={() => excluir(pr)}><Trash2 size={17} /></button>
          </>}
        </div>
      </div>
    );
  };

  return (
    <div className="aba-conteudo">
      <div className="secao-cab">
        <h2>Prescrição médica</h2>
        <div className="acoes">
          {PODE_IMPRIMIR && <button className="btn btn-secundario nao-imprimir" onClick={() => window.print()}><Printer size={16} /> Imprimir</button>}
          {pode.prescrever && <button className="btn btn-primario nao-imprimir" onClick={() => setForm({})}><Plus size={18} /> Prescrever</button>}
        </div>
      </div>
      {p.prescricoes.length === 0 ? (
        <Vazio icone={<Pill size={36} />} titulo="Nenhuma medicação prescrita" texto="Adicione as medicações do paciente. Dose e volume são calculados automaticamente pelo peso." acao={pode.prescrever ? <button className="btn btn-primario" onClick={() => setForm({})}><Plus size={18} /> Prescrever medicação</button> : undefined} />
      ) : (
        <>
          <div className="cartao lista-rx">{ativas.map((pr) => <Linha key={pr.id} pr={pr} />)}{ativas.length === 0 && <p className="muted">Nenhuma prescrição ativa.</p>}</div>
          {inativas.length > 0 && (
            <>
              <h3 className="mt">Suspensas / encerradas</h3>
              <div className="cartao lista-rx">{inativas.map((pr) => <Linha key={pr.id} pr={pr} />)}</div>
            </>
          )}
        </>
      )}
      {form && <PrescricaoForm paciente={p} editar={form.editar} onFechar={() => setForm(null)} />}
    </div>
  );
}
