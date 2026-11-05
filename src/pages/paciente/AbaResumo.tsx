import { useState } from 'react';
import { usePode } from '../../auth';
import { Pencil, Send, Clock, Droplets, Activity, Stethoscope, AlertTriangle } from 'lucide-react';
import type { Gravidade, Paciente } from '../../types';
import { useStore } from '../../store';
import { Campo, Chips, Modal, Badge, useToast } from '../../components/ui';
import SeletorDiagnostico from '../../components/SeletorDiagnostico';
import { dosesPaciente, textoQuantidade, fmtNum, foraDaFaixa } from '../../utils/calc';
import { fmtHora, fmtDataHora, relativo, uid, toDateInput } from '../../utils/format';
import { STATUS_DOSE } from '../../components/AplicarDose';
import { ROT } from './AbaMonitoramento';
import { ir } from '../../router';

export default function AbaResumo({ p }: { p: Paciente }) {
  const { db, agora, atualizarPaciente } = useStore();
  const toast = useToast();
  const pode = usePode();
  const [editDiag, setEditDiag] = useState(false);
  const [diags, setDiags] = useState(p.diagnosticos);
  const [diagObs, setDiagObs] = useState(p.diagnosticoObs ?? '');
  const [nota, setNota] = useState('');
  const internado = p.status === 'internado';

  const proximas = dosesPaciente(p, new Date(agora.getTime() - 12 * 3600_000), new Date(agora.getTime() + 8 * 3600_000), agora)
    .filter((d) => d.status === 'atrasado' || d.status === 'pendente').slice(0, 8);
  const ult = [...p.registros].sort((a, b) => b.dataHora.localeCompare(a.dataHora))[0];
  const fluido = p.fluidos.find((f) => f.ativo);
  const ocupados = new Set(db.pacientes.filter((x) => x.status === 'internado' && x.id !== p.id).map((x) => x.boxId));

  const addNota = () => {
    if (!nota.trim()) return;
    atualizarPaciente(p.id, (x) => { x.evolucoes.push({ id: uid(), dataHora: new Date().toISOString(), autor: db.usuarioAtual, texto: nota.trim() }); });
    setNota('');
    toast('Evolução registrada');
  };

  return (
    <div className="aba-conteudo grade-resumo">
      <div className="col">
        {internado && (
          <div className="cartao">
            <h3 className="cartao-titulo">Situação</h3>
            <fieldset className="grade-form g2 fieldset-limpo" disabled={!pode.editarPaciente}>
              <Campo rotulo="Estado clínico" span={2}>
                <Chips<Gravidade> permitirLimpar={false} valor={p.gravidade} onChange={(v) => v && atualizarPaciente(p.id, (x) => { x.gravidade = v; })} opcoes={[
                  { v: 'estavel', r: 'Estável', tom: 'ok' }, { v: 'atencao', r: 'Atenção', tom: 'alerta' }, { v: 'critico', r: 'Crítico', tom: 'perigo' },
                ]} />
              </Campo>
              <Campo rotulo="Box">
                <select value={p.boxId ?? ''} onChange={(e) => { const v = e.target.value || null; atualizarPaciente(p.id, (x) => { x.boxId = v; }); toast('Paciente transferido de box'); }}>
                  <option value="">— Sem box —</option>
                  {db.config.alas.map((a) => (
                    <optgroup key={a.id} label={a.nome}>
                      {a.boxes.map((b) => <option key={b.id} value={b.id} disabled={ocupados.has(b.id)}>{b.nome}{ocupados.has(b.id) ? ' (ocupado)' : ''}</option>)}
                    </optgroup>
                  ))}
                </select>
              </Campo>
              <Campo rotulo="Alta prevista">
                <input type="date" value={p.altaPrevista ? toDateInput(p.altaPrevista) : ''} onChange={(e) => atualizarPaciente(p.id, (x) => { x.altaPrevista = e.target.value ? new Date(e.target.value + 'T12:00').toISOString() : undefined; })} />
              </Campo>
              <Campo rotulo="Peso atual (kg)" dica="Alterar o peso recalcula as doses">
                <input inputMode="decimal" defaultValue={String(p.peso).replace('.', ',')} onBlur={(e) => { const v = parseFloat(e.target.value.replace(',', '.')); if (v > 0 && v !== p.peso) { atualizarPaciente(p.id, (x) => { x.peso = v; }); toast('Peso atualizado — doses recalculadas'); } }} />
              </Campo>
              <Campo rotulo="Cuidados">
                <div className="linha-checks">
                  <label className="check"><input type="checkbox" checked={!!p.jejum} onChange={(e) => atualizarPaciente(p.id, (x) => { x.jejum = e.target.checked; })} /> Jejum</label>
                  <label className="check"><input type="checkbox" checked={!!p.isolamento} onChange={(e) => atualizarPaciente(p.id, (x) => { x.isolamento = e.target.checked; })} /> Isolamento</label>
                </div>
              </Campo>
            </fieldset>
          </div>
        )}

        <div className="cartao">
          <div className="secao-cab">
            <h3 className="cartao-titulo"><Stethoscope size={16} /> Diagnóstico</h3>
            {pode.editarPaciente && <button className="btn btn-sm btn-fantasma" onClick={() => { setDiags(p.diagnosticos); setDiagObs(p.diagnosticoObs ?? ''); setEditDiag(true); }}><Pencil size={14} /> Editar</button>}
          </div>
          {p.diagnosticos.length ? <div className="diag-selecionados">{p.diagnosticos.map((d) => <span key={d} className="diag-sel">{d}</span>)}</div> : <p className="muted">Sem diagnóstico definido.</p>}
          {p.diagnosticoObs && <p className="mt">{p.diagnosticoObs}</p>}
          <dl className="dl mt">
            <dt>Queixa</dt><dd>{p.queixa || '—'}</dd>
            {p.anamnese && <><dt>Anamnese</dt><dd>{p.anamnese}</dd></>}
            {p.alergias && <><dt>Alergias</dt><dd className="txt-perigo">{p.alergias}</dd></>}
          </dl>
        </div>

        <div className="cartao">
          <h3 className="cartao-titulo">Evolução clínica</h3>
          <div className="nota-nova">
            <textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Registrar evolução, conduta, resultado de exames..." />
            <button className="btn btn-primario" onClick={addNota} disabled={!nota.trim()}><Send size={16} /></button>
          </div>
          <div className="timeline">
            {[...p.evolucoes].sort((a, b) => b.dataHora.localeCompare(a.dataHora)).map((e) => (
              <div key={e.id} className="tl-item">
                <div className="tl-cab"><b>{e.autor}</b> <small className="muted">{fmtDataHora(e.dataHora)}</small></div>
                <p>{e.texto}</p>
              </div>
            ))}
            {p.evolucoes.length === 0 && <p className="muted">Nenhuma evolução registrada.</p>}
          </div>
        </div>
      </div>

      <div className="col">
        <div className="cartao">
          <div className="secao-cab">
            <h3 className="cartao-titulo"><Clock size={16} /> Próximas medicações</h3>
            <button className="btn btn-sm btn-fantasma" onClick={() => ir(`/paciente/${p.id}/execucao`)}>Mapa completo</button>
          </div>
          {proximas.length === 0 && <p className="muted">Nada pendente nas próximas horas.</p>}
          <div className="lista-simples">
            {proximas.map((d) => (
              <div key={d.prescricao.id + d.horario.toISOString()} className={`item-simples st-${d.status}`}>
                <b>{fmtHora(d.horario)}</b>
                <span className="flex1">{d.prescricao.nome} — {textoQuantidade(d.prescricao, p.peso)} {d.prescricao.via}</span>
                <Badge tom={STATUS_DOSE[d.status].tom}>{d.status === 'atrasado' ? 'Atrasado' : relativo(d.horario, agora)}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="cartao">
          <div className="secao-cab">
            <h3 className="cartao-titulo"><Activity size={16} /> Último monitoramento</h3>
            <button className="btn btn-sm btn-fantasma" onClick={() => ir(`/paciente/${p.id}/monitoramento`)}>Registrar</button>
          </div>
          {ult ? (
            <>
              <small className="muted">{fmtDataHora(ult.dataHora)} • {ult.responsavel}</small>
              <div className="mini-params">
                {ult.temperatura !== undefined && <div className={foraDaFaixa(p.especie, 'temperatura', ult.temperatura) ? 'fora' : ''}><span>Temp.</span><b>{fmtNum(ult.temperatura, 1)}°C</b></div>}
                {ult.fc !== undefined && <div className={foraDaFaixa(p.especie, 'fc', ult.fc) ? 'fora' : ''}><span>FC</span><b>{ult.fc}</b></div>}
                {ult.fr !== undefined && <div className={foraDaFaixa(p.especie, 'fr', ult.fr) ? 'fora' : ''}><span>FR</span><b>{ult.fr}</b></div>}
                {ult.dor !== undefined && <div className={ult.dor > 4 ? 'fora' : ''}><span>Dor</span><b>{ult.dor}/10</b></div>}
              </div>
              <div className="chips">
                {ult.alimentacao && <span className="chip chip-estatico">🍽️ {ROT.alimentacao[ult.alimentacao]}</span>}
                {ult.agua && <span className="chip chip-estatico">💧 {ROT.agua[ult.agua]}</span>}
                {ult.vomito !== undefined && <span className={`chip chip-estatico ${ult.vomito ? 'tom-perigo ativo' : ''}`}>{ult.vomito ? '🤢 Vomitou' : 'Sem vômito'}</span>}
                {ult.urina && <span className="chip chip-estatico">🚽 {ROT.urina[ult.urina]}</span>}
                {ult.fezes && <span className="chip chip-estatico">Fezes: {ROT.fezes[ult.fezes]}</span>}
              </div>
            </>
          ) : <p className="muted">Nenhum registro.</p>}
        </div>

        <div className="cartao">
          <div className="secao-cab">
            <h3 className="cartao-titulo"><Droplets size={16} /> Fluidoterapia</h3>
            <button className="btn btn-sm btn-fantasma" onClick={() => ir(`/paciente/${p.id}/fluido`)}>{fluido ? 'Ajustar' : 'Calcular soro'}</button>
          </div>
          {fluido ? <p><b>{fluido.solucao}</b> — {fmtNum(fluido.taxaMlH, 1)} mL/h ({fmtNum(fluido.volumeDia, 0)} mL/24 h){fluido.aditivos && <><br /><small className="muted">{fluido.aditivos}</small></>}</p> : <p className="muted">Sem fluidoterapia ativa.</p>}
        </div>

        <div className="cartao">
          <h3 className="cartao-titulo">Tutor</h3>
          <dl className="dl">
            <dt>Nome</dt><dd>{p.tutor.nome}</dd>
            <dt>Telefone</dt><dd>{p.tutor.telefone || '—'}</dd>
            {p.tutor.email && <><dt>E-mail</dt><dd>{p.tutor.email}</dd></>}
            {p.tutor.cpf && <><dt>CPF</dt><dd>{p.tutor.cpf}</dd></>}
            {p.tutor.endereco && <><dt>Endereço</dt><dd>{p.tutor.endereco}</dd></>}
          </dl>
        </div>
        {p.alertas && <div className="alerta-box"><AlertTriangle size={16} /> {p.alertas}</div>}
      </div>

      <Modal aberto={editDiag} onFechar={() => setEditDiag(false)} largo titulo="Editar diagnóstico" rodape={
        <>
          <button className="btn btn-secundario" onClick={() => setEditDiag(false)}>Cancelar</button>
          <button className="btn btn-primario" onClick={() => { atualizarPaciente(p.id, (x) => { x.diagnosticos = diags; x.diagnosticoObs = diagObs; }); setEditDiag(false); toast('Diagnóstico atualizado'); }}>Salvar</button>
        </>
      }>
        <SeletorDiagnostico valor={diags} onChange={setDiags} />
        <Campo rotulo="Observações / suspeitas / exames"><textarea rows={3} value={diagObs} onChange={(e) => setDiagObs(e.target.value)} /></Campo>
      </Modal>
    </div>
  );
}
