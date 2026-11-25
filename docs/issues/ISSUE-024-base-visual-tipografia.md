# ISSUE-024 — Base visual: tipografia e remoção do layout legado

**Estado:** Aguardando validação

**Área:** Interface geral

**Rotas afetadas:** todas

**Depende de:** ISSUE-023

## Contexto

O redesign “Arquivo Vivo” já introduziu tokens, componentes e layout
responsivo, mas toda página ainda é renderizada dentro do wrapper legado
`#mainbody2` (`src/routes/+layout.svelte`). `src/app.css` mantém cerca de 150
linhas de compatibilidade (`#mainbody2 h1`, `.tableforms`, `.tablelist`,
`#sidebody`, `.imagdir`, `.idsearch` etc.), descritas no próprio arquivo como
“compatibilidade temporária para as páginas legadas, migradas nas fases 2–7”.
As fases já foram concluídas, e essas regras passaram a competir com os
estilos dos componentes (por exemplo, `AlumniCard` precisa de
`:global(#mainbody2)` para vencer a especificidade).

Os títulos usam `Georgia`, que dá uma aparência datada. Para modernizar a
identidade sem custo de legibilidade, foi decidido:

- **Texto, formulários e botões:** manter a fonte do sistema (`system-ui`),
  que é a mais legível em cada aparelho e não exige download.
- **Títulos:** usar uma única fonte serifada moderna, de licença livre,
  hospedada no próprio site. Proposta: **Source Serif 4** (SIL Open Font
  License), em formato variável WOFF2.

O design system hoje restringe a tipografia a fontes do sistema; esta issue
altera essa regra. O tema escuro foi considerado e ficou **fora do escopo** por
decisão de produto.

## Modificação proposta

### Remover o layout legado

- Remover o elemento `#mainbody2` do layout e todas as regras
  `#mainbody2 …` de `src/app.css`.
- Mover para os componentes ou para estilos base de elementos (`h1`, `h2`,
  `p`, listas) o que ainda for necessário, sem seletores por ID.
- Remover classes legadas que deixem de ter uso (`.formbutton`,
  `.tableforms`, `.tablelist`, `.tablepage`, `.tablepagenoline`, `#sidebody`,
  `.imagdir`, `.idsearch`), conferindo antes cada uso com busca no código.
- Remover `:global(#mainbody2)` de `AlumniCard.svelte` e de outros
  componentes.

### Tipografia

- Adicionar Source Serif 4 variável, subconjunto latino (inclui acentos do
  português), em `static/fonts/`, com o arquivo de licença ao lado.
- Declarar `@font-face` em `src/app.css` com `font-display: swap` e pré-carregar
  o arquivo em `src/app.html` (`<link rel="preload" as="font" crossorigin>`).
- Atualizar `--font-serif` para `"Source Serif 4", Georgia, serif`, mantendo
  Georgia como alternativa.
- Revisar a escala de títulos: `h1` com peso semibold e entrelinha justa;
  `h2` e títulos de componentes continuam em sans-serif, como prevê o design
  system.
- Meta de tamanho: até cerca de 80 KB para o arquivo de fonte. Se a versão
  variável exceder isso, usar um único peso estático (semibold).

### Refinar tokens

- Introduzir uma pequena escala de elevação (`--shadow-sm`, `--shadow-card`,
  `--shadow-overlay`) e de raio, usada de forma consistente por cards,
  diálogos e campos.
- Revisar contraste de todos os pares texto/fundo após a mudança.

## Fora do escopo

- Tema escuro (registrado como possível evolução futura).
- Novo cabeçalho e marca (ISSUE-025).
- Redesenho de telas específicas (ISSUES 026 a 030).
- Fontes servidas por CDN ou serviços externos.

## Critérios de aceite

- Nenhuma ocorrência de `mainbody2` em `src/`.
- Nenhuma página perde espaçamento, título ou estilo de lista em 320 px e
  1366 px em comparação com as capturas anteriores, exceto as melhorias
  intencionais.
- Os títulos `h1` usam Source Serif 4 servida pelo próprio site; nenhuma
  requisição de fonte sai do domínio.
- Com a fonte bloqueada, a página continua legível com Georgia.
- O arquivo de fonte respeita a meta de tamanho e o arquivo de licença está
  versionado.
- Contraste de texto normal ≥ 4,5:1 e de texto grande ≥ 3:1.
- `pnpm run validate` passa.

## Validação manual sugerida

Capturar todas as rotas principais em 390 px e 1366 px antes e depois e
comparar. Verificar no DevTools que a fonte vem de `/fonts/` e que não há
mudança brusca de layout ao carregar.

## Documentos complementares

### Ler antes da implementação

- `docs/redesign/design-system.md`, seções 1 a 4.

### Atualizar ao implementar

- `docs/redesign/design-system.md`: regra de fontes (permitir uma fonte
  hospedada no site para títulos), tokens de sombra e raio e menção ao tema
  escuro como fora do escopo.
- Esta issue, com o resultado e o estado final.

## Arquivos de código previstos

- `src/routes/+layout.svelte`
- `src/app.css`
- `src/app.html`
- `src/lib/components/*.svelte` que usam `:global(#mainbody2)`
- `static/fonts/` (novo)

Não há alteração server-side, de schema ou de migração.
