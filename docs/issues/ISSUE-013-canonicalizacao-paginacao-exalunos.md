# ISSUE-013 — Corrigir canonicalização e URLs da paginação de ex-alunos

**Estado:** Concluída

**Áreas:** Consulta de ex-alunos, paginação e SEO técnico

**Rotas afetadas:** `/exalunos_lista`, `/exalunos/curso/[curso]` e links de
paginação compartilhados

## Contexto

A relação geral e as páginas temáticas de curso dividem os resultados em
páginas. Por exemplo, a segunda página de Mecânica é atualmente gerada como:

```text
/exalunos/curso/mecanica?ordem=nome&pagina=2
```

Usar um parâmetro GET para o número da página é adequado: cada parte da
sequência precisa de uma URL rastreável própria. Entretanto, a implementação
vigente trata qualquer query como uma variante não indexável, emite
`noindex,follow` e aponta canonical para a primeira página. Isso também atinge
paginação pura, apesar de cada página conter um conjunto diferente de perfis.

A orientação atual dos buscadores é que cada página de uma sequência paginada
tenha URL e canonical próprias. Filtros livres e ordenações alternativas podem
continuar fora do índice, pois geram variações do mesmo conjunto.

O parâmetro `ordem=nome` também é redundante, porque “nome” já é a ordenação
padrão. Sua presença cria duas URLs equivalentes para a mesma segunda página:

```text
/exalunos/curso/mecanica?pagina=2
/exalunos/curso/mecanica?ordem=nome&pagina=2
```

O tamanho da página no código-fonte atual já é `300`, embora tenha sido
observado um ambiente exibindo `150` resultados. Esta issue fixa 300 como
contrato e exige validar o artefato efetivamente publicado, sem pressupor que
uma mudança da constante será necessária.

## Objetivos

- Tornar indexável e autocanônica cada página de uma sequência paginada sem
  outros filtros.
- Remover parâmetros com valores padrão das URLs geradas.
- Redirecionar representações equivalentes para uma única URL.
- Corrigir páginas solicitadas acima do limite real.
- Manter busca, filtros, recentes e ordenações alternativas como
  `noindex,follow`.
- Garantir 300 resultados por página na relação geral e nas páginas de curso.
- Preservar links HTML sequenciais e funcionamento sem JavaScript.

## Contrato de tamanho da página

- A relação geral e todas as páginas de curso devem usar exatamente 300
  resultados por página.
- Contagem, `LIMIT`, `OFFSET`, total de páginas, rótulo da página atual e links
  “Anterior”/“Próxima” devem derivar da mesma constante server-side.
- Não criar uma segunda constante de tamanho na rota de curso.
- O valor não deve vir de query, formulário ou outra entrada do visitante.
- O código atual já declara `PAGE_SIZE = 300`; a implementação deve preservar
  esse valor e investigar qualquer resultado de 150 como possível diferença de
  versão, cache ou ambiente implantado.
- A validação manual deve usar um curso com mais de 300 registros e confirmar
  que a primeira página contém até 300 cartões e que o 301º registro inicia a
  página 2 conforme a ordenação aplicada.

## URLs canônicas da paginação

Para a relação geral:

```text
Página 1: /exalunos_lista
Página 2: /exalunos_lista?pagina=2
Página 3: /exalunos_lista?pagina=3
```

Para uma página temática de curso:

```text
Página 1: /exalunos/curso/mecanica
Página 2: /exalunos/curso/mecanica?pagina=2
Página 3: /exalunos/curso/mecanica?pagina=3
```

- A página 1 usa a URL sem `pagina` e possui canonical para si mesma.
- Cada página `N > 1` sem busca, filtro, recentes ou ordenação alternativa é
  indexável e possui canonical absoluta incluindo `?pagina=N`.
- Não transformar a paginação em segmentos como `/pagina/2`; query é o
  contrato adotado.
- A canonical deve usar parâmetros em ordem determinística e conter somente os
  parâmetros necessários para identificar aquela página.
- Título e descrição podem permanecer iguais na sequência, mas a proposta é
  acrescentar “— Página N” ao `<title>` quando `N > 1`, facilitando inspeção e
  diferenciação nos relatórios.
- Não adicionar `rel="next"` ou `rel="prev"` como requisito, pois os links de
  paginação já formam a sequência rastreável.

## Normalização e redirecionamentos

Aplicar redirecionamento permanente `308` quando a URL solicitada tiver uma
representação válida, porém não canônica.

### Valores padrão

```text
?pagina=1
→ URL base sem query

?ordem=nome
→ URL base sem query

?ordem=nome&pagina=2
→ ?pagina=2
```

A regra vale para a relação geral e para cada página de curso.

### Parâmetros legados

- `ORDEM=ALFA` é equivalente à ordenação padrão e deve ser omitido do destino.
- Demais valores legados reconhecidos continuam normalizados para o parâmetro
  moderno `ordem`, conforme o contrato existente.
