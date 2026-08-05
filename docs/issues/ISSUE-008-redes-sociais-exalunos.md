# ISSUE-008 — Redes sociais no cadastro e no perfil de ex-alunos

**Estado:** Concluída

**Áreas:** Cadastro e detalhe de ex-alunos

**Rotas afetadas:** `/novocadastro` e `/detalhe_exaluno`

## Contexto

O cadastro não possui campos próprios para redes sociais. Quem deseja publicar
seus perfis no Instagram, Facebook ou LinkedIn não dispõe de uma forma
estruturada de informá-los, e a página pública de detalhes não apresenta esses
contatos.

Como existem bancos SQLite já implantados, acrescentar os campos apenas ao
schema inicial quebraria a aplicação ao consultar uma instalação antiga. A
mudança precisa incluir uma migração explícita, idempotente e executada durante
a inicialização da aplicação.

## Modificação proposta

Adicionar ao cadastro os campos opcionais “Instagram”, “Facebook” e “LinkedIn”.
Cada campo deve receber a URL completa do perfil na rede correspondente.
Valores válidos devem ser armazenados em novas colunas de `ExAlunos` e
apresentados no perfil público com o ícone e o nome da rede.

O preenchimento deve ser acompanhado de ajuda clara informando que a URL será
publicada no perfil. Campo vazio significa que aquela rede não será publicada.

## Contrato dos campos

| Campo     | Coluna SQLite | Regra quando preenchido      |
| --------- | ------------- | ---------------------------- |
| Instagram | `Instagram`   | URL HTTPS em `instagram.com` |
| Facebook  | `Facebook`    | URL HTTPS em `facebook.com`  |
| LinkedIn  | `LinkedIn`    | URL HTTPS em `linkedin.com`  |

As três colunas devem ser `TEXT`, aceitar `NULL` e não possuir valor padrão
publicável. O valor canônico persistido deve ser uma URL HTTPS completa; não
armazenar apenas nomes de usuário.

## Validação e normalização

- Os três campos são opcionais. Após remover espaços nas extremidades, valor
  vazio deve ser persistido como `NULL`.
- A validação no navegador serve para usabilidade, mas a mesma regra deve ser
  aplicada obrigatoriamente no servidor antes do `INSERT`.
- Usar o parser `URL`, não expressões regulares isoladas, para interpretar o
  endereço.
- Aceitar somente o protocolo `https:`.
- Aceitar o domínio oficial e seus subdomínios, comparando o hostname
  normalizado com `dominio-oficial` ou com o sufixo
  `.dominio-oficial`. A regra não pode aceitar domínios visualmente parecidos,
  como `instagram.com.exemplo.net`.
- Rejeitar URL com usuário ou senha embutidos, porta explícita ou hostname fora
  da rede correspondente.
- Definir e aplicar um limite de 500 caracteres tanto no formulário quanto no
  servidor.
- Remover o fragmento (`#...`) antes de persistir. Preservar caminho e query
  válidos, pois algumas redes podem usá-los na identificação do perfil.
- Não tentar completar silenciosamente protocolo, domínio ou nome de usuário.
  Uma entrada ambígua deve produzir mensagem clara em português junto ao campo.
- Centralizar a validação e a normalização em código compartilhado
  server-side, orientado pela allowlist de domínios, evitando três
  implementações divergentes.
- Em erro de qualquer campo, devolver somente os valores seguros necessários
  para preencher novamente o formulário; não registrar as URLs nem detalhes
  internos.

## Schema e migração de bancos existentes

- Atualizar `scripts/initial.sql` para que bancos novos já contenham
  `Instagram`, `Facebook` e `LinkedIn`.
- Atualizar `scripts/make_db.py` para aceitar fontes legadas sem esses campos e,
  se eles existirem na fonte, importar somente valores que passem pela mesma
  política de validação ou deixá-los como `NULL`.
- Criar um mecanismo server-only de migrações incrementais e versionadas. Não
  espalhar comandos de alteração de schema entre rotas.
- Manter em SQLite uma tabela de histórico de migrações, criada com
  `CREATE TABLE IF NOT EXISTS`, e registrar a migração das redes sociais por um
  identificador estável.
