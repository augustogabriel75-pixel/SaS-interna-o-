import type { FormaFarmaceutica, UnidadeDose, Via } from '../types';

export interface FaixaDose {
  min: number;
  max: number;
  padrao: number;
  freq: number; // horas
}

export interface Apresentacao {
  rotulo: string;
  valor: number; // quantidade do ativo por mL / comprimido
  forma: FormaFarmaceutica;
}

export interface Medicamento {
  id: string;
  nome: string;
  comerciais: string;
  classe: Classe;
  unidade: UnidadeDose;
  apresentacoes: Apresentacao[];
  vias: Via[];
  canina: FaixaDose | null;
  felina: FaixaDose | null;
  obs?: string;
  alertaFelino?: string;
}

export type Classe =
  | 'Antiemético'
  | 'Protetor gástrico'
  | 'Analgésico opioide'
  | 'Analgésico / Antitérmico'
  | 'Anti-inflamatório (AINE)'
  | 'Corticoide'
  | 'Antibiótico'
  | 'Anticonvulsivante'
  | 'Sedativo / Anestésico'
  | 'Cardiovascular / Diurético'
  | 'Emergência'
  | 'Suplemento / Eletrólito'
  | 'Endócrino'
  | 'Gastrointestinal'
  | 'Outros';

export const CLASSES: Classe[] = [
  'Antiemético',
  'Protetor gástrico',
  'Analgésico opioide',
  'Analgésico / Antitérmico',
  'Anti-inflamatório (AINE)',
  'Corticoide',
  'Antibiótico',
  'Anticonvulsivante',
  'Sedativo / Anestésico',
  'Cardiovascular / Diurético',
  'Emergência',
  'Suplemento / Eletrólito',
  'Endócrino',
  'Gastrointestinal',
  'Outros',
];

const ml = (rotulo: string, valor: number): Apresentacao => ({ rotulo, valor, forma: 'mL' });
const cp = (rotulo: string, valor: number): Apresentacao => ({ rotulo, valor, forma: 'comprimido' });
const f = (min: number, max: number, padrao: number, freq: number): FaixaDose => ({ min, max, padrao, freq });

/**
 * Doses de referência compiladas de literatura veterinária usual (formulários e bulas).
 * São apenas sugestões iniciais: a prescrição final é sempre responsabilidade do médico-veterinário.
 */
