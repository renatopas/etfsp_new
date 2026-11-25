# ISSUE-025 — Novo cabeçalho e marca

**Estado:** Concluída

**Área:** Interface geral

**Rotas afetadas:** todas

**Depende de:** ISSUE-024

## Contexto

O cabeçalho usa a imagem de fundo `static/images/header.jpg` (laranja, com os
textos “CETFSP”/“ETFSP” em marca-d’água) e o logotipo `logoex.gif`, de
345 × 75 px. Em telas de alta densidade o GIF fica serrilhado, e a imagem de
fundo destoa da paleta azul e “papel” definida no design system.

Os quatro destinos aparecem como botões com borda, um padrão visual antigo. No
celular, logotipo e botão “Menu” ocupam duas linhas, cerca de 15% da altura da
tela antes de qualquer conteúdo.

A imagem de compartilhamento em redes sociais (`og:image` e `twitter:image` em
`src/app.html`) é `logo_cefet.gif`, um GIF pequeno que gera prévias de baixa
qualidade.

## Modificação proposta

### Marca

- Recriar a marca como SVG a partir da composição tipográfica existente
  (“EX ALUNOS” + “Escola Técnica Federal de São Paulo”), sem inventar brasão ou
  símbolo institucional, como já prevê o design system (seção 6).
- A marca deve ser nítida em qualquer densidade de tela, ter dimensões
  declaradas e manter o texto alternativo atual.

### Cabeçalho

- Fundo sólido na superfície do site, com uma linha inferior discreta.
- Navegação larga (≥ 48 rem): os quatro destinos como links de texto, sem
  borda; o destino atual indicado por sublinhado espesso ou barra inferior na
  cor primária, além de `aria-current`.
- “Cadastre-se” pode receber destaque de botão primário, por ser a única ação
  de conversão do menu.
- Navegação estreita (< 48 rem): marca e botão “Menu” na mesma linha, com
  altura total do cabeçalho de no máximo 64 px. O painel do menu continua no
  fluxo da página.
- O cabeçalho **não** fica fixo ao rolar, para não ocupar espaço permanente em
  telas pequenas.

### Rodapé

- Ajustar espaçamento e tipografia ao novo cabeçalho, mantendo o conteúdo
  atual (aviso de site não oficial, contato, Sobre, Política de Privacidade).

### Imagem de compartilhamento

- Criar uma imagem 1200 × 630 px em PNG ou JPEG com a nova marca, para
  `og:image` e `twitter:image`, com URL absoluta.

## Decisões registradas

- **Laranja da identidade antiga:** removido. O cabeçalho, a marca e os
  acentos usam somente a paleta azul/papel do design system. A cor de destaque
  `--color-accent` (cobre) continua disponível para pequenos destaques, conforme
  já previsto.

## Fora do escopo

- Alterar os quatro destinos, sua ordem ou rótulos.
- Busca no cabeçalho.
- Tema escuro.

## Critérios de aceite

- A marca é SVG, nítida em telas 2× e 3× e tem texto alternativo.
- `header.jpg` e `logoex.gif` deixam de ser usados e são removidos de
  `static/images/`.
- Nenhum laranja da identidade antiga permanece no cabeçalho, na marca ou no
  rodapé.
- Em 390 px, marca e “Menu” cabem em uma linha e o cabeçalho tem no máximo
  64 px de altura.
- Em ≥ 48 rem, os quatro destinos ficam visíveis sem botão “Menu”, e o destino
  atual é identificável sem depender só da cor.
- Menu móvel continua fechando por `Escape`, por escolha de destino e pelo
  botão, e o foco volta ao botão.
- Prévia de compartilhamento usa a nova imagem 1200 × 630.
- `pnpm run validate` passa.

## Validação manual sugerida

Testar em 320, 390, 768 e 1366 px; abrir e fechar o menu por toque e teclado;
validar a prévia de compartilhamento com uma ferramenta de depuração de Open
Graph após o deploy.

## Documentos complementares

### Ler antes da implementação

- `docs/redesign/functional-spec.md`, seções 1.1 e 1.2.
- `docs/redesign/design-system.md`, seções 5 (`SiteHeader`, `SiteFooter`) e 6.

### Atualizar ao implementar

- `docs/redesign/design-system.md`: descrição do `SiteHeader` e da marca.
- Esta issue, com o resultado e o estado final.

## Arquivos de código previstos

- `src/lib/Header.svelte`, `src/lib/Footer.svelte`
- `src/app.css`, `src/app.html`
- `static/images/` (nova marca e imagem de compartilhamento; remoção das
  antigas)

Não há alteração server-side, de schema ou de migração.

## Resultado da implementação

- Marca recriada em SVG (`src/lib/components/Brand.svelte`): “EX” desenhado em
  formas geométricas, “ALUNOS” em sans-serif pesada, barra vertical e “Escola
  Técnica / Federal de São Paulo” na serifa dos títulos, tudo em azul. Os
  textos usam `textLength` para manter a composição mesmo com fonte
  alternativa. O SVG é decorativo; o nome acessível continua no link.
- Cabeçalho com fundo branco e linha inferior, sem imagem de fundo e sem
  laranja. Destinos como links de texto; o atual usa cor primária, sublinhado
  de 3 px e `aria-current`. “Cadastre-se” tem aparência de botão primário.
- Altura medida do cabeçalho: 61 px em 320 e 390 px (marca e “Menu” na mesma
  linha) e 73 px em 768 e 1366 px. Sem rolagem horizontal em nenhuma largura.
  O menu móvel continua fechando por `Escape`, devolvendo o foco ao botão.
  Sem JavaScript, a navegação aparece aberta e o botão não é exibido.
- Rodapé com mais respiro vertical; conteúdo inalterado.
- Imagem de compartilhamento `static/images/og-etfsp.png` (1200 × 630, 42 KB),
  gerada a partir da marca. `Meta.svelte` passou a emitir
  `summary_large_image`, `og:image` absoluto, dimensões e texto alternativo; as
  metatags duplicadas de `src/app.html` foram removidas. Perfis com foto
  continuam usando a foto.
- Removidos `header.jpg`, `logoex.gif` e `logo_cefet.gif` (a antiga imagem de
  compartilhamento), sem referências restantes.
- **Correção de efeito colateral da ISSUE-024:** em `/lista_foto`, o título
  “N fotos encontradas” ficou colado ao formulário de filtros depois da remoção
  de `#mainbody2`; a seção de resultados recebeu margem superior.
- Design system atualizado (`SiteHeader` e identidade).
- Validação em 25 de novembro de 2026: `pnpm run validate` e
  `pnpm run test:cloud-data` passaram (o `check` mantém o aviso anterior de
  `src/lib/PrettyDate.svelte`). A prévia em redes sociais deve ser conferida
  com uma ferramenta de depuração de Open Graph após o deploy.
