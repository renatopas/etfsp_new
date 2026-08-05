# ISSUE-009 — Simplificar e melhorar o formulário de cadastro

**Estado:** Aguardando validação

**Área:** Cadastro de ex-alunos

**Rotas afetadas:** `/novocadastro` e, para refletir a publicação dos contatos,
`/detalhe_exaluno`

## Contexto

O formulário de cadastro solicita dados públicos e internos em uma única página
e repete instruções de publicação em vários campos. Isso torna o preenchimento
mais longo e visualmente carregado.

Além disso, os campos possuem pouco contraste em relação ao fundo dos blocos,
prejudicando a identificação das áreas editáveis. A simplificação deve coletar
somente dados destinados ao perfil público, preservar a identidade visual do
site e melhorar a hierarquia do formulário sem promover um redesign amplo.

## Modificação proposta

Reduzir o cadastro a três blocos enxutos:

1. “Dados principais”;
2. “Contato — informe pelo menos um”;
3. “Texto para seu perfil”.

Todos os dados solicitados passarão a ter finalidade pública. A página deve
explicar essa regra uma única vez antes dos blocos, em vez de repetir a mesma
instrução em cada campo.

## Estrutura e ordem dos campos

### Bloco 1 — Dados principais

| Campo             | Obrigatório | Regra vigente a preservar                              |
| ----------------- | ----------- | ------------------------------------------------------ |
| Nome              | sim         | nome completo, entre 5 e 120 caracteres                |
| Apelido           | não         | até 80 caracteres                                      |
| Curso             | sim         | valor da allowlist canônica de cursos                  |
| Ano em que entrou | sim         | quatro dígitos, entre 1909 e o ano civil atual         |
| Ano em que saiu   | sim         | mesmo intervalo e igual ou posterior ao ano de entrada |

### Bloco 2 — Contato

O título ou a descrição do bloco deve informar “Informe pelo menos um”. Nenhum
campo individual é obrigatório, mas o conjunto deve conter ao menos um contato
preenchido e válido.

| Campo          | Coluna      | Regra quando preenchido                                 |
| -------------- | ----------- | ------------------------------------------------------- |
| E-mail         | `Email`     | um único endereço válido                                |
| WhatsApp       | `WhatsApp`  | número internacional normalizado; público               |
| Instagram      | `Instagram` | URL HTTPS válida no domínio oficial; até 500 caracteres |
| Facebook       | `Facebook`  | URL HTTPS válida no domínio oficial; até 500 caracteres |
| LinkedIn       | `LinkedIn`  | URL HTTPS válida no domínio oficial; até 500 caracteres |
| Página pessoal | `HomePage`  | URL HTTP ou HTTPS válida; manter a normalização vigente |

### Contrato do WhatsApp

- Criar uma coluna opcional `WhatsApp TEXT` em `ExAlunos`, independente de
  `Telefone`.
- O formulário deve aceitar espaços, parênteses e hífens apenas como
  conveniência de digitação, mas exigir código do país.
- Normalizar no servidor para o formato E.164: sinal `+` seguido de 8 a 15
  dígitos, sem espaços ou pontuação.
- Rejeitar letras, ramal, ausência de código do país, mais de 15 dígitos e
  valores que não resultem no formato definido.
- Usar `type="tel"`, `inputmode="tel"` e `autocomplete="tel"` para
  usabilidade. O placeholder pode mostrar um exemplo como `+55 11 99999-9999`.
- Campo vazio deve ser persistido como `NULL`.
- Centralizar normalização e validação em código server-only reutilizado pelo
  cadastro e pelo perfil.

### Bloco 3 — Texto para seu perfil

- Um único campo de texto longo, opcional, persistido em `DadoPubl`.
- Usar o rótulo “Texto para seu perfil”.
- Manter o limite de 2.000 caracteres.
- Não exibir uma instrução redundante dizendo que o texto será público, pois a
  finalidade pública será explicada uma vez para todo o formulário.

## Regras de obrigatoriedade e conteúdo

- Antes dos blocos, apresentar de forma concisa:
  - “Todos os dados informados serão publicados no seu perfil.”
  - “(\*) Campo obrigatório.”