- Parâmetros desconhecidos não devem ser propagados ao destino canônico.
- Parâmetro reconhecido repetido ou inválido deve seguir a política segura da
  rota e não ser interpolado em SQL.

### Página acima do limite

Se a página solicitada ultrapassar o total, redirecionar para a última página
real, em vez de renderizar silenciosamente o conteúdo da última página sob uma
URL arbitrária:

```text
/exalunos/curso/mecanica?pagina=999
→ 308 /exalunos/curso/mecanica?pagina=5
```

- Se existir apenas uma página, o destino é a URL base sem `pagina`.
- Preservar busca, curso, recentes ou ordenação reconhecida quando a correção
  ocorrer dentro de uma variante não indexável.
- Evitar cadeia de redirecionamentos: parâmetros padrão, formato legado e
  página excedente devem ser resolvidos diretamente no destino final sempre
  que o total já estiver disponível.
- Página zero, negativa, decimal, texto ou inteiro acima do limite seguro não
  deve ser interpretada parcialmente. A política proposta é normalizar para a
  página 1 e redirecionar para a URL correspondente.

## Política de indexação

### Indexáveis e autocanônicas

- relação geral sem query;
- relação geral contendo somente `pagina=N`, com `N > 1` e dentro do limite;
- página base de cada curso;
- página de curso contendo somente `pagina=N`, com `N > 1` e dentro do limite.

### `noindex,follow`

Qualquer sequência que contenha ao menos uma destas condições:

- `busca` não vazia;
- curso como filtro legado ainda não redirecionado;
- `recentes=1`;
- ordenação diferente de `nome`;
- combinação com parâmetros de filtro futuros.

Nessas variantes:

- manter links de paginação rastreáveis;
- manter canonical para a página base da relação ou do curso, conforme a
  política vigente para filtros;
- não incluir a URL no sitemap;
- não usar `robots.txt` para impedir o rastreamento necessário à leitura de
  `noindex`.

`pagina` por si só não deve mais causar `noindex`.

## Links de paginação

- “Anterior” e “Próxima” devem continuar sendo elementos `<a>` com `href` real.
- Links da ordenação padrão devem omitir `ordem=nome`.
- Página 1 deve ser ligada pela URL base, sem `pagina=1`.
- Páginas seguintes devem emitir somente `pagina=N` quando não houver outro
  estado necessário.
- Em busca ou ordenação alternativa, preservar somente parâmetros reconhecidos
  que realmente alteram o resultado.
- A página 2 deve possuir link de retorno à página 1 e, quando aplicável, link
  para a página 3.
- Não depender de botões sem `href`, fragmentos `#`, JavaScript ou rolagem
  infinita para alcançar páginas subsequentes.

## Sitemap

- Manter somente a primeira página da relação geral e de cada curso no
  sitemap.
- Não incluir `?pagina=2`, `?pagina=3` ou páginas seguintes, embora sejam
  indexáveis e autocanônicas.
- Os links sequenciais são o mecanismo de descoberta das páginas seguintes.
- Manter os perfis individuais no sitemap, de modo que a descoberta de um
  perfil não dependa exclusivamente da paginação.
- Não adicionar `lastmod` sem uma data confiável de mudança do conteúdo.

## Consulta e desempenho

- Continuar usando `LIMIT 300` e `OFFSET` calculado no servidor.
- O total deve vir de `COUNT(*)` com exatamente as mesmas condições da consulta
  de resultados.
- Consultas continuam parametrizadas, exceto fragmentos de ordenação vindos da
  allowlist conhecida.
- Toda consulta pública mantém `e.Excluido = 0`.
- Nenhuma coluna adicional deve ser selecionada para implementar canonical ou
  redirecionamento.
- A correção da página acima do limite pode usar o `COUNT` já necessário; não
  executar uma segunda contagem idêntica.
- Confirmar no ambiente de desenvolvimento que 300 cartões e suas miniaturas
  não produzem resposta, memória ou tempo de renderização inadequados. Se
  houver problema mensurável, registrar evidência antes de propor outro limite.

## Privacidade

- A mudança não altera quais ex-alunos ou campos são públicos.
- Páginas paginadas continuam usando apenas o modelo mínimo dos cartões.
- Tornar uma página paginada indexável não autoriza adicionar contatos,
  comentários ou dados internos à listagem ou aos metadados.
- Registros com `Excluido != 0` não aparecem em nenhuma página, contagem ou link
  indexável.
- URLs, canonical e títulos não devem conter nomes de pessoas ou valores de
  busca livre.

## Fora do escopo

- Alterar as URLs canônicas dos cursos.
- Colocar o número da página no caminho.
- Indexar busca por nome, recentes ou ordenações alternativas.
- Incluir todas as páginas paginadas no sitemap.
- Trocar paginação por “Carregar mais” ou rolagem infinita.
- Modificar o tamanho de página da galeria de fotos.
- Alterar schema, view, catálogo de cursos ou dados persistidos.
- Adicionar contatos ou outros campos aos cartões.

## Critérios de aceite

