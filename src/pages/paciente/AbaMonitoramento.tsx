import { useState } from 'react';
import { Plus, Trash2, Save, Activity } from 'lucide-react';
import type { Paciente, Registro } from '../../types';
import { useStore } from '../../store';
import { Campo, Chips, Vazio, useToast, useConfirmar } from '../../components/ui';
import { foraDaFaixa, REFERENCIAS, fmtNum } from '../../utils/calc';
import { fmtDataHora, toLocalInput, fromLocalInput, uid, fmtHora, fmtData } from '../../utils/format';

export const ROT = {
  alimentacao: { comeu_tudo: 'Comeu tudo', comeu_parcial: 'Comeu parcial', nao_comeu: 'Não comeu', forcada: 'Alim. assistida', jejum: 'Jejum', nao_ofertado: 'Não ofertado' },
  agua: { bebeu: 'Bebeu', pouco: 'Bebeu pouco', nao_bebeu: 'Não bebeu', nao_ofertado: 'Não ofertado' },
  urina: { normal: 'Normal', ausente: 'Não urinou', alterada: 'Alterada' },
  fezes: { normal: 'Normais', ausente: 'Não defecou', pastosa: 'Pastosas', diarreica: 'Diarreia', sanguinolenta: 'Com sangue' },
  consciencia: { alerta: 'Alerta', deprimido: 'Deprimido', estupor: 'Estupor', coma: 'Coma', agitado: 'Agitado' },
  mucosas: { normocoradas: 'Normocoradas', hipocoradas: 'Hipocoradas', hipercoradas: 'Hipercoradas', ictericas: 'Ictéricas', cianoticas: 'Cianóticas', congestas: 'Congestas' },
  hidratacao: { normal: 'Hidratado', leve: 'Desid. leve (5%)', moderada: 'Desid. moderada (8%)', grave: 'Desid. grave (>10%)' },
} as const;

type Num = 'temperatura' | 'fc' | 'fr' | 'pas' | 'glicemia' | 'tpc' | 'spo2' | 'peso' | 'dor';

const NUMS: { k: Num; r: string; u: string; passo?: string }[] = [
  { k: 'temperatura', r: 'Temperatura', u: '°C', passo: '0.1' },
  { k: 'fc', r: 'FC', u: 'bpm' },
  { k: 'fr', r: 'FR', u: 'mpm' },
  { k: 'pas', r: 'PAS', u: 'mmHg' },
  { k: 'glicemia', r: 'Glicemia', u: 'mg/dL' },
  { k: 'tpc', r: 'TPC', u: 's', passo: '0.5' },
  { k: 'spo2', r: 'SpO₂', u: '%' },
  { k: 'peso', r: 'Peso', u: 'kg', passo: '0.01' },
];

