import type { Especie, Paciente, Prescricao, UnidadeDose } from '../types';

/** Quantidade total do ativo (na mesma unidade do numerador da dose) */
export function doseTotal(dose: number, peso: number) {
  return dose * peso;
}

/** Volume em mL ou nº de comprimidos */
export function quantidadeAdministrar(p: Pick<Prescricao, 'dose' | 'unidadeDose' | 'concentracao'>, peso: number) {
  if (p.unidadeDose === 'mL/kg') return p.dose * peso;
  if (!p.concentracao) return 0;
  return (p.dose * peso) / p.concentracao;
}

export function unidadeAtivo(u: UnidadeDose) {
  return u.split('/')[0];
}

export function arred(n: number, casas = 2) {
  if (!isFinite(n)) return 0;
  const f = Math.pow(10, casas);
  return Math.round(n * f) / f;
}

export function fmtNum(n: number, casas = 2) {
  return arred(n, casas).toLocaleString('pt-BR', { maximumFractionDigits: casas });
}

export function textoQuantidade(p: Prescricao, peso: number) {
  const q = quantidadeAdministrar(p, peso);
  if (p.forma === 'mL') return `${fmtNum(q, 2)} mL`;
  const fr = fracaoComprimido(q);
  return `${fr} ${p.forma}${q > 1 ? 's' : ''}`;
}

/** Arredonda para ¼ de comprimido e mostra fração */
export function fracaoComprimido(q: number) {
  const quartos = Math.round(q * 4);
  const inteiro = Math.floor(quartos / 4);
  const resto = quartos % 4;
  const fr = ['', '¼', '½', '¾'][resto];
  if (quartos === 0) return `${fmtNum(q, 2)} (< ¼)`;
  return inteiro ? `${inteiro}${fr ? ' ' + fr : ''}` : fr;
}

/** Horários programados de uma prescrição dentro do intervalo [de, ate] */
export function horariosPrescricao(p: Prescricao, de: Date, ate: Date): Date[] {
  if (p.seNecessario) return [];
  const inicio = new Date(p.inicio).getTime();
  const passo = p.frequenciaHoras * 3600_000;
  if (passo <= 0) return [];
  let fim = ate.getTime();
  if (p.duracaoDias > 0) fim = Math.min(fim, inicio + p.duracaoDias * 86400_000 - 1);
  if (!p.ativa && p.suspensaEm) fim = Math.min(fim, new Date(p.suspensaEm).getTime());
  const out: Date[] = [];
  let k = Math.max(0, Math.ceil((de.getTime() - inicio) / passo));
  for (let t = inicio + k * passo; t <= fim; t = inicio + ++k * passo) {
    out.push(new Date(t));
    if (out.length > 500) break;
  }
  return out;
}

export interface DoseAgendada {
  paciente: Paciente;
  prescricao: Prescricao;
  horario: Date;
  status: 'aplicado' | 'nao_aplicado' | 'atrasado' | 'pendente';
  aplicacaoId?: string;
}

export const TOLERANCIA_MIN = 30;

export function statusDose(pac: Paciente, pr: Prescricao, h: Date, agora = new Date()): DoseAgendada {
  const iso = h.toISOString();
  const ap = pac.aplicacoes.find((a) => a.prescricaoId === pr.id && a.horario === iso);
  let status: DoseAgendada['status'] = 'pendente';
  if (ap) status = ap.status;
  else if (agora.getTime() - h.getTime() > TOLERANCIA_MIN * 60_000) status = 'atrasado';
  return { paciente: pac, prescricao: pr, horario: h, status, aplicacaoId: ap?.id };
}

export function dosesPaciente(pac: Paciente, de: Date, ate: Date, agora = new Date()) {
  const out: DoseAgendada[] = [];
  for (const pr of pac.prescricoes) {
    for (const h of horariosPrescricao(pr, de, ate)) out.push(statusDose(pac, pr, h, agora));
  }
  return out.sort((a, b) => a.horario.getTime() - b.horario.getTime());
}

// ───────────── Fluidoterapia

export type MetodoManutencao = 'aaha' | 'fixo';

export function manutencaoDiaria(peso: number, especie: Especie, metodo: MetodoManutencao, mlKgDia = 50) {
  if (metodo === 'aaha') {
    // AAHA 2013/2024: cães 132 × kg^0,75 ; gatos 80 × kg^0,75 (mL/dia)
    return (especie === 'canina' ? 132 : 80) * Math.pow(peso, 0.75);
  }
  return peso * mlKgDia;
}

export interface ResultadoFluido {
  manutencao: number;
  deficit: number;
  perdas: number;
  total24h: number;
  taxaReposicaoMlH: number;
  taxaManutMlH: number;
  taxaInicialMlH: number;
  taxaMediaMlH: number;
}

