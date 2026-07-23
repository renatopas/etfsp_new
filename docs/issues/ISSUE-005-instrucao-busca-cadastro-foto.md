# ISSUE-005 — Simplificar a instrução da busca no envio de foto

**Estado:** Concluída
**Área:** Envio de foto
**Rota afetada:** `/cadfoto`

## Contexto

No formulário de envio de foto, a ajuda abaixo de “Buscar pelo nome” informa:

> Digite pelo menos 3 caracteres. Sem JavaScript, localize o perfil e informe o ID abaixo.

A segunda frase descreve um mecanismo técnico de compatibilidade e não orienta
de forma útil a pessoa que está preenchendo o formulário. O campo “ID do
ex-aluno” e a alternativa de funcionamento sem JavaScript permanecem parte do
fluxo, mas essa explicação não deve aparecer junto à instrução principal de
busca.

## Modificação proposta

Trocar o texto de ajuda da busca por nome para somente:

> Digite pelo menos 3 caracteres.

## Regras a atender

- Remover integralmente a frase “Sem JavaScript, localize o perfil e informe o
  ID abaixo.” da interface de `/cadfoto`.
- Manter o rótulo “Buscar pelo nome”, o campo de busca, o campo “ID do
  ex-aluno” e sua validação atual.
- Não alterar o limite de três caracteres, o debounce, a consulta de resultados
  ou a seleção de um ex-aluno.
- Preservar o funcionamento sem JavaScript: a pessoa continua podendo informar
  um ID válido, sujeito à validação no servidor.
- Não introduzir mensagens técnicas, referências a JavaScript ou instruções
  destinadas a desenvolvimento no conteúdo visível ao usuário.
- Manter o texto em português, associado ao campo de busca e consistente com o
  design system.

## Fora do escopo

- Remover ou ocultar o campo “ID do ex-aluno”.
- Alterar a busca por nome, endpoint, validação de ID ou associação de foto.
- Remover a melhoria progressiva ou o suporte sem JavaScript.
- Alterar requisitos de upload, imagem, privacidade ou moderação.

## Critérios de aceite

- A ajuda abaixo de “Buscar pelo nome” exibe apenas “Digite pelo menos 3
  caracteres.”
- A frase removida não aparece no HTML nem em outro texto visível da tela de
  envio de foto.
- Com JavaScript ativo, a busca continua iniciando a partir de três caracteres
  e a seleção continua preenchendo o ID necessário ao envio.
- Sem JavaScript, o formulário continua apresentando o campo numérico de ID e
  o servidor continua validando esse valor.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passam.

## Documentos complementares

### Ler antes da implementação

- `AGENTS.md`, especialmente os princípios de conteúdo em português e validação
  no servidor.
- `docs/redesign/README.md`, para os princípios de linguagem direta e melhoria
  progressiva.
- `docs/redesign/functional-spec.md`, seção 8, sobre identificação do ex-aluno
  no envio de foto.
- `docs/redesign/design-system.md`, para textos de ajuda e acessibilidade de
  campos.
- `docs/redesign/implementation-plan.md`, tarefa RED-703.

### Atualizar ao implementar

- `docs/redesign/functional-spec.md`, seção 8: separar o requisito técnico de
  fallback sem JavaScript do texto de ajuda exibido na busca.
- `docs/redesign/implementation-plan.md`, RED-703: registrar que o fallback não
  deve gerar instrução técnica no texto destinado ao usuário.
- Esta issue, registrando validação, resultado e estado final.

## Arquivos de código previstos

- `src/routes/cadfoto/Formulario.svelte`.

Não se prevê mudança em endpoint, banco de dados, schema, upload ou contrato de
privacidade.

## Resultado da implementação

- O texto de ajuda em `src/routes/cadfoto/Formulario.svelte` agora exibe apenas
  “Digite pelo menos 3 caracteres.”
- O campo de ID, a busca e a validação no servidor não foram alterados.
- Atualizados `docs/redesign/functional-spec.md` e
  `docs/redesign/implementation-plan.md` para separar o fallback técnico do
  conteúdo exibido ao usuário.
