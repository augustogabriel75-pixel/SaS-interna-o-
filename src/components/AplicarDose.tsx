import { useEffect, useState } from 'react';
import { NUVEM } from '../lib/supabase';
import { Check, Undo2, XCircle } from 'lucide-react';
import { Modal, Campo, Badge, useToast } from './ui';
import { useStore, nomesEquipe } from '../store';
import type { DoseAgendada } from '../utils/calc';
import { textoQuantidade, fmtNum, unidadeAtivo } from '../utils/calc';
import { fmtDataHora, toLocalInput, fromLocalInput, uid } from '../utils/format';

export function rotuloDose(d: DoseAgendada['prescricao'], peso: number) {
  return `${fmtNum(d.dose, 3)} ${d.unidadeDose} → ${fmtNum(d.dose * peso, 2)} ${unidadeAtivo(d.unidadeDose)} = ${textoQuantidade(d, peso)}`;
}

export const STATUS_DOSE = {
  aplicado: { r: 'Aplicado', tom: 'ok' as const },
  nao_aplicado: { r: 'Não aplicado', tom: 'alerta' as const },
  atrasado: { r: 'Atrasado', tom: 'perigo' as const },
  pendente: { r: 'Pendente', tom: 'neutro' as const },
};

export default function AplicarDose({ dose, onFechar }: { dose: DoseAgendada | null; onFechar: () => void }) {
  const { db, atualizarPaciente } = useStore();
  const toast = useToast();
  const [quando, setQuando] = useState(toLocalInput());
  const [resp, setResp] = useState(db.usuarioAtual);
  const [obs, setObs] = useState('');

  useEffect(() => {
    if (dose) {
      const ap = dose.paciente.aplicacoes.find((a) => a.id === dose.aplicacaoId);
      setQuando(toLocalInput(ap?.realizadoEm ?? new Date()));
      setResp(ap?.responsavel ?? db.usuarioAtual);
      setObs(ap?.obs ?? '');
    }
  }, [dose, db.usuarioAtual]);

  if (!dose) return null;
  const { paciente: p, prescricao: pr } = dose;
  const st = STATUS_DOSE[dose.status];

  const registrar = (status: 'aplicado' | 'nao_aplicado') => {
    if (!resp.trim()) {
      toast('Informe quem aplicou (cadastre a equipe em Profissionais)', 'erro');
      return;
    }
    if (status === 'nao_aplicado' && !obs.trim()) {
      toast('Informe o motivo da não aplicação', 'erro');
      return;
    }
    const iso = dose.horario.toISOString();
    atualizarPaciente(p.id, (x) => {
      x.aplicacoes = x.aplicacoes.filter((a) => !(a.prescricaoId === pr.id && a.horario === iso));
      x.aplicacoes.push({ id: uid(), prescricaoId: pr.id, horario: iso, status, realizadoEm: fromLocalInput(quando), responsavel: resp, obs: obs.trim() || undefined });
    });
    toast(status === 'aplicado' ? `${pr.nome} registrado como aplicado` : `${pr.nome} marcado como não aplicado`, status === 'aplicado' ? 'ok' : 'info');
    onFechar();
  };

  const desfazer = () => {
    atualizarPaciente(p.id, (x) => {
      x.aplicacoes = x.aplicacoes.filter((a) => a.id !== dose.aplicacaoId);
    });
    toast('Registro desfeito', 'info');
    onFechar();
  };

  return (
    <Modal
      aberto
      onFechar={onFechar}
      titulo={<>Checagem de medicação</>}
      rodape={
        <>
          {dose.aplicacaoId && <button className="btn btn-fantasma" onClick={desfazer}><Undo2 size={16} /> Desfazer</button>}
          <span className="flex1" />
          <button className="btn btn-alerta" onClick={() => registrar('nao_aplicado')}><XCircle size={16} /> Não aplicado</button>
          <button className="btn btn-sucesso" onClick={() => registrar('aplicado')}><Check size={16} /> Aplicado</button>
        </>
      }
    >
      <div className="dose-resumo">
        <div className="dose-resumo-linha">
          <strong className="dose-med">{pr.nome}</strong>
          <Badge tom={st.tom}>{st.r}</Badge>
        </div>
        <div className="dose-grande">{textoQuantidade(pr, p.peso)} <span>{pr.via}</span></div>
        <div className="muted">{rotuloDose(pr, p.peso)}</div>
        <div className="dose-info">
          <span><b>Paciente:</b> {p.nome} ({fmtNum(p.peso)} kg)</span>
          <span><b>Horário programado:</b> {fmtDataHora(dose.horario)}</span>
          {pr.diluicao && <span><b>Diluição:</b> {pr.diluicao}</span>}
          {pr.observacoes && <span><b>Obs.:</b> {pr.observacoes}</span>}
        </div>
      </div>
      <div className="grade-form g2">
        <Campo rotulo="Realizado em">
          <input type="datetime-local" value={quando} onChange={(e) => setQuando(e.target.value)} />
        </Campo>
        <Campo rotulo="Responsável">
          {NUVEM ? (
            <input value={resp} readOnly aria-readonly="true" />
          ) : nomesEquipe(db.config).length ? (
            <select value={resp} onChange={(e) => setResp(e.target.value)}>
              {!nomesEquipe(db.config).includes(resp) && <option value={resp}>{resp || 'Selecione'}</option>}
              {nomesEquipe(db.config).map((u) => <option key={u}>{u}</option>)}
            </select>
          ) : (
            <input value={resp} onChange={(e) => setResp(e.target.value)} placeholder="Nome de quem aplicou" />
          )}
        </Campo>
        <Campo rotulo="Observação / motivo" span={2}>
          <input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex.: paciente vomitou após, aplicado com atraso, recusou VO..." />
        </Campo>
      </div>
    </Modal>
  );
}
