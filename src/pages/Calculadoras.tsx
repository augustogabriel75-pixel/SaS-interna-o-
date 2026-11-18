import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Abas, Campo } from '../components/ui';
import { CalcFluido, CalcKCl, CalcCRI } from '../components/Calculadoras';
import { todosMedicamentos, faixaDe, unidadeDe, doseSugerida, textoFaixa } from '../data/medicamentos';
import { useStore } from '../store';
import { textoCalculo, textoQuantidade, doseNaForma, formaDaUnidade } from '../utils/calc';
import type { Especie, Prescricao } from '../types';

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
  const { db } = useStore();
  const lista = todosMedicamentos(db.config.medicamentosClinica);
  const [medId, setMedId] = useState('maropitant');
  const [especie, setEspecie] = useState<Especie>('canina');
  const [peso, setPeso] = useState('10');
  const med = lista.find((m) => m.id === medId) ?? lista[0];
  const faixa = faixaDe(med, especie);
  const u = unidadeDe(med, especie);
  const [dose, setDose] = useState('');
  const [apIdx, setApIdx] = useState(0);
  const formaU = formaDaUnidade(u);
  const ap = med.apresentacoes[apIdx] ?? med.apresentacoes[0];
  const p = parseFloat(peso.replace(',', '.')) || 0;
  const d = parseFloat(dose.replace(',', '.')) || (faixa ? doseSugerida(faixa, p) : 0);
  const rx = { dose: d, unidadeDose: u, concentracao: doseNaForma(u) ? 1 : ap.valor, forma: formaU ?? ap.forma } as Prescricao;
  return (
    <div className="calc">
      <div className="grade-form g4">
        <Campo rotulo="Medicamento" span={2}>
          <select value={med.id} onChange={(e) => { setMedId(e.target.value); setDose(''); setApIdx(0); }}>
            {lista.map((m) => <option key={m.id} value={m.id}>{m.nome} — {m.comerciais}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Espécie">
          <div className="seg">
            <button type="button" className={especie === 'canina' ? 'ativo' : ''} onClick={() => { setEspecie('canina'); setDose(''); }}>Cão</button>
            <button type="button" className={especie === 'felina' ? 'ativo' : ''} onClick={() => { setEspecie('felina'); setDose(''); }}>Gato</button>
          </div>
        </Campo>
        <Campo rotulo="Peso (kg)"><input inputMode="decimal" value={peso} onChange={(e) => setPeso(e.target.value)} /></Campo>
        <Campo rotulo={`Dose (${u})`} dica={faixa ? `Ref.: ${textoFaixa(med, especie)} a cada ${faixa.freq} h` : 'Sem referência'}>
          <input inputMode="decimal" value={dose} placeholder={faixa ? String(doseSugerida(faixa, p)).replace('.', ',') : ''} onChange={(e) => setDose(e.target.value)} />
        </Campo>
        {!doseNaForma(u) && med.apresentacoes.length > 1 && (
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
            <div className="calc-linha"><b>{textoCalculo(d, u, p)}</b></div>
            <div className="calc-grande">{textoQuantidade(rx, p)} <span>{med.vias.join(' / ')}</span></div>
            {med.obs && <small className="muted">{med.obs}</small>}
          </div>
        </div>
      )}
    </div>
  );
}