export function calcularFluido(o: {
  peso: number;
  especie: Especie;
  metodo: MetodoManutencao;
  mlKgDia: number;
  desidratacao: number; // %
  horasReposicao: number;
  perdas: number; // mL/dia
}): ResultadoFluido {
  const manutencao = manutencaoDiaria(o.peso, o.especie, o.metodo, o.mlKgDia);
  const deficit = o.peso * (o.desidratacao / 100) * 1000;
  const perdas = o.perdas;
  const horas = Math.max(1, Math.min(24, o.horasReposicao || 24));
  const taxaManutMlH = (manutencao + perdas) / 24;
  const taxaReposicaoMlH = deficit / horas;
  const taxaInicialMlH = taxaManutMlH + taxaReposicaoMlH;
  const total24h = manutencao + deficit + perdas;
  return {
    manutencao, deficit, perdas, total24h, taxaReposicaoMlH, taxaManutMlH, taxaInicialMlH,
    taxaMediaMlH: total24h / 24,
  };
}

export function gotasMin(mlH: number, equipo: number) {
  return (mlH * equipo) / 60;
}

export function segundosPorGota(mlH: number, equipo: number) {
  const g = gotasMin(mlH, equipo);
  return g > 0 ? 60 / g : 0;
}

/** Tabela de suplementação de potássio (escala de Scott modificada) */
export const TABELA_KCL = [
  { faixa: '< 2,0', max: 2.0, meqL: 80 },
  { faixa: '2,1 – 2,5', max: 2.5, meqL: 60 },
  { faixa: '2,6 – 3,0', max: 3.0, meqL: 40 },
  { faixa: '3,1 – 3,5', max: 3.5, meqL: 28 },
  { faixa: '3,6 – 5,0', max: 5.0, meqL: 20 },
];

export const KCL_MEQ_ML = 2.56; // KCl 19,1%

export function kclPorFrasco(potassioSerico: number, volumeFrasco: number) {
  const linha = TABELA_KCL.find((l) => potassioSerico <= l.max) ?? TABELA_KCL[TABELA_KCL.length - 1];
  const meq = (linha.meqL * volumeFrasco) / 1000;
  return { linha, meq, ml: meq / KCL_MEQ_ML };
}

export function taxaMaxKMlH(peso: number, meqL: number) {
  // limite 0,5 mEq/kg/h
  return meqL > 0 ? (0.5 * peso * 1000) / meqL : Infinity;
}

// ───────────── Infusão contínua (CRI)

export type UnidadeCRI = 'mcg/kg/min' | 'mcg/kg/h' | 'mg/kg/h' | 'mg/kg/dia' | 'UI/kg/h';

export function calcularCRI(o: {
  dose: number;
  unidade: UnidadeCRI;
  peso: number;
  concentracao: number; // mg/mL (ou UI/mL)
  taxaMlH: number;
  volume: number;
}) {
  let mgH = 0;
  switch (o.unidade) {
    case 'mcg/kg/min': mgH = (o.dose * o.peso * 60) / 1000; break;
    case 'mcg/kg/h': mgH = (o.dose * o.peso) / 1000; break;
    case 'mg/kg/h': mgH = o.dose * o.peso; break;
    case 'mg/kg/dia': mgH = (o.dose * o.peso) / 24; break;
    case 'UI/kg/h': mgH = o.dose * o.peso; break;
  }
  const horasDuracao = o.taxaMlH > 0 ? o.volume / o.taxaMlH : 0;
  const mgTotal = mgH * horasDuracao;
  const mlFarmaco = o.concentracao > 0 ? mgTotal / o.concentracao : 0;
  return { mgH, horasDuracao, mgTotal, mlFarmaco, concentracaoFinal: o.volume > 0 ? mgTotal / o.volume : 0 };
}

// ───────────── Parâmetros de referência

export const REFERENCIAS: Record<Especie, Record<string, [number, number]>> = {
  canina: { temperatura: [37.5, 39.2], fc: [60, 160], fr: [10, 30], pas: [90, 140], glicemia: [70, 120], tpc: [0, 2], spo2: [95, 100] },
  felina: { temperatura: [37.8, 39.2], fc: [140, 220], fr: [20, 40], pas: [90, 140], glicemia: [70, 150], tpc: [0, 2], spo2: [95, 100] },
};

export function foraDaFaixa(especie: Especie, campo: string, v?: number) {
  if (v === undefined || v === null || isNaN(v)) return false;
  const r = REFERENCIAS[especie][campo];
  if (!r) return false;
  return v < r[0] || v > r[1];
}
