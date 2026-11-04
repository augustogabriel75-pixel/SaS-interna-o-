import type { Config, Paciente, Registro } from '../types';
import { fmtData, fmtDataHora, especieRotulo, diasInternado } from './format';
import { fmtNum, REFERENCIAS } from './calc';

export interface OpcoesBoletim {
  periodoHoras: number;
  incluirMedicacoes: boolean;
  nomesMedicacoes: boolean;
  incluirParametros: boolean;
  incluirFluido: boolean;
  incluirAltaPrevista: boolean;
  estadoGeral: string;
  observacao: string;
}

export const OPCOES_PADRAO: OpcoesBoletim = {
  periodoHoras: 24,
  incluirMedicacoes: true,
  nomesMedicacoes: false,
  incluirParametros: true,
  incluirFluido: true,
  incluirAltaPrevista: true,
  estadoGeral: '',
  observacao: '',
};

const CLASSE_LEIGA: Record<string, string> = {
  'Antiemético': 'medicação para controle de náusea e vômito',
  'Protetor gástrico': 'protetor gástrico',
  'Analgésico opioide': 'controle de dor',
  'Analgésico / Antitérmico': 'analgésico/antitérmico',
  'Anti-inflamatório (AINE)': 'anti-inflamatório',
  'Corticoide': 'anti-inflamatório (corticoide)',
  'Antibiótico': 'antibioticoterapia',
  'Anticonvulsivante': 'medicação anticonvulsivante',
  'Sedativo / Anestésico': 'medicação calmante/sedativa',
  'Cardiovascular / Diurético': 'medicação de suporte cardiovascular/diurético',
  'Emergência': 'medicações de suporte',
  'Suplemento / Eletrólito': 'suplementação vitamínica/eletrolítica',
  'Endócrino': 'controle hormonal/glicêmico (insulina)',
  'Gastrointestinal': 'medicação de suporte gastrointestinal',
  'Outros': 'outras medicações de suporte',
};

const ALIM: Record<string, string> = {
  comeu_tudo: 'alimentou-se bem, por vontade própria',
  comeu_parcial: 'alimentou-se parcialmente',
  nao_comeu: 'ainda não aceitou alimento',
  forcada: 'recebeu alimentação assistida',
  jejum: 'permanece em jejum por recomendação médica',
  nao_ofertado: 'alimento ainda não foi ofertado',
};

const AGUA: Record<string, string> = {
  bebeu: 'está ingerindo água normalmente',
  pouco: 'ingeriu pouca água',
  nao_bebeu: 'não ingeriu água por conta própria (hidratação mantida pelo soro)',
  nao_ofertado: 'água ainda não foi ofertada',
};

const CONSC: Record<string, string> = {
  alerta: 'alerta e responsivo',
  deprimido: 'mais quieto(a)/prostrado(a)',
  estupor: 'bastante prostrado(a)',
  coma: 'em estado crítico, pouco responsivo(a)',
  agitado: 'agitado(a)',
};

function ultimo<T>(regs: Registro[], k: keyof Registro): T | undefined {
  for (let i = regs.length - 1; i >= 0; i--) {
    const v = regs[i][k];
    if (v !== undefined && v !== null && v !== '') return v as T;
  }
  return undefined;
}

