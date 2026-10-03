# ISSUE-020 — Preparar o projeto para trabalho no Codex Cloud

## Estado

Aguardando validação.

## Contexto

O projeto pode ser analisado e alterado a partir do repositório, mas sua execução
completa também depende de estado externo que não é versionado:

- um banco SQLite existente e gravável, indicado por `DB_PATH`;
- um diretório existente e gravável de fotos, indicado por `FOTOS_DIR`;
- chaves do Cloudflare Turnstile;
- dependências Node com módulos nativos (`sqlite3` e `sharp`).

Uma tarefa no Codex Cloud recebe um workspace isolado e efêmero. Portanto, não
deve depender implicitamente do filesystem do WSL, do banco de produção, de
arquivos ignorados da máquina local ou de segredos copiados para o Git.

O banco e as fotos locais podem servir como origem para um conjunto de teste
realista porque o conteúdo publicado no site é público. Porém, o banco histórico
também contém colunas e valores privados. A preparação deve exportar somente o
necessário para os fluxos públicos e omitir ou neutralizar qualquer dado sem
autorização explícita para publicação.

Esta issue deve ser implementada e executada localmente, no workspace do WSL,
porque somente esse ambiente possui acesso autorizado ao banco e às fotos que
servirão como fontes. Seu resultado não é executar o desenvolvimento no Cloud,
mas produzir, validar e documentar os artefatos seguros necessários para que
uma tarefa posterior funcione na nuvem sem acessar o filesystem local nem os
dados originais.

## Objetivo

Tornar o repositório reproduzível em um ambiente Codex Cloud, permitindo
instalar, executar, validar e revisar mudanças sem acesso ao ambiente de
produção e sem expor dados privados.

A solução deve produzir um pacote de dados sanitizado a partir do estado local,
documentar como disponibilizá-lo ao ambiente efêmero e padronizar a execução e
o fluxo Git das tarefas na nuvem.

Ao final desta issue, o trabalho local deve estar concluído e deve existir um
handoff reproduzível para abrir uma nova tarefa no Codex Cloud. A validação
efetiva no Cloud será feita nessa tarefa posterior.

## Decisões iniciais

- Toda implementação, geração e validação que acessar as fontes reais ocorrerá
  localmente.
- O banco local atual e o acervo local de fotos serão apenas fontes de leitura.
- Tarefas Cloud futuras consumirão somente o pacote sanitizado ou fixtures
  sintéticas e não terão acesso ao banco, às fotos ou ao `.env` do WSL.
- O schema canônico continuará sendo `scripts/initial.sql`.
- As colunas privadas não precisam ser removidas fisicamente do schema se isso
  quebrar queries, views ou tipos existentes. Seus valores devem ficar ausentes,
  nulos ou sintéticos no banco de teste.
- A seleção de dados deve usar uma lista positiva de campos permitidos, nunca
  uma lista de campos a remover de um `SELECT *`.
- O pacote sanitizado e seus artefatos derivados não serão versionados.
- O ambiente Cloud não receberá segredos nem dados de produção.
- O `.env` local nunca será alterado, substituído nem usado como arquivo de
  saída. Somente `.env.example` poderá ser atualizado.
- O processo recusará sobrescrever uma saída existente por padrão e não usará
  comandos destrutivos como `git clean -fdx`.
- A integridade das fontes locais será conferida antes e depois da geração.
- Cada tarefa de implementação deverá usar seu próprio workspace e branch. Esta
  issue de planejamento foi criada em
  `feat/issue-020-preparar-codex-cloud`.

## Escopo

### 1. Inventário de dependências do ambiente

Mapear e documentar:

- versão de Node e pnpm;
- comandos de instalação, desenvolvimento, verificação e build;
- variáveis de ambiente obrigatórias e opcionais;
- arquivos e diretórios esperados em runtime;
- dependências nativas necessárias para `sqlite3` e `sharp`;
- necessidade de acesso de rede durante a instalação;
- rotas que leem ou gravam no banco e no diretório de fotos;
- integrações externas, especialmente Turnstile e analytics.

