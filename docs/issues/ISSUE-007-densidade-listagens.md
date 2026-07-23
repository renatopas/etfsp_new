# ISSUE-007 — Aumentar a densidade das listagens

**Estado:** Concluída
**Áreas:** Relação de ex-alunos e galeria de fotos
**Rotas afetadas:** `/exalunos_lista` e `/lista_foto`

## Contexto

As duas listagens exibem pouco conteúdo por página: a relação de ex-alunos usa
30 registros e a galeria usa 24 fotos. A relação também usa cartões com espaço
vertical elevado para a quantidade de dados mostrados. Na galeria, a área da
miniatura pode exibi-la maior do que a resolução baixa do arquivo armazenado,
resultando em ampliação visual de baixa qualidade.

## Modificação proposta

Tornar as listagens mais densas, sem remover informações públicas necessárias:

- exibir 300 ex-alunos por página e tornar o cartão de ex-aluno mais compacto
  verticalmente;
- exibir 100 fotos por página e reduzir o espaço de miniatura na galeria,
  evitando ampliar miniaturas além de sua resolução armazenada.

## Regras a atender

### Relação de ex-alunos

- Definir o tamanho de página como 300 registros na consulta, contagem e
  paginação de `/exalunos_lista`.
- Compactar o cartão verticalmente por meio de espaçamento, tipografia e área de
  foto proporcionais, sem ocultar nome, apelido quando existente, curso,
  período ou acesso ao perfil.
- Manter a área do nome e a miniatura clicáveis; não repetir um link textual ao
  perfil com a mesma função.
- Miniaturas devem manter proporção, ter espaço reservado e usar carregamento
  tardio quando estiverem fora da área inicial, pois uma página pode conter 300
  itens.
- Preservar busca, curso, ordenação, recentes e paginação em todas as URLs e
  links gerados.

### Galeria de fotos

- Definir o tamanho de página como 100 fotos na consulta, contagem e paginação
  de `/lista_foto`.
- Reduzir o tamanho visual reservado para cada miniatura e a grade para
  comportar a nova densidade, preservando uma área de toque/foco utilizável.
- Manter a proporção 4:3 e não ampliar uma miniatura além da sua dimensão
  armazenada. A miniatura atual é gerada para até 320 × 240 px; o CSS deve
  permitir redução, mas não usar uma caixa que provoque upscaling.
- Manter título, curso, turma e anos disponíveis sem sobrepor texto à imagem ou
  depender somente da miniatura para identificação.
- Preservar o link da imagem e o diálogo progressivo: sem JavaScript, o link
  continua abrindo a foto; com JavaScript, continua abrindo a visualização
  ampliada.
- Usar `loading="lazy"` nas miniaturas fora da primeira área de visualização e
  manter dimensões ou proporção estáveis para evitar saltos de layout.

### Regras comuns

- Não incluir campos privados, colunas internas ou dados adicionais no modelo
  enviado ao navegador.
- Consultas continuam parametrizadas e filtram exclusão lógica (`Excluido = 0`).
- A paginação continua com parâmetros `GET`, funcional sem JavaScript e com
  indicação de página atual.
- A página acima do último resultado é normalizada como hoje; os novos limites
  devem ser aplicados tanto no cálculo de páginas quanto em `LIMIT` e `OFFSET`.
- A densidade não pode criar rolagem horizontal em 320 px, controles menores que
  44 × 44 px nem prejuízo de navegação por teclado.
- Não mudar schema, gerar novas versões de arquivos de miniatura nem modificar
  os arquivos de fotos já armazenados nesta issue.

## Fora do escopo

- Filtro, busca, ordenação ou novo parâmetro de tamanho de página escolhido pela
  pessoa visitante.
- Alterar o conteúdo público de cartões ou adicionar dados de contato.
- Regenerar miniaturas existentes ou alterar o processamento de upload.
- Paginação infinita, carregamento automático ao rolar ou virtualização via
  JavaScript.
- Alterar regras de privacidade, exclusão lógica ou contratos dos endpoints de
  imagem.

## Critérios de aceite

- Uma relação com mais de 300 ex-alunos mostra exatamente 300 itens na primeira
  página; a página seguinte começa no registro 301 e mantém todos os filtros.