export function gerarBoletim(p: Paciente, cfg: Config, o: OpcoesBoletim, agora = new Date()) {
  const desde = agora.getTime() - o.periodoHoras * 3600_000;
  const regs = p.registros
    .filter((r) => new Date(r.dataHora).getTime() >= desde)
    .sort((a, b) => a.dataHora.localeCompare(b.dataHora));
  const ele = p.sexo === 'macho' ? 'ele' : 'ela';
  const o_a = p.sexo === 'macho' ? 'o' : 'a';
  const linhas: string[] = [];

  linhas.push(`🏥 *BOLETIM MÉDICO — ${cfg.clinica.toUpperCase()}*`);
  linhas.push(`📅 ${fmtDataHora(agora)}`);
  linhas.push('');
  linhas.push(`🐾 *Paciente:* ${p.nome} (${especieRotulo(p.especie)}, ${p.raca}, ${fmtNum(p.peso, 2)} kg)`);
  linhas.push(`👤 *Tutor(a):* ${p.tutor.nome}`);
  const dias = diasInternado(p.dataEntrada, agora);
  linhas.push(`🛏️ *Internado(a) desde:* ${fmtData(p.dataEntrada)} (${dias + 1}º dia de internação)`);
  if (p.diagnosticos.length) linhas.push(`🩺 *Diagnóstico:* ${p.diagnosticos.join(', ')}`);
  linhas.push('');

  // Estado geral
  const est = o.estadoGeral || ({ estavel: 'estável', atencao: 'estável, porém requer atenção', critico: 'grave, sob cuidados intensivos' } as const)[p.gravidade];
  linhas.push(`*Estado geral:* ${p.nome} encontra-se ${est}.`);
  const cons = ultimo<string>(regs, 'consciencia');
  if (cons) linhas.push(`No momento está ${CONSC[cons] ?? cons}.`);
  linhas.push('');

  // Alimentação e excreções
  if (regs.length) {
    linhas.push(`*Nas últimas ${o.periodoHoras} horas:*`);
    const alim = ultimo<string>(regs, 'alimentacao');
    if (alim) linhas.push(`🍽️ Alimentação: ${ALIM[alim]}.`);
    const agua = ultimo<string>(regs, 'agua');
    if (agua) linhas.push(`💧 Água: ${AGUA[agua]}.`);
    const vomitos = regs.filter((r) => r.vomito).reduce((s, r) => s + (r.vomitoQtd || 1), 0);
    const teveRegVomito = regs.some((r) => r.vomito !== undefined);
    if (teveRegVomito) linhas.push(vomitos ? `🤢 Vômito: apresentou ${vomitos} episódio(s) de vômito.` : '✅ Vômito: não apresentou vômitos.');
    const urina = ultimo<string>(regs, 'urina');
    if (urina) linhas.push(urina === 'normal' ? '✅ Urina: urinando normalmente.' : urina === 'ausente' ? '⚠️ Urina: ainda não urinou no período (em monitoramento).' : '⚠️ Urina: com alteração, em acompanhamento.');
    const fezes = ultimo<string>(regs, 'fezes');
    if (fezes) {
      const t: Record<string, string> = {
        normal: '✅ Fezes: evacuou normalmente.',
        ausente: 'Fezes: ainda não evacuou no período.',
        pastosa: 'Fezes: evacuou fezes pastosas.',
        diarreica: '⚠️ Fezes: apresentou diarreia.',
        sanguinolenta: '⚠️ Fezes: apresentou fezes com sangue, em acompanhamento.',
      };
      linhas.push(t[fezes]);
    }
    const dor = ultimo<number>(regs, 'dor');
    if (dor !== undefined) linhas.push(dor <= 2 ? '😌 Dor: confortável, dor controlada.' : dor <= 5 ? '💊 Dor: desconforto leve a moderado, analgesia ajustada.' : '💊 Dor: apresentando dor, analgesia reforçada.');
    linhas.push('');
  }

  // Parâmetros
  if (o.incluirParametros && regs.length) {
    const temps = regs.map((r) => r.temperatura).filter((x): x is number => typeof x === 'number');
    const t = ultimo<number>(regs, 'temperatura');
    const fc = ultimo<number>(regs, 'fc');
    const fr = ultimo<number>(regs, 'fr');
    const gl = ultimo<number>(regs, 'glicemia');
    const ref = REFERENCIAS[p.especie];
    const partes: string[] = [];
    if (t !== undefined) {
      const febre = temps.some((x) => x > ref.temperatura[1]);
      partes.push(`temperatura ${fmtNum(t, 1)} °C${febre ? ' (apresentou febre no período)' : ''}`);
    }
    if (fc !== undefined) partes.push(`frequência cardíaca ${fc} bpm`);
    if (fr !== undefined) partes.push(`frequência respiratória ${fr} mpm`);
    if (gl !== undefined) partes.push(`glicemia ${gl} mg/dL`);
    if (partes.length) {
      linhas.push(`📊 *Parâmetros (última aferição):* ${partes.join(', ')}.`);
      linhas.push('');
    }
  }

  // Tratamento
  const ativas = p.prescricoes.filter((x) => x.ativa);
  const fluidos = p.fluidos.filter((x) => x.ativo);
  if ((o.incluirMedicacoes && ativas.length) || (o.incluirFluido && fluidos.length)) {
    linhas.push('*Tratamento em andamento:*');
    if (o.incluirFluido && fluidos.length) linhas.push(`• Fluidoterapia (soro na veia) para manter a hidratação${fluidos[0].aditivos ? ' com suplementação' : ''}.`);
    if (o.incluirMedicacoes && ativas.length) {
      if (o.nomesMedicacoes) {
        ativas.forEach((m) => linhas.push(`• ${m.nome} (${m.via})`));
      } else {
        const classes = Array.from(new Set(ativas.map((m) => CLASSE_LEIGA[m.classe ?? 'Outros'] ?? 'medicação de suporte')));
        classes.forEach((c) => linhas.push(`• ${c.charAt(0).toUpperCase() + c.slice(1)}`));
      }
    }
    linhas.push('');
  }

  if (o.observacao.trim()) {
    linhas.push(`📝 *Observações do médico-veterinário:*`);
    linhas.push(o.observacao.trim());
    linhas.push('');
  }

  if (o.incluirAltaPrevista && p.altaPrevista) {
    linhas.push(`🗓️ *Previsão de alta:* ${fmtData(p.altaPrevista)} (sujeita à evolução clínica).`);
    linhas.push('');
  }

  linhas.push(`Seguimos acompanhando ${o_a} ${p.nome} de perto e informaremos qualquer mudança. Estamos à disposição para dúvidas. ${ele === 'ele' ? '💙' : '💜'}`);
  linhas.push('');
  linhas.push(`_${p.veterinario}${cfg.crmv ? ' — ' + cfg.crmv : ''}_`);
  linhas.push(`_${cfg.clinica}${cfg.telefone ? ' • ' + cfg.telefone : ''}_`);
  return linhas.join('\n');
}

/** Remove a marcação do WhatsApp (*negrito* / _itálico_) para impressão */
export function textoLimpo(t: string) {
  return t.replace(/\*([^*\n]+)\*/g, '$1').replace(/_([^_\n]+)_/g, '$1');
}
