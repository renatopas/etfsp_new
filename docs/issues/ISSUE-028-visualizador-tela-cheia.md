# ISSUE-028 — Visualizador de fotos em tela cheia

**Estado:** Aprovada para implementação

**Área:** Consulta e visualização de fotos

**Rota afetada:** `/lista_foto`

**Depende de:** ISSUE-027

## Contexto

A ISSUE-015 transformou o diálogo da galeria em um visualizador com navegação
por botões, teclado e gesto horizontal, preservando o zoom nativo por pinça.
Essas facilidades são valorizadas e **devem ser mantidas integralmente**.

A aparência, porém, é de uma caixa branca sobre a página. No celular, a caixa
fica no meio da tela, a página continua visível atrás, a foto aparece pequena e
os botões “← Anterior” e “Próxima →” e o indicador “Foto 1 de 1” quebram em duas
linhas.

O padrão que as pessoas conhecem da galeria do celular e de aplicativos de
mensagem é a foto ocupando a tela inteira, sobre fundo escuro, com controles
sobrepostos.

Ponto a verificar em aparelho real: a área da imagem usa
`touch-action: pan-y pinch-zoom`. Com a página ampliada pela pinça, arrastar um
dedo na horizontal pode ser interpretado como troca de foto em vez de mover a
área ampliada, e `pan-y` pode impedir esse deslocamento lateral.

## Modificação proposta

### Aparência

- O `dialog` ocupa toda a área visível (`100dvw × 100dvh`), com fundo escuro
  quase opaco e sem bordas.
- A foto é centralizada e ocupa o máximo de espaço possível mantendo a
  proporção (`object-fit: contain`), em retrato e paisagem.
- Controles sobrepostos e grandes:
  - botão Fechar (✕) no canto superior;
  - indicador de posição (“2 de 15”) no topo;
  - botões anterior (‹) e próxima (›) nas laterais, centralizados
    verticalmente;
  - título e metadados (curso, turma, anos) em uma faixa na parte inferior.
- Os controles têm contraste suficiente sobre qualquer foto (fundo
  semitransparente atrás dos ícones) e área de toque de pelo menos 44 × 44 px.
- Respeitar as áreas seguras de aparelhos com recorte de tela
  (`env(safe-area-inset-*)`).
- A página de trás não rola enquanto o visualizador está aberto.

### Comportamento preservado (ISSUE-015)

- Botões anterior/próxima, setas `ArrowLeft`/`ArrowRight`, `Escape`, gesto
  horizontal com distância mínima e pinça para zoom.
- Gestos com mais de um dedo nunca trocam de foto.
- Navegação limitada às fotos da página atual, na mesma ordem da grade.
- Foco retorna à miniatura de origem ao fechar.
- Sem JavaScript, a miniatura continua abrindo o arquivo da imagem.

### Melhorias de comportamento

- **Swipe desativado durante o zoom:** enquanto a página estiver ampliada
  (`window.visualViewport.scale > 1`), o gesto de um dedo não troca de foto,
  permitindo mover a área ampliada em todas as direções. Ajustar
  `touch-action` conforme necessário.
- **Pré-carregamento:** carregar antecipadamente a imagem anterior e a
  seguinte para a troca ser imediata.
- **Transição:** troca de foto com esmaecimento curto (cerca de 150 ms),
  desativado com `prefers-reduced-motion: reduce`.
- Em telas sem toque, os botões laterais permanecem sempre visíveis (não
  depender de hover).

### Acessibilidade

- Botões com nome acessível em português (“Fechar”, “Foto anterior”, “Próxima
  foto”); ícones são decorativos.
- Título do diálogo atualizado a cada foto; posição anunciada sem repetição
  excessiva.
- Ordem de foco: fechar, anterior, próxima, metadados.

## Fora do escopo

- Biblioteca de lightbox, carrossel ou gestos.
- Zoom por botão ou por duplo toque implementado em JavaScript (o zoom continua
  sendo o nativo do navegador).
- URL própria para cada foto aberta, download, compartilhamento ou
  comentários.
- Navegação entre páginas de resultados.

## Critérios de aceite

- Em 390 × 844 (retrato) e 844 × 390 (paisagem), a foto ocupa a maior área
  possível sem cortes e os controles não quebram linha.
- Todas as formas de navegação da ISSUE-015 continuam funcionando.
- Em celular real, após ampliar por pinça, é possível mover a área ampliada
  lateralmente sem trocar de foto; ao voltar ao zoom normal, o swipe volta a
  funcionar.
