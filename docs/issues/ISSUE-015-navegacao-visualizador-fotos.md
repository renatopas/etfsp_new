# ISSUE-015 — Navegar entre fotos no visualizador da galeria

**Estado:** Concluída

**Área:** Consulta e visualização de fotos

**Rota afetada:** `/lista_foto`

## Contexto

Na página de consulta de fotos, selecionar uma miniatura abre a imagem em um
diálogo. Para ver outra foto, atualmente é necessário fechar o diálogo,
localizar a próxima miniatura na grade e abri-la. A repetição torna a consulta
pouco fluida, sobretudo quando o visitante deseja percorrer várias imagens.

A rota já carrega no navegador os dados e as URLs de até 100 fotos por página.
É possível aproveitar esse conjunto para trocar a imagem exibida sem fazer
novas consultas ao servidor e sem alterar a paginação existente.

## Modificação proposta

Transformar o diálogo existente em um visualizador que permita navegar para a
foto anterior ou seguinte na mesma ordem em que elas aparecem na grade.

A navegação fica limitada às fotos da página atual. Ao alcançar a primeira ou
a última foto, o visualizador não deve carregar nem abrir automaticamente
outra página de resultados.

## Formas de navegação

- Exibir controles visíveis para ir à foto anterior e à próxima.
- Permitir a mesma navegação pelas teclas `ArrowLeft` e `ArrowRight` enquanto
  o diálogo estiver aberto.
- Permitir gesto horizontal de arrastar, ou _swipe_, em dispositivos com toque.
- Manter o botão “Fechar” e o fechamento pela tecla `Escape` oferecido pelo
  diálogo.
- Não exigir gesto: todas as ações devem continuar disponíveis por controles
  visíveis e teclado.

O gesto deve exigir deslocamento horizontal mínimo e predominante em relação
ao deslocamento vertical. Um toque simples, um movimento curto ou a rolagem
vertical da página não deve trocar a foto acidentalmente.

## Conteúdo do visualizador

Ao mudar de foto, atualizar em conjunto:

- imagem principal e seu texto alternativo;
- título ou texto substituto usado atualmente;
- curso, turma, ano da foto e ano de formatura, quando disponíveis;
- indicador de posição no conjunto, no formato “12 de 37” ou equivalente.

Os controles indisponíveis na primeira e na última foto devem ser ocultados ou
desabilitados de forma visual e semanticamente clara. Em um resultado com uma
única foto, não deve haver indicação enganosa de que é possível navegar.

O link da miniatura deve conservar seu `href` para o arquivo da imagem. Sem
JavaScript, selecionar a miniatura deve continuar abrindo diretamente esse
arquivo, como ocorre hoje.

## Acessibilidade e interação

- Fornecer nomes acessíveis em português aos botões anterior, próximo e
  fechar; ícones ou setas visuais não devem ser o único rótulo.
- Usar elementos `button` para as ações do visualizador e preservar foco
  visível.
- Oferecer áreas de acionamento confortáveis em telas pequenas.
- Executar os atalhos de teclado somente enquanto o diálogo estiver aberto e
  remover corretamente qualquer listener criado pelo componente.
- Manter título acessível válido para o diálogo após cada troca de foto.
- Anunciar a posição ou a mudança de foto sem produzir anúncios duplicados ou
  excessivos para tecnologias assistivas.
- Garantir que os controles não cubram de forma permanente uma parte
  relevante da imagem, especialmente em telas estreitas.
- Respeitar a proporção da foto principal e limitar sua altura à área visível,
  permitindo consultar os metadados e os controles.

Não é necessário animar a transição. Se houver animação, ela deve respeitar
`prefers-reduced-motion` e não pode ser necessária para compreender a mudança.

## Limites da paginação

- O conjunto navegável é exatamente `data.photos`, já filtrado e carregado
  para a página atual.
- A ordem do visualizador deve ser a mesma da grade, atualmente a ordem
  decrescente de `idFoto` produzida no servidor.
- A posição inicial deve corresponder à miniatura selecionada, mesmo quando a
  foto aberta não for a primeira da grade.
