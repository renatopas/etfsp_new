# ISSUE-016 — Atualizar dependências e imagem Docker

**Estado:** Concluída

**Área:** Manutenção, segurança e implantação

**Arquivos principais:** `package.json`, `pnpm-lock.yaml`, `Dockerfile`

## Contexto

As bibliotecas do projeto precisam ser mantidas atualizadas para incorporar
correções de bugs, correções de segurança e melhorias de compatibilidade. A
atualização deve considerar dependências de produção, dependências de
desenvolvimento, ferramentas de build e a versão do Node.js usada na imagem de
produção.

O projeto fixa o gerenciador em `pnpm@10.11.0` e atualmente usa `node:23-alpine`
nas etapas de build e execução do `Dockerfile`. A atualização da imagem não
deve ser tratada como uma alteração isolada: a versão escolhida precisa ser
compatível com SvelteKit, Vite, `sharp`, `sqlite3`, pnpm e o ambiente de
produção.

## Modificação proposta

Fazer uma atualização planejada das dependências declaradas em
`package.json`, regenerar o `pnpm-lock.yaml` e revisar a imagem base do
`Dockerfile`. Registrar as versões adotadas, incompatibilidades encontradas e
eventuais ajustes de código necessários.

As atualizações devem ocorrer em uma branch própria e ser entregues por Pull
Request para `main`, preservando a branch protegida.

## Plano de trabalho

1. Registrar o estado inicial das versões instaladas e verificar avisos com
   `pnpm outdated` e `pnpm audit`.
2. Consultar changelogs e avisos de breaking change das dependências que terão
   versões major, especialmente SvelteKit, Svelte, Vite, TypeScript, `sharp`,
   `sqlite3` e plugins do Vite/Tailwind.
3. Atualizar primeiro as dependências em grupos coerentes, evitando mudanças
   não relacionadas no mesmo Pull Request.
4. Regenerar e revisar `pnpm-lock.yaml`; não editar o lockfile manualmente.
5. Revisar a versão do Node.js usada nas duas etapas do `Dockerfile`, usando
   uma linha suportada e adequada ao ambiente de produção. Manter a mesma
   versão entre build e runtime, salvo justificativa documentada.
6. Verificar o uso de `corepack`, a versão do pnpm e a instalação de
   dependências de produção dentro da imagem.
7. Executar as validações locais e construir a imagem Docker sem usar cache
   antigo.
8. Testar a imagem resultante com as variáveis de runtime necessárias, sem
   incluir banco, diretório de fotos, segredos ou outros dados persistentes na
   imagem.
9. Abrir Pull Request com o resumo das versões alteradas, auditoria antes e
   depois, testes executados e eventuais decisões de compatibilidade.

## Regras a atender

- Manter `pnpm` como gerenciador e respeitar o campo `packageManager` do
  `package.json`.
- Atualizar dependências diretas e transitivas apenas por comandos do pnpm,
  preservando um lockfile reproduzível.
- Não aplicar atualizações major automaticamente sem avaliar a documentação
  de migração e executar as validações do projeto.
- Investigar vulnerabilidades reportadas pelo `pnpm audit`; não considerar a
  atualização concluída apenas porque o comando foi executado.
- Não introduzir dependências desnecessárias para resolver avisos de
  segurança.
- Manter as dependências necessárias à compilação disponíveis na etapa de
  build e instalar somente dependências de produção na etapa final, quando
  compatível com o funcionamento do adapter Node.
- Usar uma imagem oficial do Node.js, com tag explícita e linha de suporte
  vigente no momento da implementação; registrar a decisão na issue.
- Não usar tags flutuantes como `latest`.
- Garantir que a imagem não contenha `.env`, banco SQLite, diretório de fotos,
  caches do pnpm, arquivos de desenvolvimento ou segredos.
- Preservar o funcionamento de `sharp`, `sqlite3`, SvelteKit, Vite e dos
  scripts existentes.
- Não alterar regras de negócio, schema, dados persistentes ou comportamento
  visual sem uma justificativa específica.
- Não registrar tokens, URLs privadas, caminhos de produção ou conteúdo de
  variáveis de ambiente nos logs ou na documentação.

## Fora do escopo

- Atualizar bibliotecas sem relação com o ecossistema usado pelo projeto.
- Migrar para outro gerenciador de pacotes, ORM, adapter ou distribuição Linux.
- Alterar o schema SQLite ou recriar o banco de produção.
- Automatizar deploy ou alterar a configuração do servidor sem uma issue
  específica.
- Corrigir vulnerabilidades do sistema operacional do host ou dos serviços
  externos ao container.
- Fazer uma reescrita visual ou atualizar funcionalidades do site durante a
  manutenção de dependências.

## Critérios de aceite

- `package.json` contém versões atualizadas e compatíveis, com o
  `packageManager` mantido de forma explícita.
