import { useMemo, useState } from 'react';
import { AlertTriangle, Search, Calculator, Info } from 'lucide-react';
import { Modal, Campo, useToast } from '../../components/ui';
import { todosMedicamentos, CLASSES, VIAS, FREQUENCIAS, faixaDe, unidadeDe, doseSugerida, textoFaixa, type Medicamento } from '../../data/medicamentos';
import { fmtNum, quantidadeAdministrar, textoQuantidade, horariosPrescricao, unidadeAtivo, UNIDADES_DOSE, doseNaForma, formaDaUnidade, textoCalculo, porAnimal } from '../../utils/calc';
import { usePode } from '../../auth';
import { fmtHora, fmtData, toLocalInput, fromLocalInput, uid } from '../../utils/format';
import { useStore } from '../../store';
import type { FormaFarmaceutica, Paciente, Prescricao, UnidadeDose, Via } from '../../types';

function proximaHoraCheia() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}

export default function PrescricaoForm({ paciente: p, editar, onFechar }: { paciente: Paciente; editar?: Prescricao; onFechar: () => void }) {
  const { db, atualizar, atualizarPaciente } = useStore();
  const toast = useToast();
  const pode = usePode();
  const todos = useMemo(() => todosMedicamentos(db.config.medicamentosClinica), [db.config.medicamentosClinica]);
  const [salvarNoBulario, setSalvarNoBulario] = useState(false);
  const [etapa, setEtapa] = useState<'escolher' | 'dose'>(editar ? 'dose' : 'escolher');
  const [busca, setBusca] = useState('');
  const [classe, setClasse] = useState<string>('');
  const [med, setMed] = useState<Medicamento | undefined>(() => todosMedicamentos(db.config.medicamentosClinica).find((m) => m.id === editar?.medicamentoId));

  const [f, setF] = useState(() => ({
    nome: editar?.nome ?? '',
    classe: editar?.classe ?? 'Outros',
    dose: editar ? String(editar.dose) : '',
    unidadeDose: (editar?.unidadeDose ?? 'mg/kg') as UnidadeDose,
    concentracao: editar ? String(editar.concentracao) : '',
    forma: (editar?.forma ?? 'mL') as FormaFarmaceutica,
    via: (editar?.via ?? 'IV') as Via,
    frequenciaHoras: editar?.frequenciaHoras ?? 8,
    inicio: toLocalInput(editar?.inicio ?? proximaHoraCheia()),
    duracaoDias: editar?.duracaoDias ?? 5,
    diluicao: editar?.diluicao ?? '',
    observacoes: editar?.observacoes ?? '',
    seNecessario: editar?.seNecessario ?? false,
  }));
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return todos.filter((m) => (!classe || m.classe === classe) && (!q || `${m.nome} ${m.comerciais} ${m.classe}`.toLowerCase().includes(q)));
  }, [busca, classe, todos]);

  const faixa = med ? faixaDe(med, p.especie) : null;
  const unidadeRef = med ? unidadeDe(med, p.especie) : undefined;

  const escolher = (m: Medicamento) => {
    const fx = faixaDe(m, p.especie);
    const u = unidadeDe(m, p.especie);
    const formaU = formaDaUnidade(u);
    const ap = (formaU && m.apresentacoes.find((a) => a.forma === formaU)) || m.apresentacoes[0];
    setMed(m);
    setF((x) => ({
      ...x,
      nome: m.nome,
      classe: m.classe,
      dose: fx ? String(doseSugerida(fx, p.peso)) : '',
      unidadeDose: u,
      concentracao: String(ap.valor),
      forma: ap.forma,
      via: m.vias[0],
      frequenciaHoras: fx?.freq ?? 24,
      duracaoDias: fx && fx.freq >= 168 ? 1 : x.duracaoDias,
    }));
    setEtapa('dose');
  };

  const livre = () => {
    setMed(undefined);
    setF((x) => ({ ...x, nome: busca, dose: '', concentracao: '' }));
    setEtapa('dose');
  };

  const dose = parseFloat(String(f.dose).replace(',', '.')) || 0;
  const conc = parseFloat(String(f.concentracao).replace(',', '.')) || 0;
  const naForma = doseNaForma(f.unidadeDose);
  const previa: Prescricao = {
    id: editar?.id ?? 'previa', nome: f.nome, dose, unidadeDose: f.unidadeDose, concentracao: naForma ? 1 : conc,
    forma: formaDaUnidade(f.unidadeDose) ?? f.forma, via: f.via, frequenciaHoras: f.frequenciaHoras, inicio: fromLocalInput(f.inicio),
    duracaoDias: f.duracaoDias, ativa: true, criadaEm: '', seNecessario: f.seNecessario,
  };
  const qtd = quantidadeAdministrar(previa, p.peso);
  const fora = faixa && dose > 0 && f.unidadeDose === unidadeRef && (dose < faixa.min * 0.999 || dose > faixa.max * 1.001);
  const acimaMax = faixa?.maxQtd && f.unidadeDose === unidadeRef && qtd > faixa.maxQtd;
  const proximos = horariosPrescricao(previa, new Date(previa.inicio), new Date(new Date(previa.inicio).getTime() + 48 * 3600_000)).slice(0, 8);

  const salvar = () => {
    if (!f.nome.trim()) return toast('Informe o nome do medicamento', 'erro');
    if (!dose) return toast('Informe a dose', 'erro');
    if (!naForma && !conc) return toast('Informe a concentração/apresentação', 'erro');
    const nova: Prescricao = {
      ...previa,
      id: editar?.id ?? uid(),
      nome: f.nome.trim(),
      medicamentoId: med?.id,
      classe: f.classe,
      diluicao: f.diluicao || undefined,
      observacoes: f.observacoes || undefined,
      criadaEm: editar?.criadaEm ?? new Date().toISOString(),
      prescritor: editar?.prescritor ?? db.usuarioAtual,
      ativa: editar?.ativa ?? true,
      suspensaEm: editar?.suspensaEm,
    };
    if (!med && salvarNoBulario) {
      const fx = { min: dose, max: dose, padrao: dose, freq: f.frequenciaHoras };
      const novo: Medicamento = {
        id: 'clin-' + uid(), nome: f.nome.trim(), comerciais: 'Cadastrado pela clínica', classe: f.classe as Medicamento['classe'], unidade: f.unidadeDose,
        apresentacoes: [{ rotulo: naForma ? 'Uso conforme dose' : `${fmtNum(conc, 3)} ${unidadeAtivo(f.unidadeDose)}/${previa.forma}`, valor: naForma ? 1 : conc, forma: previa.forma }],
        vias: [f.via], canina: p.especie === 'canina' ? fx : null, felina: p.especie === 'felina' ? fx : null, obs: f.observacoes || undefined,
      };
      nova.medicamentoId = novo.id;
      atualizar((d) => { d.config.medicamentosClinica = [...(d.config.medicamentosClinica ?? []), novo]; });
    }
    atualizarPaciente(p.id, (x) => {
      const i = x.prescricoes.findIndex((r) => r.id === nova.id);
      if (i >= 0) x.prescricoes[i] = nova;
      else x.prescricoes.push(nova);
    });
    toast(editar ? 'Prescrição atualizada' : `${nova.nome} prescrito`);
    onFechar();
  };

  if (etapa === 'escolher') {
    return (
      <Modal aberto largo onFechar={onFechar} titulo="Prescrever medicação — escolha o fármaco">
        <div className="busca">
          <Search size={16} />
          <input autoFocus value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por princípio ativo ou nome comercial (ex.: Cerenia, dipirona, ceftriaxona)" />
        </div>
        <div className="sistemas mt">
          <button type="button" className={`sistema ${!classe ? 'ativo' : ''}`} onClick={() => setClasse('')}>Todas</button>
          {CLASSES.map((c) => <button type="button" key={c} className={`sistema ${classe === c ? 'ativo' : ''}`} onClick={() => setClasse(c)}>{c}</button>)}
        </div>
        <div className="lista-meds">
          {lista.map((m) => {
            const fx = faixaDe(m, p.especie);
            return (
              <button type="button" key={m.id} className={`item-med ${!fx ? 'contra' : ''}`} onClick={() => escolher(m)}>
                <div>
                  <strong>{m.nome}</strong>
                  <small>{m.comerciais}</small>
                </div>
                <div className="item-med-dir">
                  <span className="badge badge-neutro">{m.daClinica ? 'Da clínica' : m.classe}</span>
                  {fx ? <small>{textoFaixa(m, p.especie)}</small> : <small className={m.daClinica ? 'muted' : 'txt-perigo'}>{m.daClinica ? 'Sem dose para esta espécie' : 'Contraindicado'}</small>}
                </div>
              </button>
            );
          })}
          <button type="button" className="item-med item-livre" onClick={livre}>
            <div><strong>+ Medicamento não listado{busca ? `: “${busca}”` : ''}</strong><small>Preencher manualmente dose e concentração</small></div>
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      aberto
      largo
      onFechar={onFechar}
      titulo={editar ? `Editar prescrição — ${f.nome}` : `Prescrever — ${f.nome || 'medicamento'}`}
      rodape={
        <>
          {!editar && <button className="btn btn-fantasma" onClick={() => setEtapa('escolher')}>← Trocar fármaco</button>}
          <span className="flex1" />
          <button className="btn btn-secundario" onClick={onFechar}>Cancelar</button>
          <button className="btn btn-primario" onClick={salvar}>Salvar prescrição</button>
        </>
      }
    >
      {med && (
        <div className="ref-med">
          <div><strong>{med.nome}</strong> <span className="muted">({med.comerciais})</span></div>
          {faixa ? (
            <div><Info size={14} /> Referência {p.especie === 'canina' ? 'cães' : 'gatos'}: <b>{textoFaixa(med, p.especie)}</b> a cada {faixa.freq} h • Vias: {med.vias.join(', ')}</div>
          ) : (
            <div className="txt-perigo"><AlertTriangle size={14} /> Sem dose de referência para esta espécie.</div>
          )}
          {med.obs && <div className="muted">{med.obs}</div>}
          {p.especie === 'felina' && med.alertaFelino && <div className="alerta-box"><AlertTriangle size={16} /> {med.alertaFelino}</div>}
        </div>
      )}
      {p.alergias && <div className="alerta-box"><AlertTriangle size={16} /> Alergias/restrições do paciente: {p.alergias}</div>}

      <div className="grade-form g4">
        {!med && <Campo rotulo="Medicamento" span={2}><input value={f.nome} onChange={(e) => set('nome', e.target.value)} /></Campo>}
        {!med && (
          <Campo rotulo="Classe" span={2}>
            <select value={f.classe} onChange={(e) => set('classe', e.target.value)}>{CLASSES.map((c) => <option key={c}>{c}</option>)}</select>
          </Campo>
        )}
        <Campo rotulo="Dose" span={2}>
          <div className="input-grupo">
            <input inputMode="decimal" value={f.dose} onChange={(e) => set('dose', e.target.value)} className={fora ? 'input-alerta' : ''} />
            <select value={f.unidadeDose} onChange={(e) => set('unidadeDose', e.target.value as UnidadeDose)}>
              {UNIDADES_DOSE.map((x) => <option key={x.u} value={x.u}>{x.r}</option>)}
            </select>
          </div>
        </Campo>
        {!naForma && (
          <Campo rotulo="Apresentação / concentração" span={2}>
            {med ? (
              <select value={`${f.concentracao}|${f.forma}`} onChange={(e) => { const [c, fo] = e.target.value.split('|'); set('concentracao', c); set('forma', fo as FormaFarmaceutica); }}>
                {med.apresentacoes.map((a) => <option key={a.rotulo} value={`${a.valor}|${a.forma}`}>{a.rotulo}</option>)}
                {!med.apresentacoes.some((a) => String(a.valor) === f.concentracao && a.forma === f.forma) && <option value={`${f.concentracao}|${f.forma}`}>Personalizada: {f.concentracao} {unidadeAtivo(f.unidadeDose)}/{f.forma}</option>}
              </select>
            ) : (
              <div className="input-grupo">
                <input inputMode="decimal" value={f.concentracao} onChange={(e) => set('concentracao', e.target.value)} placeholder="Ex.: 10" />
                <span className="input-sufixo">{unidadeAtivo(f.unidadeDose)} por</span>
                <select value={f.forma} onChange={(e) => set('forma', e.target.value as FormaFarmaceutica)}>
                  <option value="mL">mL</option><option value="comprimido">comprimido</option><option value="cápsula">cápsula</option><option value="g">grama (pó/pasta)</option>
                </select>
              </div>
            )}
          </Campo>
        )}
        <Campo rotulo="Via">
          <select value={f.via} onChange={(e) => set('via', e.target.value as Via)}>
            {(med ? [...med.vias, ...VIAS.filter((v) => !med.vias.includes(v))] : VIAS).map((v) => <option key={v}>{v}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Frequência">
          <select value={f.frequenciaHoras} onChange={(e) => set('frequenciaHoras', Number(e.target.value))} disabled={f.seNecessario}>
            {FREQUENCIAS.map((fr) => <option key={fr.horas} value={fr.horas}>{fr.rotulo}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Primeira dose">
          <input type="datetime-local" value={f.inicio} onChange={(e) => set('inicio', e.target.value)} />
        </Campo>
        <Campo rotulo="Duração">
          <select value={f.duracaoDias} onChange={(e) => set('duracaoDias', Number(e.target.value))}>
            <option value={0}>Contínuo (até suspender)</option>
            {[1, 2, 3, 4, 5, 6, 7, 10, 14, 21, 28].map((n) => <option key={n} value={n}>{n} dia(s)</option>)}
          </select>
        </Campo>
        <Campo rotulo="Tipo">
          <label className="check"><input type="checkbox" checked={f.seNecessario} onChange={(e) => set('seNecessario', e.target.checked)} /> Se necessário (SOS)</label>
        </Campo>
        <Campo rotulo="Diluição / modo de administração" span={2}>
          <input value={f.diluicao} onChange={(e) => set('diluicao', e.target.value)} placeholder="Ex.: diluir em 10 mL de NaCl 0,9%, IV lento em 5 min" />
        </Campo>
        <Campo rotulo="Observações" span={2}>
          <input value={f.observacoes} onChange={(e) => set('observacoes', e.target.value)} placeholder="Ex.: suspender se PAS < 90" />
        </Campo>
      </div>

      <div className={`calc-resultado ${fora ? 'calc-alerta' : ''}`}>
        <Calculator size={22} />
        <div>
          <div className="calc-linha">{porAnimal(f.unidadeDose) ? <>Dose fixa, independente do peso: <b>{textoCalculo(dose, f.unidadeDose, p.peso).replace('dose fixa: ', '')}</b></> : <b>{textoCalculo(dose, f.unidadeDose, p.peso)}</b>}</div>
          <div className="calc-grande">Administrar: {qtd > 0 ? textoQuantidade(previa, p.peso) : '—'} <span>{f.via}</span></div>
          {(previa.forma === 'comprimido' || previa.forma === 'cápsula') && qtd > 0 && <small className="muted">Valor exato: {fmtNum(qtd, 3)} {previa.forma}(s)</small>}
          {fora && <div className="txt-perigo"><AlertTriangle size={14} /> Dose fora da faixa de referência ({textoFaixa(med!, p.especie)}). Confirme antes de salvar.</div>}
          {acimaMax && <div className="txt-perigo"><AlertTriangle size={14} /> Acima do máximo da bula ({faixa!.maxQtd} por administração).</div>}
        </div>
      </div>

      {!f.seNecessario && proximos.length > 0 && (
        <div className="previa-horarios">
          <span className="campo-rotulo">Horários gerados</span>
          <div className="chips">
            {proximos.map((h) => <span key={h.toISOString()} className="chip chip-estatico">{fmtData(h).slice(0, 5)} {fmtHora(h)}</span>)}
            {proximos.length === 8 && <span className="muted">…</span>}
          </div>
        </div>
      )}
      {!med && !editar && pode.configurar && (
        <label className="check mt"><input type="checkbox" checked={salvarNoBulario} onChange={(e) => setSalvarNoBulario(e.target.checked)} /> Salvar este medicamento no bulário da clínica para usar nas próximas prescrições</label>
      )}
      <p className="aviso-legal">Doses de referência são sugestões da literatura. A prescrição é de responsabilidade do médico-veterinário.</p>
    </Modal>
  );
}
