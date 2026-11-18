export interface GrupoDiagnostico {
  sistema: string;
  itens: string[];
}

export const DIAGNOSTICOS: GrupoDiagnostico[] = [
  { sistema: 'Gastrointestinal', itens: [
    'Gastroenterite aguda', 'Gastroenterite hemorrágica (SDHA)', 'Pancreatite aguda', 'Corpo estranho gastrointestinal',
    'Dilatação-vólvulo gástrico (DVG)', 'Intussuscepção intestinal', 'Megaesôfago', 'Doença inflamatória intestinal (DII)',
    'Constipação / Fecaloma', 'Megacólon', 'Gastrite aguda', 'Úlcera gastroduodenal', 'Indiscrição alimentar',
    'Gastroenterite parasitária (verminose)', 'Gastroenterite viral', 'Colite aguda', 'Colite crônica', 'Esofagite',
    'Corpo estranho esofágico', 'Corpo estranho linear', 'Obstrução intestinal', 'Volvo mesentérico', 'Prolapso retal',
    'Íleo paralítico', 'Tricobezoar (bola de pelo)', 'Enteropatia perdedora de proteínas', 'Linfangiectasia intestinal',
    'Insuficiência pancreática exócrina', 'Pancreatite crônica', 'Hemorragia digestiva alta', 'Enterite por Clostridium',
    'Salmonelose', 'Campilobacteriose', 'Saculite / abscesso de glândula adanal', 'Fístula perianal', 'Gastrite crônica',
  ] },
  { sistema: 'Hepatobiliar', itens: [
    'Hepatopatia aguda', 'Lipidose hepática felina', 'Colangite / Colangio-hepatite', 'Mucocele biliar', 'Shunt portossistêmico',
    'Encefalopatia hepática', 'Obstrução biliar extra-hepática', 'Hepatite crônica', 'Hepatopatia por acúmulo de cobre',
    'Cirrose hepática', 'Insuficiência hepática aguda', 'Colecistite', 'Colelitíase', 'Abscesso hepático', 'Neoplasia hepática',
    'Hepatotoxicidade por fármacos', 'Triadite felina (colangite + pancreatite + enterite)',
    'Platinossomose felina ("envenenamento por lagartixa")',
  ] },
  { sistema: 'Urinário', itens: [
    'Doença renal crônica (DRC)', 'Lesão renal aguda (LRA)', 'Obstrução uretral', 'Cistite idiopática felina (DTUIF)',
    'Urolitíase', 'Pielonefrite', 'Infecção do trato urinário', 'Ruptura de bexiga / uroabdômen', 'Cistite bacteriana',
    'Urolitíase por estruvita', 'Urolitíase por oxalato de cálcio', 'Tampão uretral felino',
    'Obstrução ureteral (ureterolitíase)', 'Nefrolitíase', 'Hidronefrose', 'Ruptura uretral',
    'Glomerulonefrite / proteinúria renal', 'Síndrome nefrótica', 'Doença renal policística (felinos)', 'Incontinência urinária',
    'Carcinoma de células de transição (bexiga)', 'Hematúria a esclarecer', 'Lesão renal aguda por leptospirose',
  ] },
  { sistema: 'Infecciosas — cães', itens: [
    'Parvovirose', 'Cinomose', 'Erliquiose monocítica', 'Babesiose', 'Anaplasmose', 'Leptospirose', 'Leishmaniose visceral',
    'Traqueobronquite infecciosa canina (Tosse dos canis)', 'Coronavirose canina', 'Cinomose — forma nervosa',
    'Hepatite infecciosa canina (adenovírus tipo 1)', 'Influenza canina', 'Hepatozoonose', 'Rangeliose (Rangelia vitalii)',
    'Brucelose canina', 'Neosporose', 'Toxoplasmose canina', 'Tétano', 'Raiva (suspeita — notificação obrigatória)',
    'Papilomatose oral canina', 'Herpesvírus canino (neonatal)',
  ] },
  { sistema: 'Infecciosas — felinos', itens: [
    'Complexo respiratório felino',
    'Rinotraqueíte viral felina (herpesvírus felino FHV-1)',
    'Herpesvirose felina ocular (ceratoconjuntivite herpética)',
    'Calicivirose felina (FCV)',
    'Panleucopenia felina',
    'FIV (Imunodeficiência felina)',
    'FeLV (Leucemia felina)',
    'PIF (Peritonite infecciosa felina)',
    'PIF efusiva (úmida)',
    'PIF não efusiva (seca)',
    'Micoplasmose hemotrópica',
    'Esporotricose',
    'Calicivirose felina sistêmica virulenta',
    'Clamidiose felina (Chlamydia felis)',
    'Bordetelose felina',
    'Micoplasmose respiratória felina',
    'Micoplasmose hemotrópica (Mycoplasma haemofelis)',
    'Criptococose',
    'Toxoplasmose felina',
  ] },
  { sistema: 'Parasitárias', itens: [
    'Giardíase', 'Dirofilariose', 'Coccidiose / Isosporose', 'Ancilostomíase', 'Toxocaríase', 'Dipilidiose', 'Tricuríase',
    'Criptosporidiose', 'Aelurostrongilose (verme pulmonar felino)', 'Infestação maciça por pulgas',
    'Infestação maciça por carrapatos', 'Paralisia por carrapato', 'Tungíase (bicho-de-pé)', 'Otocaríase (Otodectes cynotis)',
  ] },
  { sistema: 'Cardiovascular', itens: [
    'Insuficiência cardíaca congestiva (ICC)', 'Doença mixomatosa da valva mitral (DMVM)', 'Cardiomiopatia dilatada (CMD)',
    'Cardiomiopatia hipertrófica felina (CMH)', 'Tromboembolismo aórtico felino', 'Efusão pericárdica / Tamponamento',
    'Arritmia cardíaca', 'Hipertensão arterial sistêmica', 'Cardiomiopatia restritiva felina',
    'Cardiomiopatia arritmogênica (Boxer)', 'Endocardite bacteriana', 'Persistência do ducto arterioso (PDA)',
    'Estenose pulmonar', 'Estenose subaórtica', 'Fibrilação atrial', 'Taquicardia ventricular', 'Bloqueio atrioventricular',
    'Síncope', 'Tromboembolismo pulmonar', 'Hipertensão pulmonar', 'Efusão pericárdica idiopática',
  ] },
  { sistema: 'Respiratório', itens: [
    'Pneumonia bacteriana', 'Pneumonia aspirativa', 'Edema pulmonar cardiogênico', 'Edema pulmonar não cardiogênico',
    'Efusão pleural', 'Piotórax', 'Pneumotórax', 'Asma felina / Bronquite', 'Colapso de traqueia', 'Síndrome braquicefálica',
    'Paralisia de laringe', 'Contusão pulmonar', 'Broncopneumonia', 'Bronquite crônica canina', 'Rinite crônica',
    'Rinite fúngica (aspergilose nasal)', 'Pólipo nasofaríngeo felino', 'Corpo estranho nasal', 'Epistaxe', 'Quilotórax',
    'Hemotórax', 'Neoplasia pulmonar / metástases pulmonares', 'Fibrose pulmonar',
    'Síndrome do desconforto respiratório agudo (SDRA)', 'Edema de laringe', 'Hipoplasia de traqueia', 'Dispneia a esclarecer',
  ] },
  { sistema: 'Neurológico', itens: [
    'Epilepsia idiopática', 'Status epilepticus / Crises em cluster', 'Doença do disco intervertebral (DDIV)',
    'Traumatismo cranioencefálico (TCE)', 'Síndrome vestibular', 'Meningoencefalite', 'Trauma medular', 'Polirradiculoneurite',
    'Embolia fibrocartilaginosa', 'Botulismo', 'Hidrocefalia', 'Espondilomielopatia cervical (Síndrome de Wobbler)',
    'Mielopatia degenerativa', 'Síndrome da cauda equina', 'Discoespondilite', 'Meningite-arterite responsiva a esteroides',
    'Meningoencefalite granulomatosa', 'Neoplasia intracraniana', 'Síndrome vestibular geriátrica (idiopática)',
    'Síndrome vestibular central', 'Paralisia do nervo facial', 'Miastenia gravis', 'Síndrome de Horner',
    'Avulsão do plexo braquial', 'Tremor idiopático (Shaker)', 'Convulsão a esclarecer', 'Paresia / paralisia a esclarecer',
  ] },
  { sistema: 'Endócrino / Metabólico', itens: [
    'Cetoacidose diabética (CAD)', 'Diabetes mellitus descompensado', 'Hipoadrenocorticismo (crise addisoniana)',
    'Hiperadrenocorticismo', 'Hipoglicemia', 'Hipocalcemia / Eclâmpsia', 'Hipertireoidismo felino', 'Hipotireoidismo',
    'Hipercalemia', 'Hipocalemia', 'Diabetes mellitus', 'Síndrome hiperosmolar hiperglicêmica', 'Insulinoma',
    'Hipoparatireoidismo', 'Hiperparatireoidismo', 'Diabetes insipidus', 'Feocromocitoma', 'Acromegalia felina', 'Hipercalcemia',
    'Hipernatremia', 'Hiponatremia', 'Hipomagnesemia',
  ] },
  { sistema: 'Reprodutor / Neonatologia', itens: [
    'Piometra', 'Distocia', 'Pós-operatório de cesariana', 'Mastite', 'Prostatite / Abscesso prostático', 'Torção testicular',
    'Prolapso vaginal / uterino', 'Hiperplasia mamária felina', 'Pseudociese (gestação psicológica)', 'Metrite pós-parto',
    'Retenção de placenta / fetos', 'Aborto', 'Torção uterina', 'Ruptura uterina', 'Subinvolução de sítios placentários',
    'Vaginite', 'Hiperplasia prostática benigna', 'Neoplasia prostática', 'Neoplasia testicular', 'Criptorquidismo',
    'Tumor venéreo transmissível (TVT)', 'Parafimose', 'Pós-operatório de orquiectomia', 'Neonato fraco / hipotermia neonatal',
    'Hipoglicemia neonatal', 'Sepse neonatal', 'Síndrome do definhamento neonatal', 'Isoeritrólise neonatal felina',
    'Filhote órfão (aleitamento artificial)',
  ] },
  { sistema: 'Trauma / Cirúrgico', itens: [
    'Politraumatismo', 'Atropelamento', 'Fratura de membro', 'Fratura de pelve', 'Ferida por mordedura', 'Hérnia diafragmática',
    'Hérnia perineal', 'Laceração / Ferida cutânea', 'Queimadura', 'Queda de altura (síndrome do gato paraquedista)',
    'Pós-operatório de OVH', 'Pós-operatório ortopédico', 'Pós-operatório de esplenectomia',
    'Pós-operatório de enterotomia/enterectomia', 'Pós-operatório de mastectomia', 'Pós-operatório de cistotomia',
    'Deiscência de sutura', 'Hemoabdômen', 'Luxação coxofemoral', 'Luxação de patela', 'Ruptura do ligamento cruzado cranial',
    'Fratura de mandíbula', 'Fratura de coluna', 'Fratura de crânio', 'Trauma torácico', 'Ferida por arma de fogo',
    'Evisceração / eventração', 'Hérnia inguinal', 'Hérnia umbilical', 'Hérnia escrotal', 'Degloving (desenluvamento)',
    'Pós-operatório de nodulectomia', 'Pós-operatório de enucleação', 'Pós-operatório de gastropexia / gastrotomia',
    'Pós-operatório de colecistectomia', 'Pós-operatório de amputação', 'Pós-operatório de herniorrafia',
    'Pós-operatório de TPLO / osteotomia', 'Pós-operatório de colocefalectomia', 'Pós-operatório de osteossíntese',
    'Pós-operatório de tratamento periodontal', 'Pós-operatório de uretrostomia', 'Pós-operatório de nefrectomia',
    'Pós-operatório de cirurgia de coluna (hemilaminectomia)',
  ] },
  { sistema: 'Ortopedia / Locomotor', itens: [
    'Displasia coxofemoral', 'Osteoartrite / doença articular degenerativa', 'Doença de Legg-Calvé-Perthes',
    'Poliartrite imunomediada', 'Artrite séptica', 'Osteomielite', 'Panosteíte', 'Miosite', 'Rabdomiólise',
    'Hiperparatireoidismo nutricional secundário (raquitismo)', 'Claudicação aguda a esclarecer',
  ] },
  { sistema: 'Toxicologia', itens: [
    'Intoxicação por rodenticida anticoagulante', 'Intoxicação por organofosforado/carbamato ("chumbinho")',
    'Intoxicação por metaldeído (lesmicida)', 'Intoxicação por chocolate (metilxantinas)', 'Intoxicação por paracetamol',
    'Intoxicação por lírio (felinos)', 'Intoxicação por uva / passas', 'Intoxicação por ivermectina',
    'Intoxicação por permetrina (felinos)', 'Intoxicação por AINE', 'Acidente ofídico (picada de cobra)',
    'Envenenamento por sapo (Rhinella)', 'Intoxicação por xilitol', 'Intoxicação por cebola / alho',
    'Intoxicação por etilenoglicol', 'Intoxicação por etanol (álcool)', 'Intoxicação por amitraz', 'Intoxicação por piretroides',
    'Intoxicação por estricnina', 'Intoxicação por fluoroacetato', 'Intoxicação por colecalciferol (vitamina D)',
    'Intoxicação por cannabis', 'Intoxicação por medicamentos de uso humano',
    'Intoxicação por plantas (comigo-ninguém-pode e outras)', 'Intoxicação por chumbo', 'Intoxicação por zinco',
    'Intoxicação por produtos de limpeza / cáusticos', 'Acidente escorpiônico', 'Acidente araneídico (aranha)',
    'Acidente por abelhas / vespas', 'Acidente por lagarta (taturana / Lonomia)',
  ] },
  { sistema: 'Hematologia / Oncologia', itens: [
    'Anemia hemolítica imunomediada (AHIM)', 'Trombocitopenia imunomediada', 'Anemia regenerativa / Hemorragia', 'Coagulopatia',
    'Hemangiossarcoma', 'Linfoma', 'Mastocitoma', 'Neoplasia mamária', 'Neoplasia esplênica',
    'Coagulação intravascular disseminada (CID)', 'Anemia ferropriva', 'Anemia da doença renal crônica',
    'Anemia por hemoparasitose', 'Policitemia', 'Hemofilia', 'Doença de von Willebrand', 'Leucemia', 'Mieloma múltiplo',
    'Osteossarcoma', 'Carcinoma de células escamosas', 'Melanoma oral', 'Sarcoma de aplicação felino', 'Timoma',
    'Adenocarcinoma de sacos anais', 'Neoplasia cutânea / subcutânea', 'Síndrome paraneoplásica (hipercalcemia maligna)',
  ] },
  { sistema: 'Choque / Crítico', itens: [
    'Sepse / Choque séptico', 'Choque hipovolêmico', 'Choque cardiogênico', 'Hipertermia / Insolação (golpe de calor)',
    'Hipotermia', 'Desidratação grave', 'Peritonite séptica', 'Anafilaxia', 'Edema de glote / Reação alérgica', 'Parada cardiorrespiratória (pós-RCP)',
    'Síndrome da resposta inflamatória sistêmica (SIRS)', 'Choque distributivo', 'Choque obstrutivo', 'Hemorragia aguda',
    'Quase-afogamento', 'Eletrocussão', 'Inalação de fumaça', 'Síndrome de esmagamento', 'Acidose / distúrbio ácido-base grave',
    'Recuperação anestésica prolongada', 'Paciente politraumatizado em observação',
  ] },
  { sistema: 'Dermatologia', itens: [
    'Abscesso subcutâneo', 'Miíase', 'Dermatite piotraumática', 'Otite externa / média', 'Celulite', 'Dermatite atópica',
    'Dermatite alérgica à picada de pulga (DAPP)', 'Hipersensibilidade alimentar', 'Piodermite superficial',
    'Piodermite profunda', 'Malasseziose', 'Dermatofitose (Microsporum / Trichophyton)', 'Sarna demodécica (demodicose)',
    'Sarna sarcóptica (escabiose)', 'Sarna notoédrica (felinos)', 'Pênfigo foliáceo', 'Lúpus eritematoso',
    'Complexo granuloma eosinofílico felino', 'Acne felina', 'Alopecia psicogênica felina',
    'Carcinoma de células escamosas (plano nasal / orelhas)', 'Otohematoma', 'Fasciíte necrosante', 'Úlcera de decúbito',
    'Necrose cutânea',
  ] },
  { sistema: 'Oftalmologia', itens: [
    'Úlcera de córnea', 'Proptose ocular', 'Úlcera de córnea profunda / descemetocele', 'Ceratoconjuntivite seca', 'Conjuntivite',
    'Ceratite herpética felina', 'Sequestro corneano felino', 'Glaucoma', 'Uveíte', 'Catarata', 'Luxação de cristalino',
    'Descolamento de retina', 'Hifema', 'Prolapso da glândula da terceira pálpebra (olho de cereja)', 'Entrópio',
    'Trauma / perfuração ocular', 'Cegueira aguda',
  ] },
  { sistema: 'Odontologia / Cavidade oral', itens: [
    'Doença periodontal grave', 'Gengivoestomatite crônica felina', 'Fratura dentária', 'Abscesso dentário (dente carniceiro)',
    'Fístula oronasal', 'Lesão de reabsorção dentária felina', 'Neoplasia oral', 'Corpo estranho oral',
    'Sialocele (mucocele salivar)', 'Úlceras orais (calicivírus / uremia)',
  ] },
  { sistema: 'Sinais clínicos (a esclarecer)', itens: [
    'Anorexia a esclarecer', 'Dor aguda a esclarecer', 'Febre de origem indeterminada', 'Vômito a esclarecer',
    'Diarreia a esclarecer', 'Icterícia a esclarecer', 'Poliúria / polidipsia a esclarecer', 'Perda de peso / caquexia',
    'Desnutrição', 'Obesidade mórbida', 'Disfunção cognitiva (senilidade)', 'Internação para observação clínica',
    'Internação para exames / monitoramento',
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

/** Texto sem acento e minúsculo, para busca */
export function normalizar(t: string) {
  return t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/**
 * Busca tolerante: ignora acentos e aceita palavras parecidas
 * (ex.: "herpesviral" encontra "herpesvirose", "rinotraqueite" encontra "Rinotraqueíte").
 */
export function buscarDiagnosticos(q: string) {
  const termos = normalizar(q).split(/[^a-z0-9]+/).filter((t) => t.length >= 2);
  if (!termos.length) return [];
  const pontuados = TODOS_DIAGNOSTICOS.map((d) => {
    const alvo = normalizar(d.nome);
    const palavras = alvo.split(/[^a-z0-9]+/).filter(Boolean);
    let pontos = 0;
    for (const t of termos) {
      if (alvo.includes(t)) pontos += 3;
      else if (t.length >= 5 && palavras.some((w) => w.length >= 5 && prefixoComum(w, t) >= Math.max(5, Math.min(7, Math.min(w.length, t.length) - 2)))) pontos += 1;
      else return { d, pontos: -1 };
    }
    return { d, pontos };
  });
  return pontuados.filter((x) => x.pontos > 0).sort((a, b) => b.pontos - a.pontos).map((x) => x.d.nome);
}

function prefixoComum(a: string, b: string) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}