- A troca para a foto seguinte já pré-carregada não mostra área vazia.
- Com movimento reduzido, não há animação.
- A página de fundo não rola com o visualizador aberto e volta à mesma posição
  ao fechar.
- `pnpm run validate` passa.

## Validação manual sugerida

Testar em pelo menos um Android (Chrome) e um iPhone (Safari), com uma página
de várias fotos de orientações diferentes: abrir a primeira, uma intermediária
e a última; navegar por botões e swipe; ampliar com pinça, mover a área
ampliada, reduzir e voltar a navegar; girar o aparelho. No computador, testar
teclado e mouse.

## Documentos complementares

### Ler antes da implementação

- `docs/issues/ISSUE-015-navegacao-visualizador-fotos.md`.
- `docs/redesign/functional-spec.md`, seção 7, “Visualização ampliada”.

### Atualizar ao implementar

- `docs/redesign/functional-spec.md`, seção 7: aparência em tela cheia e regra
  de swipe durante o zoom.
- `docs/redesign/design-system.md`: componente `PhotoDialog`, incluindo a
  exceção do fundo escuro e a transição permitida.
- Esta issue, com o resultado e o estado final.

## Arquivos de código previstos

- `src/routes/lista_foto/+page.svelte` (ou extração para
  `src/lib/components/PhotoDialog.svelte`)

Não há alteração server-side, de schema ou de migração.

## Resultado da implementação

- O visualizador foi extraído para `src/lib/components/PhotoDialog.svelte`. A
  galeria apenas o abre com `open(index)`.
- Tela cheia com fundo escuro (tokens `--color-viewer*`):
  - posição (“2 de 15”) e botão “Fechar” (ícone + texto) no topo;
  - botões circulares anterior/próxima nas laterais, centralizados
    verticalmente;
  - título e metadados (curso pelo nome curto, turma e anos) na parte
    inferior;
  - áreas seguras (`env(safe-area-inset-*)`) respeitadas;
  - com uma única foto, posição e setas não aparecem.
- A imagem é posicionada de forma absoluta na área entre o topo e a legenda,
  com `object-fit: scale-down`: ocupa o máximo possível sem cortes e sem
  ampliar arquivos pequenos, em retrato e paisagem.
- Comportamento da ISSUE-015 preservado (botões, setas, `Escape`, swipe com
  50 px predominantemente horizontais, gestos de vários dedos ignorados,
  limites da página, retorno do foco e link sem JavaScript).
- Novidades:
  - com a página ampliada (`visualViewport.scale > 1`), o swipe não troca a
    foto e a área de toque passa a `touch-action: auto`, liberando o
    deslocamento em todas as direções;
  - pré-carregamento da foto anterior e da seguinte;
  - esmaecimento de 150 ms na troca, desativado com movimento reduzido;
  - a página de fundo não rola com o visualizador aberto e mantém a posição
    ao fechar.
- Contraste: texto 17:1 e metadados 10,5:1 sobre o fundo; ícone branco sobre o
  botão translúcido, mesmo sobre uma foto branca, 4,4:1.
- Especificação funcional (seção 7) e design system (`PhotoDialog`, tokens e
  transição) atualizados.
- **Limitação conhecida:** imagens com fundo transparente (PNG/GIF) aparecem
  sobre o fundo escuro, e elementos pretos ficam pouco visíveis. Fotos reais
  raramente têm transparência.
- Validação automatizada em 25 de novembro de 2026, em uma cópia descartável da
  fixture com 10 fotos (retrato, paisagem e uma imagem pequena):
  - `pnpm run validate` e `pnpm run test:cloud-data` passaram (o `check`
    mantém o aviso anterior de `src/lib/PrettyDate.svelte`);
  - botões, setas do teclado e limites (próxima desabilitada em “10 de 10”);
  - toques simulados pelo protocolo do Chrome: swipe para os dois lados troca
    a foto; arrasto vertical, arrasto curto e gesto com dois dedos não trocam;
  - com escala 2× simulada, o swipe não troca a foto; de volta a 1×, troca;
  - fotos vizinhas pré-carregadas;
  - `Escape` fecha, o foco volta à miniatura e a posição de rolagem é mantida;
  - imagem centralizada em 390 × 664, 844 × 340 e 1366 × 800;
  - transição de 150 ms presente e ausente com movimento reduzido;
  - com uma única foto, sem setas nem posição.
- **Pendente antes de marcar como concluída:** validação manual em celular real
  (Android/Chrome e iPhone/Safari) do zoom por pinça, do deslocamento da área
  ampliada e do swipe após voltar ao zoom normal, conforme a “Validação manual
  sugerida”.
