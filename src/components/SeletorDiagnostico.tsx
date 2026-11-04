import { useMemo, useState } from 'react';
import { Plus, X, Search } from 'lucide-react';
import { DIAGNOSTICOS } from '../data/diagnosticos';

export default function SeletorDiagnostico({ valor, onChange }: { valor: string[]; onChange: (v: string[]) => void }) {
  const [busca, setBusca] = useState('');
  const [sistema, setSistema] = useState(DIAGNOSTICOS[0].sistema);

  const resultados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return DIAGNOSTICOS.find((g) => g.sistema === sistema)?.itens ?? [];
    return DIAGNOSTICOS.flatMap((g) => g.itens).filter((i) => i.toLowerCase().includes(q));
  }, [busca, sistema]);

  const alternar = (d: string) => onChange(valor.includes(d) ? valor.filter((x) => x !== d) : [...valor, d]);
  const adicionarLivre = () => {
    const t = busca.trim();
    if (t && !valor.includes(t)) onChange([...valor, t]);
    setBusca('');
  };

  return (
    <div className="seletor-diag">
      {valor.length > 0 && (
        <div className="diag-selecionados">
          {valor.map((d) => (
            <span key={d} className="diag-sel">
              {d}
              <button type="button" onClick={() => alternar(d)} aria-label={`Remover ${d}`}><X size={14} /></button>
            </span>
          ))}
        </div>
      )}
      <div className="busca">
        <Search size={16} />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarLivre(); } }}
          placeholder="Buscar diagnóstico ou digitar um novo e pressionar Enter"
        />
        {busca.trim() && !resultados.some((r) => r.toLowerCase() === busca.trim().toLowerCase()) && (
          <button type="button" className="btn btn-sm btn-secundario" onClick={adicionarLivre}><Plus size={14} /> Adicionar</button>
        )}
      </div>
      {!busca && (
        <div className="sistemas">
          {DIAGNOSTICOS.map((g) => (
            <button type="button" key={g.sistema} className={`sistema ${g.sistema === sistema ? 'ativo' : ''}`} onClick={() => setSistema(g.sistema)}>
              {g.sistema}
            </button>
          ))}
        </div>
      )}
      <div className="diag-opcoes">
        {resultados.map((d) => (
          <button type="button" key={d} className={`chip ${valor.includes(d) ? 'ativo tom-info' : ''}`} onClick={() => alternar(d)}>
            {valor.includes(d) ? '✓ ' : ''}{d}
          </button>
        ))}
        {resultados.length === 0 && <span className="muted">Nenhum resultado — pressione Enter para adicionar “{busca}”.</span>}
      </div>
    </div>
  );
}
