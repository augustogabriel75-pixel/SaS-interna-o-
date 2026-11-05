import { useMemo, useState } from 'react';
import { usePode } from '../auth';
import { NUVEM } from '../lib/supabase';
import { UserPlus, AlertTriangle, BedDouble, Clock, LogOut, Plus, ShieldAlert, Activity, Cat, Dog, Droplets, Search } from 'lucide-react';
import { useStore } from '../store';
import { dosesPaciente, type DoseAgendada } from '../utils/calc';
import { fmtHora, relativo, tempoInternado, inicioDoDia, fimDoDia } from '../utils/format';
import { Stat, Badge } from '../components/ui';
import { ir } from '../router';
import type { Paciente } from '../types';

export const GRAV = {
  estavel: { r: 'Estável', tom: 'ok' as const },
  atencao: { r: 'Atenção', tom: 'alerta' as const },
  critico: { r: 'Crítico', tom: 'perigo' as const },
};

export function IconeEspecie({ especie, size = 18 }: { especie: string; size?: number }) {
  return especie === 'felina' ? <Cat size={size} /> : <Dog size={size} />;
}

export default function Painel() {
  const { db, agora } = useStore();
  const pode = usePode();
  const [busca, setBusca] = useState('');
  const internados = db.pacientes.filter((p) => p.status === 'internado');

  const info = useMemo(() => {
    const m = new Map<string, { atrasadas: number; proxima?: DoseAgendada }>();
    for (const p of internados) {
      const doses = dosesPaciente(p, new Date(agora.getTime() - 24 * 3600_000), new Date(agora.getTime() + 24 * 3600_000), agora);
      m.set(p.id, {
        atrasadas: doses.filter((d) => d.status === 'atrasado').length,
        proxima: doses.find((d) => d.status === 'pendente'),
      });
    }
    return m;
  }, [internados, agora]);

  const totalBoxes = db.config.alas.reduce((s, a) => s + a.boxes.length, 0);
  const atrasadas = [...info.values()].reduce((s, i) => s + i.atrasadas, 0);
  const proxHora = internados.flatMap((p) => dosesPaciente(p, agora, new Date(agora.getTime() + 3600_000), agora)).filter((d) => d.status === 'pendente').length;
  const altasHoje = internados.filter((p) => p.altaPrevista && new Date(p.altaPrevista) >= inicioDoDia(agora) && new Date(p.altaPrevista) <= fimDoDia(agora)).length;
  const criticos = internados.filter((p) => p.gravidade === 'critico').length;
  const semBox = internados.filter((p) => !p.boxId || !db.config.alas.some((a) => a.boxes.some((b) => b.id === p.boxId)));

  const filtro = (p?: Paciente) =>
    !busca || (p && `${p.nome} ${p.tutor.nome} ${p.diagnosticos.join(' ')}`.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="pagina">
      <div className="pagina-cab">
        <div>
          <h1>Mapa de internação</h1>
          <p className="sub">{internados.length} paciente(s) internado(s) • {totalBoxes - internados.filter((p) => p.boxId).length} box(es) livre(s)</p>
        </div>
        <div className="acoes">
          <div className="busca">
            <Search size={16} />
            <input placeholder="Buscar paciente, tutor, diagnóstico..." value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
          {pode.internar && <button className="btn btn-primario" onClick={() => ir('/internar')}><Plus size={18} /> Internar paciente</button>}
        </div>
      </div>

      {!NUVEM && db.config.equipe.length === 0 && (
        <div className="alerta-box info">
          <UserPlus size={16} />
          <span className="flex1">Cadastre os profissionais da clínica para registrar quem prescreveu, aplicou e assinou cada documento.</span>
          <a className="btn btn-sm btn-primario" href="#/equipe">Adicionar profissionais</a>
        </div>
      )}

      <div className="stats">
        <Stat rotulo="Internados" valor={`${internados.length}/${totalBoxes}`} icone={<BedDouble />} tom="info" />
        <Stat rotulo="Críticos" valor={criticos} icone={<Activity />} tom={criticos ? 'perigo' : 'neutro'} />
        <Stat rotulo="Medicações atrasadas" valor={atrasadas} icone={<AlertTriangle />} tom={atrasadas ? 'perigo' : 'ok'} onClick={() => ir('/agenda')} />
        <Stat rotulo="Próxima 1 hora" valor={proxHora} icone={<Clock />} tom="alerta" onClick={() => ir('/agenda')} />
        <Stat rotulo="Altas previstas hoje" valor={altasHoje} icone={<LogOut />} tom="ok" />
      </div>

      {semBox.length > 0 && (
        <section className="ala">
          <div className="ala-cab"><span className="ala-cor" style={{ background: '#64748b' }} /> <h2>Sem box definido</h2></div>
          <div className="grade-boxes">
            {semBox.filter(filtro).map((p) => <CardBox key={p.id} p={p} boxNome="—" info={info.get(p.id)} agora={agora} />)}
          </div>
        </section>
      )}

      {db.config.alas.map((ala) => {
        const ocupados = ala.boxes.filter((b) => internados.some((p) => p.boxId === b.id)).length;
        return (
          <section className="ala" key={ala.id}>
            <div className="ala-cab">
              <span className="ala-cor" style={{ background: ala.cor }} />
              <h2>{ala.nome}</h2>
              <span className="ala-ocup">{ocupados}/{ala.boxes.length} ocupados</span>
            </div>
            <div className="grade-boxes">
              {ala.boxes.map((b) => {
                const p = internados.find((x) => x.boxId === b.id);
                if (busca && !filtro(p)) return null;
                if (!p) {
                  return (
                    <button key={b.id} className="box box-livre" disabled={!pode.internar} onClick={() => ir(`/internar?box=${b.id}`)}>
                      <span className="box-nome">{b.nome}</span>
                      <Plus size={22} />
                      <span>{pode.internar ? 'Livre — internar' : 'Livre'}</span>
                    </button>
                  );
                }
                return <CardBox key={b.id} p={p} boxNome={b.nome} cor={ala.cor} info={info.get(p.id)} agora={agora} />;
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function CardBox({ p, boxNome, cor, info, agora }: { p: Paciente; boxNome: string; cor?: string; info?: { atrasadas: number; proxima?: DoseAgendada }; agora: Date }) {
  const g = GRAV[p.gravidade];
  const fluido = p.fluidos.find((f) => f.ativo);
  const ultimoReg = [...p.registros].sort((a, b) => b.dataHora.localeCompare(a.dataHora))[0];
  const altaHoje = p.altaPrevista && new Date(p.altaPrevista) <= fimDoDia(agora);
  return (
    <button className={`box box-ocupado grav-${p.gravidade}`} style={{ ['--cor-ala' as string]: cor }} onClick={() => ir(`/paciente/${p.id}`)}>
      <div className="box-topo">
        <span className="box-nome">{boxNome}</span>
        <Badge tom={g.tom}>{g.r}</Badge>
      </div>
      <div className="box-pet">
        <div className={`avatar avatar-${p.especie}`}><IconeEspecie especie={p.especie} /></div>
        <div>
          <strong>{p.nome}</strong>
          <small>{p.raca} • {p.peso.toLocaleString('pt-BR')} kg</small>
        </div>
      </div>
      <div className="box-diag">{p.diagnosticos[0] ?? p.queixa ?? 'Sem diagnóstico'}{p.diagnosticos.length > 1 && ` +${p.diagnosticos.length - 1}`}</div>
      <div className="box-tags">
        {p.isolamento && <span className="tag tag-alerta"><ShieldAlert size={12} /> Isolamento</span>}
        {p.jejum && <span className="tag">Jejum</span>}
        {fluido && <span className="tag tag-info"><Droplets size={12} /> {fluido.taxaMlH} mL/h</span>}
        {altaHoje && <span className="tag tag-ok"><LogOut size={12} /> Alta hoje</span>}
      </div>
      <div className="box-rodape">
        {info?.atrasadas ? (
          <span className="box-atraso"><AlertTriangle size={14} /> {info.atrasadas} atrasada(s)</span>
        ) : info?.proxima ? (
          <span><Clock size={14} /> {fmtHora(info.proxima.horario)} • {info.proxima.prescricao.nome} <em>({relativo(info.proxima.horario, agora)})</em></span>
        ) : (
          <span className="muted">Sem medicações pendentes</span>
        )}
      </div>
      <div className="box-meta">
        <span>{tempoInternado(p.dataEntrada, agora)} internado</span>
        {ultimoReg && <span>Últ. aferição {fmtHora(ultimoReg.dataHora)}</span>}
      </div>
    </button>
  );
}
