import { useState } from 'react';
import { usePode } from '../../auth';
import { Droplets, StopCircle, Pencil, Check } from 'lucide-react';
import type { Paciente } from '../../types';
import { useStore } from '../../store';
import { Abas, Badge, useToast } from '../../components/ui';
import { CalcFluido, CalcKCl, CalcCRI } from '../../components/Calculadoras';
import { fmtDataHora, uid, tempoInternado } from '../../utils/format';
import { gotasMin, fmtNum } from '../../utils/calc';

export default function AbaFluido({ p }: { p: Paciente }) {
  const { atualizarPaciente } = useStore();
  const toast = useToast();
  const pode = usePode();
  const [aba, setAba] = useState<'fluido' | 'kcl' | 'cri'>('fluido');
  const [editando, setEditando] = useState<string | null>(null);
  const [novaTaxa, setNovaTaxa] = useState('');
  const ativos = p.fluidos.filter((f) => f.ativo);
  const encerrados = p.fluidos.filter((f) => !f.ativo);

  const encerrar = (id: string) => atualizarPaciente(p.id, (x) => {
    const f = x.fluidos.find((i) => i.id === id)!;
    f.ativo = false;
    f.encerradoEm = new Date().toISOString();
  });

  const salvarTaxa = (id: string) => {
    const t = parseFloat(novaTaxa.replace(',', '.'));
    if (!t) return;
    atualizarPaciente(p.id, (x) => {
      const f = x.fluidos.find((i) => i.id === id)!;
      f.obs = `${f.obs ? f.obs + ' • ' : ''}Taxa alterada de ${f.taxaMlH} para ${t} mL/h em ${fmtDataHora(new Date())}`;
      f.taxaMlH = t;
      f.volumeDia = Math.round(t * 24);
    });
    setEditando(null);
    toast('Taxa da fluidoterapia atualizada');
  };

  return (
    <div className="aba-conteudo">
      <div className="secao-cab"><h2>Fluidoterapia</h2></div>

      {ativos.length > 0 && (
        <div className="cartao lista-rx">
          {ativos.map((f) => (
            <div key={f.id} className="linha-rx">
              <div className="rx-principal">
                <div className="rx-nome"><Droplets size={18} className="txt-info" /><strong>{f.solucao}</strong><Badge tom="info">Em curso</Badge></div>
                <div className="rx-dose">
                  {editando === f.id ? (
                    <span className="linha-inline">
                      <input className="input-curto" autoFocus inputMode="decimal" value={novaTaxa} onChange={(e) => setNovaTaxa(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && salvarTaxa(f.id)} /> mL/h
                      <button className="btn btn-sm btn-sucesso" onClick={() => salvarTaxa(f.id)}><Check size={14} /></button>
                    </span>
                  ) : (
                    <span className="rx-qtd">{fmtNum(f.taxaMlH, 1)} mL/h</span>
                  )}
                  <span>{fmtNum(gotasMin(f.taxaMlH, f.equipo), 0)} gotas/min ({f.equipo === 20 ? 'macro' : 'micro'})</span>
                  <span>{fmtNum(f.volumeDia, 0)} mL/24 h</span>
                </div>
                <small className="muted">Início {fmtDataHora(f.inicio)} • há {tempoInternado(f.inicio)}{f.aditivos && ` • Aditivos: ${f.aditivos}`}</small>
                {f.obs && <small className="rx-obs">{f.obs}</small>}
              </div>
              {pode.fluido && <div className="rx-acoes">
                <button className="btn-icone" title="Alterar taxa" onClick={() => { setEditando(f.id); setNovaTaxa(String(f.taxaMlH).replace('.', ',')); }}><Pencil size={17} /></button>
                <button className="btn btn-sm btn-secundario" onClick={() => encerrar(f.id)}><StopCircle size={15} /> Encerrar</button>
              </div>}
            </div>
          ))}
        </div>
      )}

      <div className="cartao">
        <Abas ativa={aba} onChange={setAba} abas={[
          { id: 'fluido', rotulo: 'Calculadora de soro' },
          { id: 'kcl', rotulo: 'Potássio (KCl)' },
          { id: 'cri', rotulo: 'Infusão contínua (CRI)' },
        ]} />
        <div className="mt">
          {aba === 'fluido' && (
            <CalcFluido peso={p.peso} especie={p.especie} onPrescrever={!pode.fluido ? undefined : (f) => {
              atualizarPaciente(p.id, (x) => {
                x.fluidos.forEach((o) => { if (o.ativo) { o.ativo = false; o.encerradoEm = new Date().toISOString(); } });
                x.fluidos.push({ id: uid(), ...f, aditivos: f.aditivos || undefined, obs: f.obs || undefined, inicio: new Date().toISOString(), ativo: true });
              });
              toast(`Fluidoterapia prescrita: ${f.taxaMlH} mL/h`);
            }} />
          )}
          {aba === 'kcl' && <CalcKCl peso={p.peso} />}
          {aba === 'cri' && <CalcCRI peso={p.peso} />}
        </div>
      </div>

      {encerrados.length > 0 && (
        <>
          <h3 className="mt">Histórico</h3>
          <div className="cartao lista-simples">
            {encerrados.map((f) => (
              <div key={f.id} className="item-simples">
                <b>{f.solucao}</b> — {fmtNum(f.taxaMlH, 1)} mL/h • {fmtDataHora(f.inicio)} até {fmtDataHora(f.encerradoEm)}{f.aditivos && ` • ${f.aditivos}`}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
