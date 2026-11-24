# ISSUE-029 — Relação e perfil de ex-alunos

**Estado:** Aguardando validação

**Área:** Consulta de ex-alunos

**Rotas afetadas:** `/exalunos_lista`, `/exalunos/curso/{slug}`,
`/exalunos/{id}`

**Depende de:** ISSUE-023 e ISSUE-024

## Contexto

### Relação

- A busca por nome e os seletores “Curso” e “Ordenar por” são dois formulários
  separados, com dois botões (“Buscar” e “Aplicar filtros”). Quem escolhe um
  curso e digita um nome precisa entender qual botão aciona o quê.
- Os cursos aparecem como uma sequência de links sublinhados, que no celular
  ocupa seis linhas antes da busca.
- Sem foto, o card mostra o texto “ETFSP” repetido em todos os itens, o que
  polui a lista e não ajuda a distinguir as pessoas.

### Perfil

- O card de resumo ocupa a largura toda com foto pequena à esquerda e grande
  área vazia à direita.
- Contatos aparecem como lista de definição simples; seções “Sobre”, “Outras
  informações” e “Histórico” ficam apertadas e sem hierarquia clara.
- O botão “Ver N fotos enviadas” fica no fim da página, pouco visível.

## Modificação proposta

### Relação

- **Um único formulário** com nome, curso e ordenação e um único botão
  “Buscar”. Continua funcionando por `GET` e sem JavaScript. Nas páginas de
  curso, o curso aparece como contexto fixo com link “Ver todos os cursos”,
  como hoje.
- **Cursos como chips** compactos e roláveis horizontalmente no celular, ou
  agrupados em um `details` “Ver por curso”, mantendo os links para as páginas
  indexáveis `/exalunos/curso/{slug}`.
- **Card sem foto com iniciais** do nome (ex.: “MS”), sobre fundo neutro,
  marcado como decorativo para leitores de tela. O nome já é público, então as
  iniciais não expõem dado novo.
- Cards com altura uniforme por linha e espaçamento compacto, conforme a
  ISSUE-007.

### Perfil

- Cabeçalho do perfil com foto maior (até 176 px, sem ampliar além do arquivo
  armazenado), nome, apelido, curso e período lado a lado no computador e
  empilhados no celular.
- **Ação “Ver fotos enviadas”** visível no cabeçalho do perfil, quando houver
  fotos.
- **Contatos como botões** com ícone e texto (E-mail, WhatsApp, Instagram,
  Facebook, LinkedIn, Página pessoal), reaproveitando `SocialIcon` e as regras
  atuais de URL validada no servidor, `target="_blank"` com
  `rel="noopener noreferrer"` e aviso de nova janela no nome acessível.
- Seção “Sobre” com hierarquia tipográfica clara e largura de leitura de no
  máximo 46 rem.
- Link “← Voltar à relação de ex-alunos” mantido no topo.

## Decisões registradas

- **Índice A–Z:** não será criado. A busca por nome e a ordenação continuam
  sendo as formas de localizar uma pessoa na relação.

## Fora do escopo

- Índice alfabético (A–Z), por âncoras ou por filtro de letra inicial.
- Alterar os campos públicos do perfil ou as regras de visibilidade.
- Autocompletar a busca.
- Alterar o tamanho de página.

## Critérios de aceite

- A relação tem um único botão de envio e todos os filtros funcionam juntos,
  com e sem JavaScript.
- Os links por curso continuam levando às páginas indexáveis.
- No celular, a busca aparece na primeira tela, sem precisar rolar além dos
  cursos.
- Cards sem foto exibem iniciais; leitores de tela não leem as iniciais como
  conteúdo.
- No perfil, nenhum campo privado novo é enviado ao navegador; os dados
  exibidos continuam sendo os de `PublicAlumniProfile`.
- Links de contato externos abrem em nova janela com `noopener noreferrer` e
  informam isso no nome acessível.
- Sem rolagem horizontal em 320 px.
- `pnpm run validate` passa.

## Validação manual sugerida

Buscar por nome com e sem curso, trocar a ordenação, navegar pelas páginas de
curso e abrir perfis com e sem foto, com e sem contatos e com e sem fotos
enviadas. Testar com JavaScript desativado e em 390 px e 1366 px.

## Documentos complementares

### Ler antes da implementação

- `docs/redesign/functional-spec.md`, seções 3, 4 e 5.
- `docs/redesign/privacy-data.md`.
- `docs/issues/ISSUE-012-paginas-exalunos-por-curso.md` e
  `ISSUE-013-canonicalizacao-paginacao-exalunos.md`.

### Atualizar ao implementar

- `docs/redesign/functional-spec.md`, seções 4 e 5.
- `docs/redesign/design-system.md`: `AlumniCard` (iniciais) e padrão de botões
  de contato.
- Esta issue, com o resultado e o estado final.

## Arquivos de código previstos

- `src/routes/exalunos_lista/+page.svelte`
- `src/routes/detalhe_exaluno/+page.svelte`
- `src/lib/components/AlumniCard.svelte`, `SearchForm.svelte`,
  `SocialIcon.svelte`

Não há alteração de schema ou de migração.
