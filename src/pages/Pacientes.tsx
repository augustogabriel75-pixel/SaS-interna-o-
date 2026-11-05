import { useState } from 'react';
import { usePode } from '../auth';
import { Plus, Search, Users } from 'lucide-react';
import { useStore, nomeBox } from '../store';
import { Badge, Chips, Vazio, useToast } from '../components/ui';
import { fmtData, tempoInternado } from '../utils/format';
import { GRAV, IconeEspecie } from './Painel';
import { ir } from '../router';
import type { StatusInternacao } from '../types';

const STATUS: Record<StatusInternacao, { r: string; tom: 'ok' | 'info' | 'neutro' | 'perigo' }> = {
  internado: { r: 'Internado', tom: 'info' },
  alta: { r: 'Alta', tom: 'ok' },
  obito: { r: 'Óbito', tom: 'neutro' },
  transferido: { r: 'Transferido', tom: 'neutro' },
};

export default function Pacientes() {
  const { db, agora, sync, carregarHistorico } = useStore();
  const pode = usePode();
  const toast = useToast();
  const [filtro, setFiltro] = useState<StatusInternacao | undefined>('internado');
  const [busca, setBusca] = useState('');
  const lista = db.pacientes
    .filter((p) => !filtro || p.status === filtro)
    .filter((p) => !busca || `${p.nome} ${p.tutor.nome} ${p.tutor.telefone} ${p.raca} ${p.diagnosticos.join(' ')}`.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => b.dataEntrada.localeCompare(a.dataEntrada));

  return (
    <div className="pagina">
      <div className="pagina-cab">
        <div>
          <h1>Pacientes</h1>
          <p className="sub">Histórico de internações</p>
        </div>
        <div className="acoes">
          {sync.modo === 'nuvem' && <button className="btn btn-secundario" disabled={!sync.online} onClick={() => carregarHistorico().then((n) => toast(`${n} paciente(s) no histórico`)).catch((e) => toast(e.message, 'erro'))}>Buscar histórico completo</button>}
          {pode.internar && <button className="btn btn-primario" onClick={() => ir('/internar')}><Plus size={18} /> Nova internação</button>}
        </div>
      </div>
      <div className="filtros cartao">
        <Chips<StatusInternacao> valor={filtro} onChange={setFiltro} opcoes={[
          { v: 'internado', r: 'Internados' }, { v: 'alta', r: 'Alta' }, { v: 'obito', r: 'Óbito' }, { v: 'transferido', r: 'Transferidos' },
        ]} />
        <div className="busca flex1">
          <Search size={16} />
          <input placeholder="Nome, tutor, telefone, diagnóstico..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
      </div>
      {lista.length === 0 ? (
        <Vazio icone={<Users size={36} />} titulo="Nenhum paciente encontrado" />
      ) : (
        <div className="cartao tabela-wrap">
          <table className="tabela">
            <thead>
              <tr><th>Paciente</th><th>Tutor</th><th>Diagnóstico</th><th>Box</th><th>Entrada</th><th>Situação</th></tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.id} onClick={() => ir(`/paciente/${p.id}`)} className="clicavel">
                  <td>
                    <div className="cel-pac">
                      <span className={`avatar avatar-sm avatar-${p.especie}`}><IconeEspecie especie={p.especie} size={14} /></span>
                      <span><strong>{p.nome}</strong><small>{p.raca} • {p.peso.toLocaleString('pt-BR')} kg</small></span>
                    </div>
                  </td>
                  <td>{p.tutor.nome}<small className="bloco muted">{p.tutor.telefone}</small></td>
                  <td>{p.diagnosticos.join(', ') || '—'}</td>
                  <td>{p.status === 'internado' ? nomeBox(db.config, p.boxId).split(' · ')[0] : '—'}</td>
                  <td>{fmtData(p.dataEntrada)}<small className="bloco muted">{p.status === 'internado' ? tempoInternado(p.dataEntrada, agora) : p.alta ? `até ${fmtData(p.alta.data)}` : ''}</small></td>
                  <td>
                    <Badge tom={STATUS[p.status].tom}>{STATUS[p.status].r}</Badge>{' '}
                    {p.status === 'internado' && <Badge tom={GRAV[p.gravidade].tom}>{GRAV[p.gravidade].r}</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
