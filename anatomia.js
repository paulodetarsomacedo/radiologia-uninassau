/* Textos didáticos originais e referências científicas. As áreas coloridas
   são sobreposições de orientação no esquema, não segmentações de exames. */
export const fontes = {
  atlas:{title:'Veerabhadrappa et al. Anatomia radiográfica intraoral e aprendizagem por desenhos. BMC Oral Health, 2026;26:1048.',url:'https://doi.org/10.1186/s12903-026-08307-5'},
  mental:{title:'Afkhami, Haraji & Boostani. Radiographic Localization of the Mental Foramen and Mandibular Canal. J Dent (Tehran), 2013;10:436–442.',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC4025417/'},
  lingual:{title:'McDonnell, Reza Nouri & Todd. The mandibular lingual foramen: a consistent arterial foramen in the middle of the mandible. J Anat, 1994;184:363–369.',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC1259996/'},
  mandibula:{title:'Parnia et al. Characteristics of anatomical landmarks in the mandibular interforaminal region: a CBCT study. Med Oral Patol Oral Cir Bucal, 2012;17:e420–e425.',url:'https://doi.org/10.4317/medoral.17520'},
  seio:{title:'Whyte & Boeddinghaus. The maxillary sinus: physiology, development and imaging anatomy. Dentomaxillofac Radiol, 2019;48:20190205.',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC6951102/'},
  clinica:{title:'Iwanaga et al. Clinical anatomy of the maxillary sinus: application to sinus floor augmentation. Anat Cell Biol, 2019;52:17–24.',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC6449588/'},
  incisivo:{title:'Lake et al. The Incisive Canal: A Comprehensive Review. Cureus, 2018;10:e3069.',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC6166911/'},
  zigoma:{title:'Relationship between zygomatic process morphology and maxillary sinus pneumatization. The Saudi Dental Journal, 2025. doi: 10.1007/s44445-025-00031-0.',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC12214160/'},
  livro:{title:'Lam & Mallya (eds.). White and Pharoah’s Oral Radiology. 9ª ed. Elsevier, 2025. Referência de aprofundamento; texto integral não reproduzido.',url:'https://shop.elsevier.com/books/white-and-pharoahs-oral-radiology/lam/978-0-443-11871-5'}
};
const def = {
 septo:['Septo nasal','Radiopaco','Divide as cavidades nasais na linha média. Sua porção óssea projeta-se como uma faixa radiopaca acima dos incisivos superiores.',['atlas','livro']],
 concha:['Concha nasal inferior','Radiopaca','Estrutura óssea da parede lateral nasal. Pode aparecer como opacidade arredondada dentro da imagem radiolúcida da cavidade nasal.',['atlas','livro']],
 nasal:['Fossa nasal','Radiolúcida','Espaço aéreo acima dos incisivos superiores, delimitado por corticais radiopacas. A superposição bidimensional modifica seus contornos aparentes.',['atlas','livro']],
 espinha:['Espinha nasal anterior','Radiopaca','Projeção óssea mediana na margem inferior da abertura nasal. Frequentemente apresenta contorno triangular ou em V na região dos incisivos.',['atlas','livro']],
 incisivo:['Forame incisivo','Radiolúcido','Abertura oral do canal nasopalatino, geralmente projetada entre os incisivos centrais. Forma e dimensão variam; a imagem isolada não determina patologia.',['incisivo']],
 sutura:['Sutura intermaxilar','Radiolúcida','Linha de união mediana entre as maxilas. Pode ser observada como traço radiolúcido delgado entre os incisivos centrais.',['atlas','livro']],
 nariz:['Projeção do nariz','Tecidos moles','Contorno dos tecidos moles nasais superposto à radiografia. Sua posição depende da geometria de aquisição, sem representar uma cortical óssea.',['atlas','livro']],
 labio:['Projeção do lábio','Tecidos moles','Limite de tecidos moles que pode cruzar a imagem das coroas. Não deve ser confundido com alteração da estrutura dentária.',['atlas','livro']],
 assoalho:['Assoalho da fossa nasal','Radiopaco','Cortical que delimita inferiormente a cavidade nasal. Na região canina pode encontrar a projeção da parede anterior do seio, formando o Y invertido.',['atlas','livro']],
 parede:['Parede anterior do seio maxilar','Radiopaca','Limite anterior da cavidade sinusal; a extensão do seio em direção à região canina varia entre indivíduos.',['seio','clinica']],
 fossaInc:['Fossa incisiva (mirtiforme)','Radiolúcida','Depressão da face anterior da maxila próxima ao incisivo lateral. Sua menor espessura óssea pode produzir radiolucidez sem doença.',['atlas','livro']],
 processoZ:['Processo zigomático da maxila','Radiopaco','União óssea com o zigomático. Sua projeção sobre a região molar pode ter aspecto em U ou J, variando com a anatomia.',['zigoma']],
 seio:['Seio maxilar','Radiolúcido','Cavidade pneumática da maxila com limites corticais. A proximidade aparente de seu assoalho com raízes não prova contato anatômico tridimensional.',['seio','clinica']],
 septoS:['Septo do seio maxilar','Radiopaco','Lâmina óssea no interior do seio. Pode surgir como linha radiopaca; sua configuração completa não é determinada por uma projeção isolada.',['seio','clinica']],
 zigoma:['Osso zigomático','Radiopaco','Componente do complexo zigomático que pode superpor-se à maxila posterior como área radiopaca, em continuidade com o processo zigomático.',['zigoma','atlas']],
 tuber:['Túber da maxila','Padrão trabecular','Porção posterior arredondada da maxila, distal aos últimos molares. O contorno e o trabeculado ajudam a reconhecer esse limite anatômico.',['atlas','livro']],
 pterigoide:['Processo pterigoide','Radiopaco','Extensão do esfenoide posterior à maxila. Suas lâminas podem projetar-se além do túber em incidências posteriores.',['clinica','atlas']],
 hamulo:['Hâmulo pterigoide','Radiopaco','Pequena projeção em gancho da lâmina medial do processo pterigoide, que pode aparecer posteriormente ao túber.',['atlas','livro']],
 coronoide:['Processo coronoide da mandíbula','Radiopaco','Projeção mandibular que pode sobrepor-se à região posterior da maxila durante a abertura bucal, com aspecto triangular.',['atlas','livro']],
 mentalF:['Fossa mentoniana','Radiolúcida','Depressão vestibular na mandíbula anterior. Pode produzir radiolucidez difusa acima da saliência mentual, conforme a espessura óssea e a projeção.',['atlas','livro']],
 mentual:['Protuberância mentual','Radiopaca','Relevo ósseo da face anterior da mandíbula. A projeção de suas corticais produz faixas radiopacas na região anterior.',['atlas','livro']],
 lingual:['Forame lingual','Radiolúcido','Pequena abertura vascular mediana. Seu halo radiopaco pode corresponder à parede do canal, não exclusivamente aos tubérculos genianos.',['lingual','mandibula']],
 genianos:['Tubérculos genianos','Radiopacos','Relevos da face lingual mandibular, próximos à linha média, para inserções musculares. O halo do forame lingual não os identifica de forma exclusiva.',['lingual','mandibula']],
 borda:['Borda inferior da mandíbula','Radiopaca','Cortical basal densa que aparece como faixa radiopaca quando incluída no campo. Sua ausência na imagem pode decorrer do enquadramento.',['atlas','livro']],
 forame:['Forame mentoniano','Radiolúcido','Abertura neurovascular de posição variável, frequentemente próxima aos pré-molares. Pode superpor-se ao ápice; correlacione com lâmina dura e avaliação clínica.',['mental','mandibula']],
 canal:['Canal da mandíbula','Radiolúcido','Trajeto intraósseo do feixe alveolar inferior. Pode apresentar duas margens corticais; a visibilidade e a relação com as raízes variam.',['mental','mandibula']],
 submand:['Fossa da glândula submandibular','Radiolúcida','Depressão lingual do corpo mandibular, inferior à linha milo-hióidea. Sua menor espessura pode gerar radiolucidez difusa na região posterior.',['atlas','livro']],
 milo:['Linha milo-hióidea','Radiopaca','Crista na face lingual mandibular, geralmente com projeção oblíqua na região molar. Sua posição deve ser interpretada considerando a sobreposição.',['atlas','livro']],
 obliqua:['Linha oblíqua externa','Radiopaca','Crista na face vestibular posterior da mandíbula. Pode aparecer como faixa radiopaca oblíqua próxima à região dos molares.',['atlas','livro']]
};
export const cores=['#f1b915','#18b5a4','#e476b0','#787af0','#f28a50','#31a9e5','#b2bd39','#de6373'];
function s(key,x,y,path){const d=def[key];return {key,x,y,path,name:d[0],type:d[1],text:d[2],refs:d[3]};}
export const regioes=[
 {id:'maxila-incisivos',title:'Incisivos superiores',arch:'Maxila',subtitle:'Linha média e cavidade nasal',w:459,h:679,structures:[
 s('septo',229,14,'M216 0 L247 0 L253 43 Q236 40 221 27 Z'),
 s('concha',365,25,'M303 0 H438 Q420 46 370 67 Q318 64 303 0 Z'),
 s('nasal',288,57,'M253 0 H303 Q312 60 370 68 Q350 103 296 88 Q267 79 253 0 Z'),
 s('espinha',234,123,'M234 47 Q277 69 287 111 L259 163 L231 177 L197 140 L190 105 Z'),
 s('incisivo',245,285,'M216 243 Q251 214 269 258 Q283 281 255 399 Q236 419 213 388 Q188 282 216 243 Z'),
 s('sutura',229,431,'M239 174 Q220 284 227 503'),
 s('nariz',354,320,'M0 240 Q202 397 459 242'),
 s('labio',362,575,'M0 516 Q255 657 459 515') ]},
 {id:'maxila-canino',title:'Canino superior',arch:'Maxila',subtitle:'Encontro das corticais e tecidos moles',w:465,h:669,structures:[
 s('assoalho',389,25,'M0 204 Q228 109 432 0'),
 s('parede',402,180,'M261 112 Q234 244 465 142'),
 s('nariz',255,215,'M0 351 Q253 335 366 5'),
 s('fossaInc',160,332,'M135 246 Q176 248 177 388 L166 463 Q138 445 128 386 Z') ]},
 {id:'maxila-premolares',title:'Pré-molares superiores',arch:'Maxila',subtitle:'Complexo zigomático e seio maxilar',w:736,h:551,structures:[
 s('processoZ',694,60,'M479 0 Q499 116 606 126 H736 V0 H672 Q670 91 590 70 Q550 59 522 0 Z'),
 s('seio',465,43,'M109 0 H735 V116 Q636 142 528 76 Q506 110 433 139 Q345 123 262 87 Z'),
 s('septoS',418,71,'M413 0 Q405 61 435 138') ]},
 {id:'maxila-molares',title:'Molares superiores',arch:'Maxila',subtitle:'Seio, túber e estruturas posteriores',w:731,h:517,structures:[
 s('zigoma',81,61,'M0 0 H170 Q165 171 323 118 Q423 94 460 0 H496 Q478 113 347 171 Q182 184 0 113 Z'),
 s('seio',512,61,'M170 0 H731 V145 Q642 124 588 167 Q525 160 506 135 Q460 116 416 150 Q467 77 496 0 H460 Q411 103 326 119 Q160 166 170 0 Z'),
 s('tuber',82,226,'M29 120 Q93 125 126 151 L147 339 Q99 347 59 300 Z'),
 s('pterigoide',20,206,'M0 117 Q32 137 36 190 L59 279 L23 290 L0 252 Z'),
 s('hamulo',38,340,'M0 290 Q44 315 62 348 Q62 389 23 378 Z'),
 s('coronoide',108,446,'M0 435 Q146 355 176 468 L161 517 H0 Z') ]},
 {id:'mandibula-incisivos',title:'Incisivos inferiores',arch:'Mandíbula',subtitle:'Sínfise e referências linguais',w:423,h:675,structures:[
 s('mentalF',193,283,'M0 247 Q193 198 423 274 V383 Q215 416 0 378 Z'),
 s('mentual',104,557,'M0 604 Q111 523 165 463 L158 504 Q114 587 0 675 Z M260 465 Q313 531 423 602 V675 Q309 625 258 538 Z'),
 s('lingual',210,610,'M196 607 A15 15 0 1 0 226 607 A15 15 0 1 0 196 607 Z'),
 s('genianos',228,639,'M174 609 A38 38 0 1 0 250 609 A38 38 0 1 0 174 609 Z') ]},
 {id:'mandibula-canino',title:'Canino inferior',arch:'Mandíbula',subtitle:'Base mandibular e região mentual',w:489,h:675,structures:[
 s('borda',210,625,'M0 617 Q184 571 489 640 V675 H0 Z'),
 s('mentual',107,495,'M0 400 Q66 471 148 499 L163 557 Q64 522 0 454 Z'),
 s('forame',395,484,'M356 483 Q357 449 393 463 Q433 478 426 511 Q380 527 356 483 Z') ]},
 {id:'mandibula-premolares',title:'Pré-molares inferiores',arch:'Mandíbula',subtitle:'Forame mentoniano e canal mandibular',w:653,h:492,structures:[
 s('forame',207,435,'M178 432 Q184 400 218 411 Q246 430 229 456 Q189 469 178 432 Z'),
 s('canal',448,461,'M233 445 Q414 476 653 431 L653 469 Q396 498 246 478 Z'),
 s('submand',592,479,'M413 423 Q528 399 653 385 V492 H360 Z'),
 s('milo',561,382,'M408 420 Q543 397 653 351') ]},
 {id:'mandibula-molares',title:'Molares inferiores',arch:'Mandíbula',subtitle:'Cristas ósseas e espaços radiolúcidos',w:716,h:559,structures:[
 s('obliqua',598,139,'M428 252 Q603 150 716 64'),
 s('milo',595,328,'M311 428 Q536 365 716 260'),
 s('canal',495,482,'M37 499 Q300 524 716 419 L716 459 Q319 561 45 539 Z'),
 s('submand',641,471,'M399 462 Q549 409 716 337 V526 L466 531 Z'),
 s('forame',24,519,'M0 489 Q34 479 43 510 Q53 550 24 547 L0 539 Z') ]}
];