- O cartão de ex-aluno ocupa menos altura que o atual e continua apresentando
  todos os dados públicos previstos, com acesso ao perfil pelo nome e miniatura.
- Uma galeria com mais de 100 fotos mostra exatamente 100 fotos na primeira
  página; a página seguinte começa na foto 101 e mantém todos os filtros.
- Miniaturas da galeria preservam 4:3, não são ampliadas além de 320 × 240 px e
  continuam abrindo a imagem maior pelo link ou diálogo.
- A galeria e a relação funcionam em 320, 390, 768, 1024 e 1440 px sem rolagem
  horizontal, somente com teclado e com JavaScript desativado.
- Contagens, páginas e links “Anterior”/“Próxima” refletem os novos limites.
- Nenhum resultado passa a expor e-mail, endereço, arquivo original ou outros
  dados internos.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passam.

## Validação manual sugerida

Testar bases de teste com 299, 300 e 301 ex-alunos; 99, 100 e 101 fotos; e
filtros combinados com paginação. Inspecionar a primeira e a última miniatura
carregada, redimensionar a página, usar zoom de 200% e verificar que os links
de foto continuam funcionais sem JavaScript. Medir visualmente que nenhuma
miniatura é desenhada acima de 320 × 240 px.

## Documentos complementares

### Ler antes da implementação

- `AGENTS.md`, especialmente privacidade, exclusão lógica, consultas
  parametrizadas e retorno mínimo de colunas públicas.
- `docs/redesign/README.md`, para princípios de legibilidade, controles de
  toque e melhoria progressiva.
- `docs/redesign/functional-spec.md`, seções 4 e 7.
- `docs/redesign/design-system.md`, componentes `AlumniCard`, `PhotoCard`,
  `Pagination` e regras de imagens responsivas.
- `docs/redesign/privacy-data.md`, contratos `AlumniListItem` e `PublicPhoto`.
- `docs/redesign/implementation-plan.md`, tarefas RED-301, RED-302, RED-601 e
  RED-602.

### Atualizar ao implementar

- `docs/redesign/functional-spec.md`: atualizar os limites de paginação,
  critérios de aceite e regras de cartão/miniatura das seções 4 e 7.
- `docs/redesign/design-system.md`: registrar as dimensões compactas dos
  cartões e a proibição de ampliar a miniatura de foto além da dimensão
  armazenada.
- `docs/redesign/implementation-plan.md`: substituir as referências a 30 e 24
  itens e incluir as validações de densidade e carregamento tardio.
- Esta issue, registrando validação, resultado e estado final.

## Arquivos de código previstos

- `src/routes/exalunos_lista/+page.server.ts`.
- `src/routes/exalunos_lista/+page.svelte`.
- `src/lib/components/AlumniCard.svelte`.
- `src/routes/lista_foto/+page.server.ts`.
- `src/routes/lista_foto/+page.svelte`.
- Componentes compartilhados de paginação, somente se o novo volume exigir
  ajuste de apresentação sem mudar o contrato de URL.

Não se prevê mudança em banco de dados, schema, uploads ou arquivos de foto.

## Resultado da implementação

- As consultas de ex-alunos e fotos agora usam, respectivamente, `LIMIT 300` e
  `LIMIT 100`, com contagem, página e `OFFSET` derivados dos mesmos limites.
- O cartão de ex-aluno foi compactado com miniatura de 3,5 rem, espaçamento
  reduzido e carregamento tardio, sem ocultar dados ou links públicos. A
  margem global acima do título foi neutralizada especificamente no cartão.
- O link redundante “Ver perfil” foi removido; nome e miniatura continuam sendo
  os acessos ao perfil.
- A grade de fotos passou a iniciar em 10 rem, com cartões e metadados mais
  compactos. A miniatura mantém 4:3 e tem largura máxima de 320 px, evitando
  upscaling acima do arquivo armazenado.
- Atualizados `docs/redesign/functional-spec.md`,
  `docs/redesign/design-system.md` e
  `docs/redesign/implementation-plan.md`; não houve mudança de schema, uploads
  ou arquivos de foto existentes.
