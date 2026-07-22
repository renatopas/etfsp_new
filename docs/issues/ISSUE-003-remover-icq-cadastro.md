# ISSUE-003 — Remoção do campo ICQ do cadastro

**Estado:** Aguardando validação  
**Área:** Cadastro de ex-alunos  
**Rota afetada:** `/novocadastro`

## Contexto

O formulário de cadastro ainda coleta ICQ como informação opcional. Esse meio
de contato tornou-se obsoleto e não deve continuar sendo solicitado em novos
cadastros.

## Modificação proposta

Remover o campo ICQ da interface de cadastro e de todo o processamento do POST
de `/novocadastro`. Novos registros devem deixar a coluna histórica `ICQ` sem
valor.

## Regras a atender

- Remover do formulário o rótulo, o controle, a ajuda e qualquer erro de
  validação relativo a ICQ.
- O servidor não deve ler, validar, devolver em `values` nem persistir um campo
  `ICQ` recebido no POST, inclusive se um cliente o enviar manualmente.
- Retirar `ICQ` da lista de colunas e parâmetros do `INSERT`; o banco deve usar
  o valor padrão da coluna, atualmente `NULL`.
- Manter sem alteração os cinco campos obrigatórios e todas as validações de
  cadastro, inclusive Turnstile e allowlists.
- Erros de outros campos devem continuar preservando apenas os valores ainda
  aceitos pelo formulário.
- Não registrar o valor descartado em logs ou mensagens de erro.
- Preservar a coluna `ICQ` no schema e os valores históricos existentes. Esta
  mudança de coleta não autoriza migração nem exclusão de dados.
- Manter a interface em português, responsiva e coerente com o design system.

## Compatibilidade e decisão de escopo

Esta issue elimina ICQ somente do fluxo de novos cadastros. A eventual remoção
de ICQ de perfis públicos, tipos compartilhados, view, importador legado ou
banco de dados exige uma decisão separada, pois afeta dados históricos e o
contrato de publicação. Até essa decisão, esses usos devem permanecer
compatíveis com registros antigos.

## Fora do escopo

- Apagar ou limpar valores de ICQ já armazenados.
- Remover a coluna `ICQ` de `ExAlunos` ou da view `qryExAlunos`.
- Alterar `scripts/initial.sql` ou o importador de dados legados.
- Alterar a página de perfil público.
- Substituir ICQ por outro campo de contato.
- Modificar regras de publicação de e-mail, telefone ou homepage.

## Critérios de aceite

- A página de cadastro não exibe nem solicita ICQ.
- Um cadastro válido sem ICQ continua sendo concluído normalmente.
- Um POST manipulado contendo `ICQ` não faz o valor chegar ao `INSERT`, aos
  dados devolvidos pela action ou a mensagens de erro.
- Falhas de validação preservam os demais campos aceitos, sem recriar ICQ no
  HTML.
- Nenhum registro histórico é alterado e não há migração de schema.
- Os demais campos, validações, Turnstile e retorno de sucesso continuam com o
  comportamento atual.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passam.

## Validação manual sugerida

Inspecionar a página e o HTML gerado; provocar erro de validação para conferir
a preservação dos demais valores; concluir um cadastro válido em banco de
teste; e enviar manualmente um campo `ICQ` adicional para confirmar que ele é
ignorado e não persistido.

## Documentos complementares

### Ler antes da implementação

- `AGENTS.md`, especialmente as regras de privacidade, validação no servidor e
  alterações de schema.
- `docs/redesign/README.md`, para as decisões do formulário em uma página.
- `docs/redesign/functional-spec.md`, seções 1, 5 e 6.
- `docs/redesign/privacy-data.md`, para distinguir coleta nova de preservação e
  publicação de dados históricos.
- `docs/redesign/design-system.md`, para campos, mensagens de erro e
  acessibilidade.
- `docs/redesign/implementation-plan.md`, fase do cadastro.
- `scripts/initial.sql`, somente para confirmar a nulabilidade e a presença
  histórica da coluna; não alterá-lo nesta issue.

### Atualizar ao implementar

- `docs/redesign/functional-spec.md`, seção 6: remover ICQ da tabela de campos e
  registrar que novos cadastros não coletam esse dado.
- `docs/redesign/implementation-plan.md`, removendo qualquer orientação de
  coleta de ICQ no cadastro e registrando a nova validação, caso o documento
  continue como controle de execução.
- Esta issue, registrando validação, resultado e estado final.

`docs/redesign/privacy-data.md` deve ser revisado durante a implementação, mas
não precisa mudar enquanto continuar descrevendo corretamente o tratamento dos
valores históricos de ICQ. Se o texto for interpretado como autorização para
nova coleta, deve ser esclarecido para distinguir dados legados de novos
cadastros.

## Arquivos de código previstos

- `src/routes/novocadastro/Formulario.svelte`.
- `src/routes/novocadastro/+page.server.ts`.
