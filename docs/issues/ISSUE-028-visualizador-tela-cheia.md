# ISSUE-028 — Visualizador de fotos em tela cheia

**Estado:** Aguardando validação

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
