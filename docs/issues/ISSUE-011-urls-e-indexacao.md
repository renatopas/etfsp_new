# ISSUE-011 — Melhorar URLs, rastreamento e indexação

**Estado:** Concluída

**Áreas:** SEO técnico, perfis de ex-alunos, listagens e metadados

**Rotas afetadas:** nova rota `/exalunos/[id]`, `/detalhe_exaluno`,
`/exalunos_lista`, `/lista_foto`, `/novocadastro`, `/cadfoto`, `/robots.txt` e
`/sitemap.xml`

## Contexto

Os perfis públicos de ex-alunos são hoje identificados pela URL
`/detalhe_exaluno?id={id}`. Embora parâmetros de query sejam válidos e
rastreáveis, o identificador faz parte da identidade do recurso e pode ser
representado de forma mais simples e estável no caminho, como
`/exalunos/{id}`.

A troca direta quebraria favoritos, links externos e URLs eventualmente já
indexadas. A migração deve manter compatibilidade por redirecionamento
permanente, apresentar uma única URL canônica e atualizar links internos e o
sitemap para que os buscadores consolidem os sinais na nova rota.

O site também possui páginas de busca, filtros, ordenação, paginação e fluxos
operacionais. Essas URLs podem produzir conteúdo duplicado ou de pouco valor
como resultado de busca. É necessário definir explicitamente quais páginas
devem ser indexadas, sem impedir que os buscadores leiam as diretivas de
indexação.

O sitemap dinâmico existente inclui páginas fixas e perfis não excluídos, mas
usa a rota antiga dos perfis e `DtCadastro` como `lastmod`. Data de cadastro
não representa necessariamente a última modificação; portanto, esse valor não
deve ser anunciado como tal enquanto não existir um campo confiável de
atualização.

## Objetivos

- Adotar URLs simples e estáveis para os perfis públicos.
- Preservar integralmente a compatibilidade das URLs antigas.
- Consolidar variantes de uma mesma página em uma URL canônica.
- Evitar a indexação de buscas, filtros e fluxos operacionais de baixo valor.
- Facilitar a descoberta das páginas públicas relevantes.
- Melhorar metadados e dados estruturados sem ampliar a exposição de dados
  pessoais.

## Contrato de URLs dos perfis

| Situação                     | URL                        | Comportamento esperado                             |
| ---------------------------- | -------------------------- | -------------------------------------------------- |
| Perfil canônico              | `/exalunos/{id}`           | Responder `200` para registro público existente    |
| URL legada válida            | `/detalhe_exaluno?id={id}` | Redirecionar permanentemente para `/exalunos/{id}` |
| ID inválido                  | qualquer formato           | Responder `400` sem consultar com valor inválido   |
| Registro ausente ou excluído | `/exalunos/{id}`           | Responder `404` sem expor dados do registro        |

- `{id}` deve aceitar somente inteiro decimal positivo dentro do intervalo de
  inteiros seguros do JavaScript.
- A nova URL não deve conter nome, apelido, curso ou outro dado pessoal.
- O redirecionamento legado deve usar `308 Permanent Redirect`, preservar o
  método por definição e apontar diretamente para o destino final, sem cadeia
  intermediária.
- Parâmetros extras recebidos na URL legada não devem ser transportados para a
  URL canônica, salvo decisão posterior documentada nesta issue.
- A compatibilidade deve permanecer por tempo indeterminado. A rota legada não
  deve voltar a renderizar uma segunda cópia do perfil.
- Todos os links gerados pelo site e todas as entradas do sitemap devem usar
  somente a nova URL.

## Parâmetros que permanecem em query

Busca, filtro, ordenação e paginação não identificam um perfil individual e
devem continuar usando parâmetros GET, preservando o funcionamento sem
JavaScript. Isso inclui `busca`, `curso`, `ordem`, `recentes` e `pagina` em
`/exalunos_lista`, além dos filtros próprios de `/lista_foto`.

Não faz parte desta mudança converter cada combinação de filtro em caminho.
Links gerados pela aplicação devem continuar emitindo apenas parâmetros
reconhecidos, normalizados e necessários ao estado atual.

## URL canônica

Evoluir o componente compartilhado de metadados para aceitar uma URL canônica
absoluta e emitir uma única tag `<link rel="canonical">` por documento.

- Perfis devem apontar para `https://etfsp.com/exalunos/{id}`.
- Páginas estáticas indexáveis devem apontar para sua própria URL sem query.
- A relação de ex-alunos sem filtros deve ser canônica em
  `https://etfsp.com/exalunos_lista`.
