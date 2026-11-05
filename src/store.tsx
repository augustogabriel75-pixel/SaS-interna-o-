import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Config, DB, Paciente, Prescricao, Profissional } from './types';
import { uid } from './utils/format';
import { buscarMedicamento } from './data/medicamentos';

const CHAVE = 'vetinterna:db:v1';

/** Nome usado nos registros dos pacientes de demonstração */
const EXEMPLO = 'Equipe (exemplo)';
const NOMES_TEMPORARIOS = ['Dra. Ana Souza', 'Dr. Carlos Lima', 'Enf. Juliana Reis', 'Aux. Pedro Santos'];

function boxes(prefixo: string, n: number) {
  return Array.from({ length: n }, (_, i) => ({ id: `${prefixo}${i + 1}`, nome: `${prefixo}${String(i + 1).padStart(2, '0')}` }));
}

export const CONFIG_PADRAO: Config = {
  clinica: 'VetClin Clínica Veterinária',
  telefone: '(63) 9114-0858',
  endereco: 'Porto Nacional – TO',
  crmv: '',
  equipe: [],
  alas: [
    { id: 'caes', nome: 'Internação Cães', cor: '#0ea5e9', boxes: boxes('C', 8) },
    { id: 'gatos', nome: 'Internação Gatos', cor: '#a855f7', boxes: boxes('G', 6) },
    { id: 'uti', nome: 'UTI / Semi-intensiva', cor: '#ef4444', boxes: boxes('U', 3) },
    { id: 'iso', nome: 'Isolamento (infecciosas)', cor: '#f59e0b', boxes: boxes('I', 3) },
  ],
};

function horaCheia(offsetH: number) {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + offsetH);
  return d.toISOString();
}

function rx(medId: string, _peso: number, especie: 'canina' | 'felina', inicioOffsetH: number, extra: Partial<Prescricao> = {}): Prescricao {
  const m = buscarMedicamento(medId)!;
  const faixa = (especie === 'canina' ? m.canina : m.felina)!;
  const ap = m.apresentacoes[0];
  return {
    id: uid(),
    medicamentoId: m.id,
    nome: m.nome,
    classe: m.classe,
    dose: faixa.padrao,
    unidadeDose: m.unidade,
    concentracao: ap.valor,
    forma: ap.forma,
    via: m.vias[0],
    frequenciaHoras: faixa.freq,
    inicio: horaCheia(inicioOffsetH),
    duracaoDias: 5,
    ativa: true,
    criadaEm: horaCheia(inicioOffsetH),
    prescritor: EXEMPLO,
    ...extra,
  };
}

