import { useState } from 'react';
import { Search, AlertTriangle, Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { todosMedicamentos, CLASSES, VIAS, FREQUENCIAS, textoFaixa, type Medicamento, type Classe, type FaixaDose } from '../data/medicamentos';
import { UNIDADES_DOSE, doseNaForma, formaDaUnidade, unidadeAtivo } from '../utils/calc';
import { Badge, Campo, Modal, useConfirmar, useToast } from '../components/ui';
import { useStore } from '../store';
import { usePode } from '../auth';
import { uid } from '../utils/format';
import type { FormaFarmaceutica, UnidadeDose, Via } from '../types';

export default function Bulario() {
  const { db, atualizar } = useStore();
  const pode = usePode();
  const confirmar = useConfirmar();
  const toast = useToast();
  const [busca, setBusca] = useState('');
  const [classe, setClasse] = useState('');
  const [soClinica, setSoClinica] = useState(false);
  const [form, setForm] = useState<Medicamento | null>(null);
  const todos = todosMedicamentos(db.config.medicamentosClinica);
  const q = busca.toLowerCase();
  const lista = todos.filter((m) => (!classe || m.classe === classe) && (!soClinica || m.daClinica) && (!q || `${m.nome} ${m.comerciais}`.toLowerCase().includes(q)));
  const nClinica = db.config.medicamentosClinica?.length ?? 0;

  const excluir = async (m: Medicamento) => {
    if (!(await confirmar({ titulo: `Excluir ${m.nome} do bulário da clínica?`, texto: 'Prescrições já feitas com ele não são alteradas.', botao: 'Excluir', perigo: true }))) return;
    atualizar((d) => { d.config.medicamentosClinica = (d.config.medicamentosClinica ?? []).filter((x) => x.id !== m.id); });
    toast('Medicamento removido do bulário');
  };

  return (
    <div className="pagina">
      <div className="pagina-cab">
        <div>
          <h1>Bulário de internação</h1>
          <p className="sub">{todos.length} medicamentos com doses de referência para cães e gatos{nClinica ? ` • ${nClinica} cadastrado(s) pela clínica` : ''}</p>
        </div>
        {pode.configurar && <button className="btn btn-primario" onClick={() => setForm(novoMedicamento())}><Plus size={18} /> Cadastrar medicamento</button>}
      </div>
      <div className="cartao filtros-col">
        <div className="busca"><Search size={16} /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar princípio ativo ou nome comercial" /></div>
        <div className="sistemas">
          <button className={`sistema ${!classe && !soClinica ? 'ativo' : ''}`} onClick={() => { setClasse(''); setSoClinica(false); }}>Todas</button>
          {nClinica > 0 && <button className={`sistema ${soClinica ? 'ativo' : ''}`} onClick={() => { setSoClinica(!soClinica); setClasse(''); }}>Da clínica</button>}
          {CLASSES.map((c) => <button key={c} className={`sistema ${classe === c ? 'ativo' : ''}`} onClick={() => { setClasse(c); setSoClinica(false); }}>{c}</button>)}
        </div>
      </div>
      <div className="grade-bulario">
        {lista.map((m) => (
          <div key={m.id} className="cartao med-card">
            <div className="med-card-cab">
              <div><strong>{m.nome}</strong><small>{m.comerciais}</small></div>
              {m.daClinica ? <Badge tom="info"><Building2 size={12} /> Da clínica</Badge> : <Badge>{m.classe}</Badge>}
            </div>
            <table className="tabela tabela-compacta">
              <thead><tr><th /><th>Dose</th><th>Intervalo</th></tr></thead>
              <tbody>
                <tr><td>🐶 Cão</td><td>{m.canina ? textoFaixa(m, 'canina') : <span className={m.daClinica ? 'muted' : 'txt-perigo'}>{m.daClinica ? 'Não cadastrada' : 'Não usar'}</span>}</td><td>{m.canina ? `${m.canina.freq} h` : '—'}</td></tr>
                <tr><td>🐱 Gato</td><td>{m.felina ? textoFaixa(m, 'felina') : <span className={m.daClinica ? 'muted' : 'txt-perigo'}>{m.daClinica ? 'Não cadastrada' : 'Não usar'}</span>}</td><td>{m.felina ? `${m.felina.freq} h` : '—'}</td></tr>
              </tbody>
            </table>
            <small><b>Vias:</b> {m.vias.join(', ')}</small>
            <small><b>Apresentações:</b> {m.apresentacoes.map((a) => a.rotulo).join(' • ')}</small>
            {m.obs && <small className="muted">{m.obs}</small>}
            {m.alertaFelino && <small className="txt-perigo"><AlertTriangle size={12} /> {m.alertaFelino}</small>}
            {m.daClinica && pode.configurar && (
              <div className="acoes-linha">
                <button className="btn btn-sm btn-secundario" onClick={() => setForm(structuredClone(db.config.medicamentosClinica!.find((x) => x.id === m.id)!))}><Pencil size={14} /> Editar</button>
                <button className="btn-icone perigo" title="Excluir" onClick={() => excluir(m)}><Trash2 size={16} /></button>
              </div>
            )}
          </div>
        ))}
      </div>
      {pode.configurar && (
        <p className="muted">Não encontrou um produto? Use <b>Cadastrar medicamento</b>. Ele fica disponível para toda a equipe na prescrição e nas calculadoras.</p>
      )}
      <p className="aviso-legal">Doses compiladas de literatura veterinária e bulas dos fabricantes. Sempre confirme na bula atualizada e ajuste ao paciente.</p>
      {form && <FormMedicamento inicial={form} onFechar={() => setForm(null)} />}
    </div>
  );
}

function novoMedicamento(): Medicamento {
  return {
    id: 'clin-' + uid(), nome: '', comerciais: '', classe: 'Outros', unidade: 'mg/kg',
    apresentacoes: [{ rotulo: '', valor: 0, forma: 'mL' }], vias: ['VO'],
    canina: { min: 0, max: 0, padrao: 0, freq: 24 }, felina: { min: 0, max: 0, padrao: 0, freq: 24 },
  };
}

type TextoFaixa = { usar: boolean; unidade: UnidadeDose; min: string; max: string; padrao: string; freq: number };

function faixaParaTexto(fx: FaixaDose | null, u: UnidadeDose): TextoFaixa {
  const t = (n?: number) => (n ? String(n).replace('.', ',') : '');
  return { usar: !!fx, unidade: fx?.unidade ?? u, min: t(fx?.min), max: t(fx?.max), padrao: t(fx?.padrao), freq: fx?.freq ?? 24 };
}

function FormMedicamento({ inicial, onFechar }: { inicial: Medicamento; onFechar: () => void }) {
  const { db, atualizar } = useStore();
  const toast = useToast();
  const existe = (db.config.medicamentosClinica ?? []).some((m) => m.id === inicial.id);
  const [m, setM] = useState(inicial);
  const [aps, setAps] = useState(inicial.apresentacoes.map((a) => ({ ...a, valorTxt: a.valor ? String(a.valor).replace('.', ',') : '' })));
  const [cao, setCao] = useState(faixaParaTexto(inicial.canina, inicial.unidade));
  const [gato, setGato] = useState(faixaParaTexto(inicial.felina, inicial.unidade));
  const set = <K extends keyof Medicamento>(k: K, v: Medicamento[K]) => setM((x) => ({ ...x, [k]: v }));
  const n = (s: string) => parseFloat(s.replace(',', '.')) || 0;

  const salvar = () => {
    if (!m.nome.trim()) return toast('Informe o nome do medicamento', 'erro');
    if (!cao.usar && !gato.usar) return toast('Informe a dose para cães e/ou gatos', 'erro');
    const faixa = (t: TextoFaixa): FaixaDose | null => {
      if (!t.usar) return null;
      const padrao = n(t.padrao) || n(t.min);
      return { min: n(t.min) || padrao, max: n(t.max) || n(t.min) || padrao, padrao, freq: t.freq, unidade: t.unidade !== m.unidade ? t.unidade : undefined };
    };
    const fc = faixa(cao), ff = faixa(gato);
    if ((fc && !fc.padrao) || (ff && !ff.padrao)) return toast('Informe a dose usual', 'erro');
    const precisaConc = [cao, gato].some((t) => t.usar && !doseNaForma(t.unidade));
    const apresentacoes = aps
      .filter((a) => a.rotulo.trim() || n(a.valorTxt))
      .map((a) => ({ rotulo: a.rotulo.trim() || `${a.valorTxt} ${unidadeAtivo(m.unidade)}/${a.forma}`, valor: n(a.valorTxt) || 1, forma: a.forma }));
    if (precisaConc && !apresentacoes.some((a) => a.valor > 0 && a.rotulo)) return toast('Informe ao menos uma apresentação com a concentração', 'erro');
    const final: Medicamento = { ...m, nome: m.nome.trim(), comerciais: m.comerciais.trim() || 'Cadastrado pela clínica', apresentacoes: apresentacoes.length ? apresentacoes : [{ rotulo: 'Uso conforme dose', valor: 1, forma: formaDaUnidade(m.unidade) ?? 'mL' }], canina: fc, felina: ff, daClinica: undefined };
    atualizar((d) => {
      const lista = d.config.medicamentosClinica ?? [];
      const i = lista.findIndex((x) => x.id === final.id);
      if (i >= 0) lista[i] = final;
      else lista.push(final);
      d.config.medicamentosClinica = lista;
    });
    toast(existe ? 'Medicamento atualizado' : `${final.nome} adicionado ao bulário da clínica`);
    onFechar();
  };

  // função (e não componente) para os campos não perderem o foco a cada letra digitada
  const linhaEspecie = (rotulo: string, t: TextoFaixa, setT: (t: TextoFaixa) => void) => (
    <div className="cartao faixa-especie">
      <label className="check"><input type="checkbox" checked={t.usar} onChange={(e) => setT({ ...t, usar: e.target.checked })} /> <b>{rotulo}</b></label>
      {t.usar && (
        <div className="grade-form g4">
          <Campo rotulo="Unidade da dose" span={4}>
            <select value={t.unidade} onChange={(e) => setT({ ...t, unidade: e.target.value as UnidadeDose })}>
              {UNIDADES_DOSE.map((x) => <option key={x.u} value={x.u}>{x.r}</option>)}
            </select>
          </Campo>
          <Campo rotulo="Dose usual"><input inputMode="decimal" value={t.padrao} onChange={(e) => setT({ ...t, padrao: e.target.value })} placeholder="Ex.: 2" /></Campo>
          <Campo rotulo="Mínima"><input inputMode="decimal" value={t.min} onChange={(e) => setT({ ...t, min: e.target.value })} /></Campo>
          <Campo rotulo="Máxima"><input inputMode="decimal" value={t.max} onChange={(e) => setT({ ...t, max: e.target.value })} /></Campo>
          <Campo rotulo="Intervalo">
            <select value={t.freq} onChange={(e) => setT({ ...t, freq: Number(e.target.value) })}>
              {FREQUENCIAS.map((fr) => <option key={fr.horas} value={fr.horas}>{fr.rotulo}</option>)}
            </select>
          </Campo>
        </div>
      )}
    </div>
  );

  const precisaConc = [cao, gato].some((t) => t.usar && !doseNaForma(t.unidade));

  return (
    <Modal aberto largo onFechar={onFechar} titulo={existe ? `Editar ${inicial.nome}` : 'Cadastrar medicamento no bulário da clínica'}
      rodape={<><span className="flex1" /><button className="btn btn-secundario" onClick={onFechar}>Cancelar</button><button className="btn btn-primario" onClick={salvar}>Salvar no bulário</button></>}>
      <div className="grade-form g2">
        <Campo rotulo="Nome / princípio ativo *"><input id="med-nome" value={m.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Ex.: Glicopan Pet" /></Campo>
        <Campo rotulo="Nome comercial / fabricante"><input id="med-com" value={m.comerciais} onChange={(e) => set('comerciais', e.target.value)} placeholder="Ex.: Vetnil — frasco 125 mL" /></Campo>
        <Campo rotulo="Classe">
          <select value={m.classe} onChange={(e) => set('classe', e.target.value as Classe)}>{CLASSES.map((c) => <option key={c}>{c}</option>)}</select>
        </Campo>
        <Campo rotulo="Unidade principal da dose" dica="Por kg (calcula pelo peso) ou dose fixa por animal">
          <select value={m.unidade} onChange={(e) => { const u = e.target.value as UnidadeDose; set('unidade', u); setCao((t) => ({ ...t, unidade: u })); setGato((t) => ({ ...t, unidade: u })); }}>
            {UNIDADES_DOSE.map((x) => <option key={x.u} value={x.u}>{x.r}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Vias" span={2}>
          <div className="chips">
            {VIAS.map((v) => (
              <button type="button" key={v} className={`chip ${m.vias.includes(v) ? 'ativo' : ''}`} onClick={() => set('vias', m.vias.includes(v) ? m.vias.filter((x) => x !== v) : [...m.vias, v as Via])}>{v}</button>
            ))}
          </div>
        </Campo>
      </div>

      <h4>Dose</h4>
      <div className="grade-form g2">
        {linhaEspecie('🐶 Cães', cao, setCao)}
        {linhaEspecie('🐱 Gatos', gato, setGato)}
      </div>

      {precisaConc && (
        <>
          <h4>Apresentações</h4>
          <p className="muted sem-margem">Quanto de princípio ativo tem em cada mL, comprimido ou grama. É o que permite calcular quanto administrar.</p>
          <div className="lista-aps">
            {aps.map((a, i) => (
              <div key={i} className="linha-ap">
                <input placeholder="Descrição (ex.: Suspensão 50 mg/mL)" value={a.rotulo} onChange={(e) => setAps(aps.map((x, j) => (j === i ? { ...x, rotulo: e.target.value } : x)))} />
                <input className="input-curto" inputMode="decimal" placeholder="Qtd" value={a.valorTxt} onChange={(e) => setAps(aps.map((x, j) => (j === i ? { ...x, valorTxt: e.target.value } : x)))} />
                <span className="input-sufixo">{unidadeAtivo(m.unidade)} por</span>
                <select value={a.forma} onChange={(e) => setAps(aps.map((x, j) => (j === i ? { ...x, forma: e.target.value as FormaFarmaceutica } : x)))}>
                  <option value="mL">mL</option><option value="comprimido">comprimido</option><option value="cápsula">cápsula</option><option value="g">grama</option>
                </select>
                {aps.length > 1 && <button className="btn-icone perigo" onClick={() => setAps(aps.filter((_, j) => j !== i))} aria-label="Remover"><Trash2 size={16} /></button>}
              </div>
            ))}
            <button className="btn btn-sm btn-fantasma" onClick={() => setAps([...aps, { rotulo: '', valor: 0, valorTxt: '', forma: 'mL' }])}><Plus size={14} /> Outra apresentação</button>
          </div>
        </>
      )}

      <div className="grade-form g1 mt">
        <Campo rotulo="Observações (aparece na prescrição)"><textarea rows={2} value={m.obs ?? ''} onChange={(e) => set('obs', e.target.value || undefined)} placeholder="Ex.: Administrar após a refeição. Máximo 5 dias." /></Campo>
        <Campo rotulo="Alerta para gatos (opcional)"><input value={m.alertaFelino ?? ''} onChange={(e) => set('alertaFelino', e.target.value || undefined)} /></Campo>
      </div>
    </Modal>
  );
}