- Na inicialização, consultar `PRAGMA table_info(ExAlunos)` e adicionar somente
  as colunas ausentes com `ALTER TABLE ... ADD COLUMN`. Nomes de tabela e coluna
  devem ser constantes do código, nunca derivados de entrada externa.
- Executar verificação, alterações e registro da migração de forma
  transacional. Serializar a inicialização na instância e tratar concorrência
  entre processos sem depender de erro `duplicate column` como fluxo normal.
- Só disponibilizar a conexão para as rotas depois que todas as migrações
  terminarem. Se uma migração falhar, a aplicação deve falhar na inicialização,
  em vez de atender parcialmente com schema incompatível.
- A segunda inicialização e as seguintes não devem alterar novamente o schema.
  Um banco parcialmente migrado deve receber somente as colunas ausentes.
- Não recriar o banco, não apagar dados e não executar
  `scripts/make_db.py` como migração.
- Registrar apenas o identificador e o resultado operacional da migração, sem
  SQL completo, caminho de `DB_PATH`, dados pessoais ou stack trace em resposta
  ao usuário.
- Documentar que o processo precisa de permissão de escrita em `DB_PATH` para
  aplicar migrações.

A view `qryExAlunos` só deve receber as novas colunas se algum consumidor
realmente precisar delas. A rota de detalhe atualmente consulta `ExAlunos`
diretamente, portanto não se deve ampliar a view sem necessidade.

## Cadastro

- Apresentar os campos próximos aos demais meios de contato, com `type="url"`,
  `inputmode="url"`, `autocomplete="url"` e limite de tamanho coerente com o
  servidor.
- Informar no próprio formulário que o preenchimento autoriza a publicação da
  URL no perfil público.
- Preservar os três valores após falha de validação para que a pessoa corrija
  apenas o necessário.
- Incluir as novas colunas e parâmetros no `INSERT`, mantendo a consulta
  parametrizada e aguardando sua conclusão antes de retornar sucesso.
- O cadastro sem nenhuma rede social deve continuar funcionando normalmente.
- Não alterar os campos obrigatórios, o Turnstile ou as demais validações
  existentes.

## Perfil público

- A consulta server-side de `/detalhe_exaluno` deve selecionar explicitamente
  as três novas colunas e continuar filtrando `Excluido = 0`.
- Validar novamente os valores lidos antes de incluí-los no objeto público.
  Dados legados inválidos devem ser omitidos, não renderizados como links.
- Enviar ao navegador somente as redes preenchidas e válidas.
- Exibir cada rede com ícone reconhecível e nome textual acessível. O ícone não
  pode ser a única fonte do nome para tecnologias assistivas.
- Preferir SVG local e versionado ou componente próprio; não carregar script,
  fonte ou rastreador externo para obter os ícones.
- Cada link deve abrir uma nova aba ou janela com `target="_blank"` e
  `rel="noopener noreferrer"`.
- Não renderizar ícone, rótulo, link ou espaço reservado para campo ausente.
- O estado de contato deve considerar as redes sociais, de modo que a seção
  apareça mesmo quando elas forem os únicos contatos públicos.
- Não alterar a visibilidade de e-mail, telefone ou qualquer outro dado
  pessoal.

## Fora do escopo

- Permitir edição das redes sociais após o cadastro.
- Consultar APIs das redes, confirmar a existência do perfil ou obter avatar,
  nome e demais metadados externos.
- Implementar login social, OAuth, compartilhamento ou contadores.
- Inferir redes sociais a partir de `HomePage`, comentários ou dados legados.
- Publicar redes sociais vazias ou inválidas.
- Alterar as regras de exclusão lógica ou autenticação da aplicação.

## Critérios de aceite

- Um banco novo contém as três colunas opcionais com tipo `TEXT`.
- Um banco existente sem as colunas é migrado automaticamente, sem perda ou
  alteração dos dados anteriores.
- Um banco parcialmente migrado recebe somente as colunas ausentes.
- Inicializações posteriores não repetem a alteração de schema nem falham.
- A aplicação não começa a atender requisições se a migração necessária
  falhar.
