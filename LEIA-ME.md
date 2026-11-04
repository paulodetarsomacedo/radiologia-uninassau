# UNINASSAU · Radiologia

Aplicativo mobile em HTML, CSS e JavaScript, com identidade UNINASSAU, para estudo de anatomia radiográfica intraoral, análise de imagens e elaboração de laudos acadêmicos. Compatível com hospedagem estática; a entrega direta opcional utiliza uma função Node na Vercel.

## Publicar na Vercel

1. Extraia o ZIP. A pasta que contém `index.html` é a raiz do projeto.
2. Importe essa pasta em um repositório Git e, na Vercel, selecione **Add New → Project**. Ou abra o Terminal dentro da pasta e execute `npx vercel --prod`.
3. Selecione **Framework Preset: Other**. Não há comando de build. Use a própria raiz (`.`) como diretório de saída, se o painel solicitar.
4. Publique e abra o endereço HTTPS no Safari do iPhone e no Chrome do Android.
5. Em `config.json`, você pode definir previamente WhatsApp, e-mail e unidade. Use o número no formato internacional, por exemplo `55` + DDD + número, sem pontuação. Também é possível cadastrar os destinatários pelo botão de perfil no aplicativo.

Não é necessário executar `npm install` para usar o app. Bibliotecas, modelo de IA e imagens já estão incluídos. Não abra o HTML por `file://`: módulos, armazenamento, compartilhamento e processamento exigem servidor HTTP/HTTPS.

## Estudo

Oito regiões, com as 37 marcações dos desenhos fornecidos pelo professor. Toque no número para destacar e revelar a estrutura; toque em seu nome para ler o resumo e acessar as referências científicas. O botão de expansão permite ampliar o esquema.

Os desenhos foram recortados para separar a legenda, preservando a resolução e os pixels originais. As marcações e áreas coloridas usam SVG e permanecem nítidas ao ampliar; não se afirma que os desenhos ganharam detalhes inexistentes no material original. As áreas coloridas são guias didáticos e não segmentação de exames.

Textos originais e breves, baseados em artigos científicos. O atlas contém referências clicáveis e uma bibliografia de aprofundamento. A revisão pedagógica final cabe ao docente, especialmente quanto à nomenclatura adotada em aula.

## Análise

- **Digitalizar:** abre a captura pela câmera traseira em dispositivos compatíveis. A interface de captura é a do sistema do celular.
- **Abrir imagem:** abre o seletor do sistema. Aceita arquivos de imagem disponíveis em Fotos/Arquivos. Para uma imagem recebida no WhatsApp, salve-a em Fotos ou Arquivos caso o seletor não a apresente diretamente.
- JPEG, PNG, WebP e demais formatos decodificados pelo navegador. HEIC/TIFF/DICOM não têm suporte garantido; exporte em JPEG/PNG quando necessário. O aplicativo não é um visualizador DICOM.
- Recorte com quatro cantos ajustáveis e sugestão heurística para filme escuro cercado por luz branca/azulada. A detecção usa brilho, cor, conectividade e proporção. Pode falhar em reflexos, fundo escuro ou baixo contraste: revise sempre. O recorte é retangular e não retifica perspectiva.
- Brilho, contraste, nitidez e detalhe local; cinza por luminância, inversão e rotação.
- Setas, linhas, curvas suaves por pontos, polígonos e texto. Cor, espessura, apagar e desfazer. Selecione Curva ou Polígono, toque nos pontos e depois em **Concluir forma**.
- **Mover:** um dedo desloca; dois dedos ampliam/deslocam. Nas ferramentas de desenho, um dedo insere o objeto e dois dedos navegam. A entrada do segundo dedo cancela a inserção em curso. Roda do mouse/trackpad amplia no computador.
- **Medir:** pixels até definir uma escala. **Escala:** trace um segmento de referência e informe seu comprimento real em mm. A calibração não elimina distorção geométrica da fotografia nem da radiografia.
- **Original:** restaura a cópia de trabalho inicial. Desfazer pode recuperar a edição anterior.

A cópia de trabalho tem lado maior de até 2.400 px, para conter o consumo de memória em celulares. O arquivo original permanece armazenado no dispositivo. Exportações com anotações usam a resolução da cópia de trabalho. Use imagens de até 60 MB.

