# ISSUE-018 — Reduzir riscos de exposição no repositório público

**Estado:** Aguardando validação externa

**Área:** Segurança, privacidade e implantação

**Arquivos principais:** `.gitignore`, `.dockerignore`, `src/app.html`,
`src/routes/+layout.svelte`

## Contexto

O repositório passou a ser público. Uma revisão do conteúdo versionado e do
histórico não encontrou banco SQLite, diretório de fotos, arquivo `.env`, chave
privada ou credenciais atuais do Umami. O segredo do Turnstile que aparecia em
commits antigos já foi rotacionado, e os endereços de e-mail publicados são
intencionais.

Ainda existem pontos que podem facilitar exposições acidentais futuras ou
ampliar desnecessariamente a superfície de risco:

- o `.dockerignore` não exclui explicitamente `.env`, fotos, backups e alguns
  diretórios de dados persistentes;
- o `.gitignore` permite que um arquivo `.env.test` seja versionado;
- o rastreador do Umami aparece de forma fixa em `src/app.html` e também é
  carregado dinamicamente pelo layout;
- o bloco fixo do Umami possui dois atributos `src`, incluindo referência a
  `recorder.js`, sem uma decisão explícita de produto sobre gravação de sessão;
- as proteções de segredo e dependências do GitHub precisam ser confirmadas na
  configuração externa do repositório.

## Modificação proposta

Endurecer as regras de exclusão do Git e do contexto Docker, manter uma única
integração configurável do Umami e documentar as proteções que devem permanecer
habilitadas no GitHub.

A mudança não deve remover os e-mails públicos nem reescrever o histórico Git.
Também não é necessária uma nova rotação do Turnstile como parte desta issue.

## Alterações previstas

### Proteção do contexto Docker

Adicionar ao `.dockerignore`, no mínimo:

```gitignore
.env
.env.*
!.env.example
Fotos/
database/
backups/
db.sqlite3
*.sqlite
*.sqlite3
*.sql
*.sql.gz
*.tar.gz
```

Manter fora do contexto de build outros caches, resultados de compilação e
dados locais já ignorados. Avaliar a lista final com `docker build` sem incluir
arquivos persistentes necessários somente em runtime.

### Proteção de arquivos de ambiente

Remover do `.gitignore` a exceção que permite `.env.test`. Se futuramente forem
necessárias variáveis de exemplo para testes, usar um arquivo como
`.env.test.example`, contendo apenas valores fictícios e explicitamente
permitido pelo `.gitignore`.

Manter `.env.example` versionado sem credenciais reais.

### Integração do Umami

Remover de `src/app.html` o bloco fixo do rastreador. Manter somente o
carregamento configurável já existente em `src/routes/+layout.svelte`,
condicionado a `PUBLIC_UMAMI_URL` e `PUBLIC_UMAMI_WEBSITE_ID`.

Não carregar `recorder.js` nesta issue. Uma eventual gravação de sessão deve
ser objeto de decisão específica de produto e privacidade, com revisão da
Política de Privacidade, consentimento e minimização dos dados capturados.

Confirmar que o rastreador é inserido no máximo uma vez por carregamento da
aplicação, que respeita `data-do-not-track` e que não envia parâmetros de busca
com dados inseridos por visitantes.

### Configuração do GitHub

Confirmar manualmente no repositório público:

- Secret scanning habilitado;
- Push protection habilitado;
- Dependabot alerts habilitado;
- Dependabot security updates habilitado;
- branch `main` protegida, conforme a configuração já adotada.

Essas configurações externas não são substituídas por alterações nos arquivos
do repositório. O resultado da conferência deve ser registrado nesta issue ou
no Pull Request, sem capturas que revelem alertas, tokens ou dados privados.

## Regras a atender

- Não adicionar ao Git nem ao contexto Docker `.env`, bancos, fotos, backups,
  dumps, chaves ou credenciais.
- Não incluir valores reais de produção em arquivos de exemplo, documentação,
  testes ou mensagens de commit.
- Preservar `DB_PATH`, `FOTOS_DIR` e os segredos como configuração externa em
  runtime.
- Manter as portas dos serviços publicadas somente em `127.0.0.1`, como ocorre
  atualmente, sem expor PostgreSQL diretamente.
- Manter apenas uma forma de carregar o Umami e não ativar gravação de sessão.
- Não tratar o Website ID público do Umami ou a site key pública do Turnstile
  como segredos.
- Não remover os endereços de e-mail cuja publicação é intencional.
- Não reescrever o histórico Git, pois o segredo antigo do Turnstile já foi
  rotacionado e não foram encontrados outros segredos reais no histórico.
- Não divulgar em logs ou documentação o conteúdo de alertas de segurança que
  possa incluir uma credencial completa.
- Preservar o funcionamento do site quando as variáveis opcionais do Umami não
  estiverem configuradas.

## Fora do escopo

- Nova rotação do Turnstile.
- Ocultar os e-mails públicos do site ou os metadados de autoria dos commits.
- Remover do histórico valores já invalidados.
- Implantar um novo serviço de analytics ou gravação de sessão.
- Alterar a Política de Privacidade, salvo se durante a implementação for
  descoberto que há coleta diferente da atualmente documentada.