- A relação geral e as páginas de curso retornam no máximo 300 cartões por
  página e calculam o total de páginas com divisor 300.
- Um conjunto com 301 resultados possui exatamente duas páginas.
- A página 1 usa URL sem `pagina`; `?pagina=1` redireciona com `308` para ela.
- `?ordem=nome` é omitido das URLs geradas e redireciona para a representação
  equivalente sem esse parâmetro.
- Uma página 2 sem filtros não emite `noindex` e possui canonical absoluta para
  sua própria URL com `?pagina=2`.
- Busca, recentes e ordenação alternativa continuam emitindo
  `noindex,follow`, inclusive em suas páginas 2 e seguintes.
- Uma página acima do total redireciona diretamente para a última página real;
  uma página inválida redireciona para a página 1.
- Links “Anterior” e “Próxima” usam `href`, omitem parâmetros padrão e preservam
  somente estado reconhecido necessário.
- Relação geral e páginas de curso continuam funcionando sem JavaScript.
- Sitemap continua contendo somente a primeira página de cada coleção e os
  perfis canônicos, sem URLs paginadas.
- Consultas permanecem parametrizadas, usam a allowlist de ordenação e aplicam
  `Excluido = 0`.
- Nenhum dado privado novo aparece em HTML, metadados, sitemap, logs ou
  mensagens de erro.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passam.

## Validação manual sugerida

- Na relação geral e em Mecânica, abrir página 1, página 2 e última página;
  conferir quantidade de cartões, total de páginas, canonical, robots e links.
- Conferir que Mecânica, com mais de 300 registros, apresenta 300 cartões na
  primeira página e o restante nas seguintes.
- Testar `pagina=1`, `pagina=2`, `pagina=999`, `pagina=0`, `pagina=-1`,
  `pagina=1.5`, `pagina=texto` e inteiro acima do limite seguro.
- Testar cada caso com ausência de ordem, `ordem=nome`, ordenação alternativa,
  `ORDEM=ALFA`, busca e recentes.
- Confirmar que um redirecionamento chega diretamente à URL final, sem cadeia.
- Navegar apenas pelos links “Anterior” e “Próxima”, com JavaScript desativado.
- Inspecionar sitemap e confirmar ausência de `?pagina=`.
- Comparar o artefato local e o ambiente publicado para esclarecer qualquer
  ocorrência de 150 resultados por página.
- Medir de forma simples tempo e tamanho da resposta com 300 cartões e conferir
  o comportamento em 320 px e zoom de 200%.

## Documentos complementares

### Ler antes da implementação

- `AGENTS.md`, especialmente paginação, SQL parametrizado, exclusão lógica e
  privacidade.
- `docs/issues/ISSUE-002-filtro-curso-exalunos.md`.
- `docs/issues/ISSUE-011-urls-e-indexacao.md`.
- `docs/issues/ISSUE-012-paginas-exalunos-por-curso.md`.
- `docs/redesign/functional-spec.md`, seção da relação de ex-alunos.
- `docs/redesign/privacy-data.md`, para o modelo público dos cartões.

### Atualizar ao implementar

- `docs/redesign/functional-spec.md`, corrigindo canonical, indexação,
  normalização e tamanho da página.
- `docs/redesign/implementation-plan.md`, registrando a entrega incremental.
- ISSUE-011 e ISSUE-012 somente se for necessário corrigir afirmações de
  resultado que deixaram de representar a política vigente.
- Esta issue, com decisões, validações, resultado e estado final.

## Arquivos de código previstos

- `src/routes/exalunos_lista/+page.server.ts`.
- `src/routes/exalunos_lista/+page.svelte`.
- `src/routes/exalunos/curso/[curso]/+page.server.ts`, somente se a
  normalização não puder permanecer no carregador compartilhado.
- `src/lib/components/Pagination.svelte`.
- `src/lib/Meta.svelte`, somente se o contrato atual não aceitar canonical
  calculada por página.

Não se prevê alteração em `src/routes/sitemap.xml/+server.ts`, salvo validação
que confirme a presença indevida de páginas paginadas. Não se prevê alteração
de schema, migração ou dados persistidos.

## Resultado da implementação

- Fixado `PAGE_SIZE = 300`; o workspace estava em 600 no início da
  implementação, apesar de uma inspeção anterior ter encontrado 300.
- Centralizada a construção da URL normalizada depois do `COUNT`, permitindo
  corrigir valores padrão, aliases, parâmetros legados, página inválida e
  página excedente em um único redirecionamento `308`.
- Paginação pura agora é indexável e recebe canonical própria com
  `?pagina=N`; busca, recentes e ordenação alternativa permanecem
  `noindex,follow` com canonical para a página base.
- Links de paginação omitem `pagina=1` e `ordem=nome`, preservando somente o
  estado necessário.
- Títulos das páginas seguintes incluem “Página N”.
- O sitemap permaneceu inalterado e continua sem páginas paginadas.
- Não houve alteração de schema, migração ou dados persistidos.
