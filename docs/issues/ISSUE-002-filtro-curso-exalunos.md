# ISSUE-002 — Filtro de curso na relação de ex-alunos

**Estado:** Concluída
**Área:** Consulta de ex-alunos  
**Rota afetada:** `/exalunos_lista`

## Contexto

A relação de ex-alunos permite buscar por nome, ordenar resultados, consultar
cadastros recentes e paginar, mas ainda não permite restringir a lista a um
curso. A aplicação já possui uma allowlist canônica de cursos em
`src/lib/domain.ts`.

## Modificação proposta

Adicionar à página “Relação de ex-alunos” um filtro “Curso”, com a opção “Todos
os cursos” e uma opção para cada curso da allowlist existente. O filtro deve
usar o parâmetro GET `curso` e combinar-se com busca, ordenação, cadastros
recentes e paginação.

## Contrato do parâmetro

| Parâmetro | Regra                                                                                       |
| --------- | ------------------------------------------------------------------------------------------- |
| `curso`   | opcional; vazio ou ausente não restringe; valor válido deve pertencer à allowlist `COURSES` |

Valores desconhecidos, repetidos ou fora da allowlist não devem ser
interpolados no SQL nem causar erro técnico. O servidor deve normalizá-los como
“Todos os cursos”. Links gerados pela aplicação devem emitir no máximo um valor
`curso` válido.

## Regras a atender

- A lista de opções deve vir da allowlist compartilhada `COURSES`, evitando uma
  segunda lista divergente no componente.
- A filtragem deve ocorrer no servidor com comparação exata e consulta SQL
  parametrizada.
- Toda consulta pública deve continuar aplicando `Excluido = 0`.
- O rótulo “Curso” deve estar associado ao seletor; o controle e o botão de
  aplicação devem ser acessíveis por teclado.
- O formulário deve usar `GET` e funcionar sem JavaScript.
- Ao aplicar ou trocar o curso, reiniciar a consulta na página 1, omitindo o
  parâmetro `pagina` do formulário.
- Preservar `busca`, `ordem` e `recentes` ao aplicar o filtro de curso.
- Preservar `curso` ao buscar por nome, ordenar e navegar entre páginas.
- A ação “Limpar busca” do estado vazio deve retirar a busca por nome, mas
  manter curso e modo de cadastros recentes. Deve existir uma forma clara de
  voltar a “Todos os cursos”.
- A contagem, o total de páginas e os cartões devem refletir o mesmo conjunto
  filtrado.
- Não enviar ao navegador colunas adicionais do banco para implementar o
  filtro.
- Manter o layout responsivo, a apresentação em cartões e o design system
  existente.

## Fora do escopo

- Busca textual por curso no campo de nome.
- Seleção de vários cursos ao mesmo tempo.
- Criação, renomeação ou remoção de cursos da allowlist.
- Alteração das opções de ordenação.
- Mudança de schema, view ou dados existentes.

## Critérios de aceite

- O seletor oferece “Todos os cursos” e exatamente os cursos da allowlist
  vigente.
- Uma URL como `/exalunos_lista?curso=TEL` lista somente registros públicos cujo
  curso seja `TEL`.
- Um valor inválido de `curso` não amplia uma expressão SQL, não gera erro 500 e
  resulta no estado normalizado “Todos os cursos”.
- Busca, filtro, ordenação, recentes e paginação podem ser combinados, e os
  parâmetros ativos permanecem nos formulários e links subsequentes.
- A alteração do curso começa na página 1.
- A contagem e a paginação correspondem aos resultados filtrados.
- O fluxo funciona com JavaScript desativado e em viewport de 320 px sem
  rolagem horizontal.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passam.

## Validação manual sugerida

Testar: todos os cursos; um curso com resultados; um curso sem resultados; um
valor inválido na URL; curso combinado com nome; curso combinado com
`recentes=1`; ordenação dentro de um curso; e avanço/retorno da paginação sem
perder filtros.

## Documentos complementares

### Ler antes da implementação

- `AGENTS.md`, especialmente as regras de SQL parametrizado, allowlists,
  exclusão lógica e privacidade.
- `docs/redesign/README.md`, para os princípios de consulta e melhoria
  progressiva.
- `docs/redesign/functional-spec.md`, seções 1, 3 e 4.
- `docs/redesign/privacy-data.md`, para o contrato de dados da listagem.
- `docs/redesign/design-system.md`, para formulários, controles e
  responsividade.
- `docs/redesign/implementation-plan.md`, fases da relação de ex-alunos.

### Atualizar ao implementar

- `docs/redesign/functional-spec.md`, seção 4: adicionar `curso` à tabela de
  parâmetros e atualizar comportamento, paginação, estado vazio e critérios de
  aceite.
- `docs/redesign/implementation-plan.md`, registrando o filtro incremental e
  suas validações, caso o documento continue como controle de execução.
- Esta issue, registrando validação, resultado e estado final.

## Arquivos de código previstos

- `src/routes/exalunos_lista/+page.server.ts`.
- `src/routes/exalunos_lista/+page.svelte`.
- `src/lib/domain.ts`, somente para reutilizar ou, se necessário, expor tipos
  derivados da allowlist sem duplicá-la.
- Componentes compartilhados de formulário ou paginação, apenas se a
  preservação do novo parâmetro exigir ajuste genérico.

Não se prevê mudança em `scripts/initial.sql` nem na view `qryExAlunos`.

## Resultado da implementação

- Adicionado o parâmetro `curso`, normalizado no servidor para exatamente um
  valor da allowlist `COURSES`; valores ausentes, inválidos ou repetidos não
  filtram a consulta.
- A consulta usa `e.Curso = ?` parametrizado e mantém `Excluido = 0` em todas
  as combinações de filtros.
- Adicionado o seletor “Curso”, com “Todos os cursos”, e preservação de curso,
  busca, ordenação, recentes e paginação nas URLs geradas.
- O estado vazio agora permite limpar a busca preservando os demais filtros e,
  quando aplicável, voltar a todos os cursos.
- Atualizados `docs/redesign/functional-spec.md` e
  `docs/redesign/implementation-plan.md`; não houve mudança de schema ou view.