- URLs de busca, filtro, ordenação ou modo “recentes” não devem declarar a
  combinação como uma nova página canônica.
- Páginas de paginação precisam de decisão explícita antes da implementação:
  canonical própria se forem indexáveis ou `noindex,follow` se não forem.
- A origem canônica deve ser uma configuração controlada pela aplicação, nunca
  derivada sem validação do cabeçalho `Host` enviado pelo cliente.
- Definir `https://etfsp.com` como origem proposta. Confirmar antes da
  implementação se a variante oficial é sem `www` e se a infraestrutura já
  redireciona HTTP e `www` para ela.

## Política de indexação

### Indexáveis

- `/`;
- `/exalunos`;
- `/exalunos_lista` sem busca ou filtros;
- `/exalunos/{id}` para cada registro com `Excluido = 0`;
- `/lista_foto` sem filtros;
- `/politica-de-privacidade`.

### Não indexáveis, mas rastreáveis

Emitir `<meta name="robots" content="noindex,follow">` em:

- `/exalunos_lista` quando houver busca, filtro, ordenação não padrão,
  `recentes=1` ou outra variante não canônica;
- páginas de paginação, se essa for a decisão registrada antes da
  implementação;
- `/lista_foto` quando houver filtros que criem uma variante da galeria;
- `/novocadastro`;
- `/cadfoto` e suas etapas de sucesso.

Não bloquear essas páginas no `robots.txt`, pois o robô precisa acessá-las para
ler `noindex`. Endpoints técnicos, actions e respostas que não sejam documentos
HTML não precisam receber meta tag.

## `robots.txt`

Criar uma resposta pública em `/robots.txt`, em texto simples UTF-8, com a
política mínima:

```text
User-agent: *
Allow: /

Sitemap: https://etfsp.com/sitemap.xml
```

Não adicionar bloqueios amplos sem uma justificativa específica. Em especial,
não bloquear `/exalunos_lista`, `/lista_foto`, `/novocadastro` ou `/cadfoto`
enquanto `noindex` depender do rastreamento dessas páginas.

## Sitemap

Atualizar o endpoint existente `/sitemap.xml` para:

- usar `/exalunos/{id}` para perfis e nunca listar a URL legada;
- listar somente páginas canônicas, indexáveis e com resposta `200`;
- remover `/novocadastro` e `/cadfoto`;
- continuar selecionando somente IDs de `ExAlunos` com `Excluido = 0`;
- não selecionar nem enviar nome, e-mail, telefone ou qualquer outra coluna
  pessoal desnecessária;
- omitir `lastmod` enquanto não existir uma data real e confiável de última
  atualização;
- manter XML válido, URLs absolutas, escape adequado e `Content-Type`
  compatível;
- manter cache com duração documentada sem impedir que exclusões lógicas sejam
  refletidas em prazo razoável;
- respeitar o limite do protocolo de 50.000 URLs e 50 MB sem compressão. Caso
  o volume possa atingir esse limite, a implementação deve introduzir índice
  de sitemaps e divisão determinística, em vez de truncar silenciosamente.

Uma futura data de atualização pode restaurar `lastmod`, mas isso exige campo e
fluxo confiáveis e fica fora do escopo desta issue.

## Metadados sociais e de busca

Ampliar o componente compartilhado de metadados para suportar, sem duplicação:

- título e descrição existentes;
- URL canônica absoluta;
- `og:title`, `og:description`, `og:url` e `og:type`;
- `twitter:title`, `twitter:description` e tipo de card;
- imagem absoluta opcional para Open Graph e Twitter;
- diretiva `robots` opcional, usada nas páginas não indexáveis.

Perfis devem manter título individualizado e descrição coerente apenas com
dados públicos. A imagem de perfil só deve ser anunciada quando corresponder a
uma foto pública, não excluída e já autorizada pela regra vigente.

## Dados estruturados dos perfis

Adicionar JSON-LD do tipo `ProfilePage`, com `mainEntity` do tipo `Person`,
somente nas páginas canônicas de perfis públicos.

Por padrão, limitar os dados estruturados a:

- nome público;
- URL canônica do perfil;
- foto pessoal pública, quando houver;
- curso e período apenas se houver um mapeamento semanticamente correto e
  validado antes da implementação.

Não incluir e-mail, telefone, WhatsApp, ICQ, endereço, CPF, prontuário, IP,
comentários livres ou URLs sociais no JSON-LD sem nova decisão explícita de
produto e privacidade. O JSON-LD deve ser produzido por serialização segura e
não por concatenação de strings contendo dados do banco.

