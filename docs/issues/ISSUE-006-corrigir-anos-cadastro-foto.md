# ISSUE-006 — Corrigir anos no cadastro de foto

**Estado:** Concluída
**Área:** Envio de foto
**Rota afetada:** `/cadfoto`

## Contexto

Os campos opcionais “Ano da foto” e “Ano de formatura” não estão aceitando o
preenchimento esperado. Além disso, embora a tabela `Fotos` possua as colunas
`AnoFoto` e `AnoFormatura`, o `INSERT` atual só inclui `AnoFoto`; portanto, um
ano de formatura válido não pode ser persistido.

## Modificação proposta

Corrigir a validação e a persistência dos dois campos de ano no cadastro de
foto. Um ano válido informado deve permitir o envio e ser armazenado na coluna
correspondente. Campos vazios continuam opcionais e devem ser armazenados como
`NULL`.

## Regras a atender

- “Ano da foto” e “Ano de formatura” aceitam vazio ou exatamente quatro dígitos
  entre 1909 e o ano civil atual, calculado no servidor.
- Um valor válido em `AnoFoto` deve ser persistido em `Fotos.AnoFoto`.
- Um valor válido em `AnoFormatura` deve ser persistido em
  `Fotos.AnoFormatura`.
- Um valor inválido não pode ser silenciosamente convertido em vazio nem
  descartado: o servidor deve rejeitar o envio com mensagem clara associada ao
  campo correspondente.
- A validação no navegador pode melhorar a usabilidade, mas não substitui a
  validação no servidor.
- Em falha de validação, preservar os metadados seguros já informados para que a
  pessoa possa corrigir somente o campo necessário; não reter nem reexibir o
  arquivo selecionado como se ele estivesse garantidamente disponível.
- Manter os campos como opcionais; não exigir ano de foto ou de formatura para
  concluir um envio válido.
- Não aceitar valores como três ou cinco dígitos, texto, ano anterior a 1909 ou
  ano futuro.
- Usar consultas parametrizadas e aguardar a gravação de arquivo e banco antes
  de retornar sucesso.
- Não alterar dados de fotos já cadastradas, schema, view ou regras de
  privacidade nesta issue.

## Fora do escopo

- Criar filtros novos na galeria ou alterar os filtros existentes.
- Inferir automaticamente o ano da imagem, turma ou cadastro do ex-aluno.
- Alterar os formatos, tamanho máximo ou processamento de imagens.
- Migrar, preencher ou corrigir anos de registros históricos.
- Alterar os campos de ano do cadastro de ex-alunos.

## Critérios de aceite

- Envio com `AnoFoto=2000` e `AnoFormatura=2003` é aceito, e ambos os valores
  são gravados nas respectivas colunas do registro criado.
- Envio com apenas um dos anos válidos é aceito e persiste somente o valor
  informado.
- Envio sem os dois anos continua sendo aceito e armazena `NULL` nas duas
  colunas.
- Anos inválidos produzem erro de validação junto ao campo correto e não criam
  arquivos nem registro de foto.
- O ano limite inferior (1909) e o ano civil atual são aceitos; anos fora desse
  intervalo são rejeitados.
- Um valor válido não é removido em resposta de erro causada por outro campo de
  metadado.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passam.

## Validação manual sugerida

Testar: ambos os anos válidos; somente ano da foto; somente ano de formatura;
campos vazios; 1909; ano atual; 1908; ano futuro; três e cinco dígitos; texto;
e falha em outro campo após informar anos válidos. Confirmar no banco de teste
que cada coluna recebeu o valor correto, sem expor dados reais em logs.

## Documentos complementares

### Ler antes da implementação

- `AGENTS.md`, especialmente validação no servidor, operações de arquivo/banco
  e dados persistentes externos.
- `docs/redesign/README.md`, para os princípios de erros próximos ao campo e
  melhoria progressiva.
- `docs/redesign/functional-spec.md`, seção 8, especialmente tabela de campos,
  envio e critérios de aceite.
- `docs/redesign/privacy-data.md`, para o contrato público dos metadados
  `AnoFoto` e `AnoFormatura`.
- `docs/redesign/implementation-plan.md`, tarefas RED-702 e RED-703.
- `scripts/initial.sql`, somente para confirmar as colunas existentes; não
  alterá-lo nesta issue.

### Atualizar ao implementar

- `docs/redesign/functional-spec.md`, seção 8: registrar validação server-side,
  persistência dos dois anos e comportamento de erro.
- `docs/redesign/implementation-plan.md`, RED-702 e RED-703: registrar a
  validação e persistência de ambos os campos e a reexibição segura em erro.
- Esta issue, registrando validação, resultado e estado final.

## Arquivos de código previstos

- `src/routes/cadfoto/+page.server.ts`.
- `src/routes/cadfoto/Formulario.svelte`.

Não se prevê mudança em schema, migração, importador legado, galeria ou contrato
de privacidade.

## Resultado da implementação

- A validação no servidor agora diferencia ano vazio de ano inválido e retorna
  erro junto ao campo para valores fora de 1909 até o ano atual ou que não têm
  quatro dígitos.
- Anos válidos são reexibidos após falha de outro metadado; campos vazios seguem
  opcionais e são enviados como `NULL`.
- O `INSERT` passou a incluir `AnoFormatura`, além de `AnoFoto`, persistindo os
  dois valores nas colunas correspondentes.
- Atualizados `docs/redesign/functional-spec.md` e
  `docs/redesign/implementation-plan.md`; schema e dados históricos não foram
  alterados.
