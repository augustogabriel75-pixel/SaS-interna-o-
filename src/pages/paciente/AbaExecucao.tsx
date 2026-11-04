import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Check, X, AlertTriangle, Printer } from 'lucide-react';
import type { Paciente } from '../../types';
import { useStore } from '../../store';
import { dosesPaciente, textoQuantidade, type DoseAgendada } from '../../utils/calc';
import { inicioDoDia, fimDoDia, fmtHora } from '../../utils/format';
import { rotuloFrequencia } from '../../data/medicamentos';
import AplicarDose from '../../components/AplicarDose';
import { Vazio, PODE_IMPRIMIR } from '../../components/ui';

const HORAS = Array.from({ length: 24 }, (_, i) => i);

export default function AbaExecucao({ p }: { p: Paciente }) {
  const { agora } = useStore();
  const [dia, setDia] = useState(() => inicioDoDia(agora));
  const [sel, setSel] = useState<DoseAgendada | null>(null);

  const doses = useMemo(() => dosesPaciente(p, inicioDoDia(dia), fimDoDia(dia), agora), [p, dia, agora]);
  const linhas = useMemo(() => {
    const ids = new Set(doses.map((d) => d.prescricao.id));
    const sos = p.prescricoes.filter((x) => x.seNecessario && p.aplicacoes.some((a) => a.prescricaoId === x.id && new Date(a.horario) >= inicioDoDia(dia) && new Date(a.horario) <= fimDoDia(dia)));
    return [...p.prescricoes.filter((x) => ids.has(x.id)), ...sos];
  }, [doses, p, dia]);

  const mudarDia = (n: number) => setDia((d) => new Date(d.getTime() + n * 86400_000));
  const hoje = inicioDoDia(agora).getTime() === dia.getTime();
  const horaAtual = agora.getHours();

  const total = doses.length;
  const feitas = doses.filter((d) => d.status === 'aplicado').length;
  const atrasadas = doses.filter((d) => d.status === 'atrasado').length;

  return (
    <div className="aba-conteudo">
      <div className="secao-cab">
        <h2>Mapa de execução</h2>
        <div className="acoes">
          <div className="nav-dia">
            <button className="btn-icone" onClick={() => mudarDia(-1)} aria-label="Dia anterior"><ChevronLeft size={18} /></button>
            <button className="btn btn-sm btn-fantasma" onClick={() => setDia(inicioDoDia(agora))}>{hoje ? 'Hoje' : dia.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}</button>
            <button className="btn-icone" onClick={() => mudarDia(1)} aria-label="Próximo dia"><ChevronRight size={18} /></button>
          </div>
          {PODE_IMPRIMIR && <button className="btn btn-secundario nao-imprimir" onClick={() => window.print()}><Printer size={16} /> Imprimir</button>}
        </div>
      </div>

      <div className="resumo-exec">
        <span><b>{feitas}</b>/{total} checadas</span>
        <div className="barra"><div style={{ width: total ? `${(feitas / total) * 100}%` : 0 }} /></div>
        {atrasadas > 0 && <span className="txt-perigo"><AlertTriangle size={14} /> {atrasadas} atrasada(s)</span>}
      </div>

      {linhas.length === 0 ? (
        <Vazio titulo="Sem medicações programadas neste dia" />
      ) : (
        <div className="cartao grade-exec-wrap">
          <table className="grade-exec">
            <thead>
              <tr>
                <th className="col-med">Medicação</th>
                {HORAS.map((h) => <th key={h} className={hoje && h === horaAtual ? 'hora-atual' : ''}>{String(h).padStart(2, '0')}</th>)}
              </tr>
            </thead>
            <tbody>
              {linhas.map((pr) => (
                <tr key={pr.id}>
                  <td className="col-med">
                    <strong>{pr.nome}</strong>
                    <small>{textoQuantidade(pr, p.peso)} {pr.via} • {pr.seNecessario ? 'SOS' : rotuloFrequencia(pr.frequenciaHoras).split(' — ')[0]}</small>
                  </td>
                  {HORAS.map((h) => {
                    const ds = doses.filter((d) => d.prescricao.id === pr.id && d.horario.getHours() === h);
                    const sos = pr.seNecessario ? p.aplicacoes.filter((a) => a.prescricaoId === pr.id && new Date(a.horario).getHours() === h && new Date(a.horario) >= dia && new Date(a.horario) <= fimDoDia(dia)) : [];
                    return (
                      <td key={h} className={hoje && h === horaAtual ? 'hora-atual' : ''}>
                        {ds.map((d) => {
                          const ap = p.aplicacoes.find((a) => a.id === d.aplicacaoId);
                          return (
                            <button key={d.horario.toISOString()} className={`cel-dose st-${d.status}`} onClick={() => setSel(d)} title={`${fmtHora(d.horario)} — ${pr.nome}${ap ? ` • ${ap.responsavel} às ${fmtHora(ap.realizadoEm)}` : ''}`}>
                              {d.status === 'aplicado' ? <Check size={14} /> : d.status === 'nao_aplicado' ? <X size={14} /> : d.status === 'atrasado' ? '!' : fmtHora(d.horario).slice(3) === '00' ? '' : fmtHora(d.horario).slice(3)}
                            </button>
                          );
                        })}
                        {sos.map((a) => <span key={a.id} className="cel-dose st-aplicado" title={`SOS ${fmtHora(a.realizadoEm)} — ${a.responsavel}`}><Check size={14} /></span>)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="legenda">
        <span><i className="cel-dose st-pendente" /> Pendente</span>
        <span><i className="cel-dose st-aplicado" /> Aplicado</span>
        <span><i className="cel-dose st-atrasado" /> Atrasado</span>
        <span><i className="cel-dose st-nao_aplicado" /> Não aplicado</span>
        <span className="muted">Toque em um horário para checar a medicação.</span>
      </div>

      <h3 className="mt">Registro de aplicações do dia</h3>
      <div className="cartao lista-simples">
        {doses.filter((d) => d.aplicacaoId).length === 0 && <p className="muted">Nenhuma aplicação registrada neste dia.</p>}
        {doses.filter((d) => d.aplicacaoId).map((d) => {
          const ap = p.aplicacoes.find((a) => a.id === d.aplicacaoId)!;
          return (
            <div key={ap.id} className="item-simples">
              <span className={`ponto st-${ap.status}`} />
              <b>{fmtHora(d.horario)}</b> {d.prescricao.nome} — {ap.status === 'aplicado' ? 'aplicado' : 'NÃO aplicado'} por {ap.responsavel} às {fmtHora(ap.realizadoEm)}
              {ap.obs && <em className="muted"> • {ap.obs}</em>}
            </div>
          );
        })}
      </div>
      <AplicarDose dose={sel} onFechar={() => setSel(null)} />
    </div>
  );
}
