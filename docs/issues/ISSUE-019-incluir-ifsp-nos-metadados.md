# ISSUE-019 — Incluir IFSP nos títulos e descrições das páginas

**Estado:** Concluída

**Área:** Conteúdo, metadados e SEO

**Rotas afetadas:** todas as páginas HTML que publiquem título ou descrição,
com atenção especial a `/exalunos/[id]`, `/exalunos_lista`,
`/exalunos/curso/[curso]`, `/lista_foto` e `/novocadastro`

## Contexto

O site preserva a sigla histórica ETFSP, pela qual a antiga Escola Técnica
Federal de São Paulo ainda é reconhecida por muitos ex-alunos. A instituição,
porém, passou por CEFET-SP e atualmente é o Instituto Federal de Educação,
Ciência e Tecnologia de São Paulo, conhecido pela sigla IFSP.

Parte dos títulos e descrições já apresenta “ETFSP, CEFET-SP e IFSP”, mas
alguns metadados ainda citam somente ETFSP. Isso ocorre, por exemplo, na
relação geral de ex-alunos, no perfil individual, na galeria de fotos e no
cadastro. Os títulos da relação e do perfil também usam ETFSP como sufixo sem
incluir IFSP.

Como títulos e descrições são reutilizados nas tags HTML, Open Graph e
Twitter pelo componente compartilhado de metadados, essa inconsistência
também aparece para mecanismos de busca e ao compartilhar páginas.

## Objetivo

Associar IFSP às referências institucionais a ETFSP nos títulos e descrições
das páginas, para que pessoas que conhecem a instituição pela sigla atual
também identifiquem o conteúdo do site.

A mudança deve preservar a relevância histórica de ETFSP e incluir a
denominação intermediária CEFET-SP nos textos em que houver espaço para a
sequência completa.

## Regra editorial proposta

- Em descrições de páginas e outros textos institucionais curtos, preferir
  “ETFSP, CEFET-SP e IFSP”.
- Em sufixos de títulos, nos quais a forma completa ficaria excessivamente
  longa, usar “ETFSP / IFSP”.
- Não remover ETFSP nem substituir todas as ocorrências por IFSP.
- Manter a ordem histórica ETFSP, CEFET-SP e IFSP quando as três siglas forem
  apresentadas.
- Usar sempre a sigla correta **IFSP**. A forma “IFS” não deve ser introduzida.
- Quando uma menção disser respeito exclusivamente a um período histórico da
  Escola Técnica Federal de São Paulo, ela pode continuar usando apenas ETFSP,
  desde que não seja uma descrição geral do público atual do site.

Exemplos propostos:

```text
Título de perfil: Nome do ex-aluno — Ex-alunos ETFSP / IFSP
Descrição de perfil: Perfil público de Nome do ex-aluno, ex-aluno da ETFSP, CEFET-SP ou IFSP.
Título de listagem: Relação de ex-alunos — ETFSP / IFSP
Descrição de galeria: Consulte as fotos enviadas pelos ex-alunos da ETFSP, CEFET-SP e IFSP.
```

A redação final deve permanecer natural em português. A regra não exige
repetir as siglas várias vezes na mesma frase ou produzir uma sequência de
palavras-chave sem valor para o leitor.

## Escopo da revisão

Revisar todas as instâncias do componente `Meta` e qualquer valor que alimente
seus campos `title` e `description`, incluindo valores derivados de filtros,
paginação, curso e dados do perfil.

No estado atual, a implementação deve conferir pelo menos:

- a descrição do cadastro em `/novocadastro`;
- o título e a descrição da relação geral em `/exalunos_lista`;
- os títulos derivados das páginas por curso e de suas paginações;
- o título e a descrição de cada perfil em `/exalunos/[id]`;
- a descrição da galeria em `/lista_foto`;
- títulos e descrições das páginas que já contêm a sequência completa, para
  preservar a consistência e evitar duplicação;
- as palavras-chave globais legadas de `src/app.html`, acrescentando ao menos
  `IFSP` e “Instituto Federal de São Paulo” se essa meta tag for mantida.

Como o componente `Meta` replica título e descrição para Open Graph e Twitter,
a correção deve ser feita na fonte dos valores. Não devem ser adicionadas tags
paralelas ou duplicadas em cada página.

## O que não deve ser alterado automaticamente

Uma busca textual por ETFSP também encontra ocorrências que não representam
uma referência institucional apta a receber IFSP. Não alterar por substituição
global:

- o nome e a marca `ETFSP.com`;
- o domínio `etfsp.com`, suas URLs canônicas e o sitemap;
- endereços de e-mail terminados em `@etfsp.com`;
- nomes de pacote, serviço, imagem Docker, host SSH e variáveis de
  infraestrutura;
- nomes de arquivos, caminhos, IDs ou configurações técnicas;
- registros históricos que tratem especificamente da época da ETFSP;
- documentação de issues concluídas, salvo se ela for fonte vigente da regra
  editorial.

O texto visível da interface que não seja metadado pode ser revisado quando
representar de modo geral o público do site, mas esta issue não propõe trocar
o domínio, renomear a aplicação nem redesenhar a marca.

## SEO e qualidade do conteúdo

A inclusão de IFSP torna a identificação do público mais clara e pode ajudar
os mecanismos de busca a relacionar o site à denominação atual. Ela não deve
ser descrita como garantia de melhoria de posição nos resultados.