Registrar quais recursos são necessários apenas em produção e quais precisam de
substitutos seguros no ambiente de desenvolvimento.

### 2. Auditoria do banco de teste

Antes de escrever o exportador, levantar todas as colunas usadas por:

- listagem e busca de ex-alunos;
- detalhe público do ex-aluno;
- cadastro;
- identificação e upload de foto;
- galeria e entrega de fotos;
- `qryExAlunos`;
- scripts auxiliares e validações manuais.

Classificar cada coluna como:

- pública e necessária;
- técnica e necessária;
- privada, mas exigida estruturalmente;
- privada e dispensável;
- ambígua, que deve permanecer excluída até decisão explícita.

A revisão deve contemplar, entre outros, e-mail, e-mail alternativo, endereço,
CEP, telefone, CPF, prontuário, IP e campos legados auxiliares. As flags
`OcultarEmail` e `PublicaTelefone` devem ser aplicadas antes da exportação,
não apenas na interface.

### 3. Gerador de banco sanitizado

Criar um script separado de `scripts/make_db.py` que:

1. abra o banco de origem somente para leitura;
2. recuse executar se origem e destino forem o mesmo arquivo;
3. receba os caminhos de origem e saída explicitamente, sem depender dos
   valores de produção carregados pelo `.env` local;
4. recuse um destino já existente, salvo por uma opção de substituição
   específica, segura e conscientemente acionada;
5. gere primeiro em um diretório temporário dedicado e publique a saída somente
   depois de todas as validações;
6. crie um banco novo a partir de `scripts/initial.sql`;
7. copie apenas registros e colunas explicitamente permitidos;
8. preserve chaves e relações necessárias à navegação;
9. mantenha datas no formato esperado pelo projeto;
10. respeite `Excluido = 0`;
11. aplique as regras de visibilidade de e-mail e telefone;
12. deixe valores privados como `NULL`, vazios ou valores sintéticos seguros,
    conforme as restrições do schema;
13. valide integridade referencial, view e consultas essenciais;
14. grave o resultado em um caminho de saída explícito;
15. nunca altere o banco de origem.

Se algum fluxo de escrita exigir e-mail, identificador ou outro campo não
público, o gerador deve criar um valor fictício claramente reconhecível, sem
preservar o valor real.

A saída sugerida é:

```text
.cloud-data/
├── db.sqlite3
├── Fotos/
└── manifest.json
```

### 4. Exportação segura das fotos

Criar um processo que copie apenas arquivos:

- associados a registros públicos e não excluídos;
- necessários para os cenários de teste escolhidos;
- cujos nomes estejam registrados no banco sanitizado;
- incluindo original convertido e miniatura quando o fluxo exigir ambos.

O processo deve:

- validar que todo caminho resolvido permanece dentro de `FOTOS_DIR`;
- rejeitar separadores, caminhos absolutos e `..`;
- ignorar arquivos órfãos e fotos de registros excluídos;
- preservar nomes controlados pelo servidor quando necessários às relações;
- evitar metadados e nomes originais que revelem informação privada;
- conferir a existência dos arquivos referenciados;
- permitir um subconjunto pequeno, porém representativo, para reduzir o pacote.

### 5. Manifesto e verificações de privacidade

Gerar um manifesto sem dados pessoais contendo, no mínimo:

- versão do formato do pacote;
- data de geração;
- versão ou hash do schema;
- quantidade de registros por tabela;
- quantidade e tamanho total das fotos;
- checksum do banco e, se viável, do conjunto de arquivos;
- versão do script gerador.

Adicionar uma verificação automatizada que falhe quando:

- aparecer uma coluna não permitida no conjunto exportado;
- um campo privado contiver valor real;
- houver foto ausente, órfã ou fora do diretório;
- o banco não abrir ou a view não puder ser consultada;
- o pacote exceder um limite documentado;
- origem e destino coincidirem.

A validação não deve imprimir registros completos, endereços, e-mails, tokens,
IPs nem caminhos privados.

### 6. Política para os artefatos gerados

Adicionar `.cloud-data/` e formatos equivalentes ao `.gitignore` e, quando
aplicável, ao `.dockerignore`.