export default function AbaMonitoramento({ p }: { p: Paciente }) {
  const { db, atualizarPaciente } = useStore();
  const toast = useToast();
  const confirmar = useConfirmar();
  const [aberto, setAberto] = useState(p.registros.length === 0);
  const vazio = (): Partial<Registro> & { dataHoraLocal: string; nums: Partial<Record<Num, string>> } => ({ dataHoraLocal: toLocalInput(), nums: {} });
  const [r, setR] = useState(vazio);
  const set = <K extends keyof Registro>(k: K, v: Registro[K] | undefined) => setR((x) => ({ ...x, [k]: v }));
  const setNum = (k: Num, v: string) => setR((x) => ({ ...x, nums: { ...x.nums, [k]: v } }));

  const salvar = () => {
    const nums: Partial<Record<Num, number>> = {};
    for (const n of NUMS) {
      const v = r.nums[n.k];
      if (v !== undefined && v !== '') nums[n.k] = parseFloat(v.replace(',', '.'));
    }
    const { dataHoraLocal, nums: _n, ...resto } = r;
    void _n;
    const reg: Registro = { ...resto, ...nums, id: uid(), dataHora: fromLocalInput(dataHoraLocal), responsavel: db.usuarioAtual };
    atualizarPaciente(p.id, (x) => {
      x.registros.push(reg);
      if (nums.peso) x.peso = nums.peso;
    });
    toast('Registro de monitoramento salvo');
    setR(vazio());
    setAberto(false);
  };

  const excluir = async (id: string) => {
    if (!(await confirmar({ titulo: 'Excluir este registro de monitoramento?', botao: 'Excluir', perigo: true }))) return;
    atualizarPaciente(p.id, (x) => { x.registros = x.registros.filter((i) => i.id !== id); });
  };

  const regs = [...p.registros].sort((a, b) => b.dataHora.localeCompare(a.dataHora));
  const ref = REFERENCIAS[p.especie];

  return (
    <div className="aba-conteudo">
      <div className="secao-cab">
        <h2>Monitoramento e parâmetros</h2>
        {!aberto && <button className="btn btn-primario" onClick={() => setAberto(true)}><Plus size={18} /> Novo registro</button>}
      </div>

      {aberto && (
        <div className="cartao form-monit">
          <div className="grade-form g4">
            <Campo rotulo="Data/hora"><input type="datetime-local" value={r.dataHoraLocal} onChange={(e) => setR((x) => ({ ...x, dataHoraLocal: e.target.value }))} /></Campo>
          </div>

          <h4>Alimentação e excreções</h4>
          <div className="grade-chips">
            <div><span className="campo-rotulo">🍽️ Comeu?</span>
              <Chips valor={r.alimentacao} onChange={(v) => set('alimentacao', v)} opcoes={[
                { v: 'comeu_tudo', r: 'Comeu tudo', tom: 'ok' }, { v: 'comeu_parcial', r: 'Comeu parcial', tom: 'alerta' }, { v: 'nao_comeu', r: 'Não comeu', tom: 'perigo' },
                { v: 'forcada', r: 'Alim. assistida', tom: 'alerta' }, { v: 'jejum', r: 'Jejum' }, { v: 'nao_ofertado', r: 'Não ofertado' },
              ]} /></div>
            <div><span className="campo-rotulo">💧 Bebeu água?</span>
              <Chips valor={r.agua} onChange={(v) => set('agua', v)} opcoes={[
                { v: 'bebeu', r: 'Bebeu', tom: 'ok' }, { v: 'pouco', r: 'Pouco', tom: 'alerta' }, { v: 'nao_bebeu', r: 'Não bebeu', tom: 'perigo' }, { v: 'nao_ofertado', r: 'Não ofertado' },
              ]} /></div>
            <div><span className="campo-rotulo">🤢 Vomitou?</span>
              <div className="linha-inline">
                <Chips<boolean> valor={r.vomito} onChange={(v) => set('vomito', v)} opcoes={[{ v: false, r: 'Não', tom: 'ok' }, { v: true, r: 'Sim', tom: 'perigo' }]} />
                {r.vomito && <input className="input-curto" type="number" min={1} placeholder="Qtd" value={r.vomitoQtd ?? ''} onChange={(e) => set('vomitoQtd', e.target.value ? Number(e.target.value) : undefined)} />}
              </div></div>
            <div><span className="campo-rotulo">🚽 Urinou?</span>
              <Chips valor={r.urina} onChange={(v) => set('urina', v)} opcoes={[{ v: 'normal', r: 'Sim, normal', tom: 'ok' }, { v: 'ausente', r: 'Não urinou', tom: 'perigo' }, { v: 'alterada', r: 'Alterada', tom: 'alerta' }]} /></div>
            <div><span className="campo-rotulo">💩 Fezes</span>
              <Chips valor={r.fezes} onChange={(v) => { set('fezes', v); set('diarreia', v === 'diarreica' || v === 'sanguinolenta'); }} opcoes={[
                { v: 'normal', r: 'Normais', tom: 'ok' }, { v: 'ausente', r: 'Não defecou' }, { v: 'pastosa', r: 'Pastosas', tom: 'alerta' }, { v: 'diarreica', r: 'Diarreia', tom: 'perigo' }, { v: 'sanguinolenta', r: 'Com sangue', tom: 'perigo' },
              ]} /></div>
          </div>

          <h4>Exame físico</h4>
          <div className="grade-form g4">
            {NUMS.map((n) => {
              const v = r.nums[n.k];
              const num = v ? parseFloat(v.replace(',', '.')) : undefined;
              const alerta = foraDaFaixa(p.especie, n.k, num);
              const faixa = ref[n.k];
              return (
                <Campo key={n.k} rotulo={`${n.r} (${n.u})`} dica={faixa ? `Ref.: ${fmtNum(faixa[0], 1)}–${fmtNum(faixa[1], 1)}` : undefined}>
                  <input inputMode="decimal" className={alerta ? 'input-alerta' : ''} value={v ?? ''} onChange={(e) => setNum(n.k, e.target.value)} />
                </Campo>
              );
            })}
            <Campo rotulo="Escala de dor (0–10)" span={2}>
              <div className="escala-dor">
                {Array.from({ length: 11 }, (_, i) => (
                  <button type="button" key={i} className={`dor-n dor-${i <= 2 ? 'ok' : i <= 5 ? 'alerta' : 'perigo'} ${r.dor === i ? 'ativo' : ''}`} onClick={() => set('dor', r.dor === i ? undefined : i)}>{i}</button>
                ))}
              </div>
            </Campo>
            <Campo rotulo="Nível de consciência" span={2}>
              <Chips valor={r.consciencia} onChange={(v) => set('consciencia', v)} opcoes={Object.entries(ROT.consciencia).map(([v, rr]) => ({ v: v as Registro['consciencia'] & string, r: rr, tom: v === 'alerta' ? 'ok' : v === 'deprimido' || v === 'agitado' ? 'alerta' : 'perigo' }))} />
            </Campo>
            <Campo rotulo="Mucosas" span={2}>
              <Chips valor={r.mucosas} onChange={(v) => set('mucosas', v)} opcoes={Object.entries(ROT.mucosas).map(([v, rr]) => ({ v: v as Registro['mucosas'] & string, r: rr, tom: v === 'normocoradas' ? 'ok' : 'alerta' }))} />
            </Campo>
            <Campo rotulo="Hidratação" span={2}>
              <Chips valor={r.hidratacao} onChange={(v) => set('hidratacao', v)} opcoes={Object.entries(ROT.hidratacao).map(([v, rr]) => ({ v: v as Registro['hidratacao'] & string, r: rr, tom: v === 'normal' ? 'ok' : v === 'grave' ? 'perigo' : 'alerta' }))} />
            </Campo>
            <Campo rotulo="Observações" span={4}>
              <textarea rows={2} value={r.obs ?? ''} onChange={(e) => set('obs', e.target.value)} placeholder="Comportamento, ferida cirúrgica, acesso venoso, secreções..." />
            </Campo>
          </div>
          <div className="rodape-form">
            <button className="btn btn-fantasma" onClick={() => { setAberto(false); setR(vazio()); }}>Cancelar</button>
            <button className="btn btn-primario" onClick={salvar}><Save size={18} /> Salvar registro</button>
          </div>
        </div>
      )}

      {regs.length > 1 && <Graficos p={p} />}

      {regs.length === 0 ? (
        <Vazio icone={<Activity size={36} />} titulo="Nenhum registro ainda" texto="Registre alimentação, água, vômito, urina, fezes e parâmetros vitais." />
      ) : (
        <div className="cartao tabela-wrap">
          <table className="tabela tabela-compacta">
            <thead>
              <tr><th>Data/hora</th><th>T °C</th><th>FC</th><th>FR</th><th>Dor</th><th>Comeu</th><th>Água</th><th>Vômito</th><th>Urina</th><th>Fezes</th><th>Obs.</th><th /></tr>
            </thead>
            <tbody>
              {regs.map((g) => (
                <tr key={g.id}>
                  <td><b>{fmtHora(g.dataHora)}</b><small className="bloco muted">{fmtData(g.dataHora).slice(0, 5)} • {g.responsavel.split(' ').slice(0, 2).join(' ')}</small></td>
                  <td className={foraDaFaixa(p.especie, 'temperatura', g.temperatura) ? 'txt-perigo' : ''}>{g.temperatura !== undefined ? fmtNum(g.temperatura, 1) : '—'}</td>
                  <td className={foraDaFaixa(p.especie, 'fc', g.fc) ? 'txt-perigo' : ''}>{g.fc ?? '—'}</td>
                  <td className={foraDaFaixa(p.especie, 'fr', g.fr) ? 'txt-perigo' : ''}>{g.fr ?? '—'}</td>
                  <td>{g.dor ?? '—'}</td>
                  <td>{g.alimentacao ? ROT.alimentacao[g.alimentacao] : '—'}</td>
                  <td>{g.agua ? ROT.agua[g.agua] : '—'}</td>
                  <td className={g.vomito ? 'txt-perigo' : ''}>{g.vomito === undefined ? '—' : g.vomito ? `Sim${g.vomitoQtd ? ` (${g.vomitoQtd}x)` : ''}` : 'Não'}</td>
                  <td>{g.urina ? ROT.urina[g.urina] : '—'}</td>
                  <td>{g.fezes ? ROT.fezes[g.fezes] : '—'}</td>
                  <td className="cel-obs">
                    {[g.mucosas && `Mucosas ${ROT.mucosas[g.mucosas].toLowerCase()}`, g.consciencia && ROT.consciencia[g.consciencia], g.glicemia && `Glic. ${g.glicemia}`, g.pas && `PAS ${g.pas}`, g.obs].filter(Boolean).join(' • ')}
                  </td>
                  <td><button className="btn-icone perigo" onClick={() => excluir(g.id)} title="Excluir"><Trash2 size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="muted mt">Registrado em: {fmtDataHora(new Date())} • Valores em vermelho estão fora da faixa de referência para {p.especie === 'canina' ? 'cães' : 'gatos'}.</p>
    </div>
  );
}

function Sparkline({ pontos, faixa, cor, rotulo, unidade }: { pontos: { t: number; v: number }[]; faixa: [number, number]; cor: string; rotulo: string; unidade: string }) {
  if (pontos.length < 2) return null;
  const W = 300, H = 90, P = 8;
  const vs = pontos.map((p) => p.v);
  const min = Math.min(...vs, faixa[0]) - 0.5;
  const max = Math.max(...vs, faixa[1]) + 0.5;
  const t0 = pontos[0].t, t1 = pontos[pontos.length - 1].t || t0 + 1;
  const x = (t: number) => P + ((t - t0) / Math.max(1, t1 - t0)) * (W - 2 * P);
  const y = (v: number) => H - P - ((v - min) / (max - min)) * (H - 2 * P);
  const d = pontos.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
  const ult = pontos[pontos.length - 1];
  return (
    <div className="spark">
      <div className="spark-cab"><span>{rotulo}</span><b>{fmtNum(ult.v, 1)} {unidade}</b></div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`Gráfico de ${rotulo}`}>
        <rect x={0} y={y(faixa[1])} width={W} height={Math.max(0, y(faixa[0]) - y(faixa[1]))} className="spark-faixa" />
        <path d={d} fill="none" stroke={cor} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {pontos.map((p) => <circle key={p.t} cx={x(p.t)} cy={y(p.v)} r={3} fill={p.v < faixa[0] || p.v > faixa[1] ? 'var(--perigo)' : cor} />)}
      </svg>
    </div>
  );
}

function Graficos({ p }: { p: Paciente }) {
  const regs = [...p.registros].sort((a, b) => a.dataHora.localeCompare(b.dataHora));
  const serie = (k: 'temperatura' | 'fc' | 'fr' | 'glicemia') => regs.filter((r) => typeof r[k] === 'number').map((r) => ({ t: new Date(r.dataHora).getTime(), v: r[k] as number }));
  const ref = REFERENCIAS[p.especie];
  return (
    <div className="graficos">
      <Sparkline pontos={serie('temperatura')} faixa={ref.temperatura} cor="var(--primaria)" rotulo="Temperatura" unidade="°C" />
      <Sparkline pontos={serie('fc')} faixa={ref.fc} cor="#e11d48" rotulo="Frequência cardíaca" unidade="bpm" />
      <Sparkline pontos={serie('fr')} faixa={ref.fr} cor="#7c3aed" rotulo="Frequência respiratória" unidade="mpm" />
      <Sparkline pontos={serie('glicemia')} faixa={ref.glicemia} cor="#d97706" rotulo="Glicemia" unidade="mg/dL" />
    </div>
  );
}
