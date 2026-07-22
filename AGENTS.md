# AGENTS.md

## Visão geral

Este repositório implementa o site `etfsp.com`, voltado a ex-alunos da antiga
ETFSP. Os fluxos principais são cadastro de ex-alunos, busca e consulta de
colegas, envio de fotos e consulta das fotos publicadas.

O projeto preserva parte da aparência e dos dados de um site legado. Ao alterar
uma tela, mantenha o conteúdo em português e evite modernizações visuais amplas
que não façam parte da tarefa.

## Stack e execução

- SvelteKit 2, Svelte 5 e TypeScript em modo estrito.
- Adapter Node; Vite faz o build.
- SQLite via `sqlite3`; não há ORM.
- `sharp` valida/converte uploads e produz miniaturas WebP.
- Cloudflare Turnstile protege o cadastro.
- `pnpm` é o gerenciador de pacotes e `just` agrupa os comandos usuais.

Variáveis de ambiente necessárias em runtime:

- `DB_PATH`: caminho do banco SQLite existente e gravável.
- `FOTOS_DIR`: diretório existente e gravável das fotos.
- `CF_TURNSTILE_SECRET`: segredo do Turnstile.
- `PUBLIC_CF_TURNSTILE_SITEKEY`: site key usada no cliente.

Comandos de validação:

```sh
pnpm run check
pnpm run lint
pnpm run build
```

`pnpm run lint` apenas verifica Prettier. Para formatar, use
`pnpm run format`. Os alvos `just run` e `just build` formatam o repositório
antes de executar; não os use se uma reescrita global de formatação puder
misturar alterações alheias à tarefa.

Não há suíte de testes automatizados no momento. Em mudanças funcionais,
execute pelo menos `pnpm run check` e o build; descreva qualquer validação
manual relevante no handoff.

## Mapa do repositório

- `src/routes/`: rotas e endpoints SvelteKit.
  - `novocadastro/`: formulário e action de cadastro.
  - `exalunos_lista/`: pesquisa e ordenação de ex-alunos.
  - `detalhe_exaluno/`: perfil público consultado por `?id=`.
  - `cadfoto/`: identifica o ex-aluno e recebe o upload.
  - `lista_foto/`: filtros e galeria.
  - `Fotos/[file]/`: entrega arquivos do diretório de fotos.
- `src/lib/server/index.ts`: inicializa a conexão SQLite e resolve
  `FOTOS_DIR`; importe somente em código de servidor.
- `src/lib/server/turnstile.ts`: validação server-side do Turnstile.
- `src/lib/`: componentes compartilhados de layout e apresentação.
- `src/app.css`: estilos globais e identidade visual legada.
- `scripts/initial.sql`: schema canônico de `ExAlunos`, `Fotos` e da view
  `qryExAlunos`.
- `scripts/make_db.py`: importa os CSVs legados; é uma ferramenta destrutiva,
  pois recria `db.sqlite3`.
- `static/`: imagens e demais assets públicos versionados.

## Convenções de implementação

- Use os padrões de Svelte 5 já presentes (`$props`, `$state`, `$derived`) e
  mantenha acesso a banco, filesystem, segredos e processamento de imagens em
  arquivos server-only (`+page.server.ts`, `+server.ts` ou `src/lib/server`).
- Prefira tipos explícitos para linhas do SQLite, dados de formulário e retornos
  de actions. Não amplie o uso de `any`.
- Todas as consultas devem ser parametrizadas. Valores escolhidos pelo usuário
  nunca devem ser interpolados em SQL; para ordenação, use uma allowlist que
  converta a opção em fragmento SQL conhecido.
- Valide no servidor tudo o que vier de URL, formulário ou upload. Validação no
  navegador serve apenas para usabilidade.
- Ao envolver as callbacks de `sqlite3` em promises, resolva/rejeite em todos os
  caminhos e sempre aguarde (`await`) gravações no banco e no filesystem antes
  de retornar sucesso.