- `pnpm-lock.yaml` foi regenerado pelos comandos do pnpm e está consistente
  com o `package.json`.
- `pnpm install --frozen-lockfile` termina com sucesso em uma cópia limpa.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passam.
- `pnpm audit` foi executado antes e depois; cada vulnerabilidade relevante
  foi corrigida, justificada por risco/compatibilidade ou registrada como
  dependente de atualização futura.
- O `Dockerfile` usa uma versão explícita e suportada do Node.js nas etapas
  aplicáveis, sem divergência não justificada entre build e runtime.
- A construção com `docker build --pull --no-cache` termina com sucesso.
- O container inicia e responde corretamente quando recebe as variáveis
  `DB_PATH`, `FOTOS_DIR`, `CF_TURNSTILE_SECRET` e
  `PUBLIC_CF_TURNSTILE_SITEKEY` por configuração externa.
- O banco e o diretório de fotos continuam fora da imagem e podem ser
  fornecidos por volumes ou caminhos persistentes do ambiente de execução.
- A imagem não contém segredos, dados locais, arquivos `.env` ou artefatos de
  desenvolvimento.
- O Pull Request registra versões anteriores e novas, resultado da auditoria,
  validações e qualquer mudança incompatível.

## Validação manual sugerida

Criar uma cópia limpa do repositório e executar `pnpm install
--frozen-lockfile`, seguido de `pnpm run check`, `pnpm run lint` e
`pnpm run build`.

Construir a imagem com `docker build --pull --no-cache -t etfsp:deps-update .`.
Executar o container em um ambiente de teste com um banco e um diretório de
fotos de teste montados externamente, verificando inicialização, cadastro,
consulta de ex-alunos, galeria e upload de foto conforme as condições de
teste disponíveis.

Inspecionar as camadas ou o conteúdo da imagem para confirmar que não foram
incluídos `.env`, `db.sqlite3`, fotos reais, caches ou segredos. Repetir a
auditoria de dependências após a atualização e guardar o resultado no Pull
Request.

## Documentos complementares

### Ler antes da implementação

- `AGENTS.md`, especialmente as regras de dependências, persistência e
  validação.
- `package.json` e `pnpm-lock.yaml`.
- `Dockerfile`.
- `README.md` e `docs/deploy/README.md`, para preservar o procedimento de
  execução e implantação documentado.

### Atualizar ao implementar

- Esta issue, com as versões escolhidas, vulnerabilidades encontradas,
  validações executadas e resultado final.
- A documentação de implantação, caso a versão do Node.js, pnpm ou o comando
  de execução do container mude.

## Arquivos de código previstos

- `package.json`.
- `pnpm-lock.yaml`.
- `Dockerfile`.
- `docs/deploy/README.md`, somente se o procedimento documentado precisar ser
  ajustado.

Não se prevê alteração de schema, migração, banco persistente, diretório de
fotos ou funcionalidades da aplicação.

## Resultado da implementação

- Dependências diretas e de desenvolvimento foram atualizadas para as versões
  disponíveis e compatíveis em 5 de setembro de 2026, incluindo SvelteKit
  2.70.3, Svelte 5.57.0, Vite 8.2.2, TypeScript 6.0.3, `sharp` 0.35.4,
  `sqlite3` 6.0.1 e pnpm 10.11.0.
- O `pnpm-lock.yaml` foi regenerado pelo pnpm e a configuração de
  `onlyBuiltDependencies` foi movida para `pnpm-workspace.yaml`, que é a
  localização reconhecida pelo pnpm atual.
- Foi adicionado um override para `cookie` 0.7.x, eliminando o aviso de
  segurança transitivo trazido pelo SvelteKit.
- O `Dockerfile` agora usa `node:24-alpine` nas etapas de build e runtime e
  copia `pnpm-workspace.yaml` antes das instalações. A alteração foi
  necessária para que o script nativo do `sqlite3` não fosse ignorado dentro
  da imagem.
- A compatibilidade com os novos `PageProps` do SvelteKit foi ajustada na
  rota dinâmica de cursos, sem alteração de comportamento da página.
- O Prettier atualizado formatou três arquivos que já estavam fora do padrão
  exigido pela versão atualizada.
- `pnpm audit --audit-level=high` e a auditoria final completa não reportaram
  vulnerabilidades conhecidas. O pnpm ainda informa a subdependência
  depreciada `prebuild-install`, sem vulnerabilidade associada no resultado
  final.
- `pnpm run check` passou sem erros, com três avisos Svelte já existentes
  relacionados a estado referenciado localmente e interação de ponteiro em
  elemento sem papel ARIA.
- `pnpm run lint`, `pnpm run build` e `git diff --check` passaram.
- `docker build --pull --no-cache -t etfsp:deps-update .` passou com sucesso;
  a imagem final instalou somente dependências de produção e manteve banco,
  fotos, arquivos `.env` e segredos fora da imagem.