## IA 2×

Rede neural ESRGAN Slim 2× real, via TensorFlow.js/UpscalerJS. Pesos e bibliotecas são carregados da própria hospedagem, sem envio da radiografia. O processamento é por blocos, com progresso e cancelamento. A entrada pode ser limitada a 512, 1.024 ou 1.536 px no lado maior; a saída terá o dobro das dimensões da entrada efetivamente processada. Uma fonte menor não é reduzida.

A divisória vertical permite comparar antes/depois. O resultado pode ser salvo separadamente. A IA não é incorporada automaticamente à imagem ou ao PDF do laudo: o modelo foi treinado com fotografias gerais, não validado para diagnóstico odontológico, e pode sintetizar detalhes. Confirme qualquer achado na imagem original.

Desempenho depende de memória e aceleração do aparelho. O app informa falhas sem substituir silenciosamente a IA por simples interpolação.

## Diagnóstico e PDF

Campos de exame, origem digital/digitalizada, região, indicação, data, paciente/código, turma, aluno e matrícula. Cada Enter no editor cria um tópico. Shift + Enter continua dentro do tópico. A colagem de várias linhas cria vários tópicos. A conclusão é independente.

A assinatura é desenhada na tela e reutilizada nos próximos laudos no mesmo navegador. Trata-se de assinatura manuscrita eletrônica, sem certificado digital ou verificação de identidade.

O PDF contém logo, cabeçalho, tipo de exame, identificação, indicação, achados em tópicos, conclusão, data, assinatura e paginação. A imagem anotada é opcional. Nomes, matrícula, região, indicação, achados, conclusão, imagem e assinatura devem estar preenchidos conforme as validações da interface. Textos extensos são paginados.

O download é solicitado ao navegador. Após gerar, o app também mantém links **Baixar novamente** e **Visualizar**. No iPhone, se o sistema abrir a prévia, utilize Compartilhar → Salvar em Arquivos.

## Enviar ao professor

### Sem serviços pagos ou credenciais

**Enviar** gera o PDF e solicita o download primeiro. Depois, **Compartilhar PDF** abre a folha de compartilhamento do celular, quando o navegador permite compartilhar arquivos. Escolha WhatsApp ou e-mail, selecione o professor e confirme. Para mandar pelos dois canais, repita o compartilhamento.

Os atalhos **WhatsApp do professor** e **E-mail do professor** preenchem destinatário/mensagem, mas não conseguem anexar automaticamente o PDF. Anexe o arquivo salvo. Um HTML sozinho não pode enviar silenciosamente mensagens ou anexar arquivos a `mailto:`/`wa.me`.

### Entrega direta opcional pela Vercel

A função `api/enviar.js` está pronta para receber o PDF e encaminhá-lo aos canais configurados, após o aluno informar a chave da turma e confirmar a entrega. Nada é enviado enquanto a infraestrutura não estiver configurada.

Configure as variáveis de `.env.example` em **Vercel → Project → Settings → Environment Variables**. Nunca coloque tokens no HTML, JavaScript público ou `config.json`.

Obrigatórias para qualquer entrega direta:

- `APP_ORIGIN`: origem HTTPS exata do app, sem barra final.
- `SUBMISSION_KEY`: chave aleatória com pelo menos 16 caracteres, fornecida à turma.
- `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`: Redis para limitar tentativas e registrar o estado das entregas.

Para e-mail: `RESEND_API_KEY`, `RESEND_FROM` com domínio/remetente verificado e `TEACHER_EMAIL`.

Para WhatsApp: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `TEACHER_WHATSAPP`, `WHATSAPP_GRAPH_VERSION`, `WHATSAPP_TEMPLATE_NAME` e `WHATSAPP_TEMPLATE_LANGUAGE`. O remetente deve ser uma conta WhatsApp Business/API; seu WhatsApp pessoal pode ser o destinatário, com o consentimento e habilitação exigidos pela Meta. Não é necessário transformar seu número pessoal em remetente API.