function demo(): Paciente[] {
  const base = (o: Partial<Paciente>): Paciente => ({
    id: uid(), nome: '', especie: 'canina', raca: 'SRD', sexo: 'macho', castrado: false, idade: '', peso: 10,
    tutor: { nome: '', telefone: '' }, boxId: null, dataEntrada: horaCheia(-24), queixa: '', diagnosticos: [],
    gravidade: 'estavel', status: 'internado', veterinario: EXEMPLO,
    prescricoes: [], aplicacoes: [], registros: [], fluidos: [], boletins: [], evolucoes: [], ...o,
  });

  const thor = base({
    nome: 'Thor', especie: 'canina', raca: 'Golden Retriever', sexo: 'macho', castrado: true, idade: '6 anos', peso: 32.4,
    tutor: { nome: 'Mariana Alves', telefone: '(11) 98888-1111', email: 'mariana@email.com' }, boxId: 'C1',
    dataEntrada: horaCheia(-30), queixa: 'Vômitos repetidos e prostração há 2 dias, dor abdominal.',
    diagnosticos: ['Pancreatite aguda'], gravidade: 'atencao', altaPrevista: horaCheia(48),
  });
  thor.prescricoes = [
    rx('maropitant', thor.peso, 'canina', -26),
    rx('omeprazol', thor.peso, 'canina', -26),
    rx('metadona', thor.peso, 'canina', -26),
    rx('dipirona', thor.peso, 'canina', -26),
    rx('ampicilina', thor.peso, 'canina', -26, { via: 'IV' }),
  ];
  thor.fluidos = [{ id: uid(), solucao: 'Ringer com lactato', taxaMlH: 95, volumeDia: 2280, equipo: 20, inicio: horaCheia(-28), ativo: true, aditivos: 'KCl 20 mEq/L' }];

  const luna = base({
    nome: 'Luna', especie: 'felina', raca: 'SRD', sexo: 'femea', castrado: true, idade: '4 anos', peso: 4.2,
    tutor: { nome: 'Rafael Costa', telefone: '(11) 97777-2222' }, boxId: 'G2',
    dataEntrada: horaCheia(-50), queixa: 'Anorexia há 4 dias, apatia, icterícia.',
    diagnosticos: ['Lipidose hepática felina'], gravidade: 'critico', altaPrevista: horaCheia(96), alertas: 'Sonda esofágica — alimentação a cada 4 h',
  });
  luna.prescricoes = [
    rx('ondansetrona', luna.peso, 'felina', -48),
    rx('buprenorfina', luna.peso, 'felina', -48),
    rx('mirtazapina', luna.peso, 'felina', -48, { duracaoDias: 7 }),
    rx('ursodiol', luna.peso, 'felina', -46, { duracaoDias: 0 }),
  ];
  luna.fluidos = [{ id: uid(), solucao: 'NaCl 0,9% (soro fisiológico)', taxaMlH: 12, volumeDia: 288, equipo: 60, inicio: horaCheia(-50), ativo: true, aditivos: 'KCl 28 mEq/L + Complexo B' }];

  const mel = base({
    nome: 'Mel', especie: 'canina', raca: 'SRD', sexo: 'femea', idade: '4 meses', peso: 5.8,
    tutor: { nome: 'João Pereira', telefone: '(11) 96666-3333' }, boxId: 'I1', isolamento: true,
    dataEntrada: horaCheia(-12), queixa: 'Diarreia sanguinolenta, vômitos, sem vacinação completa.',
    diagnosticos: ['Parvovirose'], gravidade: 'critico', altaPrevista: horaCheia(120),
  });
  mel.prescricoes = [
    rx('maropitant', mel.peso, 'canina', -11),
    rx('ondansetrona', mel.peso, 'canina', -11),
    rx('ampicilina', mel.peso, 'canina', -11, { via: 'IV' }),
    rx('metronidazol', mel.peso, 'canina', -11, { via: 'IV', dose: 10 }),
    rx('omeprazol', mel.peso, 'canina', -11),
  ];
  mel.fluidos = [{ id: uid(), solucao: 'Ringer com lactato', taxaMlH: 30, volumeDia: 720, equipo: 60, inicio: horaCheia(-12), ativo: true, aditivos: 'Glicose 2,5% + KCl 20 mEq/L' }];

  const pipoca = base({
    nome: 'Pipoca', especie: 'canina', raca: 'Shih-tzu', sexo: 'femea', castrado: true, idade: '9 anos', peso: 6.1,
    tutor: { nome: 'Cláudia Ramos', telefone: '(11) 95555-4444' }, boxId: 'C3',
    dataEntrada: horaCheia(-20), queixa: 'Secreção vaginal purulenta, poliúria/polidipsia. OVH terapêutica realizada.',
    diagnosticos: ['Piometra', 'Pós-operatório de OVH'], gravidade: 'estavel', altaPrevista: horaCheia(20), veterinario: EXEMPLO,
  });
  pipoca.prescricoes = [
    rx('cefalotina', pipoca.peso, 'canina', -18),
    rx('meloxicam', pipoca.peso, 'canina', -18, { duracaoDias: 3 }),
    rx('tramadol', pipoca.peso, 'canina', -18),
    rx('dipirona', pipoca.peso, 'canina', -18),
  ];

  // aplicações já feitas (até 1 h atrás)
  const agora = Date.now();
  for (const p of [thor, luna, mel, pipoca]) {
    for (const pr of p.prescricoes) {
      const ini = new Date(pr.inicio).getTime();
      for (let t = ini; t < agora - 3600_000; t += pr.frequenciaHoras * 3600_000) {
        p.aplicacoes.push({ id: uid(), prescricaoId: pr.id, horario: new Date(t).toISOString(), status: 'aplicado', realizadoEm: new Date(t + 5 * 60_000).toISOString(), responsavel: EXEMPLO });
      }
    }
  }

  thor.registros = [
    { id: uid(), dataHora: horaCheia(-20), responsavel: EXEMPLO, temperatura: 39.6, fc: 120, fr: 32, dor: 5, mucosas: 'normocoradas', consciencia: 'deprimido', alimentacao: 'jejum', agua: 'pouco', vomito: true, vomitoQtd: 2, urina: 'normal', fezes: 'ausente', tpc: 2 },
    { id: uid(), dataHora: horaCheia(-8), responsavel: EXEMPLO, temperatura: 39.0, fc: 104, fr: 26, dor: 3, mucosas: 'normocoradas', consciencia: 'alerta', alimentacao: 'nao_ofertado', agua: 'bebeu', vomito: false, urina: 'normal', fezes: 'ausente', tpc: 2 },
    { id: uid(), dataHora: horaCheia(-2), responsavel: EXEMPLO, temperatura: 38.6, fc: 96, fr: 24, dor: 2, mucosas: 'normocoradas', consciencia: 'alerta', alimentacao: 'comeu_parcial', agua: 'bebeu', vomito: false, urina: 'normal', fezes: 'pastosa', tpc: 1, obs: 'Aceitou dieta gastrointestinal pastosa em pequena quantidade.' },
  ];
  luna.registros = [
    { id: uid(), dataHora: horaCheia(-6), responsavel: EXEMPLO, temperatura: 37.6, fc: 190, fr: 36, dor: 2, mucosas: 'ictericas', consciencia: 'deprimido', alimentacao: 'forcada', agua: 'nao_bebeu', vomito: false, urina: 'normal', fezes: 'ausente', glicemia: 110 },
  ];
  mel.registros = [
    { id: uid(), dataHora: horaCheia(-4), responsavel: EXEMPLO, temperatura: 39.8, fc: 170, fr: 34, dor: 4, mucosas: 'hipocoradas', consciencia: 'deprimido', alimentacao: 'nao_comeu', agua: 'nao_bebeu', vomito: true, vomitoQtd: 1, diarreia: true, urina: 'normal', fezes: 'sanguinolenta', glicemia: 68, hidratacao: 'moderada' },
  ];
  pipoca.registros = [
    { id: uid(), dataHora: horaCheia(-3), responsavel: EXEMPLO, temperatura: 38.4, fc: 110, fr: 22, dor: 1, mucosas: 'normocoradas', consciencia: 'alerta', alimentacao: 'comeu_tudo', agua: 'bebeu', vomito: false, urina: 'normal', fezes: 'normal', obs: 'Ferida cirúrgica limpa, sem secreção.' },
  ];
  thor.evolucoes = [{ id: uid(), dataHora: horaCheia(-8), autor: EXEMPLO, texto: 'Paciente mais ativo, cessaram os vômitos. Lipase ainda elevada. Iniciar realimentação gradual com dieta low-fat.' }];
  return [thor, luna, mel, pipoca];
}

