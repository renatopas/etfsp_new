# ISSUE-021 — Desativar ex-aluno por comando administrativo

**Estado:** Aguardando validação

**Área:** Administração, privacidade e segurança

**Arquivos previstos:** `scripts/admin_exaluno.py`, `package.json`,
`scripts/initial.sql` e uma nova migração de banco

## Contexto

O catálogo, a galeria e o cadastro são públicos e não existe autenticação na
aplicação. Ocasionalmente, cerca de duas vezes por ano, um ex-aluno solicita por
e-mail que seu cadastro deixe de ser publicado.

Uma área administrativa web protegida por autenticação teria custo de
implementação e manutenção desproporcional à frequência dessa operação. Fazer o
`UPDATE` diretamente no shell do SQLite, por outro lado, facilita erros como
selecionar um homônimo, esquecer registros relacionados ou não deixar uma
trilha de auditoria.

As tabelas `ExAlunos` e `Fotos` já possuem a coluna `Excluido`, e as consultas
públicas filtram os registros ativos. A necessidade pode, portanto, ser atendida
por um comando administrativo pequeno, executado manualmente por SSH no
servidor, sem expor uma nova superfície HTTP.

## Objetivo

Criar uma ferramenta de linha de comando para localizar e desativar logicamente
um ex-aluno de maneira deliberada, transacional e auditável, sem implementar
autenticação ou um CRUD web.

O comando deve reduzir a possibilidade de erro operacional e preservar a
reversibilidade. Esta issue não autoriza exclusão física de registros nem de
arquivos de fotos.

## Solução proposta

Adicionar um script administrativo ao próprio repositório, preferencialmente em
Python para usar o módulo `sqlite3` da biblioteca padrão e seguir o padrão das
ferramentas existentes em `scripts/`.

O `package.json` deve oferecer comandos curtos, sem esconder qual operação será
executada. Uma interface possível é:

```sh
pnpm admin:exaluno buscar --nome "Fulano"
pnpm admin:exaluno consultar --id 123
pnpm admin:exaluno desativar --id 123
```

A busca serve apenas para localizar o ID. Alterações devem aceitar somente um ID
inteiro e nunca operar diretamente sobre todos os resultados de um nome.

O script deve receber o banco por `DB_PATH` já presente no ambiente ou por uma
opção explícita. Ele não deve carregar `.env` como script, presumir um banco na
raiz do repositório, procurar automaticamente bancos no filesystem nem criar um
banco vazio quando o caminho estiver ausente ou incorreto.

## Fluxo de desativação

Antes de gravar, o comando deve consultar novamente o registro por ID e mostrar
somente os dados necessários para evitar confusão entre homônimos:

```text
ID: 123
Nome: Fulano de Tal
Curso: Mecânica
Ingresso: 1985
Término: 1988
Fotos vinculadas ativas: 3

Operação proposta:
- marcar o ex-aluno como excluído;
- marcar logicamente as fotos vinculadas como excluídas;
- registrar a operação na auditoria.

Digite o ID 123 para confirmar:
```

O comando deve:

1. recusar ID ausente, inválido, inexistente ou já excluído;
2. solicitar um motivo curto sem colocar seu conteúdo na linha de comando ou no
   histórico do shell;
3. rejeitar motivo vazio e orientar o operador a não copiar e-mails ou dados
   pessoais para a auditoria;
4. exigir que o operador digite novamente o ID exato;
5. iniciar uma transação;
6. repetir as verificações relevantes dentro da transação;
7. atualizar o ex-aluno e os registros de foto definidos nesta issue;
8. inserir a auditoria usando `Date.now()` equivalente em milissegundos;
9. confirmar a transação apenas se todas as etapas terminarem;
10. desfazer a transação e retornar erro não sensível em qualquer falha.

Não deve existir uma opção genérica como `--force` que elimine silenciosamente a
confirmação. Se uma execução não interativa for necessária no futuro, ela deve
ser discutida em outra issue com controles próprios.

## Tratamento das fotos vinculadas

Como proposta inicial, a desativação também marcará `Fotos.Excluido = 1` para os
registros cujo `idExAlunoUpload` corresponda ao ex-aluno. Isso impede que os
arquivos continuem acessíveis pelas rotas públicas e mantém a operação
reversível, sem remover originais ou miniaturas de `FOTOS_DIR`.

Essa regra precisa ser confirmada antes da implementação: `idExAlunoUpload`
identifica quem enviou a foto, não necessariamente todas as pessoas retratadas.
Uma solicitação pode se limitar ao perfil pessoal, enquanto algumas fotos podem
ser parte do acervo coletivo. Se a decisão for preservar essas fotos, o comando
deverá deixar isso explícito na prévia e não poderá inferir consentimento apenas
pelo vínculo técnico.

Independentemente da decisão, o script deve contar e apresentar o impacto antes
da confirmação. A remoção física dos arquivos permanece fora do escopo.

## Auditoria

Adicionar uma tabela dedicada, com nome a definir durante a implementação e
campos equivalentes a:

```text
ID
Acao
ExAlunoID
Operador
Motivo
Data
```

O operador deve ser obtido do usuário do sistema que executou o comando ou de
outra identidade confiável disponível no ambiente. Essa identificação é uma
trilha operacional e não substitui a segurança do acesso SSH.

A auditoria não deve copiar o cadastro, a mensagem recebida, e-mail, CPF,
telefone, endereço, IP ou outros dados pessoais. O motivo deve ser curto, por
exemplo `solicitação confirmada pelo titular`.

A criação da tabela exige:

- alteração de `scripts/initial.sql` para bancos novos;
- uma migração explícita, idempotente e versionada para bancos existentes;
- registro da migração em `SchemaMigrations`;
- validação da migração em uma cópia ou fixture sintética, nunca diretamente no
  único banco de produção.