O processo local deve tratar `.cloud-data/` como destino descartável isolado,
mas nunca apagá-lo ou substituí-lo implicitamente. Qualquer limpeza deve exigir
um caminho resolvido e validado, limitado a esse diretório. O processo não pode
editar, recriar, truncar nem remover o `.env`, o banco ou o diretório de fotos
de origem.

Documentar que não devem ser commitados:

- bancos SQLite derivados;
- fotos exportadas;
- arquivos `.env`;
- manifestos que acidentalmente contenham dados identificáveis;
- segredos ou dumps de produção.

O script, a documentação e fixtures inteiramente fictícias podem ser
versionados. O pacote gerado deve permanecer fora do Git.

### 7. Entrega dos dados ao ambiente Cloud

Esta etapa ainda é preparada localmente: ela deve produzir o pacote, as
instruções e a configuração que uma tarefa Cloud posterior consumirá. Ela não
pressupõe que a execução local já esteja dentro do ambiente Cloud.

Validar na interface e documentação atuais do Codex qual mecanismo está
disponível para preparar o filesystem da tarefa. Preparar localmente a primeira
opção compatível, nesta ordem de preferência:

1. etapa de configuração do ambiente que restaure um pacote sanitizado privado;
2. download de artefato privado por URL autenticada e temporária, com checksum;
3. geração de um conjunto mínimo inteiramente fictício dentro do próprio
   workspace.

Se o produto permitir capturar um filesystem previamente preparado, documentar
de forma inequívoca de onde ele é capturado. Não assumir que o Cloud vê
automaticamente o WSL ou arquivos locais ignorados.

O procedimento deve poder ser repetido quando o banco ou as fotos mudarem e não
deve depender da persistência indefinida de um workspace efêmero.

### 8. Configuração do ambiente Cloud

Definir e testar uma configuração reproduzível que:

- use a versão de Node compatível com o projeto;
- habilite o pnpm pela versão declarada em `packageManager`;
- execute `pnpm install --frozen-lockfile`;
- restaure ou gere `.cloud-data`;
- crie diretórios graváveis;
- configure:
  - `DB_PATH=.cloud-data/db.sqlite3`;
  - `FOTOS_DIR=.cloud-data/Fotos`;
- use chaves oficiais de teste do Turnstile apenas em desenvolvimento/teste;
- não configure segredos de produção;
- não habilite analytics por padrão;
- execute uma verificação rápida do banco e das fotos.

Revisar `.env.example` para explicar valores locais, valores Cloud de teste e
quais variáveis nunca devem ser preenchidas com credenciais reais.

Avaliar a inclusão de scripts como:

```json
{
  "cloud:data:build": "...",
  "cloud:data:check": "...",
  "validate": "pnpm run check && pnpm run lint && pnpm run build"
}
```

Os nomes finais podem mudar, desde que a intenção permaneça clara.

### 9. Execução e validação no Cloud

Documentar dois modos:

- desenvolvimento: `pnpm run dev`, com porta e sinal de prontidão definidos;
- validação: `pnpm run check`, `pnpm run lint` e `pnpm run build`.

Se houver instruções de inicialização automática para o agente, elas devem
informar como:

1. preparar os dados;
2. iniciar o servidor;
3. detectar que ele está pronto;
4. executar smoke tests;
5. encerrar processos em segundo plano.

Não usar `just run` ou `just build` na automação, porque esses alvos formatam
o repositório e podem misturar alterações alheias à tarefa.

Os smoke tests devem cobrir pelo menos:

- página inicial;
- lista e busca de ex-alunos;
- detalhe de um ex-aluno;
- lista e entrega de uma foto;
- abertura do formulário de cadastro;
- tentativa controlada de upload com fixture segura.

### 10. Guia de trabalho com tarefas Cloud

Criar um guia curto explicando:

- tarefa: unidade de trabalho com objetivo e resultado verificável;
- turno: interação adicional dentro da mesma tarefa;
- workspace: checkout isolado associado à tarefa;
- ambiente: configuração usada para criar/preparar o workspace;
- como localizar uma tarefa pelo título ou identificador;
- como reabrir e continuar a tarefa;
- o que é preservado e o que é efêmero;
- como inspecionar diff, logs e verificações;
- como trazer as mudanças para o Git local;
- como publicar uma branch e abrir ou revisar um pull request;
- como atualizar o pacote de dados sanitizado.

Deixar explícito que tarefas paralelas não compartilham automaticamente o mesmo
workspace nem alterações não commitadas.

### 11. Convenção de branches e integração

Adotar para o trabalho Cloud:

- uma branch por tarefa coerente;
- prefixo `codex/` para branches criadas por tarefas Cloud, salvo limitação da
  integração;
- branch criada a partir da referência remota atualizada escolhida para a
  tarefa;
- nenhum commit direto em `main`;
- nenhum merge automático sem revisão;
- commits pequenos e identificáveis;
- título/ID da tarefa registrado no pull request ou handoff.

Ao concluir uma tarefa:

1. revisar o diff no workspace;
2. executar as validações;
3. registrar limitações;
4. criar commit/branch ou usar o mecanismo de aplicar mudanças oferecido pela
   interface;
5. revisar localmente ou por pull request;
6. integrar somente após aprovação.

Para tarefas paralelas que alterem os mesmos arquivos, documentar a ordem de
integração e a necessidade de atualizar/rebasear a segunda branch e repetir os
testes.

### 12. Documentação do repositório

Atualizar:

- `README.md` com um caminho curto para execução local e Cloud;
- `.env.example` com variáveis e valores de teste;
- `AGENTS.md` somente se surgirem comandos ou regras permanentes;
- um novo guia, por exemplo `docs/codex-cloud.md`;
- documentação do gerador e da política de atualização do pacote.

A documentação deve distinguir claramente:

- dados públicos do site;
- dados privados omitidos;
- dados fictícios usados apenas para satisfazer o schema;
- segredos de teste;
- segredos de produção, que são proibidos no ambiente de desenvolvimento.

## Plano de implementação

As etapas abaixo pertencem a esta issue e são executadas localmente. As duas
últimas produzem o handoff e o roteiro de validação; a criação e execução da
tarefa Cloud ocorrerão somente depois que esta preparação estiver revisada e
integrada ao repositório.

1. Confirmar o mecanismo atual de configuração e transferência de artefatos do
   Codex Cloud.
2. Inventariar versões, variáveis, dependências e recursos externos.
3. Inventariar as queries e classificar as colunas do banco.
4. Definir formalmente a lista positiva de tabelas e campos exportáveis.
5. Definir um conjunto pequeno de cenários e fotos representativos.
6. Implementar o gerador de banco sanitizado.
7. Implementar a cópia e validação segura das fotos.
8. Criar manifesto, checksums e auditorias automáticas.
9. Proteger artefatos por meio dos arquivos de ignore.
10. Atualizar os exemplos de ambiente e scripts do projeto.
11. Configurar a preparação reproduzível do ambiente Cloud.
12. Escrever o guia de tarefas, workspaces, branches e revisão.
13. Executar smoke tests localmente com o pacote sanitizado.
14. Produzir o handoff com os comandos, artefatos e critérios de verificação da
    primeira tarefa Cloud.
15. Registrar como trabalho posterior os testes de uma tarefa piloto e de duas
    tarefas paralelas, incluindo isolamento e fluxo de integração.

## Fora de escopo

- disponibilizar o banco ou fotos de produção no Git;
- replicar todos os registros históricos no ambiente de teste;
- criar autenticação ou autorização para o site;
- alterar amplamente o visual;
- migrar SQLite para outro banco;
- automatizar deploy em produção;
- resolver nesta issue as regras de produto de campos cuja publicação seja
  ambígua — eles permanecerão omitidos.

## Critérios de aceitação

- [ ] Um clone limpo consegue instalar dependências com comando documentado.
- [ ] O banco sanitizado é gerado sem modificar o banco de origem.
- [ ] O `.env`, o banco e as fotos de origem permanecem inalterados, conforme
      verificações anteriores e posteriores à geração.
