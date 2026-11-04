export interface GrupoDiagnostico {
  sistema: string;
  itens: string[];
}

export const DIAGNOSTICOS: GrupoDiagnostico[] = [
  { sistema: 'Gastrointestinal', itens: [
    'Gastroenterite aguda', 'Gastroenterite hemorrágica (SDHA)', 'Pancreatite aguda', 'Corpo estranho gastrointestinal',
    'Dilatação-vólvulo gástrico (DVG)', 'Intussuscepção intestinal', 'Megaesôfago', 'Doença inflamatória intestinal (DII)',
    'Constipação / Fecaloma', 'Megacólon', 'Gastrite aguda', 'Úlcera gastroduodenal', 'Indiscrição alimentar',
  ] },
  { sistema: 'Hepatobiliar', itens: [
    'Hepatopatia aguda', 'Lipidose hepática felina', 'Colangite / Colangio-hepatite', 'Mucocele biliar',
    'Shunt portossistêmico', 'Encefalopatia hepática', 'Obstrução biliar extra-hepática',
  ] },
  { sistema: 'Urinário', itens: [
    'Doença renal crônica (DRC)', 'Lesão renal aguda (LRA)', 'Obstrução uretral', 'Cistite idiopática felina (DTUIF)',
    'Urolitíase', 'Pielonefrite', 'Infecção do trato urinário', 'Ruptura de bexiga / uroabdômen',
  ] },
  { sistema: 'Doenças infecciosas', itens: [
    'Parvovirose', 'Cinomose', 'Erliquiose monocítica', 'Babesiose', 'Anaplasmose', 'Leptospirose',
    'Leishmaniose visceral', 'FIV (Imunodeficiência felina)', 'FeLV (Leucemia felina)', 'PIF (Peritonite infecciosa felina)',
    'Micoplasmose hemotrópica', 'Complexo respiratório felino', 'Traqueobronquite infecciosa canina (Tosse dos canis)',
    'Esporotricose', 'Panleucopenia felina', 'Coronavirose canina', 'Giardíase',
  ] },
  { sistema: 'Cardiovascular', itens: [
    'Insuficiência cardíaca congestiva (ICC)', 'Doença mixomatosa da valva mitral (DMVM)', 'Cardiomiopatia dilatada (CMD)',
    'Cardiomiopatia hipertrófica felina (CMH)', 'Tromboembolismo aórtico felino', 'Efusão pericárdica / Tamponamento',
    'Arritmia cardíaca', 'Hipertensão arterial sistêmica', 'Dirofilariose',
  ] },
  { sistema: 'Respiratório', itens: [
    'Pneumonia bacteriana', 'Pneumonia aspirativa', 'Edema pulmonar cardiogênico', 'Edema pulmonar não cardiogênico',
    'Efusão pleural', 'Piotórax', 'Pneumotórax', 'Asma felina / Bronquite', 'Colapso de traqueia',
    'Síndrome braquicefálica', 'Paralisia de laringe', 'Contusão pulmonar',
  ] },
  { sistema: 'Neurológico', itens: [
    'Epilepsia idiopática', 'Status epilepticus / Crises em cluster', 'Doença do disco intervertebral (DDIV)',
    'Traumatismo cranioencefálico (TCE)', 'Síndrome vestibular', 'Meningoencefalite', 'Trauma medular', 'Polirradiculoneurite',
    'Embolia fibrocartilaginosa', 'Botulismo',
  ] },
  { sistema: 'Endócrino / Metabólico', itens: [
    'Cetoacidose diabética (CAD)', 'Diabetes mellitus descompensado', 'Hipoadrenocorticismo (crise addisoniana)',
    'Hiperadrenocorticismo', 'Hipoglicemia', 'Hipocalcemia / Eclâmpsia', 'Hipertireoidismo felino', 'Hipotireoidismo',
    'Hipercalemia', 'Hipocalemia',
  ] },
  { sistema: 'Reprodutor', itens: [
    'Piometra', 'Distocia', 'Pós-operatório de cesariana', 'Mastite', 'Prostatite / Abscesso prostático',
    'Torção testicular', 'Prolapso vaginal / uterino', 'Hiperplasia mamária felina',
  ] },
  { sistema: 'Trauma / Cirúrgico', itens: [
    'Politraumatismo', 'Atropelamento', 'Fratura de membro', 'Fratura de pelve', 'Ferida por mordedura',
    'Hérnia diafragmática', 'Hérnia perineal', 'Laceração / Ferida cutânea', 'Queimadura', 'Queda de altura (síndrome do gato paraquedista)',
    'Pós-operatório de OVH', 'Pós-operatório ortopédico', 'Pós-operatório de esplenectomia', 'Pós-operatório de enterotomia/enterectomia',
    'Pós-operatório de mastectomia', 'Pós-operatório de cistotomia', 'Deiscência de sutura', 'Hemoabdômen',
  ] },
  { sistema: 'Toxicologia', itens: [
    'Intoxicação por rodenticida anticoagulante', 'Intoxicação por organofosforado/carbamato ("chumbinho")',
    'Intoxicação por metaldeído (lesmicida)', 'Intoxicação por chocolate (metilxantinas)', 'Intoxicação por paracetamol',
    'Intoxicação por lírio (felinos)', 'Intoxicação por uva / passas', 'Intoxicação por ivermectina',
    'Intoxicação por permetrina (felinos)', 'Intoxicação por AINE', 'Acidente ofídico (picada de cobra)',
    'Envenenamento por sapo (Rhinella)', 'Intoxicação por xilitol',
  ] },
  { sistema: 'Hematologia / Oncologia', itens: [
    'Anemia hemolítica imunomediada (AHIM)', 'Trombocitopenia imunomediada', 'Anemia regenerativa / Hemorragia',
    'Coagulopatia', 'Hemangiossarcoma', 'Linfoma', 'Mastocitoma', 'Neoplasia mamária', 'Neoplasia esplênica',
    'Coagulação intravascular disseminada (CID)',
  ] },
  { sistema: 'Choque / Crítico', itens: [
    'Sepse / Choque séptico', 'Choque hipovolêmico', 'Choque cardiogênico', 'Hipertermia / Insolação (golpe de calor)',
    'Hipotermia', 'Desidratação grave', 'Peritonite séptica', 'Anafilaxia', 'Parada cardiorrespiratória (pós-RCP)',
  ] },
  { sistema: 'Dermatologia / Outros', itens: [
    'Abscesso subcutâneo', 'Miíase', 'Dermatite piotraumática', 'Otite externa / média', 'Celulite',
    'Úlcera de córnea', 'Proptose ocular', 'Anorexia a esclarecer', 'Dor aguda a esclarecer', 'Febre de origem indeterminada',
    'Doença periodontal grave', 'Edema de glote / Reação alérgica',
  ] },
];