Crie um template aprovado no WhatsApp Manager com cabeçalho **DOCUMENT** e dois parâmetros posicionais no corpo, nesta ordem: aluno e matrícula. Exemplo de corpo: “Recebemos o laudo acadêmico de {{1}}, matrícula {{2}}. O documento segue em anexo.” O nome/idioma do template devem corresponder às variáveis. Consulte a versão ativa da Graph API na conta; não use literalmente `vXX.X`.

Há limite de 2,8 MB por PDF para a entrega direta, validação do tipo, destinatários fixos no servidor, verificação de origem e de chave, limite de tentativas e registro de canais já aceitos. O Redis guarda hash/identificadores de entrega por sete dias, não o conteúdo do PDF. Resend e Meta recebem o PDF quando o aluno entrega; configure sua política institucional para esse uso. Os serviços podem ter custos.

O retorno informa aceitação pelo provedor por canal. Isso não comprova entrega final nem leitura. Uma falha parcial pode ser repetida; os canais registrados como concluídos são ignorados. Falhas de rede após aceitação de um provedor ainda podem exigir conferência, especialmente no WhatsApp.

## Dados, acesso e instalação

Imagem, rascunho, perfil e assinatura ficam no IndexedDB do navegador. **Iniciar novo caso** limpa imagem e laudo, preservando perfil/assinatura. **Perfil → Dados e privacidade → Apagar todos os dados** limpa tudo. Dados locais não são compartilhados entre alunos, aparelhos ou navegadores e não substituem backup. Em aparelhos compartilhados, encerre o caso e apague os dados pessoais ao final.

O aplicativo tem identidade exclusiva UNINASSAU. Não inclui autenticação institucional nem verificação de matrícula. Se for necessário restringir o acesso a alunos da instituição, configure proteção de acesso na hospedagem ou integre o SSO institucional.

Pode ser adicionado à tela inicial no Safari/Chrome compatíveis. O núcleo fica disponível offline após carregado; a IA também pode reutilizar seus arquivos após o primeiro carregamento completo. Envio direto exige conexão. Atualizações do conteúdo são buscadas pela rede quando disponível.

## Validação realizada

Revisão visual em navegador Chromium, em desktop e em uma moldura de 390 px. Exercitados: seleção anatômica, importação de imagem simulada, recorte automático, seta, cinza, ajustes, restauração de rascunho e assinatura. A rede neural executou uma ampliação de 37 × 48 para 74 × 96 px no navegador, com divisória antes/depois; o carregamento e a inferência do modelo também foram verificados numericamente em CPU. A amostra pequena valida o funcionamento, não o desempenho em imagens grandes. O mesmo gerador PDF foi testado com relatório curto e relatório de 55 tópicos, incluindo imagem, assinatura e múltiplas páginas, com inspeção do resultado renderizado. Testes numéricos verificaram filtros e detector de filme; testes com serviços simulados verificaram autenticação, origem, validação de PDF, destinatário fixo e repetição de e-mail sem novo envio.

Câmera física, gestos multitouch, permissões de compartilhamento/download e desempenho da IA devem ser homologados no Safari/iPhone e Chrome/Android reais. O ambiente de revisão não forneceu o download de Blob ao controlador do navegador; a geração e a estrutura do PDF foram verificadas separadamente. Entregas reais dependem das credenciais e da homologação dos provedores, não foram efetuadas durante a criação.

## Estrutura

- `index.html`, `style.css`, `app.js`: interface e fluxo.
- `anatomia.js`, `assets/`: esquemas, marcações e conteúdo.
- `imagem.js`, `image-worker.js`, `recorte.js`: análise, gestos, filtros e recorte.
- `laudo.js`: PDF paginado.
- `core.js`: armazenamento e utilidades.
- `vendor/`, `models/2x/`: bibliotecas e pesos locais.
- `api/enviar.js`: entrega direta opcional.
- `config.json`, `vercel.json`, `manifest.webmanifest`, `sw.js`: configuração, hospedagem e instalação.

Bibliotecas incluídas: jsPDF 4.2.1 (MIT), TensorFlow.js 4.11.0 (Apache 2.0), UpscalerJS 1.0.0 e ESRGAN Slim 1.0.0 (MIT). Licenças em `vendor/licenses/`. Logo e desenhos são os arquivos fornecidos para este projeto.
