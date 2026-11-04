import { useState } from 'react';
import { Droplets, AlertTriangle, Syringe, FlaskConical } from 'lucide-react';
import { Campo, Chips } from './ui';
import { calcularFluido, gotasMin, segundosPorGota, fmtNum, kclPorFrasco, TABELA_KCL, taxaMaxKMlH, calcularCRI, KCL_MEQ_ML, type MetodoManutencao, type UnidadeCRI } from '../utils/calc';
import { SOLUCOES } from '../data/diagnosticos';
import type { Especie } from '../types';

const num = (s: string) => parseFloat((s || '').replace(',', '.')) || 0;

export interface FluidoCalculado {
  solucao: string;
  taxaMlH: number;
  volumeDia: number;
  equipo: 20 | 60;
  aditivos: string;
  obs: string;
}

export function CalcFluido({ peso: pesoInicial, especie: espInicial, onPrescrever }: { peso?: number; especie?: Especie; onPrescrever?: (f: FluidoCalculado) => void }) {
  const [peso, setPeso] = useState(pesoInicial ? String(pesoInicial).replace('.', ',') : '');
  const [especie, setEspecie] = useState<Especie>(espInicial ?? 'canina');
  const [metodo, setMetodo] = useState<MetodoManutencao>('aaha');
  const [mlKgDia, setMlKgDia] = useState('50');
  const [desid, setDesid] = useState(0);
  const [horas, setHoras] = useState('12');
  const [perdas, setPerdas] = useState('');
  const [equipo, setEquipo] = useState<20 | 60>(pesoInicial && pesoInicial < 10 ? 60 : 20);
  const [solucao, setSolucao] = useState(SOLUCOES[0]);
  const [aditivos, setAditivos] = useState('');
  const [usar, setUsar] = useState<'inicial' | 'manutencao'>('inicial');

  const p = num(peso);
  const r = calcularFluido({ peso: p, especie, metodo, mlKgDia: num(mlKgDia), desidratacao: desid, horasReposicao: num(horas), perdas: num(perdas) });
  const taxa = usar === 'inicial' ? r.taxaInicialMlH : r.taxaManutMlH;
  const bolusMin = especie === 'canina' ? 10 : 5;
  const bolusMax = especie === 'canina' ? 20 : 10;

  return (
    <div className="calc">
      <div className="grade-form g4">
        <Campo rotulo="Peso (kg)"><input inputMode="decimal" value={peso} onChange={(e) => setPeso(e.target.value)} disabled={!!pesoInicial} /></Campo>
        <Campo rotulo="Espécie">
          <div className="seg">
            <button type="button" className={especie === 'canina' ? 'ativo' : ''} onClick={() => setEspecie('canina')} disabled={!!espInicial}>Cão</button>
            <button type="button" className={especie === 'felina' ? 'ativo' : ''} onClick={() => setEspecie('felina')} disabled={!!espInicial}>Gato</button>
          </div>
        </Campo>
        <Campo rotulo="Manutenção" span={2}>
          <div className="input-grupo">
            <select value={metodo} onChange={(e) => setMetodo(e.target.value as MetodoManutencao)}>
              <option value="aaha">AAHA ({especie === 'canina' ? '132' : '80'} × kg^0,75)</option>
              <option value="fixo">mL/kg/dia fixo</option>
            </select>
            {metodo === 'fixo' && <input className="input-curto" inputMode="decimal" value={mlKgDia} onChange={(e) => setMlKgDia(e.target.value)} />}
          </div>
        </Campo>
        <Campo rotulo="Grau de desidratação" span={4}>
          <Chips<number> permitirLimpar={false} valor={desid} onChange={(v) => setDesid(v ?? 0)} opcoes={[
            { v: 0, r: 'Hidratado (0%)', tom: 'ok' }, { v: 5, r: 'Leve 5%', tom: 'alerta' }, { v: 6, r: '6%', tom: 'alerta' }, { v: 8, r: 'Moderada 8%', tom: 'alerta' },
            { v: 10, r: 'Grave 10%', tom: 'perigo' }, { v: 12, r: '12%', tom: 'perigo' },
          ]} />
        </Campo>
        <Campo rotulo="Repor déficit em (h)"><input inputMode="numeric" value={horas} onChange={(e) => setHoras(e.target.value)} disabled={!desid} /></Campo>
        <Campo rotulo="Perdas contínuas (mL/dia)" dica="Vômito, diarreia, poliúria"><input inputMode="decimal" value={perdas} onChange={(e) => setPerdas(e.target.value)} placeholder="0" /></Campo>
        <Campo rotulo="Equipo">
          <div className="seg">
            <button type="button" className={equipo === 20 ? 'ativo' : ''} onClick={() => setEquipo(20)}>Macro (20 gts)</button>
            <button type="button" className={equipo === 60 ? 'ativo' : ''} onClick={() => setEquipo(60)}>Micro (60 gts)</button>
          </div>
        </Campo>
        <Campo rotulo="Solução">
          <select value={solucao} onChange={(e) => setSolucao(e.target.value)}>{SOLUCOES.map((s) => <option key={s}>{s}</option>)}</select>
        </Campo>
      </div>

      {p > 0 && (
        <>
          <div className="resultado-fluido">
            <div className="rf-item"><span>Manutenção</span><b>{fmtNum(r.manutencao, 0)} mL/dia</b><small>{fmtNum(r.taxaManutMlH - r.perdas / 24, 1)} mL/h</small></div>
            <div className="rf-item"><span>Déficit (desidratação)</span><b>{fmtNum(r.deficit, 0)} mL</b><small>{desid ? `${fmtNum(r.taxaReposicaoMlH, 1)} mL/h por ${num(horas) || 24} h` : '—'}</small></div>
            <div className="rf-item"><span>Perdas</span><b>{fmtNum(r.perdas, 0)} mL/dia</b><small>{fmtNum(r.perdas / 24, 1)} mL/h</small></div>
            <div className="rf-item rf-total"><span>Total 1ªs 24 h</span><b>{fmtNum(r.total24h, 0)} mL</b><small>média {fmtNum(r.taxaMediaMlH, 1)} mL/h</small></div>
          </div>

          <div className="taxa-final">
            <div className="tf-escolha">
              <Chips<'inicial' | 'manutencao'> permitirLimpar={false} valor={usar} onChange={(v) => v && setUsar(v)} opcoes={[
                { v: 'inicial', r: desid ? `Reposição + manutenção (${num(horas) || 24} h iniciais)` : 'Manutenção + perdas' },
                ...(desid ? [{ v: 'manutencao' as const, r: 'Após reposição (manutenção)' }] : []),
              ]} />
            </div>
            <div className="tf-numeros">
              <div><Droplets size={26} /><b>{fmtNum(taxa, 1)}</b><span>mL/h</span></div>
              <div><b>{fmtNum(gotasMin(taxa, equipo), 0)}</b><span>gotas/min</span></div>
              <div><b>{fmtNum(segundosPorGota(taxa, equipo), 1)}</b><span>seg/gota</span></div>
              {usar === 'inicial' && desid ? <div><b>{fmtNum(taxa * (num(horas) || 24), 0)}</b><span>mL nas {num(horas) || 24} h iniciais</span></div> : <div><b>{fmtNum(taxa * 24, 0)}</b><span>mL em 24 h</span></div>}
            </div>
          </div>

          <div className="alerta-box info">
            <FlaskConical size={16} />
            <span><b>Bolus de choque ({especie === 'canina' ? 'cão' : 'gato'}):</b> {bolusMin}–{bolusMax} mL/kg de cristaloide em 15–20 min = <b>{fmtNum(p * bolusMin, 0)}–{fmtNum(p * bolusMax, 0)} mL</b>. Reavaliar após cada bolus.</span>
          </div>

          {onPrescrever && (
            <div className="grade-form g2 mt">
              <Campo rotulo="Aditivos (opcional)"><input value={aditivos} onChange={(e) => setAditivos(e.target.value)} placeholder="Ex.: KCl 20 mEq/L, glicose 2,5%, complexo B" /></Campo>
              <div className="alinha-fim">
                <button className="btn btn-primario" onClick={() => onPrescrever({ solucao, taxaMlH: Math.round(taxa * 10) / 10, volumeDia: Math.round(usar === 'inicial' && desid ? r.total24h : taxa * 24), equipo, aditivos, obs: desid ? `Desidratação ${desid}% — reposição em ${num(horas)} h` : '' })}>
                  <Droplets size={18} /> Prescrever fluidoterapia {fmtNum(taxa, 1)} mL/h
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function CalcKCl({ peso: pesoInicial }: { peso?: number }) {
  const [peso, setPeso] = useState(pesoInicial ? String(pesoInicial).replace('.', ',') : '');
  const [k, setK] = useState('3,2');
  const [frasco, setFrasco] = useState('500');
  const [taxa, setTaxa] = useState('');
  const r = kclPorFrasco(num(k), num(frasco));
  const max = taxaMaxKMlH(num(peso), r.linha.meqL);
  const excede = num(taxa) > 0 && num(taxa) > max;
  return (
    <div className="calc">
      <div className="grade-form g4">
        <Campo rotulo="Peso (kg)"><input inputMode="decimal" value={peso} onChange={(e) => setPeso(e.target.value)} disabled={!!pesoInicial} /></Campo>
        <Campo rotulo="K⁺ sérico (mEq/L)"><input inputMode="decimal" value={k} onChange={(e) => setK(e.target.value)} /></Campo>
        <Campo rotulo="Volume do frasco (mL)">
          <select value={frasco} onChange={(e) => setFrasco(e.target.value)}>{['100', '250', '500', '1000'].map((v) => <option key={v}>{v}</option>)}</select>
        </Campo>
        <Campo rotulo="Taxa da fluido (mL/h)"><input inputMode="decimal" value={taxa} onChange={(e) => setTaxa(e.target.value)} placeholder="opcional" /></Campo>
      </div>
      <div className="resultado-fluido">
        <div className="rf-item"><span>Suplementar</span><b>{r.linha.meqL} mEq/L</b><small>faixa K⁺ {r.linha.faixa}</small></div>
        <div className="rf-item"><span>KCl no frasco</span><b>{fmtNum(r.meq, 1)} mEq</b><small>em {frasco} mL</small></div>
        <div className="rf-item rf-total"><span>KCl 19,1% a adicionar</span><b>{fmtNum(r.ml, 1)} mL</b><small>({KCL_MEQ_ML} mEq/mL)</small></div>
        <div className="rf-item"><span>Taxa máxima segura</span><b>{num(peso) ? `${fmtNum(max, 0)} mL/h` : '—'}</b><small>0,5 mEq/kg/h</small></div>
      </div>
      {excede && <div className="alerta-box"><AlertTriangle size={16} /> A taxa informada excede o limite de 0,5 mEq/kg/h de potássio! Reduza a taxa ou a concentração.</div>}
      <table className="tabela tabela-compacta mt">
        <thead><tr><th>K⁺ sérico (mEq/L)</th><th>mEq KCl/L de fluido</th><th>mL KCl 19,1% / 500 mL</th></tr></thead>
        <tbody>{TABELA_KCL.map((l) => <tr key={l.faixa} className={l === r.linha ? 'linha-destaque' : ''}><td>{l.faixa}</td><td>{l.meqL}</td><td>{fmtNum((l.meqL / 2) / KCL_MEQ_ML, 1)}</td></tr>)}</tbody>
      </table>
      <p className="aviso-legal">Homogeneizar bem o frasco após adicionar KCl. Nunca administrar KCl em bolus.</p>
    </div>
  );
}

const CRI_PRESETS: { nome: string; dose: number; unidade: UnidadeCRI; conc: number; faixa: string }[] = [
  { nome: 'Fentanil', dose: 3, unidade: 'mcg/kg/h', conc: 0.05, faixa: '2–10 mcg/kg/h' },
  { nome: 'Lidocaína', dose: 50, unidade: 'mcg/kg/min', conc: 20, faixa: '25–80 mcg/kg/min (cães)' },
  { nome: 'Cetamina', dose: 0.3, unidade: 'mg/kg/h', conc: 100, faixa: '0,1–0,6 mg/kg/h' },
  { nome: 'Metoclopramida', dose: 2, unidade: 'mg/kg/dia', conc: 5, faixa: '1–2 mg/kg/dia' },
  { nome: 'Furosemida', dose: 0.5, unidade: 'mg/kg/h', conc: 10, faixa: '0,1–1 mg/kg/h' },
  { nome: 'Dexmedetomidina', dose: 1, unidade: 'mcg/kg/h', conc: 0.5, faixa: '0,5–2 mcg/kg/h' },
  { nome: 'Midazolam', dose: 0.2, unidade: 'mg/kg/h', conc: 5, faixa: '0,1–0,5 mg/kg/h' },
  { nome: 'Insulina regular (CAD)', dose: 0.05, unidade: 'UI/kg/h', conc: 100, faixa: '0,025–0,1 UI/kg/h' },
  { nome: 'Noradrenalina', dose: 0.1, unidade: 'mcg/kg/min', conc: 1, faixa: '0,05–2 mcg/kg/min' },
  { nome: 'Dobutamina', dose: 5, unidade: 'mcg/kg/min', conc: 12.5, faixa: '2–15 mcg/kg/min' },
];

export function CalcCRI({ peso: pesoInicial }: { peso?: number }) {
  const [peso, setPeso] = useState(pesoInicial ? String(pesoInicial).replace('.', ',') : '');
  const [preset, setPreset] = useState(0);
  const [dose, setDose] = useState(String(CRI_PRESETS[0].dose).replace('.', ','));
  const [unidade, setUnidade] = useState<UnidadeCRI>(CRI_PRESETS[0].unidade);
  const [conc, setConc] = useState(String(CRI_PRESETS[0].conc).replace('.', ','));
  const [taxa, setTaxa] = useState('5');
  const [volume, setVolume] = useState('60');

  const aplicar = (i: number) => {
    setPreset(i);
    const p = CRI_PRESETS[i];
    setDose(String(p.dose).replace('.', ','));
    setUnidade(p.unidade);
    setConc(String(p.conc).replace('.', ','));
  };
  const r = calcularCRI({ dose: num(dose), unidade, peso: num(peso), concentracao: num(conc), taxaMlH: num(taxa), volume: num(volume) });
  const un = unidade.startsWith('UI') ? 'UI' : 'mg';
  return (
    <div className="calc">
      <div className="chips mb">
        {CRI_PRESETS.map((p, i) => <button type="button" key={p.nome} className={`chip ${preset === i ? 'ativo tom-info' : ''}`} onClick={() => aplicar(i)}>{p.nome}</button>)}
      </div>
      <p className="muted">Faixa usual: {CRI_PRESETS[preset].faixa}</p>
      <div className="grade-form g3">
        <Campo rotulo="Peso (kg)"><input inputMode="decimal" value={peso} onChange={(e) => setPeso(e.target.value)} disabled={!!pesoInicial} /></Campo>
        <Campo rotulo="Dose">
          <div className="input-grupo">
            <input inputMode="decimal" value={dose} onChange={(e) => setDose(e.target.value)} />
            <select value={unidade} onChange={(e) => setUnidade(e.target.value as UnidadeCRI)}>
              {(['mcg/kg/min', 'mcg/kg/h', 'mg/kg/h', 'mg/kg/dia', 'UI/kg/h'] as UnidadeCRI[]).map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
        </Campo>
        <Campo rotulo={`Concentração do fármaco (${un}/mL)`}><input inputMode="decimal" value={conc} onChange={(e) => setConc(e.target.value)} /></Campo>
        <Campo rotulo="Volume da seringa/bolsa (mL)"><input inputMode="decimal" value={volume} onChange={(e) => setVolume(e.target.value)} /></Campo>
        <Campo rotulo="Taxa da bomba (mL/h)"><input inputMode="decimal" value={taxa} onChange={(e) => setTaxa(e.target.value)} /></Campo>
      </div>
      {num(peso) > 0 && (
        <div className="resultado-fluido">
          <div className="rf-item"><span>Fármaco por hora</span><b>{fmtNum(r.mgH, 3)} {un}/h</b></div>
          <div className="rf-item"><span>Duração do volume</span><b>{fmtNum(r.horasDuracao, 1)} h</b></div>
          <div className="rf-item"><span>Total de fármaco</span><b>{fmtNum(r.mgTotal, 2)} {un}</b></div>
          <div className="rf-item rf-total"><span><Syringe size={14} /> Adicionar</span><b>{fmtNum(r.mlFarmaco, 2)} mL</b><small>do fármaco e completar até {volume} mL</small></div>
        </div>
      )}
      {r.mlFarmaco > num(volume) && <div className="alerta-box"><AlertTriangle size={16} /> O volume do fármaco excede o volume total — aumente a taxa ou use concentração maior.</div>}
    </div>
  );
}
