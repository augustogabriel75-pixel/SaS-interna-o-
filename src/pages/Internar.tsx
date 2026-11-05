import { useState, type FormEvent } from 'react';
import { NUVEM } from '../lib/supabase';
import { Save, Dog, Cat } from 'lucide-react';
import { useStore, nomesVeterinarios } from '../store';
import { Campo, Chips, useToast } from '../components/ui';
import SeletorDiagnostico from '../components/SeletorDiagnostico';
import { RACAS_CAES, RACAS_GATOS } from '../data/diagnosticos';
import { uid, toLocalInput, fromLocalInput, toDateInput } from '../utils/format';
import { ir } from '../router';
import type { Especie, Gravidade, Paciente, Sexo } from '../types';

export default function Internar({ boxInicial, editarId }: { boxInicial?: string; editarId?: string }) {
  const { db, atualizar, paciente } = useStore();
  const toast = useToast();
  const existente = editarId ? paciente(editarId) : undefined;
  const ocupados = new Set(db.pacientes.filter((p) => p.status === 'internado' && p.id !== editarId).map((p) => p.boxId));

  const [f, setF] = useState(() => ({
    nome: existente?.nome ?? '',
    especie: (existente?.especie ?? 'canina') as Especie,
    raca: existente?.raca ?? 'SRD',
    sexo: (existente?.sexo ?? 'macho') as Sexo,
    castrado: existente?.castrado ?? false,
    idade: existente?.idade ?? '',
    peso: existente ? String(existente.peso).replace('.', ',') : '',
    pelagem: existente?.pelagem ?? '',
    microchip: existente?.microchip ?? '',
    tutorNome: existente?.tutor.nome ?? '',
    tutorTel: existente?.tutor.telefone ?? '',
    tutorEmail: existente?.tutor.email ?? '',
    tutorCpf: existente?.tutor.cpf ?? '',
    tutorEnd: existente?.tutor.endereco ?? '',
    boxId: existente?.boxId ?? boxInicial ?? '',
    entrada: toLocalInput(existente?.dataEntrada ?? new Date()),
    altaPrevista: existente?.altaPrevista ? toDateInput(existente.altaPrevista) : toDateInput(new Date(Date.now() + 2 * 86400_000)),
    queixa: existente?.queixa ?? '',
    anamnese: existente?.anamnese ?? '',
    diagnosticos: existente?.diagnosticos ?? ([] as string[]),
    diagnosticoObs: existente?.diagnosticoObs ?? '',
    alergias: existente?.alergias ?? '',
    gravidade: (existente?.gravidade ?? 'estavel') as Gravidade,
    veterinario: existente?.veterinario ?? (nomesVeterinarios(db.config).includes(db.usuarioAtual) ? db.usuarioAtual : nomesVeterinarios(db.config)[0] ?? ''),
    jejum: existente?.jejum ?? false,
    isolamento: existente?.isolamento ?? false,
    alertas: existente?.alertas ?? '',
  }));
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));

  const salvar = (e: FormEvent) => {
    e.preventDefault();
    const peso = parseFloat(f.peso.replace(',', '.'));
    if (!f.nome.trim()) return toast('Informe o nome do paciente', 'erro');
    if (!peso || peso <= 0) return toast('Informe o peso do paciente (kg)', 'erro');
    if (!f.tutorNome.trim()) return toast('Informe o nome do tutor', 'erro');
    const dados: Partial<Paciente> = {
      nome: f.nome.trim(), especie: f.especie, raca: f.raca || 'SRD', sexo: f.sexo, castrado: f.castrado, idade: f.idade, peso,
      pelagem: f.pelagem, microchip: f.microchip,
      tutor: { nome: f.tutorNome.trim(), telefone: f.tutorTel, email: f.tutorEmail, cpf: f.tutorCpf, endereco: f.tutorEnd },
      boxId: f.boxId || null, dataEntrada: fromLocalInput(f.entrada),
      altaPrevista: f.altaPrevista ? new Date(f.altaPrevista + 'T12:00').toISOString() : undefined,
      queixa: f.queixa, anamnese: f.anamnese, diagnosticos: f.diagnosticos, diagnosticoObs: f.diagnosticoObs, alergias: f.alergias,
      gravidade: f.gravidade, veterinario: f.veterinario, jejum: f.jejum, isolamento: f.isolamento, alertas: f.alertas,
    };
    let id = editarId;
    atualizar((d) => {
      if (existente) {
        const p = d.pacientes.find((x) => x.id === editarId)!;
        Object.assign(p, dados);
      } else {
        id = uid();
        d.pacientes.push({
          id, status: 'internado', prescricoes: [], aplicacoes: [], registros: [], fluidos: [], boletins: [], evolucoes: [],
          ...(dados as Omit<Paciente, 'id' | 'status' | 'prescricoes' | 'aplicacoes' | 'registros' | 'fluidos' | 'boletins' | 'evolucoes'>),
        });
      }
    });
    toast(existente ? 'Dados atualizados' : `${f.nome} internado(a) com sucesso`);
    ir(existente ? `/paciente/${id}` : `/paciente/${id}/prescricao`);
  };

  const racas = f.especie === 'canina' ? RACAS_CAES : RACAS_GATOS;

  return (
    <form className="pagina" onSubmit={salvar}>
      <div className="pagina-cab">
        <div>
          <h1>{existente ? `Editar internação — ${existente.nome}` : 'Nova internação'}</h1>
          <p className="sub">Preencha os dados do paciente. Campos com * são obrigatórios.</p>
        </div>
        <div className="acoes">
          <button type="button" className="btn btn-fantasma" onClick={() => history.back()}>Cancelar</button>
          <button type="submit" className="btn btn-primario"><Save size={18} /> {existente ? 'Salvar' : 'Internar e prescrever'}</button>
        </div>
      </div>

      <section className="cartao">
        <h2 className="cartao-titulo">Paciente</h2>
        <div className="grade-form g4">
          <Campo rotulo="Espécie *" span={4}>
            <div className="seg">
              <button type="button" className={f.especie === 'canina' ? 'ativo' : ''} onClick={() => { set('especie', 'canina'); set('raca', 'SRD'); }}><Dog size={18} /> Canino</button>
              <button type="button" className={f.especie === 'felina' ? 'ativo' : ''} onClick={() => { set('especie', 'felina'); set('raca', 'SRD'); }}><Cat size={18} /> Felino</button>
            </div>
          </Campo>
          <Campo rotulo="Nome *"><input value={f.nome} onChange={(e) => set('nome', e.target.value)} autoFocus={!existente} /></Campo>
          <Campo rotulo="Raça">
            <input list="racas" value={f.raca} onChange={(e) => set('raca', e.target.value)} />
            <datalist id="racas">{racas.map((r) => <option key={r} value={r} />)}</datalist>
          </Campo>
          <Campo rotulo="Peso (kg) *"><input inputMode="decimal" value={f.peso} onChange={(e) => set('peso', e.target.value)} placeholder="Ex.: 12,5" /></Campo>
          <Campo rotulo="Idade"><input value={f.idade} onChange={(e) => set('idade', e.target.value)} placeholder="Ex.: 3 anos" /></Campo>
          <Campo rotulo="Sexo">
            <div className="seg">
              <button type="button" className={f.sexo === 'macho' ? 'ativo' : ''} onClick={() => set('sexo', 'macho')}>Macho</button>
              <button type="button" className={f.sexo === 'femea' ? 'ativo' : ''} onClick={() => set('sexo', 'femea')}>Fêmea</button>
            </div>
          </Campo>
          <Campo rotulo="Castrado(a)">
            <div className="seg">
              <button type="button" className={f.castrado ? 'ativo' : ''} onClick={() => set('castrado', true)}>Sim</button>
              <button type="button" className={!f.castrado ? 'ativo' : ''} onClick={() => set('castrado', false)}>Não</button>
            </div>
          </Campo>
          <Campo rotulo="Pelagem"><input value={f.pelagem} onChange={(e) => set('pelagem', e.target.value)} /></Campo>
          <Campo rotulo="Microchip"><input value={f.microchip} onChange={(e) => set('microchip', e.target.value)} /></Campo>
        </div>
      </section>

      <section className="cartao">
        <h2 className="cartao-titulo">Tutor</h2>
        <div className="grade-form g4">
          <Campo rotulo="Nome do tutor *" span={2}><input value={f.tutorNome} onChange={(e) => set('tutorNome', e.target.value)} /></Campo>
          <Campo rotulo="WhatsApp / Telefone"><input inputMode="tel" value={f.tutorTel} onChange={(e) => set('tutorTel', e.target.value)} placeholder="(11) 99999-9999" /></Campo>
          <Campo rotulo="CPF"><input value={f.tutorCpf} onChange={(e) => set('tutorCpf', e.target.value)} /></Campo>
          <Campo rotulo="E-mail" span={2}><input type="email" value={f.tutorEmail} onChange={(e) => set('tutorEmail', e.target.value)} /></Campo>
          <Campo rotulo="Endereço" span={2}><input value={f.tutorEnd} onChange={(e) => set('tutorEnd', e.target.value)} /></Campo>
        </div>
      </section>

      <section className="cartao">
        <h2 className="cartao-titulo">Internação</h2>
        <div className="grade-form g4">
          <Campo rotulo="Box / leito">
            <select value={f.boxId} onChange={(e) => set('boxId', e.target.value)}>
              <option value="">— Sem box —</option>
              {db.config.alas.map((a) => (
                <optgroup key={a.id} label={a.nome}>
                  {a.boxes.map((b) => <option key={b.id} value={b.id} disabled={ocupados.has(b.id)}>{b.nome}{ocupados.has(b.id) ? ' (ocupado)' : ''}</option>)}
                </optgroup>
              ))}
            </select>
          </Campo>
          <Campo rotulo="Data/hora de entrada"><input type="datetime-local" value={f.entrada} onChange={(e) => set('entrada', e.target.value)} /></Campo>
          <Campo rotulo="Alta prevista"><input type="date" value={f.altaPrevista} onChange={(e) => set('altaPrevista', e.target.value)} /></Campo>
          <Campo rotulo="Médico-veterinário responsável">
            {nomesVeterinarios(db.config).length ? (
              <select value={f.veterinario} onChange={(e) => set('veterinario', e.target.value)}>
                {!nomesVeterinarios(db.config).includes(f.veterinario) && <option value={f.veterinario}>{f.veterinario || 'Selecione'}</option>}
                {nomesVeterinarios(db.config).map((u) => <option key={u}>{u}</option>)}
              </select>
            ) : (
              <a className="btn btn-secundario" href={NUVEM ? '#/admin' : '#/equipe'}>Cadastrar veterinários</a>
            )}
          </Campo>
          <Campo rotulo="Estado clínico" span={2}>
            <Chips<Gravidade> permitirLimpar={false} valor={f.gravidade} onChange={(v) => v && set('gravidade', v)} opcoes={[
              { v: 'estavel', r: 'Estável', tom: 'ok' }, { v: 'atencao', r: 'Atenção', tom: 'alerta' }, { v: 'critico', r: 'Crítico', tom: 'perigo' },
            ]} />
          </Campo>
          <Campo rotulo="Cuidados" span={2}>
            <div className="linha-checks">
              <label className="check"><input type="checkbox" checked={f.jejum} onChange={(e) => set('jejum', e.target.checked)} /> Jejum</label>
              <label className="check"><input type="checkbox" checked={f.isolamento} onChange={(e) => set('isolamento', e.target.checked)} /> Isolamento (infectocontagioso)</label>
            </div>
          </Campo>
          <Campo rotulo="Queixa principal / motivo da internação" span={4}>
            <textarea rows={2} value={f.queixa} onChange={(e) => set('queixa', e.target.value)} placeholder="Ex.: vômitos há 2 dias, apatia, anorexia..." />
          </Campo>
          <Campo rotulo="Anamnese / histórico" span={4}>
            <textarea rows={3} value={f.anamnese} onChange={(e) => set('anamnese', e.target.value)} placeholder="Vacinação, vermifugação, medicações em uso, doenças prévias, exames..." />
          </Campo>
          <Campo rotulo="Alergias / restrições" span={2}><input value={f.alergias} onChange={(e) => set('alergias', e.target.value)} placeholder="Ex.: alergia a dipirona" /></Campo>
          <Campo rotulo="Alertas para a equipe" span={2}><input value={f.alertas} onChange={(e) => set('alertas', e.target.value)} placeholder="Ex.: agressivo, usar focinheira; sonda esofágica" /></Campo>
        </div>
      </section>

      <section className="cartao">
        <h2 className="cartao-titulo">Diagnóstico</h2>
        <SeletorDiagnostico valor={f.diagnosticos} onChange={(v) => set('diagnosticos', v)} />
        <div className="grade-form g1 mt">
          <Campo rotulo="Observações do diagnóstico / suspeitas / exames">
            <textarea rows={2} value={f.diagnosticoObs} onChange={(e) => set('diagnosticoObs', e.target.value)} />
          </Campo>
        </div>
      </section>

      <div className="rodape-form">
        <button type="button" className="btn btn-fantasma" onClick={() => history.back()}>Cancelar</button>
        <button type="submit" className="btn btn-primario"><Save size={18} /> {existente ? 'Salvar alterações' : 'Internar e prescrever'}</button>
      </div>
    </form>
  );
}
