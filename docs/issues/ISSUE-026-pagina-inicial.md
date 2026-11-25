# ISSUE-026 — Página inicial mais viva

**Estado:** Concluída

**Área:** Início

**Rota afetada:** `/`

**Depende de:** ISSUE-024 e ISSUE-025

## Contexto

A página inicial mostra título, texto curto, caixa de busca, dois links, dois
botões e uma nota. No computador, todo o conteúdo fica em uma coluna estreita
à esquerda e mais da metade da largura fica vazia. Nada indica que o site tem
um acervo ativo de pessoas e fotos.

A rota hoje é pré-renderizada no build (`export const prerender = true` em
`src/routes/+page.server.ts`) e não consulta o banco. A especificação proíbe
exibir números que não sejam calculados pelo servidor em tempo real
(`functional-spec.md`, seção 2).

## Modificação proposta

Manter a busca como ação principal e acrescentar três blocos simples, nesta
ordem:

1. **Destaque com busca.** Título, texto curto e busca por nome (componente
   `SearchForm` atual), com mais respiro e ocupando a largura útil no
   computador. Links “Ver todos os ex-alunos” e “Ver cadastros recentes”
   continuam logo abaixo.
2. **Números do acervo.** Uma linha discreta: “N ex-alunos cadastrados ·
   N fotos”, calculada no servidor a cada requisição.
3. **Fotos recentes.** Faixa com as 8 fotos gerais mais recentes, usando a
   miniatura existente, título e link para a galeria. Uma ação “Ver todas as
   fotos” leva a `/lista_foto`.
4. **Atalhos por curso.** Lista dos cursos de `COURSE_CATALOG` com link para
   `/exalunos/curso/{slug}`, apresentada como chips ou cards pequenos.

As ações “Cadastre-se” e “Enviar uma foto” ficam visíveis sem rolar demais no
celular. A nota de site não oficial permanece.

### Regras de servidor e privacidade

- Remover `prerender` da rota e criar `load` server-side.
- Contagem de ex-alunos: `ExAlunos` com `Excluido = 0`.
- Contagem de fotos e fotos recentes: `Fotos` com `Excluido = 0` e
  `Carometro = 0`, na mesma ordem da galeria (`idFoto DESC`), limitado a 8.
- Retornar ao navegador apenas título, curso, ano e nome da miniatura de cada
  foto — os mesmos campos públicos já exibidos em `/lista_foto`. Não retornar
  ID do ex-aluno que enviou a foto.
- Reaproveitar ou extrair para `src/lib/server/` a lógica de consulta da
  galeria, para que as regras de visibilidade fiquem em um único lugar.
- Consultas parametrizadas; nenhum valor de URL é usado nesta rota.

### Desempenho

- Miniaturas com `width`/`height` declarados e `loading="lazy"`.
- As consultas são simples (contagens e `LIMIT 8`); não é necessário cache
  nesta issue. Se o tempo de resposta ficar acima de 200 ms, avaliar cache em
  memória de curta duração.

## Fora do escopo

- Seção histórica ou “Memória da ETFSP”.
- Carrossel automático (proibido pelo design system).
- Destaque de ex-alunos individuais ou de cadastros recentes com nome na
  página inicial.
- Abrir o visualizador de fotos na própria página inicial.

## Critérios de aceite

- Busca continua exigindo apenas digitar o nome e acionar um botão, e
  funciona sem JavaScript.
- Os números exibidos correspondem às contagens do banco, respeitando exclusão
  lógica e excluindo carômetro das fotos.
- Fotos excluídas logicamente ou de carômetro nunca aparecem na faixa de
  recentes.
- Com zero fotos, a faixa não é exibida ou mostra um estado vazio com
  “Enviar uma foto”.
- O JSON de dados da página não contém campos além dos listados acima.
- Sem rolagem horizontal em 320 px; no computador o conteúdo usa a largura
  disponível de forma equilibrada.
- O conteúdo principal é compreensível sem imagens.
- `pnpm run validate` passa.

## Validação manual sugerida

Com a fixture sintética, conferir números e fotos contra o banco. Excluir
logicamente uma foto na cópia de teste e confirmar que ela some da faixa.
Capturar a página em 390 px e 1366 px.

## Documentos complementares

### Ler antes da implementação

- `docs/redesign/functional-spec.md`, seções 2 e 7.
- `docs/redesign/privacy-data.md`.

### Atualizar ao implementar

- `docs/redesign/functional-spec.md`, seção 2: nova ordem de conteúdo, números
  e fotos recentes.
- Esta issue, com o resultado e o estado final.

## Arquivos de código previstos

- `src/routes/+page.server.ts`, `src/routes/+page.svelte`
- `src/routes/lista_foto/+page.server.ts` (se a consulta for extraída)
- `src/lib/server/` (consulta compartilhada de fotos públicas, se criada)

Não há alteração de schema ou de migração.

## Resultado da implementação

- A rota deixou de ser pré-renderizada e ganhou `load` server-side, com três
  consultas parametrizadas em paralelo: contagem de ex-alunos
  (`Excluido = 0`), contagem de fotos gerais e as 8 fotos gerais mais recentes
  (`Excluido = 0` e `Carometro = 0`, ordem `idFoto DESC`, como na galeria).
- A regra de foto pública (colunas, filtro de exclusão e conversão) foi
  extraída para `src/lib/server/public-photos.ts` e passou a ser usada também
  por `/lista_foto`, sem mudar seu comportamento.
- O navegador recebe apenas as duas contagens e, para cada foto, título,
  curso, ano da foto e URL da miniatura (tipo `RecentPhoto` em
  `src/lib/domain.ts`). Não recebe arquivo original, turma, ID do ex-aluno nem
  outros metadados.
- Página reorganizada:
  - destaque com título, texto, números e ações “Cadastre-se” / “Enviar uma
    foto”, e busca em um card;
  - a partir de 64 rem, busca à direita; no celular, logo após o texto;
  - “Fotos recentes” em grade (2 colunas no celular, 4 no computador), com
    miniatura 4:3, título com reticências e curso/ano;
  - “Ex-alunos por curso” como chips com link para as páginas por curso;
  - estado vazio com “Enviar uma foto”.
- Especificação funcional (seção 2) atualizada.
- Validação em 25 de novembro de 2026:
  - `pnpm run validate` e `pnpm run test:cloud-data` passaram (o `check`
    mantém o aviso anterior de `src/lib/PrettyDate.svelte`).
  - Em uma cópia descartável da fixture, com 9 fotos gerais extras, uma
    excluída e uma de carômetro (as duas mais recentes), a página mostrou 30
    ex-alunos e 10 fotos. A faixa listou as 8 fotos gerais mais recentes e
    omitiu a excluída e a de carômetro. O JSON de dados não continha outros
    campos.
  - Sem rolagem horizontal em 320, 390, 768 e 1366 px.
  - No celular (390 × 664 visíveis), a busca começa a 275 px do topo e os
    botões de ação aparecem na primeira tela.
