# ISSUE-001 — Link para cadastros recentes na página inicial

**Estado:** Concluída
**Área:** Início e consulta de ex-alunos  
**Rotas afetadas:** `/` e, apenas como destino, `/exalunos_lista`

## Contexto

A página inicial oferece o link “Ver todos os ex-alunos”, mas não oferece o
atalho “Ver cadastros recentes”, que já existe na página de entrada de
ex-alunos. A consulta de cadastros recentes já é suportada pela relação de
ex-alunos por meio do parâmetro `recentes=1`.

## Modificação proposta

Adicionar, junto ao link “Ver todos os ex-alunos” da página inicial, um link com
o texto “Ver cadastros recentes”. O destino deve ser
`/exalunos_lista?recentes=1`.

## Regras a atender

- Manter o link atual “Ver todos os ex-alunos”.
- Usar o parâmetro moderno `recentes=1`; não criar uma nova rota nem gerar link
  novo com os parâmetros legados `Restricao=LAST` ou `ORDEM`.
- Manter os dois links visualmente como ações auxiliares da busca, sem competir
  com a ação principal “Buscar ex-aluno”.
- Usar um link HTML normal, funcional sem JavaScript e acessível por teclado.
- Preservar a responsividade da página, inclusive sem rolagem horizontal a
  partir de 320 px.
- Manter conteúdo e rótulos em português e respeitar o design system existente.
- Não alterar, nesta issue, a definição de “recente”: permanecem os cadastros
  realizados nos 30 dias anteriores, conforme a regra atual do servidor.

## Fora do escopo

- Alterar a consulta, a ordenação ou o período dos cadastros recentes.
- Criar uma seção de cadastros recentes dentro da página inicial.
- Exibir contagens de cadastros na página inicial.
- Alterar a página de entrada `/exalunos`, onde o atalho já existe.

## Critérios de aceite

- A página inicial exibe “Ver todos os ex-alunos” e “Ver cadastros recentes”.
- “Ver cadastros recentes” leva a `/exalunos_lista?recentes=1`.
- A página de destino informa que apresenta cadastros dos últimos 30 dias e
  mantém a ordenação de mais recentes primeiro.
- Os dois links funcionam com JavaScript desativado e podem ser acionados pelo
  teclado.
- Em viewport de 320 px, os links continuam legíveis e não provocam rolagem
  horizontal.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passam.

## Documentos complementares

### Ler antes da implementação

- `AGENTS.md`, especialmente as regras de escopo, privacidade e validação.
- `docs/redesign/README.md`, para os princípios de experiência e arquitetura de
  informação.
- `docs/redesign/functional-spec.md`, seções 1, 2, 3 e 4.
- `docs/redesign/design-system.md`, para links, espaçamento, responsividade e
  acessibilidade.
- `docs/redesign/implementation-plan.md`, fases relativas à página inicial e à
  relação de ex-alunos.

### Atualizar ao implementar

- `docs/redesign/functional-spec.md`, seção 2, incluindo o novo link na ordem de
  conteúdo e nos critérios de aceite da página inicial.
- `docs/redesign/implementation-plan.md`, caso ainda seja usado para acompanhar
  as tarefas incrementais posteriores ao redesign.
- Esta issue, registrando validação, resultado e estado final.

## Arquivos de código previstos

- `src/routes/+page.svelte`.

Não se prevê mudança em banco de dados, schema, endpoint ou contrato de
privacidade.

## Resultado da implementação

- Adicionado o link “Ver cadastros recentes” em `src/routes/+page.svelte`, ao
  lado do link para a relação completa, com destino
  `/exalunos_lista?recentes=1`.
- Atualizada a seção 2 de `docs/redesign/functional-spec.md` e a tarefa
  RED-201 de `docs/redesign/implementation-plan.md`.
- Não houve alteração no período de 30 dias, na rota de resultados, em banco de
  dados ou em contratos de privacidade.