function novoDB(comDemo = true): DB {
  return { versao: 2, config: structuredClone(CONFIG_PADRAO), pacientes: comDemo ? demo() : [], usuarioAtual: '' };
}

/** Atualiza dados salvos por versões anteriores */
export function migrar(db: DB): DB {
  if ((db.versao ?? 1) < 2) {
    const antigos = (db.config.equipe as unknown[]) ?? [];
    db.config.equipe = antigos
      .map((e) => (typeof e === 'string' ? e : (e as Profissional).nome))
      .filter((n) => n && !NOMES_TEMPORARIOS.includes(n))
      .map((nome) => ({ id: uid(), nome, funcao: 'veterinario' as const, ativo: true }));
    const trocar = (n: string) => (NOMES_TEMPORARIOS.includes(n) ? EXEMPLO : n);
    for (const p of db.pacientes) {
      p.veterinario = trocar(p.veterinario);
      p.prescricoes.forEach((r) => { if (r.prescritor) r.prescritor = trocar(r.prescritor); });
      p.aplicacoes.forEach((a) => { a.responsavel = trocar(a.responsavel); });
      p.registros.forEach((r) => { r.responsavel = trocar(r.responsavel); });
      p.evolucoes.forEach((e) => { e.autor = trocar(e.autor); });
      p.boletins.forEach((b) => { b.autor = trocar(b.autor); });
    }
    if (db.config.clinica === 'Hospital Veterinário VetInterna') db.config.clinica = CONFIG_PADRAO.clinica;
    if (db.config.telefone === '(11) 99999-0000') db.config.telefone = CONFIG_PADRAO.telefone;
    if (db.config.endereco === 'Rua das Clínicas, 100 — Centro') db.config.endereco = CONFIG_PADRAO.endereco;
    if (db.config.crmv === 'CRMV-SP 00000') db.config.crmv = '';
    if (NOMES_TEMPORARIOS.includes(db.usuarioAtual)) db.usuarioAtual = '';
    db.versao = 2;
  }
  if (db.usuarioAtual && !db.config.equipe.some((e) => e.nome === db.usuarioAtual && e.ativo)) db.usuarioAtual = '';
  if (!db.usuarioAtual) db.usuarioAtual = db.config.equipe.find((e) => e.ativo)?.nome ?? '';
  return db;
}