## Segurança operacional

- O script deve ser executado somente por uma conta SSH autorizada e com acesso
  mínimo ao checkout e ao banco.
- O servidor deve preferir autenticação SSH por chave, desabilitar login remoto
  direto como `root` e manter as permissões do banco restritas.
- O caminho do banco deve ser resolvido e validado antes de abrir a conexão.
- A ferramenta deve recusar banco inexistente, não gravável ou sem o schema
  esperado.
- Todas as consultas devem ser parametrizadas.
- A busca por nome deve escapar `%`, `_` e o caractere de escape de `LIKE`.
- Nenhum comando deve imprimir registros completos ou dados privados.
- Mensagens de erro não devem revelar SQL, conteúdo do banco ou stack traces por
  padrão.
- O script não deve alterar `FOTOS_DIR`, apagar arquivos, recriar o banco nem
  usar `scripts/make_db.py`.
- Deve haver backup regular do banco fora deste fluxo. O comando não deve
  sobrescrever backups nem tentar administrar sua retenção.

O acesso SSH e a permissão de escrita no banco são a barreira de autorização.
O ID do ex-aluno, argumentos de linha de comando e a confirmação interativa não
são considerados prova de identidade do solicitante.

## Verificação da solicitação

Antes de executar o comando, o responsável deve confirmar por procedimento
operacional que a solicitação veio do titular ou foi suficientemente verificada.
O script não automatiza essa decisão.

Quando o pedido vier do e-mail já cadastrado, pode-se responder solicitando uma
confirmação. Se vier de outro endereço, deve-se pedir evidência proporcional,
sem solicitar CPF completo, documento ou outros dados excessivos por e-mail.

Também deve ficar claro para o solicitante se a ação apenas deixa de publicar o
cadastro ou se haverá alguma etapa posterior de eliminação definitiva. Exclusão
lógica não deve ser apresentada como apagamento físico completo.

## Reativação

Uma operação de reativação é útil para corrigir erros, mas não precisa fazer
parte da primeira entrega. Se incluída, deve ser um subcomando explícito,
mostrar previamente aluno e fotos afetadas, exigir a mesma confirmação forte e
gerar uma nova entrada de auditoria; não deve apagar ou reescrever a auditoria
anterior.

A reativação automática de todas as fotos pode não ser correta caso alguma
delas tenha sido moderada por outro motivo. Por isso, seu comportamento precisa
ser definido separadamente antes da implementação.

## Fora do escopo

- Criar painel web, autenticação, sessão ou papéis administrativos.
- Permitir edição geral dos dados do ex-aluno.
- Excluir fisicamente registros ou arquivos de fotos.
- Automatizar a decisão de validar o solicitante.
- Enviar e-mails ou armazenar o conteúdo das mensagens recebidas.
- Executar a ferramenta no ambiente Cloud ou contra a fixture versionada como
  substituto de uma operação real no servidor.
- Fazer alterações diretamente na branch `main`; toda implementação deve usar
  branch dedicada e Pull Request.

## Critérios de aceite

- Há comandos separados para buscar, consultar e desativar um ex-aluno.
- Busca e consulta não modificam o banco.
- A desativação aceita apenas um ID inteiro e exige confirmação interativa pelo
  mesmo ID.
- A prévia mostra somente ID, nome, curso, anos e quantidade de fotos afetadas.
- Registro inexistente ou já excluído não produz nova alteração.
- Consultas são parametrizadas e a busca escapa curingas de `LIKE`.
- Ex-aluno, fotos conforme a decisão validada e auditoria são alterados na mesma
  transação.
- Uma falha em qualquer gravação deixa o banco sem alteração parcial.
- A auditoria não armazena nem imprime dados pessoais desnecessários.
- Nenhum arquivo em `FOTOS_DIR` é alterado ou removido.
- O script recusa caminho ausente, banco inexistente e schema incompatível.
- O schema inicial e a migração para bancos implantados permanecem coerentes.
- Testes automatizados usam somente banco temporário e dados inteiramente
  fictícios.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passam.

## Validação sugerida

Criar um banco temporário a partir de `scripts/initial.sql`, preenchido apenas
com perfis e fotos fictícios. Cobrir pelo menos:

- busca literal contendo `%`, `_` e barra invertida;
- ID inválido, inexistente e já excluído;
- cancelamento na confirmação;
- confirmação com ID diferente;
- desativação sem fotos e com várias fotos;
- contagem correta do impacto;
- rollback provocado por falha na auditoria;
- timestamp em milissegundos;
- motivo vazio ou excessivamente longo;
- banco ausente, somente leitura e com schema incompatível;
- ausência de dados privados na saída e nas mensagens de erro.

Após os testes automatizados, executar manualmente contra uma cópia sintética e
confirmar que as consultas públicas deixam de retornar o ex-aluno e, conforme a
decisão validada, suas fotos. Não testar a implementação inicial diretamente no
banco de produção.

## Decisões pendentes para aprovação

1. Desativar automaticamente todas as fotos em que o ex-aluno consta como
   responsável pelo upload, ou preservar o acervo coletivo?
2. A primeira versão deve incluir reativação ou apenas desativação?
3. Qual limite de tamanho deve ser aplicado ao motivo da auditoria?
4. Qual conta ou grupo do sistema terá autorização para executar o comando no
   servidor?

## Fluxo de implementação

A implementação desta issue deve ocorrer em uma nova branch criada a partir de
uma `main` limpa e atualizada. O código, a migração e os testes devem ser
submetidos em Pull Request próprio. Nenhuma etapa de implementação ou migração
deve ser feita diretamente na `main` ou no banco de produção.
