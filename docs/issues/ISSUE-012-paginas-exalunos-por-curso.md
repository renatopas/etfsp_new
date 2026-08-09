# ISSUE-012 — Criar páginas indexáveis de ex-alunos por curso

**Estado:** Concluída

**Áreas:** Consulta de ex-alunos, URLs, SEO técnico e catálogo de cursos

**Rotas afetadas:** nova rota `/exalunos/curso/[curso]`,
`/exalunos_lista`, `/exalunos`, `/sitemap.xml` e páginas que exibem seletores
ou nomes de curso

## Contexto

A relação de ex-alunos já permite filtrar registros por uma allowlist de sete
siglas usando o parâmetro GET `curso`, por exemplo
`/exalunos_lista?curso=PRD`. Conforme a política definida na ISSUE-011, URLs
com filtros recebem `noindex,follow` e apontam canonical para a relação geral.
Isso evita combinações redundantes, mas também impede que cada curso seja
apresentado aos buscadores como uma página temática relevante.

Os sete cursos são categorias estáveis e possuem significado editorial
próprio. Diferentemente de buscas livres, ordenações e combinações arbitrárias
de filtros, cada curso pode ter uma página canônica, indexável e com título,
descrição e URL legíveis.

As siglas e descrições confirmadas são:

| Sigla | Descrição                         |
| ----- | --------------------------------- |
| MEC   | Técnico em Mecânica               |
| ELE   | Técnico em Eletrotécnica          |
| EDI   | Técnico em Edificações            |
| ELO   | Técnico em Eletrônica             |
| PRD   | Técnico em Processamento de Dados |
| TEL   | Técnico em Telecomunicações       |
| INF   | Técnico em Informática Industrial |

O catálogo continuará no código, sem criar tabela no SQLite. Os cursos são uma
allowlist pequena e controlada, não existe administração de cursos no site e
uma tabela acrescentaria migração e manutenção sem benefício proporcional no
momento.

## Objetivos

- Criar uma página canônica e indexável para cada um dos sete cursos.
- Usar URLs descritivas em português e estáveis, sem acentos.
- Preservar os links existentes baseados em `?curso=`.
- Centralizar sigla, descrição e slug em um único catálogo tipado.
- Reutilizar as regras de consulta, privacidade, ordenação e paginação da
  relação existente.
- Evitar a indexação de buscas, ordenações e páginas subsequentes dentro de um
  curso.
- Permitir acrescentar cursos futuros por uma mudança explícita e revisável no
  catálogo, sem alterar schema.

## Catálogo canônico de cursos

Substituir a lista isolada de siglas por um catálogo compartilhado equivalente
ao contrato abaixo:

```ts
export const COURSE_CATALOG = {
  MEC: {
    name: "Técnico em Mecânica",
    slug: "mecanica",
  },
  ELE: {
    name: "Técnico em Eletrotécnica",
    slug: "eletrotecnica",
  },
  EDI: {
    name: "Técnico em Edificações",
    slug: "edificacoes",
  },
  ELO: {
    name: "Técnico em Eletrônica",
    slug: "eletronica",
  },
  PRD: {
    name: "Técnico em Processamento de Dados",
    slug: "processamento-de-dados",
  },
  TEL: {
    name: "Técnico em Telecomunicações",
    slug: "telecomunicacoes",
  },
  INF: {
    name: "Técnico em Informática Industrial",
    slug: "informatica-industrial",
  },
} as const;
```

A forma exata pode ser objeto, array somente leitura ou estrutura equivalente,
desde que:

- `Course` seja derivado das chaves do catálogo;
- a allowlist `COURSES` seja derivada do catálogo ou substituída por uma API
  tipada equivalente;
- cada sigla possua exatamente um nome e um slug canônicos;
- siglas e slugs sejam únicos;
- não existam listas duplicadas e divergentes em componentes ou rotas;
- a consulta continue usando a sigla histórica persistida no banco;
- slug e nome nunca sejam recebidos do visitante e interpolados em SQL;
- seletores, validações de cadastro e filtros de fotos continuem consumindo a
  mesma allowlist compartilhada.

Não alterar os valores históricos armazenados em `ExAlunos.Curso` ou
`Fotos.CursoFoto`. O catálogo traduz apenas entre o contrato persistido, a URL
e a apresentação.