- Marcar visual e textualmente com `(*)` apenas Nome, Curso, Ano em que entrou e
  Ano em que saiu.
- Não marcar cada contato individual como obrigatório.
- Remover instruções repetidas como “Informe a URL HTTPS completa. Ela será
  publicada no seu perfil.” de cada rede social.
- Placeholders podem exemplificar o formato, mas não substituem rótulos nem
  mensagens de erro.
- Manter mensagens específicas quando um valor preenchido for inválido. A
  remoção de instruções repetidas não autoriza mensagens de erro genéricas.
- Manter o Turnstile imediatamente antes da ação de envio.
- Manter o aviso e o contato destinados a quem precisa corrigir um cadastro já
  existente.
- Todo o conteúdo permanece em português.

## Regra de contato mínimo

- Após aparar espaços e validar cada valor, o servidor deve exigir ao menos um
  dos seis contatos válidos.
- Valores preenchidos, porém inválidos, não satisfazem a regra de contato
  mínimo.
- Quando nenhum contato for informado, apresentar uma mensagem clara associada
  ao bloco, por exemplo: “Informe pelo menos uma forma de contato.”
- Quando houver contato preenchido e inválido, manter o erro específico junto
  ao campo. A mensagem do bloco pode ser omitida se a correção desse campo for
  suficiente para satisfazer a regra.
- O resumo de erros deve apontar para o bloco ou para o primeiro campo de
  contato relevante, sem criar link para um identificador inexistente.
- A validação deve ocorrer no servidor. Recursos nativos do navegador ou
  JavaScript servem apenas como apoio de usabilidade.

## Mudanças de privacidade e persistência

Esta issue altera explicitamente o contrato dos novos cadastros:

- `Email` deixa de ser obrigatório e pode ser persistido como `NULL`.
- E-mail informado continua público; novos registros mantêm
  `OcultarEmail = 0`.
- `WhatsApp` é um novo campo público e não utiliza `PublicaTelefone`.
- `Telefone` deixa de ser solicitado e permanece um campo histórico sujeito à
  regra de visibilidade `PublicaTelefone`.
- Novos cadastros devem omitir `Telefone` e `PublicaTelefone` do `INSERT`,
  mantendo respectivamente `NULL` e o padrão privado `0`.
- Redes sociais, página pessoal, nome, apelido, curso, anos e `DadoPubl`
  continuam ou passam a ser públicos quando preenchidos.
- O formulário deve enviar e o servidor deve devolver em falhas apenas os
  campos que ainda são coletados.
- O `INSERT` deve omitir os dados internos removidos. Não enviar valores vazios
  ou padrões para simular seu preenchimento.
- Campos opcionais vazios devem ser persistidos como `NULL`.
- Consultas permanecem parametrizadas e a gravação deve ser aguardada antes de
  retornar sucesso.

As novas regras valem para cadastros realizados após a implementação. Não
alterar em massa flags, contatos ou dados de ex-alunos já cadastrados.

## Dados que deixam de ser solicitados

Remover integralmente da interface, extração de `FormData`, tipos de valores,
validação, retorno de erros e `INSERT`:

- Endereço;
- Cidade;
- Estado;
- CEP;
- País;
- Como encontrou o site;
- Detalhes de como encontrou o site.
- Telefone.

Um POST manipulado contendo qualquer um desses campos deve ser ignorado. O valor
não pode chegar ao banco, aos dados devolvidos pela action, a logs ou a
mensagens de erro.

As colunas históricas, inclusive `Telefone` e `PublicaTelefone`, devem
permanecer no schema e os dados existentes devem ser preservados. Esta issue não
autoriza apagar colunas nem limpar registros anteriores.

## Schema e migração

- Adicionar `WhatsApp TEXT` à tabela `ExAlunos` em `scripts/initial.sql`.
- Acrescentar uma nova migração incremental, versionada e idempotente ao
  mecanismo criado na ISSUE-008.
- Na inicialização, verificar `PRAGMA table_info(ExAlunos)` e executar
  `ALTER TABLE ExAlunos ADD COLUMN WhatsApp TEXT` somente quando a coluna não
  existir.
- Aplicar a migração antes de disponibilizar a conexão às rotas, usando a
  transação e a proteção para inicializações concorrentes já existentes.
