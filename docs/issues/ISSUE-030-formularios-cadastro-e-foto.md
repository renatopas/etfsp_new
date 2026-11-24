# ISSUE-030 — Formulários de cadastro e envio de foto

**Estado:** Aguardando validação

**Área:** Cadastro e envio de fotos

**Rotas afetadas:** `/novocadastro`, `/cadfoto`

**Depende de:** ISSUE-023 e ISSUE-024

## Contexto

Os dois formulários seguem o modelo de página única com seções, mas usam
padrões visuais diferentes:

- o cadastro indica obrigatoriedade com “(*)” e usa blocos sobre fundo azulado;
- o envio de foto escreve “obrigatório” ao lado do rótulo e usa blocos
  brancos, com subgrupos azulados para as perguntas Sim/Não.

No envio de foto:

- o campo técnico “ID do ex-aluno” fica sempre visível, embora a
  especificação o preveja apenas como alternativa sem JavaScript;
- “É carômetro?” e “É foto pessoal?” usam rádios simples empilhados;
- o seletor de arquivo é o padrão do navegador, sem área para arrastar e
  soltar;
- “Ano da foto” e “Ano de formatura” ocupam meia largura cada, em linhas
  separadas.

## Modificação proposta

### Padrões comuns aos dois formulários

- Uma única convenção de obrigatoriedade: marcar os **opcionais** com
  “(opcional)” quando a maioria dos campos for obrigatória, ou os obrigatórios
  com “(obrigatório)”, escolhendo a que gerar menos marcações em cada
  formulário. Nunca depender só de asterisco ou de cor.
- Seções (`FormSection`) com o mesmo estilo nos dois formulários: título `h2`,
  descrição curta opcional e superfície consistente.
- Campos com a mesma altura, borda e estados (foco, erro, desabilitado).
- Resumo de erros no topo com foco programático, como prevê o design system.
- Botão de envio com estado ocupado.

### Envio de foto

- **Identificação:** com JavaScript, mostrar apenas a busca por nome e, após a
  escolha, o resumo com “Trocar”. O campo manual de ID só aparece sem
  JavaScript (por exemplo, dentro de `<noscript>` ou exibido por padrão e
  ocultado após a hidratação).
- **Arquivo:** área de arrastar e soltar com o botão “Escolher foto”, prévia
  da imagem selecionada (a prévia já existe no componente), nome e tamanho do
  arquivo, e aviso imediato quando passar de 5 MB ou não for um formato
  aceito. A validação real continua no servidor com `sharp`.
- **Perguntas Sim/Não:** rádios estilizados como opções lado a lado (“Não” /
  “Sim”), com o texto de ajuda logo abaixo da pergunta.
- **Anos:** “Ano da foto” e “Ano de formatura” lado a lado quando houver
  espaço.

### Cadastro

- Aplicar os padrões comuns sem alterar campos, ordem, regras de validação ou
  textos de privacidade aprovados na ISSUE-009.
- Turnstile com espaço reservado, para não deslocar o botão ao carregar.

## Fora do escopo

- Alterar campos, obrigatoriedade, limites de upload, formatos aceitos ou
  validações do servidor.
- Envio de várias fotos de uma vez.
- Recorte ou edição da imagem no navegador.
- Autenticação ou verificação de identidade.

## Critérios de aceite

- Os dois formulários usam a mesma convenção de obrigatoriedade e o mesmo
  estilo de seção e campo.
- Com JavaScript, o campo “ID do ex-aluno” não aparece; sem JavaScript, ele
  aparece e o envio funciona.
- Arrastar um arquivo para a área seleciona o arquivo e mostra a prévia;
  clicar ou tocar abre o seletor nativo.
- Um arquivo acima de 5 MB ou de formato não aceito gera aviso antes do envio,
  e o servidor continua rejeitando-o se o aviso for contornado.
- As perguntas Sim/Não podem ser respondidas por toque e por teclado e
  mostram claramente a opção escolhida.
- Erros aparecem junto ao campo e no resumo, e o foco vai para o resumo.
- Nenhum dado novo é registrado em log ou enviado ao navegador.
- Sem rolagem horizontal em 320 px.
- `pnpm run validate` passa.

## Validação manual sugerida

Enviar cadastro e foto com sucesso e com erros em cada campo, com e sem
JavaScript, em 390 px e 1366 px. Testar arrastar e soltar no computador e o
seletor de arquivo no celular (câmera e galeria). Usar sempre uma cópia
descartável de banco e de `FOTOS_DIR`.

## Documentos complementares

### Ler antes da implementação

- `docs/redesign/functional-spec.md`, seções 6 e 8.
- `docs/redesign/design-system.md`, seção 5 (campos de formulário,
  `FormSection`, `ErrorSummary`).
- `docs/issues/ISSUE-009-simplificar-formulario-cadastro.md`.

### Atualizar ao implementar

- `docs/redesign/functional-spec.md`, seção 8 (exibição do campo de ID e área
  de arquivo).
- `docs/redesign/design-system.md`: `FileField` e convenção de obrigatoriedade.
- Esta issue, com o resultado e o estado final.

## Arquivos de código previstos

- `src/routes/novocadastro/Formulario.svelte`
- `src/routes/cadfoto/Formulario.svelte`
- `src/lib/components/` (componentes de campo, se extraídos)

Não há alteração server-side, de schema ou de migração.