export const MEDICAMENTOS: Medicamento[] = [
  // ───────── Antieméticos
  { id: 'maropitant', nome: 'Maropitant', comerciais: 'Cerenia®, Prevomax®', classe: 'Antiemético', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 10 mg/mL', 10), cp('Comprimido 16 mg', 16), cp('Comprimido 24 mg', 24), cp('Comprimido 60 mg', 60)],
    vias: ['SC', 'IV', 'VO'], canina: f(1, 2, 1, 24), felina: f(1, 1, 1, 24),
    obs: 'Injetável: 1 mg/kg SID por até 5 dias. VO (cães): 2 mg/kg SID. IV lento. Pode arder na aplicação SC (refrigerar ajuda).' },
  { id: 'ondansetrona', nome: 'Ondansetrona', comerciais: 'Zofran®, Vonau®', classe: 'Antiemético', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 2 mg/mL', 2), cp('Comprimido 4 mg', 4), cp('Comprimido 8 mg', 8)],
    vias: ['IV', 'IM', 'SC', 'VO'], canina: f(0.1, 1, 0.5, 8), felina: f(0.1, 1, 0.5, 8),
    obs: 'IV lento. Pode ser usado a cada 8–12 h.' },
  { id: 'metoclopramida', nome: 'Metoclopramida', comerciais: 'Plasil®', classe: 'Antiemético', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 5 mg/mL', 5), cp('Comprimido 10 mg', 10)],
    vias: ['IV', 'IM', 'SC', 'VO'], canina: f(0.2, 0.5, 0.3, 8), felina: f(0.2, 0.5, 0.3, 8),
    obs: 'Contraindicado em obstrução GI. Pode ser usado em infusão contínua (1–2 mg/kg/dia).' },
  { id: 'bromoprida', nome: 'Bromoprida', comerciais: 'Digesan®', classe: 'Antiemético', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 5 mg/mL', 5), ml('Gotas 4 mg/mL', 4)],
    vias: ['IV', 'IM', 'SC', 'VO'], canina: f(0.5, 1, 0.5, 8), felina: f(0.5, 1, 0.5, 12),
    obs: 'Procinético. Contraindicado em obstrução GI.' },

  // ───────── Protetores gástricos
  { id: 'omeprazol', nome: 'Omeprazol', comerciais: 'Losec®, Gaviz®', classe: 'Protetor gástrico', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 4 mg/mL (40 mg/10 mL)', 4), cp('Cápsula 10 mg', 10), cp('Cápsula 20 mg', 20)],
    vias: ['IV', 'VO'], canina: f(0.7, 1, 1, 12), felina: f(0.7, 1, 1, 12),
    obs: 'IV lento. VO em jejum, 30 min antes da alimentação.' },
  { id: 'pantoprazol', nome: 'Pantoprazol', comerciais: 'Pantozol®', classe: 'Protetor gástrico', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 4 mg/mL (40 mg/10 mL)', 4), cp('Comprimido 20 mg', 20)],
    vias: ['IV', 'VO'], canina: f(0.7, 1, 1, 12), felina: f(0.7, 1, 1, 12) },
  { id: 'ranitidina', nome: 'Ranitidina', comerciais: 'Antak®, Label®', classe: 'Protetor gástrico', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 25 mg/mL', 25), ml('Xarope 15 mg/mL', 15)],
    vias: ['IV', 'SC', 'IM', 'VO'], canina: f(1, 2, 2, 12), felina: f(1, 2.5, 2, 12),
    obs: 'Também tem efeito procinético leve.' },
  { id: 'sucralfato', nome: 'Sucralfato', comerciais: 'Sucrafilm®', classe: 'Protetor gástrico', unidade: 'mg/kg',
    apresentacoes: [ml('Suspensão 200 mg/mL', 200)],
    vias: ['VO'], canina: f(20, 40, 25, 8), felina: f(20, 40, 25, 8),
    obs: 'Administrar separado (2 h) de outros fármacos orais.' },

  // ───────── Opioides
  { id: 'metadona', nome: 'Metadona', comerciais: 'Mytedom®', classe: 'Analgésico opioide', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 10 mg/mL', 10)],
    vias: ['IM', 'IV', 'SC'], canina: f(0.1, 0.5, 0.3, 6), felina: f(0.1, 0.3, 0.2, 6),
    obs: 'Controlado (Portaria 344). Intervalo de 4–6 h.' },
  { id: 'morfina', nome: 'Morfina', comerciais: 'Dimorf®', classe: 'Analgésico opioide', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 10 mg/mL', 10), ml('Injetável 1 mg/mL', 1)],
    vias: ['IM', 'SC', 'IV'], canina: f(0.2, 0.5, 0.3, 4), felina: f(0.1, 0.2, 0.1, 6),
    obs: 'IV apenas muito lento (liberação de histamina). Pode causar vômito.' },
  { id: 'tramadol', nome: 'Tramadol', comerciais: 'Tramal®, Cronidor®', classe: 'Analgésico opioide', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 50 mg/mL', 50), cp('Comprimido 50 mg', 50), cp('Comprimido 12 mg (vet)', 12)],
    vias: ['IV', 'IM', 'SC', 'VO'], canina: f(2, 5, 3, 8), felina: f(1, 2, 2, 12) },
  { id: 'butorfanol', nome: 'Butorfanol', comerciais: 'Torbugesic®', classe: 'Analgésico opioide', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 10 mg/mL', 10)],
    vias: ['IV', 'IM', 'SC'], canina: f(0.1, 0.4, 0.2, 4), felina: f(0.1, 0.4, 0.2, 4),
    obs: 'Analgesia de curta duração; bom sedativo e antitussígeno.' },
  { id: 'buprenorfina', nome: 'Buprenorfina', comerciais: 'Temgesic®', classe: 'Analgésico opioide', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 0,3 mg/mL', 0.3)],
    vias: ['IV', 'IM', 'SC'], canina: f(0.01, 0.02, 0.02, 8), felina: f(0.01, 0.03, 0.02, 8),
    obs: 'Em gatos pode ser usada via transmucosa oral.' },
  { id: 'fentanil', nome: 'Fentanil', comerciais: 'Fentanest®', classe: 'Analgésico opioide', unidade: 'mcg/kg',
    apresentacoes: [ml('Injetável 50 mcg/mL', 50)],
    vias: ['IV'], canina: f(2, 5, 3, 1), felina: f(1, 3, 2, 1),
    obs: 'Bolus. Infusão contínua: 2–10 mcg/kg/h (use a calculadora de CRI).' },

  // ───────── Analgésicos / Antitérmicos
  { id: 'dipirona', nome: 'Dipirona', comerciais: 'Novalgina®, D-500®', classe: 'Analgésico / Antitérmico', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 500 mg/mL', 500), ml('Gotas 500 mg/mL', 500), cp('Comprimido 500 mg', 500)],
    vias: ['IV', 'IM', 'SC', 'VO'], canina: f(25, 25, 25, 8), felina: f(12.5, 25, 25, 24),
    obs: 'Analgésico e antitérmico. IV lento.', alertaFelino: 'Gatos: usar com cautela, preferir intervalo de 24 h.' },
  { id: 'paracetamol', nome: 'Paracetamol', comerciais: 'Tylenol®', classe: 'Analgésico / Antitérmico', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 10 mg/mL', 10), cp('Comprimido 500 mg', 500)],
    vias: ['IV', 'VO'], canina: f(10, 15, 10, 8), felina: null,
    alertaFelino: 'CONTRAINDICADO EM GATOS — tóxico (metemoglobinemia).' },
  { id: 'gabapentina', nome: 'Gabapentina', comerciais: 'Neurontin®', classe: 'Analgésico / Antitérmico', unidade: 'mg/kg',
    apresentacoes: [cp('Cápsula 100 mg', 100), cp('Cápsula 300 mg', 300), ml('Suspensão manipulada 50 mg/mL', 50)],
    vias: ['VO'], canina: f(5, 10, 10, 8), felina: f(5, 10, 5, 12),
    obs: 'Dor neuropática/crônica. Em gatos também ansiolítico (50–100 mg/gato antes de manejo).' },
  { id: 'cetamina-analg', nome: 'Cetamina (dose analgésica)', comerciais: 'Cetamin®, Dopalen®', classe: 'Analgésico / Antitérmico', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 100 mg/mL', 100), ml('Injetável 50 mg/mL', 50)],
    vias: ['IV', 'IM'], canina: f(0.25, 0.5, 0.5, 8), felina: f(0.25, 0.5, 0.5, 8),
    obs: 'Dose subanestésica. CRI: 0,1–0,6 mg/kg/h (MLK).' },

  // ───────── AINEs
  { id: 'meloxicam', nome: 'Meloxicam', comerciais: 'Maxicam®, Meloxivet®', classe: 'Anti-inflamatório (AINE)', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 2 mg/mL (0,2%)', 2), cp('Comprimido 0,5 mg', 0.5), cp('Comprimido 2 mg', 2)],
    vias: ['SC', 'IV', 'VO'], canina: f(0.1, 0.2, 0.1, 24), felina: f(0.05, 0.2, 0.05, 24),
    obs: '1ª dose 0,2 mg/kg, depois 0,1 mg/kg SID. Não associar a corticoides. Atenção a hipovolemia e DRC.',
    alertaFelino: 'Gatos: 0,2 mg/kg dose única ou 0,05 mg/kg SID por curto período.' },
  { id: 'cetoprofeno', nome: 'Cetoprofeno', comerciais: 'Ketofen®, Profenid®', classe: 'Anti-inflamatório (AINE)', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 10 mg/mL (1%)', 10), cp('Comprimido 5 mg', 5), cp('Comprimido 20 mg', 20)],
    vias: ['IV', 'IM', 'SC', 'VO'], canina: f(1, 2, 2, 24), felina: f(1, 2, 1, 24),
    obs: 'Máximo 3–5 dias. 1ª dose 2 mg/kg, depois 1 mg/kg.' },
  { id: 'carprofeno', nome: 'Carprofeno', comerciais: 'Rimadyl®, Carproflan®', classe: 'Anti-inflamatório (AINE)', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 50 mg/mL', 50), cp('Comprimido 25 mg', 25), cp('Comprimido 75 mg', 75), cp('Comprimido 100 mg', 100)],
    vias: ['SC', 'IV', 'VO'], canina: f(2.2, 4.4, 4.4, 24), felina: f(2, 4, 2, 24),
    obs: '4,4 mg/kg SID ou 2,2 mg/kg BID.', alertaFelino: 'Gatos: dose única apenas.' },
  { id: 'robenacoxibe', nome: 'Robenacoxibe', comerciais: 'Onsior®', classe: 'Anti-inflamatório (AINE)', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 20 mg/mL', 20), cp('Comprimido 6 mg (gatos)', 6), cp('Comprimido 20 mg', 20)],
    vias: ['SC', 'VO'], canina: f(1, 2, 2, 24), felina: f(1, 2, 2, 24),
    obs: 'Injetável por até 3 dias. Seguro para felinos em curto prazo.' },
  { id: 'firocoxibe', nome: 'Firocoxibe', comerciais: 'Previcox®', classe: 'Anti-inflamatório (AINE)', unidade: 'mg/kg',
    apresentacoes: [cp('Comprimido 57 mg', 57), cp('Comprimido 227 mg', 227)],
    vias: ['VO'], canina: f(5, 5, 5, 24), felina: null, alertaFelino: 'Não indicado para gatos.' },
  { id: 'flunixina', nome: 'Flunixin meglumine', comerciais: 'Banamine® Pet', classe: 'Anti-inflamatório (AINE)', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 10 mg/mL', 10)],
    vias: ['IV', 'IM', 'SC'], canina: f(0.5, 1, 1, 24), felina: f(0.25, 0.5, 0.25, 24),
    obs: 'Máximo 3 dias. Potente antitérmico.', alertaFelino: 'Gatos: dose única, com cautela.' },

  // ───────── Corticoides
  { id: 'dexametasona', nome: 'Dexametasona', comerciais: 'Azium®, Decadron®', classe: 'Corticoide', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 2 mg/mL', 2), ml('Injetável 4 mg/mL', 4), cp('Comprimido 0,5 mg', 0.5)],
    vias: ['IV', 'IM', 'SC', 'VO'], canina: f(0.05, 0.2, 0.1, 24), felina: f(0.05, 0.2, 0.1, 24),
    obs: 'Anti-inflamatório: 0,05–0,2 mg/kg. Não associar com AINEs.' },
  { id: 'prednisolona', nome: 'Prednisolona', comerciais: 'Prediderm®, Predsim®', classe: 'Corticoide', unidade: 'mg/kg',
    apresentacoes: [cp('Comprimido 5 mg', 5), cp('Comprimido 20 mg', 20), ml('Solução 3 mg/mL', 3)],
    vias: ['VO'], canina: f(0.5, 2, 1, 24), felina: f(1, 2, 1, 24),
    obs: 'Anti-inflamatório 0,5–1 mg/kg; imunossupressor 2 mg/kg/dia.' },
  { id: 'metilprednisolona', nome: 'Succinato de metilprednisolona', comerciais: 'Solu-Medrol®', classe: 'Corticoide', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 62,5 mg/mL (125 mg/2 mL)', 62.5)],
    vias: ['IV'], canina: f(1, 2, 1, 12), felina: f(1, 2, 1, 12) },
  { id: 'hidrocortisona', nome: 'Hidrocortisona (succinato)', comerciais: 'Solu-Cortef®', classe: 'Corticoide', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 50 mg/mL (100 mg/2 mL)', 50)],
    vias: ['IV'], canina: f(1, 5, 2, 6), felina: f(1, 5, 2, 6),
    obs: 'Crise addisoniana / choque refratário.' },

  // ───────── Antibióticos
  { id: 'ampicilina', nome: 'Ampicilina sódica', comerciais: 'Binotal®', classe: 'Antibiótico', unidade: 'mg/kg',
    apresentacoes: [ml('Pó 1 g reconstituído em 10 mL (100 mg/mL)', 100), ml('Pó 1 g reconstituído em 5 mL (200 mg/mL)', 200)],
    vias: ['IV', 'IM', 'SC'], canina: f(20, 30, 22, 8), felina: f(20, 30, 22, 8) },
  { id: 'ampi-sulbactam', nome: 'Ampicilina + Sulbactam', comerciais: 'Unasyn®', classe: 'Antibiótico', unidade: 'mg/kg',
    apresentacoes: [ml('Pó 1,5 g em 10 mL (150 mg/mL)', 150), ml('Pó 3 g em 20 mL (150 mg/mL)', 150)],
    vias: ['IV', 'IM'], canina: f(22, 30, 30, 8), felina: f(22, 30, 30, 8) },
  { id: 'amox-clav', nome: 'Amoxicilina + Clavulanato', comerciais: 'Agemoxi CL®, Clavulin®', classe: 'Antibiótico', unidade: 'mg/kg',
    apresentacoes: [cp('Comprimido 50 mg', 50), cp('Comprimido 250 mg', 250), cp('Comprimido 500 mg', 500), ml('Suspensão 50 mg/mL', 50)],
    vias: ['VO'], canina: f(12.5, 25, 20, 12), felina: f(12.5, 25, 15, 12) },
  { id: 'cefalotina', nome: 'Cefalotina', comerciais: 'Keflin®', classe: 'Antibiótico', unidade: 'mg/kg',
    apresentacoes: [ml('Pó 1 g em 10 mL (100 mg/mL)', 100)],
    vias: ['IV', 'IM'], canina: f(20, 30, 30, 8), felina: f(20, 30, 30, 8),
    obs: 'Profilaxia cirúrgica: 22 mg/kg IV 30 min antes e a cada 90 min.' },
  { id: 'cefazolina', nome: 'Cefazolina', comerciais: 'Kefazol®', classe: 'Antibiótico', unidade: 'mg/kg',
    apresentacoes: [ml('Pó 1 g em 10 mL (100 mg/mL)', 100)],
    vias: ['IV', 'IM'], canina: f(20, 30, 22, 8), felina: f(20, 30, 22, 8) },
  { id: 'ceftriaxona', nome: 'Ceftriaxona', comerciais: 'Rocefin®', classe: 'Antibiótico', unidade: 'mg/kg',
    apresentacoes: [ml('Pó 1 g em 10 mL (100 mg/mL)', 100), ml('Pó 500 mg em 5 mL (100 mg/mL)', 100)],
    vias: ['IV', 'IM', 'SC'], canina: f(15, 50, 25, 12), felina: f(15, 50, 25, 12) },
  { id: 'cefovecina', nome: 'Cefovecina', comerciais: 'Convenia®', classe: 'Antibiótico', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 80 mg/mL', 80)],
    vias: ['SC'], canina: f(8, 8, 8, 336), felina: f(8, 8, 8, 336),
    obs: 'Dose única com ação de 14 dias.' },
  { id: 'enrofloxacino', nome: 'Enrofloxacino', comerciais: 'Baytril®, Flotril®', classe: 'Antibiótico', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 25 mg/mL (2,5%)', 25), ml('Injetável 50 mg/mL (5%)', 50), cp('Comprimido 50 mg', 50), cp('Comprimido 150 mg', 150)],
    vias: ['IV', 'IM', 'SC', 'VO'], canina: f(5, 20, 10, 24), felina: f(5, 5, 5, 24),
    obs: 'IV sempre diluído e lento. Evitar em filhotes em crescimento.',
    alertaFelino: 'Gatos: NÃO exceder 5 mg/kg/dia (risco de degeneração de retina/cegueira).' },
  { id: 'marbofloxacino', nome: 'Marbofloxacino', comerciais: 'Marbocyl®', classe: 'Antibiótico', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 10 mg/mL (1%)', 10), ml('Injetável 20 mg/mL (2%)', 20), cp('Comprimido 20 mg', 20), cp('Comprimido 80 mg', 80)],
    vias: ['IV', 'SC', 'IM', 'VO'], canina: f(2, 5, 2, 24), felina: f(2, 2, 2, 24) },
  { id: 'metronidazol', nome: 'Metronidazol', comerciais: 'Flagyl®, Metrovet®', classe: 'Antibiótico', unidade: 'mg/kg',
    apresentacoes: [ml('Solução IV 5 mg/mL (bolsa 100 mL)', 5), cp('Comprimido 250 mg', 250), cp('Comprimido 400 mg', 400), ml('Suspensão 40 mg/mL', 40)],
    vias: ['IV', 'VO'], canina: f(10, 15, 15, 12), felina: f(10, 15, 10, 12),
    obs: 'IV em infusão lenta (30–60 min). Doses altas: neurotoxicidade.' },
  { id: 'clindamicina', nome: 'Clindamicina', comerciais: 'Dalacin®, Antirobe®', classe: 'Antibiótico', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 150 mg/mL', 150), cp('Cápsula 75 mg', 75), cp('Cápsula 150 mg', 150)],
    vias: ['IV', 'IM', 'VO'], canina: f(5.5, 11, 11, 12), felina: f(5.5, 11, 11, 12),
    obs: 'IV diluído e lento.' },
  { id: 'gentamicina', nome: 'Gentamicina', comerciais: 'Garamicina®, Gentocin®', classe: 'Antibiótico', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 40 mg/mL', 40), ml('Injetável 10 mg/mL', 10)],
    vias: ['IV', 'IM', 'SC'], canina: f(6, 8, 6, 24), felina: f(5, 6, 5, 24),
    obs: 'Nefrotóxica e ototóxica: garantir hidratação e monitorar ureia/creatinina.' },
  { id: 'amicacina', nome: 'Amicacina', comerciais: 'Novamin®', classe: 'Antibiótico', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 50 mg/mL (100 mg/2 mL)', 50), ml('Injetável 250 mg/mL (500 mg/2 mL)', 250)],
    vias: ['IV', 'IM', 'SC'], canina: f(15, 30, 15, 24), felina: f(10, 15, 10, 24),
    obs: 'Nefrotóxica: garantir hidratação adequada.' },
  { id: 'doxiciclina', nome: 'Doxiciclina', comerciais: 'Doxitec®, Doxifin®', classe: 'Antibiótico', unidade: 'mg/kg',
    apresentacoes: [cp('Comprimido 50 mg', 50), cp('Comprimido 100 mg', 100), cp('Comprimido 200 mg', 200)],
    vias: ['VO'], canina: f(5, 10, 5, 12), felina: f(5, 10, 5, 12),
    obs: 'Erliquiose: 10 mg/kg SID por 28 dias.', alertaFelino: 'Gatos: oferecer água ou alimento após o comprimido (risco de estenose esofágica).' },
  { id: 'smz-tmp', nome: 'Sulfametoxazol + Trimetoprima', comerciais: 'Bactrim®, Tribrissen®', classe: 'Antibiótico', unidade: 'mg/kg',
    apresentacoes: [cp('Comprimido 480 mg', 480), cp('Comprimido 960 mg', 960), ml('Suspensão 48 mg/mL', 48)],
    vias: ['VO'], canina: f(15, 30, 15, 12), felina: f(15, 30, 15, 12),
    obs: 'Monitorar ceratoconjuntivite seca em uso prolongado.' },
  { id: 'meropenem', nome: 'Meropenem', comerciais: 'Meronem®', classe: 'Antibiótico', unidade: 'mg/kg',
    apresentacoes: [ml('Pó 1 g em 20 mL (50 mg/mL)', 50), ml('Pó 500 mg em 10 mL (50 mg/mL)', 50)],
    vias: ['IV', 'SC'], canina: f(8, 24, 12, 8), felina: f(8, 12, 10, 12),
    obs: 'Reservar para infecções multirresistentes com cultura.' },
  { id: 'penicilina-benz', nome: 'Penicilina benzatina + procaína', comerciais: 'Pentabiótico® Veterinário', classe: 'Antibiótico', unidade: 'UI/kg',
    apresentacoes: [ml('Frasco 1.200.000 UI em 3 mL (~400.000 UI/mL)', 400000)],
    vias: ['IM'], canina: f(20000, 40000, 40000, 72), felina: f(20000, 40000, 40000, 72),
    obs: 'Somente IM profunda.' },

  // ───────── Anticonvulsivantes
  { id: 'diazepam', nome: 'Diazepam', comerciais: 'Valium®, Compaz®', classe: 'Anticonvulsivante', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 5 mg/mL', 5)],
    vias: ['IV', 'Retal'], canina: f(0.5, 1, 0.5, 6), felina: f(0.25, 0.5, 0.5, 6),
    obs: 'Crise convulsiva: 0,5 mg/kg IV, pode repetir até 3x. Retal: 1 mg/kg. Não usar IM.' },
  { id: 'midazolam', nome: 'Midazolam', comerciais: 'Dormonid®', classe: 'Anticonvulsivante', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 5 mg/mL', 5), ml('Injetável 1 mg/mL', 1)],
    vias: ['IV', 'IM', 'Inalatória'], canina: f(0.2, 0.5, 0.3, 6), felina: f(0.1, 0.3, 0.2, 6),
    obs: 'Pode ser intranasal (0,2–0,5 mg/kg). CRI: 0,1–0,5 mg/kg/h.' },
  { id: 'fenobarbital', nome: 'Fenobarbital', comerciais: 'Gardenal®, Fenocris®', classe: 'Anticonvulsivante', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 100 mg/mL', 100), cp('Comprimido 50 mg', 50), cp('Comprimido 100 mg', 100), ml('Gotas 40 mg/mL', 40)],
    vias: ['IV', 'IM', 'VO'], canina: f(2, 3, 2.5, 12), felina: f(1.5, 2.5, 2, 12),
    obs: 'Ataque: 12–24 mg/kg divididos em 24 h. Monitorar sedação e função hepática.' },
  { id: 'levetiracetam', nome: 'Levetiracetam', comerciais: 'Keppra®', classe: 'Anticonvulsivante', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 100 mg/mL', 100), cp('Comprimido 250 mg', 250), cp('Comprimido 500 mg', 500), ml('Solução oral 100 mg/mL', 100)],
    vias: ['IV', 'VO'], canina: f(20, 30, 20, 8), felina: f(20, 20, 20, 8),
    obs: 'Ataque IV: 30–60 mg/kg. Manutenção 20 mg/kg TID.' },

  // ───────── Sedativos / anestésicos
  { id: 'acepromazina', nome: 'Acepromazina', comerciais: 'Acepran® 0,2% / 1%', classe: 'Sedativo / Anestésico', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 2 mg/mL (0,2%)', 2), ml('Injetável 10 mg/mL (1%)', 10)],
    vias: ['IV', 'IM', 'SC'], canina: f(0.01, 0.05, 0.02, 8), felina: f(0.02, 0.05, 0.03, 8),
    obs: 'Evitar em hipovolemia/choque (hipotensão). Cautela em braquicefálicos e Boxers.' },
  { id: 'dexmedetomidina', nome: 'Dexmedetomidina', comerciais: 'Dexdomitor®, Precedex®', classe: 'Sedativo / Anestésico', unidade: 'mcg/kg',
    apresentacoes: [ml('Injetável 500 mcg/mL (0,5 mg/mL)', 500), ml('Injetável 100 mcg/mL', 100)],
    vias: ['IV', 'IM'], canina: f(1, 5, 2, 8), felina: f(2, 10, 5, 8),
    obs: 'Evitar em cardiopatas. Reversível com atipamezol. CRI: 0,5–2 mcg/kg/h.' },
  { id: 'cetamina', nome: 'Cetamina (sedação/indução)', comerciais: 'Cetamin®, Dopalen®', classe: 'Sedativo / Anestésico', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 100 mg/mL', 100), ml('Injetável 50 mg/mL', 50)],
    vias: ['IV', 'IM'], canina: f(2, 5, 3, 8), felina: f(2, 5, 3, 8) },
  { id: 'propofol', nome: 'Propofol', comerciais: 'Diprivan®, Propovan®', classe: 'Sedativo / Anestésico', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 10 mg/mL (1%)', 10)],
    vias: ['IV'], canina: f(2, 6, 4, 1), felina: f(2, 6, 4, 1), obs: 'Titular a dose até efeito, IV lento.' },
  { id: 'trazodona', nome: 'Trazodona', comerciais: 'Donaren®', classe: 'Sedativo / Anestésico', unidade: 'mg/kg',
    apresentacoes: [cp('Comprimido 50 mg', 50), cp('Comprimido 100 mg', 100)],
    vias: ['VO'], canina: f(3, 7, 5, 12), felina: f(5, 10, 8, 24), obs: 'Ansiolítico para internação e confinamento.' },

  // ───────── Cardiovascular / Diuréticos
  { id: 'furosemida', nome: 'Furosemida', comerciais: 'Lasix®, Furosemida Vet', classe: 'Cardiovascular / Diurético', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 10 mg/mL', 10), cp('Comprimido 40 mg', 40), cp('Comprimido 10 mg (vet)', 10)],
    vias: ['IV', 'IM', 'SC', 'VO'], canina: f(1, 4, 2, 8), felina: f(0.5, 2, 1, 12),
    obs: 'Edema pulmonar agudo: 2–4 mg/kg IV, repetir conforme FR. CRI: 0,5–1 mg/kg/h.' },
  { id: 'pimobendan', nome: 'Pimobendan', comerciais: 'Vetmedin®, Cardiovet®', classe: 'Cardiovascular / Diurético', unidade: 'mg/kg',
    apresentacoes: [cp('Comprimido 1,25 mg', 1.25), cp('Comprimido 5 mg', 5), cp('Comprimido 10 mg', 10)],
    vias: ['VO'], canina: f(0.2, 0.3, 0.25, 12), felina: f(0.2, 0.3, 0.25, 12), obs: 'Administrar 1 h antes da refeição.' },
  { id: 'espironolactona', nome: 'Espironolactona', comerciais: 'Aldactone®', classe: 'Cardiovascular / Diurético', unidade: 'mg/kg',
    apresentacoes: [cp('Comprimido 25 mg', 25), cp('Comprimido 50 mg', 50)],
    vias: ['VO'], canina: f(1, 2, 2, 24), felina: f(1, 2, 1, 24) },
  { id: 'benazepril', nome: 'Benazepril', comerciais: 'Fortekor®, Lotensin®', classe: 'Cardiovascular / Diurético', unidade: 'mg/kg',
    apresentacoes: [cp('Comprimido 5 mg', 5), cp('Comprimido 10 mg', 10)],
    vias: ['VO'], canina: f(0.25, 0.5, 0.5, 24), felina: f(0.5, 1, 0.5, 24) },
  { id: 'manitol', nome: 'Manitol 20%', comerciais: 'Manitol 20%', classe: 'Cardiovascular / Diurético', unidade: 'g/kg',
    apresentacoes: [ml('Solução 20% (0,2 g/mL)', 0.2)],
    vias: ['IV'], canina: f(0.5, 1, 0.5, 8), felina: f(0.5, 1, 0.5, 8),
    obs: 'IV em 15–20 min, com filtro. Hipertensão intracraniana (TCE).' },
  { id: 'clopidogrel', nome: 'Clopidogrel', comerciais: 'Plavix®', classe: 'Cardiovascular / Diurético', unidade: 'mg/kg',
    apresentacoes: [cp('Comprimido 75 mg', 75)],
    vias: ['VO'], canina: f(1, 3, 2, 24), felina: f(3.5, 4.5, 4, 24), alertaFelino: 'Gatos: 18,75 mg/gato (¼ cp) SID.' },

  // ───────── Emergência
  { id: 'atropina', nome: 'Atropina', comerciais: 'Atropina 0,5 mg/mL', classe: 'Emergência', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 0,5 mg/mL', 0.5), ml('Injetável 0,25 mg/mL', 0.25), ml('Injetável 1% vet (10 mg/mL)', 10)],
    vias: ['IV', 'IM', 'SC'], canina: f(0.02, 0.04, 0.04, 6), felina: f(0.02, 0.04, 0.04, 6),
    obs: 'Intoxicação por organofosforado: 0,2–0,5 mg/kg (¼ IV e restante IM/SC).' },
  { id: 'adrenalina', nome: 'Adrenalina (epinefrina)', comerciais: 'Adrenalina 1 mg/mL', classe: 'Emergência', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 1 mg/mL', 1)],
    vias: ['IV', 'IM'], canina: f(0.01, 0.1, 0.01, 1), felina: f(0.01, 0.1, 0.01, 1),
    obs: 'RCP: 0,01 mg/kg IV a cada 3–5 min (ciclos alternados).' },
  { id: 'lidocaina', nome: 'Lidocaína (sem vasoconstritor)', comerciais: 'Xylocaína® 2%', classe: 'Emergência', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 20 mg/mL (2%)', 20)],
    vias: ['IV'], canina: f(1, 2, 2, 1), felina: f(0.25, 0.5, 0.25, 1),
    obs: 'Arritmia ventricular. CRI: 25–80 mcg/kg/min.', alertaFelino: 'Gatos: muito sensíveis — dose baixa e lenta.' },
  { id: 'ac-tranexamico', nome: 'Ácido tranexâmico', comerciais: 'Transamin®', classe: 'Emergência', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 50 mg/mL', 50), cp('Comprimido 250 mg', 250)],
    vias: ['IV', 'VO'], canina: f(10, 15, 10, 8), felina: f(10, 15, 10, 8), obs: 'IV lento.' },
  { id: 'vitamina-k1', nome: 'Vitamina K1 (fitomenadiona)', comerciais: 'Kanakion®, Vitamina K Vet', classe: 'Emergência', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 10 mg/mL', 10), cp('Comprimido 10 mg', 10)],
    vias: ['SC', 'VO'], canina: f(2.5, 5, 2.5, 12), felina: f(2.5, 5, 2.5, 12),
    obs: 'Rodenticida anticoagulante: 3–4 semanas. Não aplicar IV (anafilaxia).' },
  { id: 'nac', nome: 'N-acetilcisteína', comerciais: 'Fluimucil®', classe: 'Emergência', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 100 mg/mL', 100)],
    vias: ['IV', 'VO'], canina: f(70, 140, 70, 6), felina: f(70, 140, 70, 6),
    obs: 'Intoxicação por paracetamol: ataque 140 mg/kg, depois 70 mg/kg a cada 6 h.' },
  { id: 'difenidramina', nome: 'Difenidramina', comerciais: 'Difenidrin®', classe: 'Emergência', unidade: 'mg/kg',
    apresentacoes: [ml('Injetável 50 mg/mL', 50)],
    vias: ['IM', 'SC', 'IV'], canina: f(1, 2, 1, 8), felina: f(0.5, 1, 1, 12), obs: 'Reações alérgicas. IV muito lento.' },

  // ───────── Suplementos / eletrólitos
  { id: 'glicose50', nome: 'Glicose 50%', comerciais: 'Glicose hipertônica 50%', classe: 'Suplemento / Eletrólito', unidade: 'mg/kg',
    apresentacoes: [ml('Solução 50% (500 mg/mL)', 500), ml('Solução 25% (250 mg/mL)', 250)],
    vias: ['IV'], canina: f(250, 500, 500, 1), felina: f(250, 500, 500, 1),
    obs: 'Hipoglicemia: 0,25–0,5 g/kg, DILUÍDA 1:2 a 1:4 em NaCl 0,9%, IV lento.' },
  { id: 'gluconato-calcio', nome: 'Gluconato de cálcio 10%', comerciais: 'Gluconato de cálcio 10%', classe: 'Suplemento / Eletrólito', unidade: 'mg/kg',
    apresentacoes: [ml('Solução 10% (100 mg/mL)', 100)],
    vias: ['IV'], canina: f(50, 150, 100, 8), felina: f(50, 150, 100, 8),
    obs: 'IV MUITO lento (10–20 min) com monitoração de ECG (bradicardia).' },
  { id: 'complexo-b', nome: 'Complexo B', comerciais: 'Complexo B injetável', classe: 'Suplemento / Eletrólito', unidade: 'mL/kg',
    apresentacoes: [ml('Injetável', 1)],
    vias: ['IM', 'SC', 'IV'], canina: f(0.05, 0.1, 0.1, 24), felina: f(0.05, 0.1, 0.1, 24),
    obs: 'Pode ser diluído na fluidoterapia (proteger da luz).' },
  { id: 'b12', nome: 'Cianocobalamina (B12)', comerciais: 'Monovin B12®', classe: 'Suplemento / Eletrólito', unidade: 'mcg/kg',
    apresentacoes: [ml('Injetável 1000 mcg/mL', 1000), ml('Injetável 5000 mcg/2 mL (2500 mcg/mL)', 2500)],
    vias: ['SC', 'IM'], canina: f(25, 50, 25, 168), felina: f(25, 50, 50, 168), obs: 'Semanal. Gatos: 250 mcg/gato.' },

  // ───────── Endócrino
  { id: 'insulina-regular', nome: 'Insulina Regular', comerciais: 'Humulin R®, Novolin R®', classe: 'Endócrino', unidade: 'UI/kg',
    apresentacoes: [ml('Injetável 100 UI/mL', 100)],
    vias: ['IM', 'IV', 'SC'], canina: f(0.1, 0.2, 0.1, 1), felina: f(0.1, 0.2, 0.1, 1),
    obs: 'Cetoacidose: protocolo IM horário ou CRI. Monitorar glicemia 1–2 h.' },
  { id: 'insulina-nph', nome: 'Insulina NPH', comerciais: 'Humulin N®, Novolin N®', classe: 'Endócrino', unidade: 'UI/kg',
    apresentacoes: [ml('Injetável 100 UI/mL', 100)],
    vias: ['SC'], canina: f(0.25, 0.5, 0.25, 12), felina: f(0.25, 0.5, 0.25, 12),
    obs: 'Aplicar após a refeição. Seringa U-100.' },
  { id: 'glargina', nome: 'Insulina Glargina', comerciais: 'Lantus®', classe: 'Endócrino', unidade: 'UI/kg',
    apresentacoes: [ml('Injetável 100 UI/mL', 100)],
    vias: ['SC'], canina: f(0.25, 0.5, 0.3, 12), felina: f(0.25, 0.5, 0.25, 12), obs: 'Gatos: 1 UI/gato BID inicial.' },

  // ───────── Gastrointestinal
  { id: 'lactulose', nome: 'Lactulose', comerciais: 'Lactulona®', classe: 'Gastrointestinal', unidade: 'mL/kg',
    apresentacoes: [ml('Xarope 667 mg/mL', 1)],
    vias: ['VO', 'Retal'], canina: f(0.25, 1, 0.5, 8), felina: f(0.25, 0.5, 0.5, 8),
    obs: 'Encefalopatia hepática e constipação. Ajustar para 2–3 fezes pastosas/dia.' },
  { id: 'ursodiol', nome: 'Ácido ursodesoxicólico', comerciais: 'Ursacol®', classe: 'Gastrointestinal', unidade: 'mg/kg',
    apresentacoes: [cp('Comprimido 50 mg', 50), cp('Comprimido 150 mg', 150), cp('Comprimido 300 mg', 300)],
    vias: ['VO'], canina: f(10, 15, 15, 24), felina: f(10, 15, 15, 24) },
  { id: 'mirtazapina', nome: 'Mirtazapina', comerciais: 'Remeron®, Mirataz® (transdérmica)', classe: 'Gastrointestinal', unidade: 'mg/kg',
    apresentacoes: [cp('Comprimido 15 mg', 15), cp('Comprimido 30 mg', 30)],
    vias: ['VO', 'Transdérmica'], canina: f(0.5, 1, 0.6, 24), felina: f(0.3, 0.5, 0.4, 48),
    obs: 'Estimulante de apetite e antiemético.', alertaFelino: 'Gatos: 1,88 mg/gato a cada 24–48 h (¼ cp de 7,5 mg). Reduzir em DRC.' },
  { id: 'simeticona', nome: 'Simeticona', comerciais: 'Luftal®', classe: 'Gastrointestinal', unidade: 'mg/kg',
    apresentacoes: [ml('Gotas 75 mg/mL', 75)],
    vias: ['VO'], canina: f(2, 5, 3, 8), felina: f(2, 5, 3, 8) },

  // ───────── Outros
  { id: 'ivermectina', nome: 'Ivermectina', comerciais: 'Ivomec®', classe: 'Outros', unidade: 'mcg/kg',
    apresentacoes: [ml('Injetável 10 mg/mL (10.000 mcg/mL)', 10000)],
    vias: ['SC', 'VO'], canina: f(200, 400, 300, 168), felina: f(200, 400, 300, 168),
    obs: 'Contraindicado em raças com mutação MDR1 (Collie, Pastor Australiano, Sheltie...).' },
];

export function buscarMedicamento(id?: string) {
  return MEDICAMENTOS.find((m) => m.id === id);
}

export const VIAS: Via[] = ['IV', 'IM', 'SC', 'VO', 'Tópica', 'Oftálmica', 'Otológica', 'Retal', 'Inalatória', 'Transdérmica'];

export const FREQUENCIAS = [
  { horas: 1, rotulo: 'A cada 1 h' },
  { horas: 2, rotulo: 'A cada 2 h' },
  { horas: 4, rotulo: 'A cada 4 h' },
  { horas: 6, rotulo: 'QID — a cada 6 h' },
  { horas: 8, rotulo: 'TID — a cada 8 h' },
  { horas: 12, rotulo: 'BID — a cada 12 h' },
  { horas: 24, rotulo: 'SID — a cada 24 h' },
  { horas: 48, rotulo: 'A cada 48 h' },
  { horas: 72, rotulo: 'A cada 72 h' },
  { horas: 168, rotulo: 'Semanal' },
  { horas: 336, rotulo: 'A cada 14 dias' },
];

export function rotuloFrequencia(h: number) {
  return FREQUENCIAS.find((f) => f.horas === h)?.rotulo ?? `A cada ${h} h`;
}
