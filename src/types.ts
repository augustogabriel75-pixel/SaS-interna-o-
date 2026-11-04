export type Especie = 'canina' | 'felina';
export type Sexo = 'macho' | 'femea';
export type Gravidade = 'estavel' | 'atencao' | 'critico';
export type StatusInternacao = 'internado' | 'alta' | 'obito' | 'transferido';

export type UnidadeDose = 'mg/kg' | 'mcg/kg' | 'UI/kg' | 'mL/kg' | 'g/kg';
export type FormaFarmaceutica = 'mL' | 'comprimido' | 'cápsula';

export type Via = 'IV' | 'IM' | 'SC' | 'VO' | 'Tópica' | 'Oftálmica' | 'Otológica' | 'Retal' | 'Inalatória' | 'Transdérmica';

export interface Tutor {
  nome: string;
  telefone: string;
  email?: string;
  cpf?: string;
  endereco?: string;
}

export interface Prescricao {
  id: string;
  medicamentoId?: string;
  nome: string;
  classe?: string;
  dose: number;
  unidadeDose: UnidadeDose;
  /** quantidade do princípio ativo por mL / comprimido (mesma unidade do numerador da dose) */
  concentracao: number;
  forma: FormaFarmaceutica;
  via: Via;
  frequenciaHoras: number;
  inicio: string; // ISO
  duracaoDias: number; // 0 = até suspender
  diluicao?: string;
  observacoes?: string;
  ativa: boolean;
  suspensaEm?: string;
  criadaEm: string;
  prescritor?: string;
  seNecessario?: boolean;
}

export type StatusAplicacao = 'aplicado' | 'nao_aplicado';

export interface Aplicacao {
  id: string;
  prescricaoId: string;
  horario: string; // ISO do horário programado
  status: StatusAplicacao;
  realizadoEm: string;
  responsavel: string;
  obs?: string;
}

export type Alimentacao = 'comeu_tudo' | 'comeu_parcial' | 'nao_comeu' | 'forcada' | 'jejum' | 'nao_ofertado';
export type Agua = 'bebeu' | 'pouco' | 'nao_bebeu' | 'nao_ofertado';
export type Excrecao = 'normal' | 'ausente' | 'alterada';
export type Fezes = 'normal' | 'ausente' | 'pastosa' | 'diarreica' | 'sanguinolenta';
export type Consciencia = 'alerta' | 'deprimido' | 'estupor' | 'coma' | 'agitado';
export type Mucosas = 'normocoradas' | 'hipocoradas' | 'hipercoradas' | 'ictericas' | 'cianoticas' | 'congestas';

export interface Registro {
  id: string;
  dataHora: string;
  responsavel: string;
  temperatura?: number;
  fc?: number;
  fr?: number;
  pas?: number;
  glicemia?: number;
  tpc?: number;
  spo2?: number;
  peso?: number;
  dor?: number;
  mucosas?: Mucosas;
  consciencia?: Consciencia;
  hidratacao?: 'normal' | 'leve' | 'moderada' | 'grave';
  alimentacao?: Alimentacao;
  agua?: Agua;
  vomito?: boolean;
  vomitoQtd?: number;
  diarreia?: boolean;
  urina?: Excrecao;
  fezes?: Fezes;
  obs?: string;
}

export interface Fluido {
  id: string;
  solucao: string;
  taxaMlH: number;
  volumeDia: number;
  equipo: 20 | 60;
  aditivos?: string;
  inicio: string;
  ativo: boolean;
  encerradoEm?: string;
  obs?: string;
}

export interface Boletim {
  id: string;
  dataHora: string;
  texto: string;
  autor: string;
  enviado?: boolean;
}

export interface Evolucao {
  id: string;
  dataHora: string;
  autor: string;
  texto: string;
}

export interface Alta {
  data: string;
  tipo: StatusInternacao;
  condicao: string;
  orientacoes: string;
  receita: string;
  retorno?: string;
  responsavel: string;
}

export interface Paciente {
  id: string;
  nome: string;
  especie: Especie;
  raca: string;
  sexo: Sexo;
  castrado: boolean;
  idade: string;
  peso: number;
  pelagem?: string;
  microchip?: string;
  tutor: Tutor;
  boxId: string | null;
  dataEntrada: string;
  altaPrevista?: string;
  queixa: string;
  anamnese?: string;
  diagnosticos: string[];
  diagnosticoObs?: string;
  suspeitas?: string[];
  alergias?: string;
  gravidade: Gravidade;
  status: StatusInternacao;
  veterinario: string;
  jejum?: boolean;
  isolamento?: boolean;
  alertas?: string;
  prescricoes: Prescricao[];
  aplicacoes: Aplicacao[];
  registros: Registro[];
  fluidos: Fluido[];
  boletins: Boletim[];
  evolucoes: Evolucao[];
  alta?: Alta;
}

export interface Ala {
  id: string;
  nome: string;
  cor: string;
  boxes: Box[];
}

export interface Box {
  id: string;
  nome: string;
}

export interface Config {
  clinica: string;
  telefone: string;
  endereco: string;
  crmv: string;
  equipe: string[];
  alas: Ala[];
}

export interface DB {
  versao: number;
  config: Config;
  pacientes: Paciente[];
  usuarioAtual: string;
}