Dados estruturados precisam corresponder ao conteúdo visível da página e não
devem ser emitidos na URL legada, que apenas redireciona.

## Privacidade e exclusão

- A nova rota deve reutilizar a mesma consulta server-side e as mesmas regras
  de visibilidade do perfil vigente, sem ampliar colunas retornadas.
- Registros com `Excluido != 0` não podem aparecer na nova rota, no sitemap ou
  nos dados estruturados.
- A migração de URL não altera autorização de publicação nem transforma
  campos de contato em dados apropriados para metadados.
- Após exclusão lógica, a página canônica deve responder `404`; o sitemap deve
  deixar de listá-la após a expiração do cache.
- Respostas de erro e redirecionamentos não devem registrar nem revelar dados
  pessoais, SQL, caminhos internos ou stack traces.

## Compatibilidade e implantação

- Não alterar schema, IDs existentes ou registros no banco.
- Atualizar todas as referências internas conhecidas para evitar depender do
  redirecionamento em navegação normal.
- Manter uma única etapa de redirecionamento entre cada URL antiga e a nova.
- Publicar sitemap, canonical, links internos e redirecionamento na mesma
  implantação para evitar sinais contraditórios.
- Após publicar, enviar o sitemap no Google Search Console e acompanhar URLs
  indexadas, canonical escolhida, erros de cobertura e acessos às URLs antigas.
- Manter o redirecionamento mesmo depois que a URL antiga desaparecer dos
  relatórios de indexação.

## Fora do escopo

- Trocar parâmetros de busca, filtro, ordenação ou paginação por segmentos de
  caminho.
- Criar slugs com nomes de ex-alunos.
- Alterar conteúdo, visibilidade ou campos dos perfis.
- Criar autenticação ou área de edição do cadastro.
- Criar ou alterar schema para registrar data de atualização.
- Garantir posição ou destaque em resultados de busca.
- Automatizar configuração, verificação ou envio ao Google Search Console.
- Remover imediatamente cópias já mantidas por mecanismos de busca.
- Reestruturar URLs de arquivos de fotos ou implementar sitemap de imagens.

## Pontos a validar antes da implementação

- Confirmar `https://etfsp.com` sem `www` como origem canônica e confirmar os
  redirecionamentos de domínio e protocolo na infraestrutura.
- Confirmar se páginas 2 e seguintes da relação e da galeria devem ser
  indexáveis com canonical própria ou receber `noindex,follow`. A proposta
  inicial é `noindex,follow`, pois os perfis e fotos continuam alcançáveis por
  links paginados rastreáveis.
- Confirmar que perfis públicos devem ser descobertos e indexados nominalmente
  por mecanismos de busca, considerando a política de privacidade vigente.
- Confirmar o conjunto mínimo do JSON-LD. A proposta inicial exclui todos os
  meios de contato e textos livres.
- Verificar o volume atual e projetado de perfis para decidir se um único
  sitemap permanece suficiente.
- Confirmar se há proxies ou CDN que precisem de regra própria para preservar
  o status `308` e a origem canônica.

## Critérios de aceite

- `/exalunos/{id}` apresenta o mesmo perfil público permitido pela rota atual,
  com `200`, sem enviar novas colunas ao navegador.
- ID malformado produz `400`; registro ausente ou excluído produz `404`.
- `/detalhe_exaluno?id={id}` válido responde com um único `308` para a nova
  URL, e o destino responde `200`.
- Favoritos e links externos antigos continuam funcionando pelo
  redirecionamento.
- Nenhum link interno nem entrada do sitemap aponta para a rota legada.
- Toda página indexável contém exatamente uma canonical absoluta coerente.
- Variantes definidas como não indexáveis emitem `noindex,follow` no HTML e
  continuam acessíveis ao rastreador.
- `/robots.txt` responde `200`, `text/plain` e anuncia o sitemap absoluto sem
  bloquear páginas que dependem de `noindex`.
- `/sitemap.xml` contém apenas URLs canônicas e indexáveis, omite registros
  excluídos, páginas operacionais e `lastmod` impreciso, e permanece XML válido.
- Perfis emitem JSON-LD válido e compatível com o conteúdo visível, sem meios
  de contato ou dados privados adicionais.
- Título, descrição, Open Graph e Twitter não ficam duplicados e usam URLs e
  imagens absolutas quando exigido pelo protocolo.
- A navegação e o conteúdo principal continuam funcionando sem JavaScript.
- Nenhum dado privado novo aparece em HTML, JSON-LD, sitemap, logs ou mensagens
  de erro.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passam.