function carregar(): DB {
  try {
    const raw = localStorage.getItem(CHAVE);
    if (raw) {
      const db = JSON.parse(raw) as DB;
      if (db && db.config && Array.isArray(db.pacientes)) return migrar(db);
    }
  } catch {
    /* armazenamento indisponível */
  }
  return novoDB(true);
}

interface Ctx {
  db: DB;
  atualizar: (fn: (d: DB) => void) => void;
  atualizarPaciente: (id: string, fn: (p: Paciente) => void) => void;
  paciente: (id: string) => Paciente | undefined;
  resetar: (comDemo: boolean) => void;
  importar: (db: DB) => void;
  agora: Date;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(carregar);
  const [agora, setAgora] = useState(new Date());

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(db));
    } catch {
      /* ignore */
    }
  }, [db]);

  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const atualizar = useCallback((fn: (d: DB) => void) => {
    setDb((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }, []);

  const atualizarPaciente = useCallback(
    (id: string, fn: (p: Paciente) => void) =>
      atualizar((d) => {
        const p = d.pacientes.find((x) => x.id === id);
        if (p) fn(p);
      }),
    [atualizar],
  );

  const value = useMemo<Ctx>(
    () => ({
      db,
      atualizar,
      atualizarPaciente,
      paciente: (id) => db.pacientes.find((p) => p.id === id),
      resetar: (comDemo) => setDb(novoDB(comDemo)),
      importar: (d) => setDb(migrar(d)),
      agora,
    }),
    [db, atualizar, atualizarPaciente, agora],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('StoreProvider ausente');
  return c;
}

export function todosBoxes(cfg: Config) {
  return cfg.alas.flatMap((a) => a.boxes.map((b) => ({ ...b, ala: a })));
}

export function nomeBox(cfg: Config, id: string | null) {
  if (!id) return '—';
  for (const a of cfg.alas) {
    const b = a.boxes.find((x) => x.id === id);
    if (b) return `${b.nome} · ${a.nome}`;
  }
  return id;
}

export const FUNCOES: Record<Profissional['funcao'], string> = {
  veterinario: 'Médico(a)-veterinário(a)',
  enfermeiro: 'Enfermeiro(a) / Técnico(a)',
  auxiliar: 'Auxiliar veterinário(a)',
  estagiario: 'Estagiário(a)',
  recepcao: 'Recepção',
  outro: 'Outro',
};

/** Nomes dos profissionais ativos (para selects de responsável) */
export function nomesEquipe(cfg: Config) {
  return cfg.equipe.filter((e) => e.ativo).map((e) => e.nome);
}

/** Veterinários ativos; se não houver, toda a equipe ativa */
export function nomesVeterinarios(cfg: Config) {
  const v = cfg.equipe.filter((e) => e.ativo && e.funcao === 'veterinario').map((e) => e.nome);
  return v.length ? v : nomesEquipe(cfg);
}

/** Assinatura: nome + CRMV do profissional (ou do responsável técnico da clínica) */
export function assinatura(cfg: Config, nome: string) {
  const crmv = cfg.equipe.find((e) => e.nome === nome)?.crmv || cfg.crmv;
  return crmv ? `${nome} — ${crmv}` : nome;
}