- Preserve a exclusão lógica: consultas públicas de `ExAlunos` e `Fotos` devem
  filtrar `Excluido = 0`.
- Datas persistidas usam Unix timestamp em milissegundos (`Date.now()`).
- O banco e `FOTOS_DIR` são estado persistente externo. Não os coloque em
  `static/`, não os versiona e não os recrie durante testes comuns.
- Se o schema mudar, atualize `scripts/initial.sql`, a view `qryExAlunos`, o
  importador legado e todas as interfaces/consultas afetadas. Para bancos já
  implantados, forneça também uma migração explícita; editar apenas o schema
  inicial não migra dados existentes.

## Privacidade e segurança

Dados de ex-alunos exigem tratamento conservador. A tabela `ExAlunos` mistura
campos destinados ao perfil com dados pessoais/sensíveis, incluindo e-mail,
endereço, CEP, telefone, CPF, prontuário e IP. O banco também possui flags como
`OcultarEmail` e `PublicaTelefone`.

- Considere privado todo campo que não tenha autorização explícita para
  publicação. Se a regra de visibilidade estiver ambígua, não exponha o dado e
  peça uma decisão de produto.
- Aplique as flags de visibilidade na consulta server-side. Ocultar apenas no
  componente Svelte ainda envia o dado ao navegador.
- Retorne das queries e loads somente as colunas necessárias para a tela. Nunca
  use `SELECT *` em endpoints públicos.
- Não registre formulários, registros completos, e-mails, endereços, tokens,
  IPs, caminhos privados ou segredos. Mensagens de erro ao usuário não devem
  revelar SQL, filesystem ou stack traces.
- Atualmente não existe uma camada de autenticação no projeto. Não trate o ID
  do ex-aluno, o nome selecionado, campos hidden ou parâmetros da URL como prova
  de identidade/autorização.
- Turnstile reduz abuso, mas não substitui autenticação, autorização, limites
  de requisição nem validação de entrada.
- Em uploads, imponha limite de tamanho, decodifique a imagem com `sharp` e gere
  nomes controlados pelo servidor. Não confie apenas em extensão ou MIME enviado
  pelo cliente.
- Ao servir fotos, rejeite separadores, `..`, caminhos absolutos e qualquer
  resolução que saia de `FOTOS_DIR`. Prefira localizar o nome armazenado por um
  registro não excluído no banco antes de ler o arquivo.
- Fotos podem conter pessoas além de quem fez o upload. Mudanças em publicação,
  moderação, remoção ou consentimento devem preservar exclusão lógica e a
  possibilidade de auditoria, sem tornar metadados privados públicos.

## Regras dos fluxos atuais

- Cadastro exige nome, e-mail, curso, ano de ingresso e ano de saída, além de
  Turnstile. Mantenha validação equivalente no servidor ao alterar o formulário.
- Busca por nome deve escapar curingas de `LIKE` (`%` e `_`) e continuar usando
  parâmetros SQL.
- Upload aceita PNG, GIF, JPEG, WebP ou AVIF, com limite atual de 5 MB, e persiste
  original convertido e miniatura no diretório configurado.
- `FotoPessoal` indica a foto usada no perfil/lista, e `Carometro` separa esse
  tipo de acervo nos filtros. Não confunda essas flags com permissão de acesso.
- A view `qryExAlunos` sustenta listagem e detalhe. Alterações nela podem afetar
  ambas as telas e a contagem/miniatura de fotos.

## Critérios para concluir uma mudança

- Escopo pequeno e coerente com a arquitetura atual.
- Nenhum dado privado novo aparece em HTML, JSON, logs ou mensagens de erro.
- Entradas e autorização são verificadas no servidor.
- SQL permanece parametrizado e consultas respeitam exclusão/visibilidade.
- Operações de banco e arquivo terminam antes de uma resposta de sucesso.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passam, ou limitações são
  relatadas claramente.
