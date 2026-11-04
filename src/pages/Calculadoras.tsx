import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Abas, Campo } from '../components/ui';
import { CalcFluido, CalcKCl, CalcCRI } from '../components/Calculadoras';
import { MEDICAMENTOS } from '../data/medicamentos';
import { fmtNum, fracaoComprimido, unidadeAtivo } from '../utils/calc';
import type { Especie } from '../types';

type Aba = 'fluido' | 'dose' | 'kcl' | 'cri';

export default function Calculadoras() {
  const [aba, setAba] = useState<Aba>('fluido');
  return (
    <div className="pagina">
      <div className="pagina-cab">
        <div>
          <h1>Calculadoras clínicas</h1>
          <p className="sub">Fluidoterapia, doses, potássio e infusão contínua</p>
        </div>
      </div>
      <div className="cartao">
        <Abas<Aba> ativa={aba} onChange={setAba} abas={[
          { id: 'fluido', rotulo: 'Soro / fluidoterapia' },
          { id: 'dose', rotulo: 'Dose de medicamento' },
          { id: 'kcl', rotulo: 'Potássio (KCl)' },
          { id: 'cri', rotulo: 'Infusão contínua (CRI)' },
        ]} />
        <div className="mt">
          {aba === 'fluido' && <CalcFluido />}
          {aba === 'dose' && <CalcDose />}
          {aba === 'kcl' && <CalcKCl />}
          {aba === 'cri' && <CalcCRI />}
        </div>
      </div>
      <p className="aviso-legal">Ferramentas de apoio. Confirme sempre os valores antes de administrar.</p>
    </div>
  );
}

function CalcDose() {
  const [medId, setMedId] = useState('maropitant');
  const [especie, setEspecie] = useState<Especie>('canina');
  const [peso, setPeso] = useState('10');
  const med = MEDICAMENTOS.find((m) => m.id === medId)!;
  const faixa = especie === 'canina' ? med.canina : med.felina;
  const [dose, setDose] = useState('');
  const [apIdx, setApIdx] = useState(0);
  const ap = med.apresentacoes[apIdx] ?? med.apresentacoes[0];
  const d = parseFloat(dose.replace(',', '.')) || faixa?.padrao || 0;
  const p = parseFloat(peso.replace(',', '.')) || 0;
  const total = d * p;
  const qtd = med.unidade === 'mL/kg' ? total : total / ap.valor;
  return (
    <div className="calc">
      <div className="grade-form g4">
        <Campo rotulo="Medicamento" span={2}>
          <select value={medId} onChange={(e) => { setMedId(e.target.value); setDose(''); setApIdx(0); }}>
            {MEDICAMENTOS.map((m) => <option key={m.id} value={m.id}>{m.nome} — {m.comerciais}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Espécie">
          <div className="seg">
            <button type="button" className={especie === 'canina' ? 'ativo' : ''} onClick={() => { setEspecie('canina'); setDose(''); }}>Cão</button>
            <button type="button" className={especie === 'felina' ? 'ativo' : ''} onClick={() => { setEspecie('felina'); setDose(''); }}>Gato</button>
          </div>
        </Campo>
        <Campo rotulo="Peso (kg)"><input inputMode="decimal" value={peso} onChange={(e) => setPeso(e.target.value)} /></Campo>
        <Campo rotulo={`Dose (${med.unidade})`} dica={faixa ? `Ref.: ${fmtNum(faixa.min, 3)}–${fmtNum(faixa.max, 3)} a cada ${faixa.freq} h` : 'Sem referência'}>
          <input inputMode="decimal" value={dose} placeholder={faixa ? String(faixa.padrao).replace('.', ',') : ''} onChange={(e) => setDose(e.target.value)} />
        </Campo>
        {med.unidade !== 'mL/kg' && (
          <Campo rotulo="Apresentação" span={2}>
            <select value={apIdx} onChange={(e) => setApIdx(Number(e.target.value))}>
              {med.apresentacoes.map((a, i) => <option key={a.rotulo} value={i}>{a.rotulo}</option>)}
            </select>
          </Campo>
        )}
      </div>
      {!faixa && <div className="alerta-box"><AlertTriangle size={16} /> {med.alertaFelino ?? 'Sem dose de referência para esta espécie.'}</div>}
      {especie === 'felina' && faixa && med.alertaFelino && <div className="alerta-box"><AlertTriangle size={16} /> {med.alertaFelino}</div>}
      {p > 0 && d > 0 && (
        <div className="calc-resultado">
          <div>
            <div className="calc-linha">{fmtNum(p)} kg × {fmtNum(d, 3)} {med.unidade} = <b>{fmtNum(total, 3)} {unidadeAtivo(med.unidade)}</b></div>
            <div className="calc-grande">{ap.forma === 'mL' || med.unidade === 'mL/kg' ? `${fmtNum(qtd, 2)} mL` : `${fracaoComprimido(qtd)} ${ap.forma}(s)`} <span>{med.vias.join(' / ')}</span></div>
            {med.obs && <small className="muted">{med.obs}</small>}
          </div>
        </div>
      )}
    </div>
  );
}
