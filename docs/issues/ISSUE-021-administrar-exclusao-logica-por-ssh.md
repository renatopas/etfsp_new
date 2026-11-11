# ISSUE-021 — Administrar exclusão lógica de ex-alunos por SSH

**Estado:** Concluída em 10 de novembro de 2026.

**Área:** Administração, privacidade e segurança

## Contexto

O site público não possui autenticação. Ocasionalmente, cerca de duas vezes por
ano, um ex-aluno solicita por e-mail que seu cadastro deixe de ser publicado.
Uma área administrativa web teria custo e superfície de ataque desproporcionais
a essa frequência, enquanto executar `UPDATE` manualmente no SQLite facilitaria
erros e não produziria uma auditoria adequada.

As tabelas `ExAlunos` e `Fotos` já possuem a coluna `Excluido`. As consultas
públicas de perfis, galeria e entrega de arquivos respeitam essa exclusão
lógica. A solução adotada é, portanto, um comando pequeno, executado manualmente
por uma pessoa que já tenha acesso SSH ao servidor.

## Decisões

- A autorização é o próprio acesso SSH e a permissão de executar Docker no
  servidor; não existe senha adicional no comando.
- A ferramenta roda dentro do container `etfsp`, onde `DB_PATH` já aponta para
  `/database/db.sqlite3`.
- Busca e consulta são separadas das operações de escrita.
- Desativação e reativação aceitam somente um ID inteiro positivo.
- Toda escrita exige terminal interativo, motivo curto e redigitação do ID.
- A desativação marca o ex-aluno e todas as fotos ativas vinculadas por
  `idExAlunoUpload` como excluídos.
- A reativação marca o ex-aluno e **todas** as fotos excluídas vinculadas como
  ativos, inclusive fotos que já estavam excluídas antes. Essa consequência é
  mostrada antes da confirmação.
- Originais e miniaturas nunca são removidos de `FOTOS_DIR` por essa ferramenta.
- O operador auditado é o usuário da sessão SSH, fornecido por
  `ADMIN_OPERATOR`.
- O motivo possui no máximo 200 caracteres e não deve conter dados pessoais nem
  a cópia da mensagem recebida.
- A verificação de que o solicitante é o titular permanece um procedimento
  humano anterior ao comando.

Não há decisões de produto pendentes nesta issue.

## Interface

```sh
pnpm admin:exaluno buscar --nome "Fulano"
pnpm admin:exaluno consultar --id 123
pnpm admin:exaluno desativar --id 123
pnpm admin:exaluno reativar --id 123
pnpm admin:exaluno migrar
```

A busca escapa `%`, `_` e barra invertida de `LIKE`, usa parâmetros SQL e
retorna no máximo 20 resultados. Ela nunca altera todos os resultados de um
nome. A consulta mostra somente ID, nome, curso, anos, estado e contagens de
fotos.

As operações de escrita mostram a mesma prévia, descrevem o efeito nas fotos,
solicitam um motivo e exigem que o operador digite o ID novamente. Não existe
opção `--force` nem modo de escrita não interativo.

## Transação e auditoria

O comando configura chaves estrangeiras e `busy_timeout` no SQLite. Cada
alteração usa `BEGIN IMMEDIATE` e, dentro da mesma transação:

1. confirma novamente o estado atual do ex-aluno;
2. seleciona os IDs das fotos que mudarão;
3. atualiza `ExAlunos.Excluido` e `DtAtualizacao`;
4. atualiza `Fotos.Excluido`;
5. cria o evento em `AdminAudit`;
6. associa os IDs alterados em `AdminAuditFotos`;
7. confirma a transação somente depois de todas as gravações.

Qualquer falha executa rollback. A auditoria contém apenas ação, ID do
ex-aluno, operador, motivo, data em Unix timestamp de milissegundos e os IDs
técnicos das fotos alteradas. Ela não replica e-mail, endereço, telefone, CPF,
IP ou o cadastro completo.

## Migração

`scripts/initial.sql` contém as tabelas de auditoria para bancos novos. Bancos
implantados recebem a migração explícita e idempotente
`2026-11-10-admin-exaluno`, aplicada pelo subcomando `migrar` depois de um
backup.

