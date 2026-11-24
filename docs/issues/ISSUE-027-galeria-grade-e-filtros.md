# ISSUE-027 — Galeria: grade mais fotográfica e filtros compactos

**Estado:** Aguardando validação

**Área:** Consulta de fotos

**Rota afetada:** `/lista_foto`

**Depende de:** ISSUE-023 e ISSUE-024

## Contexto

Na galeria, o formulário de filtros ocupa quase a primeira tela inteira no
celular (título, curso, tipo de foto, filtros avançados e botão empilhados) antes
de qualquer foto aparecer. Cada foto é apresentada em um card com borda,
padding e até quatro linhas de texto, o que dá mais peso à moldura do que à
imagem.

## Modificação proposta

### Filtros

- Linha principal com “Título ou descrição” e “Curso”; no computador, lado a
  lado com o botão “Buscar”.
- “Tipo de foto” como controle segmentado de duas opções (“Fotos gerais” /
  “Carômetro”), implementado com rádios nativos estilizados para continuar
  funcionando sem JavaScript.
- Filtros avançados continuam em `details/summary`, abertos automaticamente
  quando algum estiver ativo.
- **Filtros ativos como chips** acima da grade (ex.: “Curso: Eletrônica ✕”,
  “Foto: 1990–1995 ✕”). Cada chip é um link `GET` que remove apenas aquele
  filtro, preservando os demais. “Limpar filtros” continua disponível.
- No celular, a área de filtros não deve passar de cerca de metade da altura
  da tela com os avançados fechados.

### Grade

- Miniaturas com cantos levemente arredondados, sem borda de card, com
  espaçamento menor entre itens.
- Legenda curta abaixo da imagem: título em uma linha (com reticências) e uma
  linha secundária com curso e ano. Os rótulos “Foto:” e “Formatura:” podem ser
  abreviados, mas não substituídos apenas por cor.
- Estado de foco e hover visível na miniatura inteira.
- Continuam valendo as regras da ISSUE-007: proporção 4:3, nada de ampliação
  além de 320 × 240 px, `loading="lazy"`, 100 fotos por página.

### Cabeçalho

- Contagem de resultados (“37 fotos encontradas”) na mesma linha dos chips ou
  logo acima da grade, com tipografia secundária em vez de um `h2` grande.

## Fora do escopo

- Visualizador ampliado (ISSUE-028).
- Rolagem infinita, novos filtros ou nova ordenação.
- Alterar consultas, parâmetros de URL ou tamanho de página.

## Critérios de aceite

- No celular (390 × 844), ao menos a primeira linha de fotos aparece sem rolar,
  com os filtros avançados fechados.
- Todos os filtros continuam funcionando sem JavaScript e refletidos na URL.
- Cada chip remove somente o seu filtro; os demais parâmetros e a página
  coerente são preservados.
- Nenhuma miniatura é ampliada além do tamanho armazenado.
- A legenda não depende só de cor e não sobrepõe texto à imagem.
- Navegação por teclado percorre filtros, chips, miniaturas e paginação na
  ordem visual.
- Sem rolagem horizontal em 320 px.
- `pnpm run validate` passa.

## Validação manual sugerida

Testar combinações de filtros, remover cada um pelos chips, testar com
JavaScript desativado e capturar a tela em 390 px e 1366 px. Usar um conjunto
com várias fotos (a fixture atual tem apenas uma foto geral; criar dados de
teste adicionais em uma cópia descartável).

## Documentos complementares

### Ler antes da implementação

- `docs/redesign/functional-spec.md`, seção 7.
- `docs/issues/ISSUE-007-densidade-listagens.md`.

### Atualizar ao implementar

- `docs/redesign/functional-spec.md`, seção 7 (“Cabeçalho e filtros” e
  “Grade”).
- `docs/redesign/design-system.md`: componentes `FilterPanel`, `PhotoCard` e
  novo padrão de chip de filtro.
- Esta issue, com o resultado e o estado final.

## Arquivos de código previstos

- `src/routes/lista_foto/+page.svelte`
- `src/lib/components/` (chip de filtro e, se útil, `PhotoCard`)

Não há alteração server-side, de schema ou de migração.