- O cadastro funciona com os três campos vazios e persiste `NULL`.
- Uma URL HTTPS válida de cada domínio permitido é normalizada e persistida na
  coluna correspondente.
- Protocolo, domínio, credenciais, porta, tamanho ou sintaxe inválidos são
  rejeitados no servidor com mensagem associada ao campo correto.
- Falha em outro campo preserva as URLs sociais válidas no formulário.
- Um perfil mostra somente as redes preenchidas e válidas, com ícone, nome
  acessível e abertura segura em nova aba ou janela.
- Uma URL inválida já existente no banco não é enviada ao navegador nem
  transformada em link.
- Nenhum novo dado privado aparece em listagens, logs ou mensagens de erro.
- As consultas permanecem parametrizadas e o detalhe continua respeitando
  `Excluido = 0`.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passam.

## Validação manual sugerida

Validar a inicialização com: banco novo; banco legado sem as três colunas;
banco com apenas uma ou duas colunas; segunda inicialização; duas instâncias
iniciando próximas; e banco sem permissão de escrita.

No formulário, testar vazio; uma URL válida de cada rede; subdomínio oficial;
HTTP; domínio semelhante; rede trocada de campo; credenciais; porta; URL
malformada; mais de 500 caracteres; fragmento; e falha em outro campo após
informar redes válidas. Conferir no perfil o comportamento com nenhuma, uma e
três redes, inclusive por teclado e leitor de tela.

## Documentos complementares

### Ler antes da implementação

- `AGENTS.md`, especialmente alterações de schema, privacidade, validação
  server-side e inicialização do SQLite.
- `docs/redesign/functional-spec.md`, seções de cadastro e perfil público.
- `docs/redesign/privacy-data.md`, para registrar o novo dado público
  opcional.
- `docs/redesign/design-system.md`, para campos, links, ícones e
  acessibilidade.
- `scripts/initial.sql` e `scripts/make_db.py`.

### Atualizar ao implementar

- `docs/redesign/functional-spec.md`, documentando os campos, sua validação e a
  apresentação no perfil.
- `docs/redesign/privacy-data.md`, registrando que cada URL social é pública
  somente quando informada voluntariamente no campo correspondente.
- `docs/redesign/design-system.md`, caso seja criado um padrão reutilizável de
  link social com ícone.
- Esta issue, registrando a estratégia final de migração, validações executadas,
  resultado e estado final.

## Arquivos de código previstos

- `scripts/initial.sql`.
- `scripts/make_db.py`.
- `src/lib/server/index.ts` e novos módulos server-only de migração e validação.
- `src/lib/domain.ts`.
- `src/routes/novocadastro/+page.server.ts`.
- `src/routes/novocadastro/Formulario.svelte`.
- `src/routes/detalhe_exaluno/+page.server.ts`.
- `src/routes/detalhe_exaluno/+page.svelte`.
- Assets ou componente local de ícones, se necessário.

## Resultado da implementação

- Adicionadas as colunas opcionais `Instagram`, `Facebook` e `LinkedIn` ao
  schema canônico e ao importador legado.
- Criado o histórico `SchemaMigrations` e a migração
  `2026-07-29-add-social-networks`, executada em `BEGIN IMMEDIATE` antes de a
  conexão ser exportada para as rotas. A migração verifica o schema, adiciona
  somente colunas ausentes e permanece idempotente.
- Centralizada a validação server-only das redes sociais, exigindo HTTPS,
  domínio oficial, ausência de credenciais e porta, limite de 500 caracteres e
  remoção de fragmentos.
- Adicionados ao cadastro os três campos opcionais, suas mensagens de
  privacidade, preservação em erros e persistência parametrizada como URL
  normalizada ou `NULL`.
- O perfil público valida novamente os dados armazenados e apresenta somente
  redes válidas, com ícone local, nome textual, aviso acessível de nova janela,
  `target="_blank"` e `rel="noopener noreferrer"`.
- Atualizados os contratos em `functional-spec.md`, `privacy-data.md`,
  `design-system.md` e `implementation-plan.md`.