## Validação manual sugerida

- Abrir um perfil existente pela URL nova e pela antiga, inspecionando status,
  `Location`, canonical e ausência de cadeia de redirecionamentos.
- Testar ID vazio, zero, negativo, decimal, texto, inteiro acima do limite,
  registro inexistente e registro excluído.
- Percorrer cartões, paginação, busca e retorno à listagem, confirmando que
  links de perfil sempre usam a rota nova.
- Inspecionar HTML com JavaScript desativado e confirmar canonical, robots,
  Open Graph e JSON-LD.
- Testar relação e galeria sem parâmetros e com cada filtro, ordenação, busca e
  paginação, conferindo a política de indexação aprovada.
- Validar `/robots.txt` e `/sitemap.xml` diretamente, inclusive tipo de
  conteúdo, escape de `&` e ausência de URLs legadas ou excluídas.
- Validar o JSON-LD no Rich Results Test e o XML do sitemap em ferramenta
  apropriada.
- Após implantação, inspecionar amostras das URLs antiga e nova no Search
  Console e acompanhar a migração da indexação.

## Documentos complementares

### Ler antes da implementação

- `AGENTS.md`, especialmente privacidade, exclusão lógica e consultas públicas.
- `docs/redesign/functional-spec.md`, para listagem, perfil e galeria.
- `docs/redesign/privacy-data.md`, para classificação de dados publicados.
- `docs/redesign/design-system.md`, para títulos, metadados e imagens.

### Atualizar ao implementar

- `docs/redesign/functional-spec.md`, registrando a rota canônica, a rota
  legada, os status e a política de parâmetros.
- `docs/redesign/privacy-data.md`, documentando o conjunto mínimo presente em
  metadados e JSON-LD.
- `docs/redesign/implementation-plan.md`, caso continue sendo usado como
  controle de execução.
- Esta issue, com decisões dos pontos pendentes, validações, resultado e estado
  final.

## Arquivos de código previstos

- `src/routes/exalunos/[id]/+page.server.ts`.
- `src/routes/exalunos/[id]/+page.svelte`.
- `src/routes/detalhe_exaluno/+page.server.ts`.
- `src/lib/components/AlumniCard.svelte`.
- `src/lib/Header.svelte`, para reconhecer a nova rota como seção ativa.
- `src/lib/Meta.svelte`.
- `src/routes/exalunos_lista/+page.svelte` e seu load server-side, se
  necessário para a diretiva calculada.
- `src/routes/lista_foto/+page.svelte` e seu load server-side, se necessário
  para a diretiva calculada.
- `src/routes/novocadastro/+page.svelte` e `src/routes/cadfoto/+page.svelte`.
- `src/routes/robots.txt/+server.ts`.
- `src/routes/sitemap.xml/+server.ts`.

Não se prevê alteração em `scripts/initial.sql`, `scripts/make_db.py`, na view
`qryExAlunos` ou nos dados existentes.

## Decisões tomadas

- Confirmada `https://etfsp.com` sem `www` como origem canônica da aplicação.
- Toda URL de relação ou galeria com query, inclusive paginação, recebe
  `noindex,follow` e aponta canonical para a página base.
- Perfis públicos não excluídos permanecem indexáveis nominalmente.
- JSON-LD contém somente nome, URL canônica e foto pessoal pública opcional;
  curso, período, contatos, redes sociais e textos livres foram omitidos.
- O banco de desenvolvimento possui 4.575 perfis públicos, portanto um único
  sitemap permanece suficiente. O endpoint detecta o limite de 50.000 URLs em
  vez de truncar silenciosamente.

## Resultado da implementação

- Criada `/exalunos/[id]` sobre um carregador server-only compartilhado; a rota
  legada valida o ID e responde `308` diretamente para a URL canônica.
- Atualizados cartões, navegação e sitemap para usar a rota nova.
- Evoluído `Meta.svelte` com canonical, Open Graph, Twitter, imagem absoluta,
  tipo de página e `noindex,follow` opcional.
- Aplicada a política de não indexação às variantes por query, paginações,
  cadastro e upload, sem bloqueá-las no `robots.txt`.
- Criado `/robots.txt` e ajustado `/sitemap.xml` para omitir páginas
  operacionais, URLs legadas, registros excluídos e `lastmod` impreciso.
- Adicionado JSON-LD mínimo e serializado com segurança aos perfis públicos.
- Não houve alteração de schema, view ou dados persistidos.