- Alterar a estratégia de versionamento da imagem do Umami; a tag `latest`
  será mantida por decisão do responsável pelo projeto.
- Modificar autenticação, autorização, schema, banco ou regras de negócio.
- Atualizar a aplicação ou todas as imagens Docker sem relação com estas
  medidas de segurança.

## Critérios de aceite

- `.dockerignore` exclui arquivos de ambiente, bancos, fotos, backups, dumps e
  compactações de dados persistentes.
- Um arquivo `.env`, uma foto e um banco de teste colocados localmente não são
  enviados ao contexto nem aparecem em nenhuma camada da imagem construída.
- `.env.test` permanece ignorado; apenas arquivos terminados em `.example`,
  com valores fictícios, podem ser versionados quando explicitamente
  necessários.
- `src/app.html` não contém URL, Website ID ou script fixo do Umami.
- Com variáveis do Umami ausentes, nenhum rastreador é carregado e o site
  continua funcionando.
- Com variáveis válidas, apenas um `script.js` do Umami é carregado e nenhum
  `recorder.js` é solicitado.
- Secret scanning, Push protection, Dependabot alerts e security updates foram
  conferidos no GitHub, sem inclusão de segredos no registro da validação.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passam.
- `docker compose config` e a construção da imagem da aplicação passam.

## Validação manual sugerida

Criar temporariamente, com conteúdo totalmente fictício, arquivos e diretórios
representativos (`.env.test`, `Fotos/`, `backups/` e um `.sqlite3`). Confirmar
com `git status --ignored` que permanecem ignorados. Remover esses artefatos de
teste após a conferência.

Construir a imagem sem cache e inspecionar o conteúdo final para confirmar que
nenhum arquivo de ambiente, banco, foto ou backup foi incluído. Não usar dados
reais nessa validação.

Executar a aplicação uma vez sem as variáveis do Umami e outra vez com valores
de teste. Nas ferramentas de rede do navegador, confirmar que há zero ou uma
requisição ao `script.js`, conforme a configuração, e nenhuma requisição ao
`recorder.js`.

## Documentos complementares

### Ler antes da implementação

- `AGENTS.md`, especialmente as regras de privacidade, segredos e dados
  persistentes.
- `.gitignore` e `.dockerignore`.
- `src/app.html` e `src/routes/+layout.svelte`.
- `compose.yaml`, `.env.example` e `deploy/README.md`.
- `docs/redesign/privacy-data.md` e a Política de Privacidade publicada.

### Atualizar ao implementar

- Esta issue, com as verificações realizadas e o estado final.

## Arquivos previstos

- `.gitignore`.
- `.dockerignore`.
- `src/app.html`.
- `src/routes/+layout.svelte`, somente se necessário para garantir uma única
  carga do rastreador e os parâmetros de privacidade.

Não se prevê alteração de schema, migração, banco, fotos, autenticação ou
conteúdo público dos perfis.

## Resultado da implementação

- Removida do `.gitignore` a exceção que permitia versionar `.env.test`.
- O `.dockerignore` agora exclui arquivos `.env`, fotos, bancos, diretórios de
  dados e backups, dumps SQL e arquivos compactados de dados persistentes.
- Corrigido também o nome do diretório gerado `.svelte-kit` nas exclusões do
  contexto Docker.
- Removido de `src/app.html` o bloco fixo e duplicado do Umami, incluindo a
  referência a `recorder.js` e o Website ID embutido.
- O Umami permanece opcional e é carregado somente por
  `src/routes/+layout.svelte` quando `PUBLIC_UMAMI_URL` e
  `PUBLIC_UMAMI_WEBSITE_ID` estão configurados.
- O script dinâmico recebeu um identificador estável e a inserção é ignorada se
  já houver um rastreador no documento, evitando carregamento duplicado.
- A tag `latest` do Umami foi preservada conforme decisão do responsável pelo
  projeto.
- `git check-ignore --no-index` confirmou as exclusões de `.env`, `.env.test`,
  `.env.production`, `Fotos/`, `database/`, `backups/` e `db.sqlite3`; o arquivo
  `.env.example` permanece elegível para versionamento.
- `docker compose config --quiet` passou com valores fictícios fornecidos
  somente ao processo de validação.
- `docker build --no-cache -t etfsp:issue-018 .` passou. A inspeção da imagem
  final não encontrou arquivos de ambiente, bancos, fotos, backups ou dumps.
- `pnpm run check` passou sem erros, mantendo três avisos preexistentes em
  outros componentes.
- `pnpm run lint`, `pnpm run build` e `git diff --check` passaram em 5 de
  setembro de 2026.

## Validação externa pendente

Não foi possível consultar as opções de segurança do GitHub porque o `gh` não
está autenticado neste ambiente. Antes de concluir a issue, conferir no GitHub
Secret scanning, Push protection, Dependabot alerts e Dependabot security
updates. A proteção da branch `main` já foi confirmada pelo responsável pelo
projeto.