- Manter cada título legível e específico à página, deixando o sufixo
  institucional no final.
- Manter cada descrição coerente com o conteúdo que o visitante encontrará.
- Evitar repetição artificial de siglas e listas extensas de termos.
- Não alterar canonical, diretivas `robots`, sitemap ou política de
  indexação nesta mudança.
- Não incluir novos dados pessoais em títulos, descrições ou metadados
  sociais.
- Perfis continuam usando somente o nome e os dados públicos já permitidos.

## Decisão de implementação sugerida

Definir constantes compartilhadas para a identificação institucional curta e
para a sequência completa, caso isso reduza duplicação sem tornar as frases
artificiais. Por exemplo, uma constante curta pode atender aos sufixos dos
títulos, enquanto descrições podem continuar com frases explícitas e naturais.

A implementação deve manter uma única fonte por página para título e
descrição. O componente `Meta` continuará responsável por refletir os mesmos
valores no `<title>`, em `meta[name="description"]`, Open Graph e Twitter.

## Fora do escopo

- Alterar o domínio `etfsp.com` ou criar um novo domínio.
- Renomear o site ou remover a identidade histórica ETFSP.
- Fazer uma reformulação visual ou alterar a navegação.
- Reescrever todo o conteúdo institucional e histórico.
- Alterar URLs, canonical, sitemap, `robots.txt` ou regras de indexação.
- Criar páginas de destino adicionais para palavras-chave.
- Garantir posição, tráfego ou destaque em mecanismos de busca.
- Alterar schema, banco de dados ou dados de ex-alunos.

## Critérios de aceite

- Todo título ou descrição de página que use ETFSP como identificação geral
  do público também apresenta IFSP.
- Títulos curtos que hoje terminam em ETFSP passam a usar o sufixo consistente
  “ETFSP / IFSP”.
- Descrições gerais usam, preferencialmente, “ETFSP, CEFET-SP e IFSP”.
- O perfil de cada ex-aluno inclui ETFSP e IFSP tanto no título quanto na
  descrição, sem publicar nenhum dado pessoal adicional.
- Listagens, páginas por curso, paginação, galeria e cadastro seguem a mesma
  regra editorial.
- `<title>`, descrição HTML, Open Graph e Twitter apresentam valores
  consistentes e não duplicados.
- A grafia incorreta “IFS” não aparece nos textos introduzidos pela mudança.
- `ETFSP.com`, `etfsp.com`, URLs, e-mails e identificadores técnicos permanecem
  inalterados.
- O conteúdo continua natural e útil ao visitante, sem acúmulo artificial de
  palavras-chave.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passam.

## Validação manual sugerida

Acessar a página inicial, a relação geral, uma página por curso, uma página
paginada, um perfil, a galeria e o cadastro. Em cada uma, conferir no HTML:

- o conteúdo de `<title>` e `meta[name="description"]`;
- `og:title`, `og:description`, `twitter:title` e
  `twitter:description`;
- a presença de IFSP sempre que ETFSP identificar de forma geral o público;
- a ausência de títulos duplicados, descrições truncadas pela aplicação ou
  alterações nas URLs canônicas.

Também executar uma busca sem distinção de maiúsculas por `ETFSP` nos arquivos
de interface. Cada ocorrência remanescente deve ser classificada como texto já
acompanhado de IFSP, marca `ETFSP.com`, domínio/e-mail, configuração técnica ou
referência estritamente histórica.

## Documentos complementares

### Ler antes da implementação

- `AGENTS.md`, em especial as regras de conteúdo e privacidade.
- `docs/redesign/functional-spec.md`, nas seções de metadados e terminologia.
- `src/lib/Meta.svelte`.
- Os componentes de página em `src/routes/` que instanciam `Meta`.

### Atualizar ao implementar

- `docs/redesign/functional-spec.md`, registrando a regra editorial para
  títulos e descrições.
- Esta issue, com a solução adotada, validações executadas e estado final.

## Arquivos de código previstos

- `src/routes/novocadastro/+page.svelte`;
- `src/routes/exalunos_lista/+page.svelte`;
- `src/routes/detalhe_exaluno/+page.svelte`;
- `src/routes/lista_foto/+page.svelte`;
- `src/app.html`, caso a meta tag de palavras-chave seja mantida;
- um módulo compartilhado em `src/lib/`, somente se adotadas constantes para
  a nomenclatura institucional;
- demais páginas encontradas na revisão final que usem ETFSP em título ou
  descrição sem IFSP.

Não se prevê alteração de schema, migração, banco de dados, diretório de fotos
ou consultas de dados pessoais.

## Resultado da implementação

- Atualizados títulos e descrições dos perfis, da relação de ex-alunos,
  da galeria e do cadastro para incluir IFSP junto às referências gerais a
  ETFSP.
- Mantidos títulos e descrições já consistentes nas páginas inicial, de
  entrada de ex-alunos, “Sobre” e Política de Privacidade.
- Acrescentados IFSP e “Instituto Federal de São Paulo” às palavras-chave
  globais existentes.
- Registrada a regra editorial na especificação funcional.
- Canonical, indexação, domínio e dados pessoais não foram alterados.

## Validação executada

- pnpm run check passou.
- pnpm run lint passou.
- pnpm run build passou.
- A busca final confirmou que as menções de ETFSP nos metadados gerais já
  acompanham IFSP; ocorrências restantes são nomes institucionais históricos,
  a marca/domínio ou texto visível já consistente.