## URLs canônicas

| Sigla | URL canônica                             |
| ----- | ---------------------------------------- |
| MEC   | `/exalunos/curso/mecanica`               |
| ELE   | `/exalunos/curso/eletrotecnica`          |
| EDI   | `/exalunos/curso/edificacoes`            |
| ELO   | `/exalunos/curso/eletronica`             |
| PRD   | `/exalunos/curso/processamento-de-dados` |
| TEL   | `/exalunos/curso/telecomunicacoes`       |
| INF   | `/exalunos/curso/informatica-industrial` |

- Slugs canônicos usam somente letras ASCII minúsculas e hífens.
- A rota dinâmica deve resolver o slug por comparação exata com o catálogo.
- Slug desconhecido responde `404`, sem executar uma consulta ampliada ou
  tratar o valor como ausência de filtro.
- A rota não deve aceitar parte de slug, prefixo, múltiplos valores ou entrada
  decodificada que não corresponda exatamente a uma entrada do catálogo.
- O curso resolvido deve ser convertido para a sigla histórica antes da
  consulta parametrizada ao SQLite.
- A canonical absoluta deve apontar para
  `https://etfsp.com/exalunos/curso/{slug}`.

## Compatibilidade e redirecionamentos

### Filtro legado por query

Uma URL com um único `curso` válido deve ser redirecionada para a página do
curso, removendo o parâmetro redundante:

```text
/exalunos_lista?curso=PRD
→ 308 /exalunos/curso/processamento-de-dados
```

Parâmetros reconhecidos adicionais devem ser preservados e normalizados:

```text
/exalunos_lista?curso=MEC&busca=Maria
→ 308 /exalunos/curso/mecanica?busca=Maria

/exalunos_lista?curso=TEL&pagina=2
→ 308 /exalunos/curso/telecomunicacoes?pagina=2
```

- Remover `curso` do destino, pois a categoria já está no caminho.
- Omitir parâmetros com valor padrão quando isso não alterar o resultado, como
  `ordem=nome` e `pagina=1`.
- Manter somente parâmetros reconhecidos e normalizados; não propagar entrada
  desconhecida, repetida ou inválida.
- Evitar cadeias: a URL legada deve apontar diretamente para a URL final.
- Um `curso` inválido, vazio ou repetido mantém o comportamento seguro atual da
  relação geral e não produz redirecionamento para uma categoria.
- A compatibilidade de `/exalunos_lista?curso=` deve permanecer por tempo
  indeterminado.

### Aliases por sigla

Se forem aceitos aliases de conveniência no caminho, eles devem apenas
redirecionar:

```text
/exalunos/curso/MEC
→ 308 /exalunos/curso/mecanica

/exalunos/curso/mec
→ 308 /exalunos/curso/mecanica
```

Nenhum alias por sigla deve ser incluído em links internos, canonical ou
sitemap. Se a implementação preferir não aceitar aliases, essas URLs respondem
`404`; a compatibilidade obrigatória é somente a da query já existente.

## Conteúdo e apresentação

Cada página de curso deve reutilizar a relação de ex-alunos e apresentar, no
mínimo:

- `h1`: “Ex-alunos de {nome do curso}”;
- descrição curta informando que a página reúne ex-alunos desse curso na
  ETFSP, CEFET-SP e IFSP;
- sigla visível em contexto, sem depender dela como único nome do curso;
- contagem de resultados;
- cartões, ordenação e paginação já usados na relação;
- forma clara de voltar à relação completa e escolher outro curso.

Para evitar construções como “Ex-alunos de Técnico em Mecânica”, o catálogo
pode guardar também um nome curto editorial, por exemplo “Mecânica”, desde que
ele permaneça no mesmo catálogo e não seja inferido por remoção textual frágil.
A redação final de título, descrição e `h1` deve ser natural em português.

Não criar texto histórico sobre os cursos sem fonte aprovada. A página não deve
afirmar datas, currículos, equivalências entre instituições ou períodos de
oferta que não estejam modelados nos dados.

## Consulta e reutilização

- Extrair a lógica compartilhável da relação para um módulo server-only ou
  função tipada que receba filtros já validados e um curso opcional confiável.