- Registrar a nova migração em `SchemaMigrations` com identificador estável.
- Bancos novos, legados, parcialmente migrados e inicializações repetidas não
  podem perder dados nem falhar por coluna duplicada.
- Atualizar `scripts/make_db.py` para importar `WhatsApp` somente quando a
  coluna existir na fonte e o valor puder ser normalizado; caso contrário,
  persistir `NULL`.
- Não adicionar `WhatsApp` à view `qryExAlunos` sem um consumidor real. O
  detalhe consulta `ExAlunos` diretamente.

## Apresentação no perfil público

- O detalhe do ex-aluno deve continuar aplicando no servidor
  `OcultarEmail = 0`, `PublicaTelefone = 1` e `Excluido = 0`.
- Telefones históricos continuam aparecendo como “Telefone” somente quando
  `PublicaTelefone = 1`; a mudança não os transforma em WhatsApp.
- Selecionar `WhatsApp` explicitamente, validá-lo novamente no servidor e
  omitir valores inválidos do objeto público.
- Exibir o novo contato com o rótulo “WhatsApp” e link HTTPS para
  `https://wa.me/<numero>`, usando apenas os dígitos do valor E.164.
- O link do WhatsApp deve abrir em nova aba ou janela, possuir nome acessível
  que avise esse comportamento e usar `rel="noopener noreferrer"`.
- Usar ícone local e nome textual; não carregar scripts, fontes ou imagens dos
  servidores do WhatsApp.
- Preservar a validação e a abertura segura dos links de redes sociais
  implementadas na ISSUE-008.
- Não ampliar as consultas públicas com os campos internos removidos do
  formulário.

## Melhorias visuais

- Preservar os tokens, tipografia e identidade visual atuais.
- Tornar os três blocos facilmente distinguíveis por título, espaçamento,
  borda e/ou diferença sutil de superfície.
- Aumentar o contraste entre controles editáveis e o fundo do bloco. Os campos
  devem possuir fundo próprio, borda perceptível e estados de foco e erro
  claramente distintos.
- Usar tokens globais existentes sempre que suficientes. Se for necessário
  criar um novo token de superfície ou borda, documentá-lo e aplicá-lo de forma
  reutilizável, sem valor isolado difícil de manter.
- Não depender apenas de cor para indicar foco, erro ou obrigatoriedade.
- Manter altura mínima de 44 px nos controles de uma linha e área de foco
  visível.
- Organizar os dois campos de ano lado a lado apenas quando houver espaço; em
  telas estreitas, mantê-los empilhados.
- Os seis contatos podem usar uma grade responsiva, desde que ordem de leitura,
  associação entre rótulo, ajuda e erro e navegação por teclado permaneçam
  previsíveis.
- Evitar caixas aninhadas, textos auxiliares repetidos e espaçamento excessivo.
- Não introduzir framework visual, biblioteca de componentes ou ícones
  externos.
- Não provocar rolagem horizontal a partir de 320 px e preservar uso com zoom
  de 200%.

## Fora do escopo

- Remover do banco as colunas que deixam de ser coletadas.
- Limpar, publicar ou alterar dados internos de registros existentes.
- Criar edição autenticada de cadastro.
- Adicionar novas formas de contato além das seis especificadas.
- Verificar externamente se e-mail, número de WhatsApp ou perfil social
  realmente existe.
- Implementar API, autenticação ou envio de mensagens pelo WhatsApp, login
  social ou APIs de redes sociais.
- Redesenhar outras páginas ou a identidade visual completa do site.
- Alterar as regras de Turnstile.

## Critérios de aceite

- O formulário contém exatamente os três blocos e os campos definidos nesta
  issue, na ordem especificada.
- Nome, Curso, Ano em que entrou e Ano em que saiu são os únicos campos
  individualmente obrigatórios.
- A regra de campos obrigatórios e a finalidade pública dos dados aparecem uma
  única vez, antes dos blocos.
- O formulário não repete em cada contato que o dado será publicado.
- Cadastro sem contato válido é rejeitado no servidor com mensagem associada
  ao bloco de contato.
- Cadastro com qualquer uma das seis formas de contato válida pode ser
  concluído, desde que os demais campos obrigatórios sejam válidos.
