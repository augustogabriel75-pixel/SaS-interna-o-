import { useState } from 'react';
import { Search, AlertTriangle } from 'lucide-react';
import { MEDICAMENTOS, CLASSES } from '../data/medicamentos';
import { fmtNum } from '../utils/calc';
import { Badge } from '../components/ui';

export default function Bulario() {
  const [busca, setBusca] = useState('');
  const [classe, setClasse] = useState('');
  const q = busca.toLowerCase();
  const lista = MEDICAMENTOS.filter((m) => (!classe || m.classe === classe) && (!q || `${m.nome} ${m.comerciais}`.toLowerCase().includes(q)));
  return (
    <div className="pagina">
      <div className="pagina-cab">
        <div>
          <h1>Bulário de internação</h1>
          <p className="sub">{MEDICAMENTOS.length} fármacos com doses de referência para cães e gatos</p>
        </div>
      </div>
      <div className="cartao filtros-col">
        <div className="busca"><Search size={16} /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar princípio ativo ou nome comercial" /></div>
        <div className="sistemas">
          <button className={`sistema ${!classe ? 'ativo' : ''}`} onClick={() => setClasse('')}>Todas</button>
          {CLASSES.map((c) => <button key={c} className={`sistema ${classe === c ? 'ativo' : ''}`} onClick={() => setClasse(c)}>{c}</button>)}
        </div>
      </div>
      <div className="grade-bulario">
        {lista.map((m) => (
          <div key={m.id} className="cartao med-card">
            <div className="med-card-cab">
              <div><strong>{m.nome}</strong><small>{m.comerciais}</small></div>
              <Badge>{m.classe}</Badge>
            </div>
            <table className="tabela tabela-compacta">
              <thead><tr><th /><th>Dose</th><th>Intervalo</th></tr></thead>
              <tbody>
                <tr><td>🐶 Cão</td><td>{m.canina ? `${fmtNum(m.canina.min, 3)}${m.canina.max !== m.canina.min ? '–' + fmtNum(m.canina.max, 3) : ''} ${m.unidade}` : <span className="txt-perigo">Não usar</span>}</td><td>{m.canina ? `${m.canina.freq} h` : '—'}</td></tr>
                <tr><td>🐱 Gato</td><td>{m.felina ? `${fmtNum(m.felina.min, 3)}${m.felina.max !== m.felina.min ? '–' + fmtNum(m.felina.max, 3) : ''} ${m.unidade}` : <span className="txt-perigo">Não usar</span>}</td><td>{m.felina ? `${m.felina.freq} h` : '—'}</td></tr>
              </tbody>
            </table>
            <small><b>Vias:</b> {m.vias.join(', ')}</small>
            <small><b>Apresentações:</b> {m.apresentacoes.map((a) => a.rotulo).join(' • ')}</small>
            {m.obs && <small className="muted">{m.obs}</small>}
            {m.alertaFelino && <small className="txt-perigo"><AlertTriangle size={12} /> {m.alertaFelino}</small>}
          </div>
        ))}
      </div>
      <p className="aviso-legal">Doses compiladas de literatura veterinária de referência. Sempre confirme em bula/formulário atualizado e ajuste ao paciente.</p>
    </div>
  );
}