- A relação geral e as páginas de curso devem usar a mesma paginação, escape de
  `LIKE`, allowlist de ordenação e mapeamento de linhas públicas.
- Todas as consultas devem continuar parametrizadas e aplicar
  `e.Excluido = 0`.
- A página deve selecionar apenas as colunas necessárias para os cartões.
- A categoria vinda do caminho deve ser resolvida pelo catálogo antes de
  chegar ao construtor da consulta.
- A contagem e os resultados devem usar exatamente as mesmas condições.
- Não duplicar uma implementação SQL completa em cada rota.
- Nenhuma mudança deve ampliar a exposição de e-mail, telefone, redes sociais
  ou campos internos.

## Busca, ordenação e paginação dentro do curso

A página base do curso, sem query, é indexável. Estados adicionais continuam
usando GET e funcionam sem JavaScript:

```text
/exalunos/curso/mecanica?busca=Maria
/exalunos/curso/mecanica?ordem=ingressoNome
/exalunos/curso/mecanica?pagina=2
```

- Qualquer query na página do curso recebe `noindex,follow`.
- Todas essas variantes declaram canonical para a página base do curso.
- Busca, ordenação, recentes e paginação preservam o curso no caminho.
- O formulário não deve voltar desnecessariamente para
  `/exalunos_lista?curso=...` durante a navegação normal.
- Selecionar “Todos os cursos” leva à relação geral.
- Selecionar outro curso leva à URL canônica daquele curso.
- O funcionamento básico não deve depender de JavaScript. Caso um seletor não
  consiga alterar dinamicamente a action sem JavaScript, fornecer links de
  curso rastreáveis e uma submissão GET que seja normalizada pelo
  redirecionamento legado.

## Metadados e dados estruturados

Cada página canônica deve possuir título e descrição próprios. Modelo inicial:

```text
Título: Ex-alunos de Mecânica — ETFSP
Descrição: Encontre ex-alunos do curso Técnico em Mecânica da ETFSP, CEFET-SP e IFSP.
Canonical: https://etfsp.com/exalunos/curso/mecanica
```

- Open Graph e Twitter devem receber o mesmo título, descrição e canonical por
  meio do componente compartilhado de metadados.
- Não emitir `noindex` na página base de um curso válido.
- Não é necessário adicionar JSON-LD específico de curso nesta entrega.
- Não incluir a lista de nomes de ex-alunos em JSON-LD.
- Metadados não devem expor contatos nem campos que não apareçam nos cartões.

## Sitemap e links internos

Adicionar ao sitemap exatamente as sete URLs canônicas de curso, derivadas do
catálogo compartilhado.

- Não incluir aliases, URLs com `?curso=`, busca, ordenação ou paginação.
- Não adicionar `lastmod` enquanto não existir data confiável de atualização da
  página temática.
- Gerar URLs absolutas com a origem canônica da aplicação.
- Manter os perfis públicos já presentes no sitemap.
- O cabeçalho de navegação continua apontando para `/exalunos`; as páginas de
  curso são destinos contextuais, não sete novos itens no menu global.
- A página `/exalunos` e a relação geral devem fornecer links HTML rastreáveis
  para os sete cursos, usando nome completo ou nome curto e sigla.

## Evolução futura do catálogo

Um curso futuro pode ser adicionado ao catálogo quando houver:

- sigla histórica persistida confirmada;
- nome oficial validado;
- slug ASCII único e estável;
- decisão de que a categoria deve ser pública e indexável.

Adicionar uma entrada deve atualizar automaticamente tipos, allowlists,
seletores e sitemap sempre que esses consumidores precisarem da lista completa.
Testes de tipo ou validações devem impedir sigla duplicada, slug duplicado ou
consumidor baseado em uma segunda lista manual.

Uma tabela SQLite só deve ser reconsiderada se surgir administração dinâmica,
vigência histórica, aliases persistidos, múltiplas unidades ou necessidade de
incluir cursos sem nova implantação. Essa mudança futura deve possuir issue e
migração próprias e não deve alterar os slugs públicos existentes.

## Privacidade e segurança

- Páginas de curso mostram somente registros com `Excluido = 0` e o mesmo
  modelo mínimo da relação geral.