- E-mail vazio é armazenado como `NULL`; e-mail preenchido continua público.
- WhatsApp válido é normalizado para E.164, persistido na nova coluna e aparece
  no perfil com link seguro para `wa.me`.
- WhatsApp vazio é armazenado como `NULL`; valor inválido é rejeitado no
  servidor e não satisfaz a regra de contato mínimo.
- O cadastro não apresenta, lê, valida, devolve nem persiste `Telefone`, mesmo
  quando esse campo é enviado em um POST manipulado.
- Telefones históricos e suas flags não são alterados.
- Os campos internos removidos não aparecem no HTML e são ignorados até quando
  enviados em um POST manipulado.
- Nenhuma coluna ou dado histórico é apagado.
- Valores válidos são preservados após falha de outro campo.
- O formulário possui contraste perceptível entre campos e fundo, foco visível,
  erros não indicados apenas por cor e navegação completa por teclado.
- O layout funciona em 320, 390, 768, 1024 e 1440 px, além de zoom de 200%, sem
  rolagem horizontal.
- O Turnstile e o fluxo de sucesso continuam funcionando.
- Nenhum dado pessoal é escrito em logs ou mensagens técnicas.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passam.

## Validação manual sugerida

Testar cadastro com cada contato isoladamente; vários contatos; nenhum contato;
um contato inválido; contato inválido junto de outro válido; todos os campos
opcionais vazios; e falha de Turnstile após preencher dados válidos.

Enviar manualmente os campos internos removidos e confirmar que são ignorados.
Conferir no banco de teste `NULL` para opcionais vazios, `OcultarEmail = 0`,
`Telefone = NULL`, `PublicaTelefone = 0` e WhatsApp normalizado quando
informado. Inspecionar o perfil criado e o payload serializado.

Validar a migração com banco novo, banco legado sem `WhatsApp`, banco já migrado
e duas inicializações consecutivas.

Validar visualmente os estados normal, foco, preenchido, inválido e desabilitado
dos controles nos tamanhos definidos nos critérios de aceite, somente com
teclado e com zoom de 200%.

## Documentos complementares

### Ler antes da implementação

- `AGENTS.md`, especialmente privacidade, validação server-side, SQL
  parametrizado e preservação do schema histórico.
- `docs/issues/ISSUE-008-redes-sociais-exalunos.md`, para o contrato de redes
  sociais já implementado.
- `docs/redesign/functional-spec.md`, seções de cadastro e perfil.
- `docs/redesign/privacy-data.md`, especialmente regras para novos cadastros.
- `docs/redesign/design-system.md`, para campos, seções, contraste, foco,
  responsividade e mensagens de erro.
- `scripts/initial.sql` e o mecanismo de migrações server-only criado na
  ISSUE-008.

### Atualizar ao implementar

- `docs/redesign/functional-spec.md`, substituindo a estrutura, campos,
  obrigatoriedade e regras de contato do cadastro.
- `docs/redesign/privacy-data.md`, registrando e-mail opcional, WhatsApp público
  e a interrupção da coleta de telefone e dos demais dados internos.
- `docs/redesign/design-system.md`, registrando qualquer ajuste de superfície,
  borda, foco ou composição visual reutilizável.
- `docs/redesign/implementation-plan.md`, atualizando as tarefas de cadastro e
  validação.
- Esta issue, registrando resultado, validações e estado final.

## Arquivos de código previstos

- `src/routes/novocadastro/+page.server.ts`.
- `src/routes/novocadastro/Formulario.svelte`.
- `src/lib/server/migrations.ts`.
- Novo módulo server-only de validação de WhatsApp, ou módulo de contatos
  existente se houver local adequado.
- `src/lib/domain.ts`.
- `src/routes/detalhe_exaluno/+page.server.ts`.
- `src/routes/detalhe_exaluno/+page.svelte`.
- `scripts/initial.sql`.
- `scripts/make_db.py`.
- `src/app.css`, somente se a melhoria de contraste exigir tokens globais.
- Componentes compartilhados de formulário, apenas se reduzirem duplicação sem
  ampliar o escopo.

Não se prevê mudança na view `qryExAlunos`.
