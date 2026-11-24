# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

As regras do projeto (stack, privacidade, convenções, fluxo Git e critérios de
conclusão) estão em `AGENTS.md` e valem integralmente aqui:

@AGENTS.md

O conteúdo abaixo complementa o `AGENTS.md` sem repeti-lo.

## Comandos

```sh
corepack enable && pnpm install --frozen-lockfile

# Banco e fotos sintéticos para desenvolvimento (não lê .env nem dados reais)
pnpm run cloud:data:init && pnpm run cloud:data:check
DB_PATH=.cloud-data/db.sqlite3 FOTOS_DIR=.cloud-data/Fotos pnpm run dev

pnpm run validate          # test:admin-exaluno + test:deploy + check + lint + build
pnpm run test:cloud-data   # testes do scripts/cloud_data.py

# Um único teste do comando administrativo (node:test)
node --test --test-name-pattern "<trecho do nome>" scripts/test_admin_exaluno.mjs
```

Requisitos: Node.js 24, pnpm 10.11.0, Python 3.11+ (dados de desenvolvimento).
Prefira `pnpm run dev`/`build` a `just run`/`just build`, que formatam o
repositório inteiro.

## Arquitetura

- **Conexão e migrações em runtime**: `src/lib/server/index.ts` abre o SQLite
  com top-level `await` e executa `migrate()` (`src/lib/server/migrations.ts`)
  antes de exportar `db`. As migrações são idempotentes (checam
  `PRAGMA table_info` e registram em `SchemaMigrations`). Durante o build
  (`building`), `db` é um placeholder e `DB_PATH`/`FOTOS_DIR` não são lidos —
  não acesse o banco em código executado no build/prerender.
- **Migrações administrativas** ficam em `scripts/migrations/*.sql` e são
  aplicadas pelo subcomando `pnpm admin:exaluno migrar`, não pelo app. O
  comando `scripts/admin_exaluno.mjs` (buscar/consultar/desativar/reativar),
  executado via SSH na VPS, faz exclusão lógica com auditoria em `AdminAudit`
  e `AdminAuditFotos` e exige `ADMIN_OPERATOR`.
- **Perfil público**: `src/lib/server/alumni-profile.ts` concentra a consulta
  do perfil (`loadPublicAlumniProfile`, `parseAlumniId`) e a normalização de
  redes sociais/WhatsApp (`social-networks.ts`, `whatsapp.ts`). A rota canônica
  é `/exalunos/[id]`; `detalhe_exaluno?id=` apenas redireciona (308) para ela.
  `/exalunos/curso/[curso]` usa os slugs de `COURSE_CATALOG` em
  `src/lib/domain.ts`, que também define os tipos públicos compartilhados.
- **Fotos**: `cadfoto/search_id/+server.ts` busca ex-alunos para o formulário
  de upload; `Fotos/[file]/+server.ts` entrega arquivos de `FOTOS_DIR`.
- **SEO**: `robots.txt` e `sitemap.xml` são endpoints em `src/routes/`.
- **UI**: componentes reutilizáveis em `src/lib/components/`; Tailwind 4 via
  `@tailwindcss/vite`. O redesign responsivo é especificado em
  `docs/redesign/` (design system, spec funcional, dados privados).

## Documentação relacionada

- `docs/issues/`: planejamento por issue (`ISSUE-NNN-*.md`); branches e commits
  costumam referenciar o número da issue.
- `docs/codex-cloud.md`: preparação de dados sintéticos e ambiente Cloud.
- `deploy/README.md`: Docker, Caddy, Umami e backups; `just send_container`
  publica a imagem na VPS via `deploy/send_container.sh`.