- [ ] Uma saída existente não é sobrescrita sem uma ação explícita e segura.
- [ ] Nenhuma etapa local executa limpeza ampla de arquivos ignorados.
- [ ] O exportador usa lista positiva de campos.
- [ ] Nenhum dado privado real aparece no banco, nas fotos, no manifesto, nos
      logs ou no Git.
- [ ] O schema, a view e as queries necessárias funcionam com valores privados
      omitidos ou sintéticos.
- [ ] Apenas fotos públicas, não excluídas e referenciadas são copiadas.
- [ ] Banco, fotos, `.env` e demais artefatos gerados estão ignorados pelo Git.
- [ ] O pacote pode ser reconstruído e validado por comandos documentados.
- [ ] A configuração preparada define `DB_PATH` e `FOTOS_DIR` sem usar
      caminhos do WSL.
- [ ] Turnstile possui configuração de teste sem segredo de produção.
- [ ] `pnpm run check`, `pnpm run lint` e `pnpm run build` passam localmente
      usando o pacote sanitizado.
- [ ] Os smoke tests dos fluxos públicos passam localmente usando apenas os dados
      sanitizados.
- [ ] O handoff contém tudo o que uma tarefa posterior precisa para iniciar no
      Cloud sem acessar o WSL.
- [ ] O guia explica tarefa, turno, workspace, ambiente, branch, commit, revisão
      e recuperação do resultado.
- [ ] A validação piloto e a validação de tarefas paralelas estão especificadas
      como uma tarefa posterior ao merge desta preparação.
- [ ] O procedimento de atualização dos dados está documentado.

## Validação manual esperada

1. Registrar hashes, tamanhos e datas relevantes das fontes antes da geração.
2. Gerar o pacote duas vezes a partir da mesma origem e comparar o resultado ou
   explicar qualquer campo deliberadamente não determinístico; depois, confirmar
   que o `.env`, o banco e as fotos de origem não foram alterados.
3. Procurar no pacote amostras conhecidas de valores privados da origem, sem
   imprimir esses valores nos logs.
4. Abrir o banco e executar as consultas usadas pelas rotas.
5. Confirmar que cada foto do banco existe e que nenhum arquivo extra foi
   copiado.
6. Iniciar o servidor usando somente o pacote e as variáveis de teste.
7. Navegar pelos fluxos públicos e executar uma gravação descartável.
8. Revisar o handoff que será entregue à primeira tarefa Cloud.

Como validação posterior, fora desta issue, criar uma tarefa Cloud piloto e
duas tarefas paralelas, confirmar o isolamento dos workspaces e revisar o fluxo
de branch, diff, testes e integração.

## Arquivos previstos

A lista exata será confirmada durante a implementação, mas provavelmente inclui:

- `scripts/export_cloud_data.py` ou equivalente;
- `scripts/check_cloud_data.py` ou equivalente;
- `docs/codex-cloud.md`;
- `.env.example`;
- `.gitignore`;
- `.dockerignore`, se existir ou for necessário;
- `package.json`;
- `README.md`;
- `AGENTS.md`, apenas para instruções permanentes;
- fixtures públicas ou inteiramente sintéticas de tamanho reduzido.

## Riscos e cuidados

- Uma branch Git não protege arquivos ignorados: a segurança das fontes locais
  depende das validações e dos limites dos scripts.
- O `.env`, o banco e as fotos locais nunca podem ser tratados como arquivos de
  trabalho descartáveis.
- “Está publicado no site” não torna automaticamente pública toda coluna do
  mesmo registro.
- Metadados de imagem e nomes de arquivos também podem carregar informação
  privada.
- Remover colunas do schema pode quebrar a view e queries; neutralizar valores é
  a opção inicial mais compatível.
- Um workspace efêmero não é armazenamento permanente nem backup.
- Um pacote grande torna a preparação lenta e incentiva soluções inseguras.
- Chaves de teste não podem ser reutilizadas em produção.
- A automação deve falhar de forma fechada: em caso de dúvida sobre um campo ou
  arquivo, ele não é exportado.
