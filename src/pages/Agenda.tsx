import { useMemo, useState } from 'react';
import { Check, Clock, Printer } from 'lucide-react';
import { useStore, nomeBox } from '../store';
import { dosesPaciente, textoQuantidade, type DoseAgendada } from '../utils/calc';
import { fmtHora, fmtData, relativo, uid } from '../utils/format';
import { Badge, Chips, Vazio, useToast } from '../components/ui';
import AplicarDose, { STATUS_DOSE } from '../components/AplicarDose';
import { IconeEspecie } from './Painel';
import { ir } from '../router';

type Janela = 2 | 6 | 12 | 24;

export default function Agenda() {
  const { db, agora, atualizarPaciente } = useStore();
  const toast = useToast();
  const [janela, setJanela] = useState<Janela>(6);
  const [ala, setAla] = useState<string>('');
  const [mostrarFeitas, setMostrarFeitas] = useState(false);
  const [sel, setSel] = useState<DoseAgendada | null>(null);

  const doses = useMemo(() => {
    const de = new Date(agora.getTime() - 24 * 3600_000);
    const ate = new Date(agora.getTime() + janela * 3600_000);
    return db.pacientes
      .filter((p) => p.status === 'internado')
      .filter((p) => !ala || db.config.alas.find((a) => a.id === ala)?.boxes.some((b) => b.id === p.boxId))
      .flatMap((p) => dosesPaciente(p, de, ate, agora))
      .filter((d) => mostrarFeitas || d.status === 'atrasado' || d.status === 'pendente')
      .sort((a, b) => a.horario.getTime() - b.horario.getTime());
  }, [db, agora, janela, ala, mostrarFeitas]);

  const grupos = useMemo(() => {
    const m = new Map<string, DoseAgendada[]>();
    for (const d of doses) {
      const k = d.status === 'atrasado' ? 'atrasadas' : `${fmtData(d.horario)} ${String(d.horario.getHours()).padStart(2, '0')}:00`;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(d);
    }
    return [...m.entries()].sort((a, b) => (a[0] === 'atrasadas' ? -1 : b[0] === 'atrasadas' ? 1 : 0));
  }, [doses]);

  const rapido = (d: DoseAgendada) => {
    const iso = d.horario.toISOString();
    atualizarPaciente(d.paciente.id, (p) => {
      p.aplicacoes = p.aplicacoes.filter((a) => !(a.prescricaoId === d.prescricao.id && a.horario === iso));
      p.aplicacoes.push({ id: uid(), prescricaoId: d.prescricao.id, horario: iso, status: 'aplicado', realizadoEm: new Date().toISOString(), responsavel: db.usuarioAtual });
    });
    toast(`${d.prescricao.nome} — ${d.paciente.nome}: aplicado`);
  };

  const atrasadas = doses.filter((d) => d.status === 'atrasado').length;

  return (
    <div className="pagina">
      <div className="pagina-cab">
        <div>
          <h1>Agenda de medicações</h1>
          <p className="sub">Checagem de todas as medicações da internação • {atrasadas > 0 ? <b className="txt-perigo">{atrasadas} atrasada(s)</b> : 'nenhuma atrasada'}</p>
        </div>
        <div className="acoes">
          <button className="btn btn-secundario" onClick={() => window.print()}><Printer size={16} /> Imprimir</button>
        </div>
      </div>

      <div className="filtros cartao">
        <div>
          <span className="campo-rotulo">Próximas</span>
          <Chips<Janela> permitirLimpar={false} valor={janela} onChange={(v) => v && setJanela(v)} opcoes={[{ v: 2, r: '2 h' }, { v: 6, r: '6 h' }, { v: 12, r: '12 h' }, { v: 24, r: '24 h' }]} />
        </div>
        <div>
          <span className="campo-rotulo">Ala</span>
          <select value={ala} onChange={(e) => setAla(e.target.value)}>
            <option value="">Todas as alas</option>
            {db.config.alas.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
        </div>
        <label className="check">
          <input type="checkbox" checked={mostrarFeitas} onChange={(e) => setMostrarFeitas(e.target.checked)} /> Mostrar já checadas
        </label>
      </div>

      {grupos.length === 0 && <Vazio icone={<Clock size={36} />} titulo="Nenhuma medicação no período" texto="Todas as medicações estão em dia." />}

      {grupos.map(([k, lista]) => (
        <section key={k} className={`agenda-grupo ${k === 'atrasadas' ? 'grupo-atrasado' : ''}`}>
          <h3>{k === 'atrasadas' ? `⚠ Atrasadas (${lista.length})` : k}</h3>
          <div className="cartao lista-doses">
            {lista.map((d) => {
              const st = STATUS_DOSE[d.status];
              return (
                <div key={d.prescricao.id + d.horario.toISOString()} className={`linha-dose st-${d.status}`}>
                  <div className="ld-hora">
                    <strong>{fmtHora(d.horario)}</strong>
                    <small>{relativo(d.horario, agora)}</small>
                  </div>
                  <button className="ld-pac" onClick={() => ir(`/paciente/${d.paciente.id}/execucao`)}>
                    <span className={`avatar avatar-sm avatar-${d.paciente.especie}`}><IconeEspecie especie={d.paciente.especie} size={14} /></span>
                    <span>
                      <strong>{d.paciente.nome}</strong>
                      <small>{nomeBox(db.config, d.paciente.boxId).split(' · ')[0]}</small>
                    </span>
                  </button>
                  <button className="ld-med" onClick={() => setSel(d)}>
                    <strong>{d.prescricao.nome}</strong>
                    <small>{textoQuantidade(d.prescricao, d.paciente.peso)} • {d.prescricao.via}</small>
                  </button>
                  <Badge tom={st.tom}>{st.r}</Badge>
                  {d.status === 'pendente' || d.status === 'atrasado' ? (
                    <button className="btn btn-sucesso btn-sm" onClick={() => rapido(d)} title="Registrar como aplicado agora"><Check size={16} /> <span className="esconde-mobile">Aplicar</span></button>
                  ) : (
                    <button className="btn btn-fantasma btn-sm" onClick={() => setSel(d)}>Ver</button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <AplicarDose dose={sel} onFechar={() => setSel(null)} />
    </div>
  );
}
