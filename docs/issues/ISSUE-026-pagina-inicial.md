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

## Decisões registradas

- **Cadastros recentes no lugar de fotos recentes.** A primeira versão desta
  issue previa uma faixa com as fotos mais recentes. Na revisão, a faixa foi
  substituída pelos cadastros mais recentes: o envio de fotos é raro, e a
  página inicial ficaria quase sempre igual. Novos cadastros são mais
  frequentes e mostram melhor que o site está ativo.

## Modificação proposta

Manter a busca como ação principal e acrescentar blocos simples, nesta ordem:

1. **Destaque com busca.** Título, texto curto e busca por nome (componente
   `SearchForm` atual), com mais respiro e ocupando a largura útil no
   computador. Links “Ver todos os ex-alunos” e “Ver cadastros recentes”
   continuam logo abaixo.
2. **Números do acervo.** Uma linha discreta: “N ex-alunos cadastrados ·
   N fotos”, calculada no servidor a cada requisição.
3. **Cadastros recentes.** Os 6 cadastros mais recentes, com o mesmo cartão
   da relação de ex-alunos (`AlumniCard`) e link para o perfil. Uma ação
   “Ver todos os ex-alunos” leva a `/exalunos_lista`.
4. **Atalhos por curso.** Lista dos cursos de `COURSE_CATALOG` com link para
   `/exalunos/curso/{slug}`, apresentada como chips.

As ações “Cadastre-se” e “Enviar uma foto” ficam visíveis sem rolar demais no
celular. A nota de site não oficial permanece.

### Regras de servidor e privacidade

- Remover `prerender` da rota e criar `load` server-side.
- Contagem de ex-alunos: `ExAlunos` com `Excluido = 0`.
- Contagem de fotos: `Fotos` com `Excluido = 0` e `Carometro = 0`.
- Cadastros recentes: `ExAlunos` com `Excluido = 0`, na mesma ordem da relação
  de cadastros recentes (`DtCadastro DESC, ID DESC`), limitado a 6.
- Retornar ao navegador apenas os campos do cartão da relação (`AlumniListItem`:
  ID, nome, apelido, curso, anos de entrada e saída e miniatura da foto
  pessoal), os mesmos já públicos em `/exalunos_lista`. Nenhum dado de contato
  ou campo interno.
- Extrair para `src/lib/server/` a consulta dos itens da relação, para que a
  página inicial e `/exalunos_lista` usem a mesma regra de visibilidade e de
  foto pessoal.
- Consultas parametrizadas; nenhum valor de URL é usado nesta rota.

### Desempenho

- As consultas são simples (contagens e `LIMIT 6`); não é necessário cache
  nesta issue. Se o tempo de resposta ficar acima de 200 ms, avaliar cache em
  memória de curta duração.

## Fora do escopo

- Seção histórica ou “Memória da ETFSP”.
- Carrossel automático (proibido pelo design system).
- Faixa de fotos recentes na página inicial (ver “Decisões registradas”).
- Exibir data de cadastro ou qualquer campo além dos já mostrados na relação.

## Critérios de aceite

- Busca continua exigindo apenas digitar o nome e acionar um botão, e
  funciona sem JavaScript.
- Os números exibidos correspondem às contagens do banco, respeitando exclusão
  lógica e excluindo carômetro das fotos.
- Ex-alunos excluídos logicamente nunca aparecem em “Cadastros recentes”.
- Sem cadastros, a seção mostra um estado vazio com “Cadastre-se”.
- O JSON de dados da página não contém campos além dos listados acima.
- Sem rolagem horizontal em 320 px; no computador o conteúdo usa a largura
  disponível de forma equilibrada.
- O conteúdo principal é compreensível sem imagens.
- `pnpm run validate` passa.

## Validação manual sugerida

Com uma cópia da fixture sintética, conferir números e cadastros contra o
banco. Excluir logicamente o cadastro mais recente na cópia e confirmar que ele
some da seção. Capturar a página em 390 px e 1366 px.

## Documentos complementares

### Ler antes da implementação

- `docs/redesign/functional-spec.md`, seções 2 e 4.
- `docs/redesign/privacy-data.md`.

### Atualizar ao implementar

- `docs/redesign/functional-spec.md`, seção 2: nova ordem de conteúdo, números
  e cadastros recentes.
- Esta issue, com o resultado e o estado final.

## Arquivos de código previstos

- `src/routes/+page.server.ts`, `src/routes/+page.svelte`
- `src/routes/exalunos_lista/+page.server.ts` (consulta extraída)
- `src/lib/server/alumni-list.ts` (novo)
- `src/lib/components/AlumniCard.svelte` (nível de título configurável)

Não há alteração de schema ou de migração.

## Resultado da implementação

- A rota deixou de ser pré-renderizada e ganhou `load` server-side, com três
  consultas parametrizadas em paralelo:
  - contagem de ex-alunos (`Excluido = 0`);
  - contagem de fotos gerais (`Excluido = 0` e `Carometro = 0`);
  - os 6 cadastros mais recentes (`Excluido = 0`, ordem
    `DtCadastro DESC, ID DESC`).
- A consulta dos itens da relação (campos do cartão e miniatura da foto
  pessoal mais recente não excluída) foi extraída para
  `src/lib/server/alumni-list.ts` e passou a ser usada também por
  `/exalunos_lista`, sem mudar seu comportamento.
- O navegador recebe apenas as duas contagens e os itens no formato
  `AlumniListItem`, os mesmos campos já públicos na relação.
- `AlumniCard` ganhou a propriedade opcional `headingLevel` (padrão `2`). Na
  página inicial os nomes usam `h3`, abaixo do `h2` “Cadastros recentes”.
- Página reorganizada:
  - destaque com título, texto, números e ações “Cadastre-se” / “Enviar uma
    foto”, e busca em um card;
  - a partir de 64 rem, busca à direita; no celular, logo após o texto;
  - “Cadastros recentes” em grade de cartões (uma coluna no celular, três no
    computador), com estado vazio;
  - “Ex-alunos por curso” como chips com link para as páginas por curso.
- Especificação funcional (seção 2) atualizada.
- Validação em 25 de novembro de 2026:
  - `pnpm run validate` e `pnpm run test:cloud-data` passaram (o `check`
    mantém o aviso anterior de `src/lib/PrettyDate.svelte`).
  - Em uma cópia descartável da fixture, o cadastro mais recente foi excluído
    logicamente e outro recebeu a segunda data mais recente. A página mostrou
    29 ex-alunos, omitiu o excluído e listou primeiro o segundo, seguido dos
    demais na ordem esperada. O JSON de dados continha apenas as contagens e
    os campos do cartão.
  - Sem rolagem horizontal em 320, 390, 768 e 1366 px.
  - No celular (390 × 664 visíveis), a busca começa a 275 px do topo e os
    botões de ação aparecem na primeira tela.