O comando recusa `DB_PATH` ausente, arquivo inexistente, banco não gravável ou
schema incompatível. Ele não procura bancos automaticamente, não cria um banco
vazio e não carrega `.env` como script.

## Operação no servidor

O procedimento completo está em `deploy/README.md`. Em resumo:

```sh
ssh etfsp
cd /home/ubuntu/etfsp
docker compose exec etfsp pnpm admin:exaluno migrar

docker compose exec \
  -e ADMIN_OPERATOR="$(id -un)" \
  etfsp \
  pnpm admin:exaluno desativar --id 123
```

O script é incluído explicitamente na imagem final. Não é necessário instalar
pnpm no host nem parar a aplicação. Como os arquivos permanecem no volume, a
exclusão lógica não reduz o armazenamento e não elimina cópias existentes em
backups ou caches externos.

## Segurança operacional

- Use autenticação SSH por chave e limite quem pode executar Docker no servidor.
- Confirme a identidade do solicitante antes da operação, sem pedir dados
  pessoais excessivos por e-mail.
- Faça backup antes da primeira migração e mantenha cópias fora da VPS.
- Não coloque o pedido completo nem dados pessoais no motivo da auditoria.
- Não use o ID, um campo hidden ou o endereço de e-mail recebido como prova
  automática de identidade.
- Não execute a migração nem a ferramenta contra o único banco de produção para
  fazer testes.
- Não use `scripts/make_db.py` nesse fluxo.
- Não apague arquivos de fotos para simular a desativação.

## Critérios de aceite

- Busca, consulta, desativação, reativação e migração são subcomandos separados.
- Busca e consulta não modificam o banco.
- Entradas são validadas e todas as consultas usam parâmetros.
- Escritas exigem terminal interativo, motivo, operador e confirmação pelo ID.
- Aluno, fotos e auditoria são alterados atomicamente.
- Desativação atinge somente fotos ativas ligadas ao ex-aluno.
- Reativação atinge todas as fotos excluídas ligadas ao ex-aluno.
- Uma falha na auditoria desfaz as alterações anteriores.
- Arquivos de fotos não são alterados nem removidos.
- A saída não contém campos privados desnecessários.
- A imagem de produção contém o script e a migração.
- Schema inicial e migração de bancos existentes permanecem coerentes.
- Testes usam somente bancos temporários e dados fictícios.

## Resultado da implementação

- Criado `scripts/admin_exaluno.mjs` com os cinco subcomandos definidos.
- Criadas `AdminAudit` e `AdminAuditFotos` no schema canônico.
- Adicionada a migração idempotente `2026-11-10-admin-exaluno`.
- A imagem final passou a incluir somente o script administrativo e suas
  migrações, além dos artefatos já existentes.
- Adicionado `pnpm run test:admin-exaluno` com cenários de validação, migração,
  busca literal, desativação, reativação e rollback.
- Documentado o procedimento de produção em `deploy/README.md`.
- Registrado em `AGENTS.md` que toda mudança deve usar branch dedicada e que o
  Pull Request só deve ser aberto quando implementação e validações estiverem
  prontas.

## Validação realizada

- `pnpm run test:admin-exaluno` passou com cenários de argumentos inválidos,
  migração repetida, escape de curingas, desativação, reativação ampla e
  rollback por falha na auditoria.
- `pnpm run test:cloud-data` passou com os seis testes existentes após a mudança
  de schema.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passaram; o check manteve
  três avisos preexistentes em componentes não alterados.
- A imagem `etfsp:issue-021` foi construída e contém o script e a migração.
- Um smoke test dentro da imagem aplicou a migração, buscou e consultou um perfil
  sintético.
- Um teste manual interativo dentro da imagem desativou uma foto ativa e depois
  reativou todas as fotos do perfil sintético, inclusive uma previamente
  excluída.
- Nenhum banco, foto ou arquivo do servidor de produção foi alterado durante as
  validações.

## Fora do escopo

- Painel web, autenticação da aplicação ou CRUD geral.
- Exclusão física de banco, originais, miniaturas ou backups.
- Automação da verificação do solicitante.
- Envio ou armazenamento de e-mails.
- Limpeza automática de caches externos.
- Distinção entre pessoas que compartilham a mesma conta SSH `ubuntu`.