- Sigla, slug, busca, ordenação e paginação devem ser validados no servidor.
- O slug nunca deve ser usado como fragmento SQL.
- Ordenação continua baseada em allowlist de fragmentos conhecidos.
- Busca continua escapando `%`, `_` e `\` para uso literal em `LIKE`.
- Respostas, logs e metadados não devem incluir linhas completas do banco,
  contatos ou detalhes internos.
- Uma página vazia de curso continua podendo responder `200` se o curso existir
  no catálogo, mas deve apresentar estado vazio claro; não transformar ausência
  de resultados em consulta sem filtro.

## Fora do escopo

- Criar tabela `Cursos`, alterar schema ou migrar dados existentes.
- Alterar as siglas persistidas em `ExAlunos` ou `Fotos`.
- Criar página indexável para toda combinação de busca, ano, ordenação ou
  paginação.
- Criar páginas por turma, ano de ingresso ou ano de saída.
- Adicionar os sete cursos ao menu global.
- Escrever histórico institucional ou descrição curricular detalhada.
- Alterar a política de indexação dos perfis individuais.
- Criar painel administrativo para cursos.
- Garantir posicionamento para uma expressão específica nos buscadores.

## Pontos a validar antes da implementação

- Confirmar a redação curta usada no `h1`: proposta “Ex-alunos de Mecânica”,
  “Ex-alunos de Eletrotécnica”, “Ex-alunos de Edificações”, “Ex-alunos de
  Eletrônica”, “Ex-alunos de Processamento de Dados”, “Ex-alunos de
  Telecomunicações” e “Ex-alunos de Informática Industrial”.
- Confirmar se aliases `/exalunos/curso/MEC` e `/exalunos/curso/mec` devem
  redirecionar ou responder `404`. A proposta é aceitar ambos com `308` para
  facilitar links digitados manualmente.
- Confirmar se o seletor deve mostrar “MEC — Técnico em Mecânica” em todos os
  fluxos ou somente nas páginas de consulta. A proposta é adotar esse rótulo
  mais claro em todos os seletores sem alterar os valores enviados.
- Confirmar se categorias válidas sem resultados devem permanecer no sitemap.
  A proposta é mantê-las, pois representam o catálogo oficial; se houver curso
  sem nenhum registro real, pode-se removê-lo do sitemap até existir conteúdo.

## Critérios de aceite

- O catálogo contém exatamente as sete siglas, descrições e slugs aprovados,
  sem lista manual concorrente.
- Tipos, validações e opções continuam aceitando somente cursos do catálogo.
- Cada URL canônica de curso válido responde `200`, filtra pela sigla correta e
  contém título, `h1`, descrição e canonical próprios.
- Slug desconhecido responde `404` e não retorna a relação completa.
- `/exalunos_lista?curso={SIGLA}` válido responde com um único `308` para a URL
  descritiva correspondente.
- O redirecionamento preserva somente busca, ordenação, recentes e paginação
  reconhecidos e remove valores padrão desnecessários.
- Links gerados pelo site não dependem do redirecionamento no fluxo normal.
- A página base de cada curso é indexável; qualquer variante com query recebe
  `noindex,follow` e canonical para a página base.
- O sitemap contém exatamente uma URL canônica para cada curso que deve ser
  indexado e não contém aliases ou variantes por query.
- Relação geral, curso, busca, ordenação e paginação continuam funcionando sem
  JavaScript.
- SQL permanece parametrizado, a ordenação usa allowlist e toda consulta aplica
  `Excluido = 0`.
- Nenhum contato ou dado privado adicional aparece em cartões, HTML,
  metadados, sitemap, logs ou mensagens de erro.
- Não há alteração de schema, view ou dados persistidos.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passam.

## Validação manual sugerida

- Abrir as sete URLs canônicas e conferir nome, sigla, resultados, título,
  descrição, canonical e ausência de `noindex`.
- Testar cada sigla pela URL legada e pelos aliases aprovados, verificando
  status `308`, `Location` e ausência de cadeia.
- Testar slug inexistente, caixa diferente, acento, fragmento parcial, valor
  codificado e caminho adicional.
- Testar curso sem filtros, busca, cada ordenação, recentes, página 1, página 2
  e página acima do total.
- Trocar entre todos os cursos e voltar a “Todos os cursos”, com e sem
  JavaScript.
- Conferir que `%`, `_` e `\` permanecem literais na busca dentro de um curso.
- Inspecionar o sitemap e confirmar sete URLs descritivas, sem query ou aliases.
- Inspecionar HTML e payload serializado para confirmar que os cartões mantêm o
  contrato mínimo de dados.
- Validar navegação por teclado, 320 px, zoom de 200% e retorno pelo histórico
  do navegador.

## Documentos complementares

### Ler antes da implementação

- `AGENTS.md`, especialmente allowlists, SQL parametrizado, exclusão lógica e
  privacidade.
- `docs/issues/ISSUE-002-filtro-curso-exalunos.md`, para o contrato atual do
  filtro.
- `docs/issues/ISSUE-011-urls-e-indexacao.md`, para canonical, `noindex`,
  sitemap e redirecionamentos.
- `docs/redesign/functional-spec.md`, seções de entrada, relação e perfil.
- `docs/redesign/privacy-data.md`, para o modelo público da listagem.
- `docs/redesign/design-system.md`, para títulos, filtros, links e estados
  vazios.

### Atualizar ao implementar

- `docs/redesign/functional-spec.md`, registrando catálogo, URLs, aliases,
  indexação e navegação entre cursos.
- `docs/redesign/privacy-data.md`, somente se o contrato de dados enviado pelas
  páginas mudar; não se prevê ampliação.
- `docs/redesign/implementation-plan.md`, registrando a entrega incremental.
- `docs/redesign/README.md`, acrescentando as páginas temáticas à arquitetura
  de informação.
- Esta issue, com decisões, validações, resultado e estado final.

## Arquivos de código previstos

- `src/lib/domain.ts` ou novo módulo compartilhado de catálogo sem dependências
  server-only.
- Novo módulo server-only para consulta compartilhada da relação, se necessário.
- `src/routes/exalunos/curso/[curso]/+page.server.ts`.
- `src/routes/exalunos/curso/[curso]/+page.svelte`.
- `src/routes/exalunos_lista/+page.server.ts`.
- `src/routes/exalunos_lista/+page.svelte`.
- `src/routes/exalunos/+page.svelte`.
- `src/lib/components/SearchForm.svelte`, `AlumniCard.svelte` e
  `Pagination.svelte` somente se a preservação do caminho exigir adaptação
  compartilhada.
- `src/routes/sitemap.xml/+server.ts`.
- Formulários que exibem opções de curso, somente para consumir rótulos
  derivados do catálogo.

Não se prevê alteração em `scripts/initial.sql`, `scripts/make_db.py`,
`src/lib/server/migrations.ts`, na view `qryExAlunos` ou nos dados existentes.

## Decisões tomadas

- Confirmados os nomes curtos propostos para títulos e `h1`.
- Aliases por sigla em maiúsculas ou minúsculas respondem `308` para o slug
  descritivo e preservam somente parâmetros reconhecidos e normalizados.
- Seletores passam a apresentar “SIGLA — nome oficial”, mantendo a sigla como
  valor submetido e persistido.
- As sete categorias permanecem no sitemap; não há categoria vazia no banco de
  desenvolvimento no momento da implementação.

## Resultado da implementação

- Criado catálogo tipado com sigla, nome oficial, nome curto e slug, do qual
  derivam `Course`, `COURSES`, validação, rótulos e resolução de slug.
- Criada `/exalunos/curso/[curso]`, reutilizando a consulta e o componente da
  relação geral sem duplicar SQL ou ampliar o modelo público.
- A página de cada curso possui título, descrição, `h1`, canonical e contexto
  próprios; variantes com query permanecem `noindex,follow`.
- URLs legadas com um único curso válido e aliases por sigla redirecionam em um
  único `308`, removendo parâmetros padrão e desconhecidos.
- Adicionados links HTML rastreáveis por curso em `/exalunos` e na relação
  geral, sem ampliar o menu global.
- Os sete slugs canônicos foram incluídos no sitemap; aliases e queries foram
  omitidos.
- Formulários e filtros exibem os nomes oficiais, mas continuam enviando e
  persistindo somente as siglas históricas.
- Não houve alteração de schema, view ou dados persistidos.