export const TODOS_DIAGNOSTICOS = DIAGNOSTICOS.flatMap((g) => g.itens.map((i) => ({ nome: i, sistema: g.sistema })));

export const SOLUCOES = [
  'Ringer com lactato',
  'NaCl 0,9% (soro fisiológico)',
  'Ringer simples',
  'Glicose 5%',
  'NaCl 0,45% + Glicose 2,5%',
  'Plasma-Lyte® / Solução balanceada',
  'NaCl 7,5% (hipertônica)',
  'Coloide (Voluven®)',
];

export const RACAS_CAES = [
  'SRD', 'Shih-tzu', 'Yorkshire', 'Poodle', 'Lhasa Apso', 'Spitz Alemão', 'Golden Retriever', 'Labrador', 'Pastor Alemão',
  'Buldogue Francês', 'Buldogue Inglês', 'Pug', 'Pinscher', 'Dachshund', 'Border Collie', 'Rottweiler', 'Pit Bull',
  'Maltês', 'Beagle', 'Boxer', 'Chihuahua', 'Schnauzer', 'Husky Siberiano', 'Cocker Spaniel', 'Pastor Belga',
];

export const RACAS_GATOS = [
  'SRD', 'Persa', 'Siamês', 'Maine Coon', 'Angorá', 'Ragdoll', 'British Shorthair', 'Sphynx', 'Bengal', 'Exótico', 'Himalaio',
];