- Os filtros e o parâmetro `pagina` permanecem inalterados enquanto o diálogo
  está aberto.
- A navegação não deve buscar dados adicionais nem tentar atravessar para a
  página anterior ou seguinte dos resultados.

## Fora do escopo

- Carregamento incremental ou antecipado de outras páginas da consulta.
- Navegação contínua entre páginas de resultados.
- Criar uma rota ou URL individual para o estado aberto de cada foto.
- Registrar a foto selecionada no histórico do navegador ou em parâmetros da
  URL.
- Alterar consultas SQL, tamanho da página, filtros, ordenação ou schema do
  banco.
- Alterar o processamento, armazenamento ou regras de visibilidade das fotos.
- Adicionar biblioteca de carrossel, gestos ou animação.

## Critérios de aceite

- Ao abrir qualquer miniatura, o visitante consegue percorrer as fotos
  anteriores e seguintes da página sem fechar o diálogo.
- Controles visíveis, teclas de seta e gesto horizontal levam à mesma foto e
  respeitam a primeira e a última posição do conjunto.
- Rolagem vertical, toque simples e movimentos curtos não causam troca
  acidental.
- Imagem, texto alternativo, título, metadados e indicador de posição
  permanecem sincronizados após todas as formas de navegação.
- Abrir uma miniatura intermediária mostra sua posição correta e permite
  navegar nas duas direções.
- Um conjunto com uma única foto continua utilizável e não apresenta controles
  de navegação ativos.
- Fechar e reabrir o diálogo por outra miniatura reinicia a seleção na foto
  escolhida.
- O diálogo continua fechando pelo botão existente e por `Escape`.
- Sem JavaScript, os links das miniaturas continuam levando aos arquivos das
  imagens.
- A paginação, os filtros e o envio de fotos continuam funcionando como antes.
- A interação é utilizável por teclado e em uma tela móvel sem depender do
  gesto.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passam.

## Validação manual sugerida

Consultar uma página com várias fotos e abrir a primeira, uma intermediária e
a última. Em cada caso, conferir controles, teclas, posição, metadados e
limites. Repetir em largura de celular, testando gestos horizontais deliberados
e rolagem vertical sobre o visualizador.

Testar também uma consulta que retorne somente uma foto, o fechamento por
`Escape`, a restauração do foco após fechar e a abertura direta dos links com
JavaScript desabilitado.

## Documentos complementares

### Ler antes da implementação

- `AGENTS.md`, especialmente as regras de fotos, privacidade e exclusão
  lógica.
- `docs/redesign/functional-spec.md`, na seção referente à consulta de fotos.

### Atualizar ao implementar

- A documentação funcional da consulta de fotos, registrando as formas e os
  limites da navegação.
- Esta issue, com a validação executada, o resultado e o estado final.

## Arquivos de código previstos

- `src/routes/lista_foto/+page.svelte`.

Não se prevê alteração server-side, de schema, migração, importador legado ou
dependências do projeto.

## Resultado da implementação

- O visualizador mantém o índice da miniatura selecionada e navega na ordem de
  `data.photos`, sem consultas adicionais ou passagem automática de página.
- Foram adicionados botões anterior/próxima com estados desabilitados nos
  limites, indicador de posição e atualização sincronizada da imagem, título,
  texto alternativo e metadados.
- As teclas `ArrowLeft` e `ArrowRight` funcionam apenas dentro do diálogo; o
  botão “Fechar”, `Escape`, o retorno do foco e o `href` das miniaturas foram
  preservados.
- O gesto usa Pointer Events apenas para toque, captura o ponteiro e exige pelo
  menos 50 px de deslocamento predominantemente horizontal. A área da imagem
  mantém `touch-action: pan-y` para preservar a rolagem vertical.
- Não foi adicionada dependência, rota, estado na URL nem alteração server-side.
- A especificação funcional da galeria foi atualizada com as novas formas de
  navegação e seus limites.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passaram em 14 de agosto
  de 2026.
