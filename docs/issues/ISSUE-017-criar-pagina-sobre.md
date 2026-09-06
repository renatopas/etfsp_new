# ISSUE-017 — Criar página “Sobre”

**Estado:** Aguardando validação

**Área:** Conteúdo institucional e identificação da aplicação

**Rota afetada:** `/sobre`

## Contexto

A versão da aplicação está registrada no `package.json`, mas atualmente não há
uma forma de consultá-la pela interface do site. Exibir essa informação em
todas as páginas, diretamente no rodapé, daria destaque excessivo a um dado
que costuma ser necessário apenas para suporte, diagnóstico ou confirmação de
uma implantação.

O site também não possui uma página institucional própria que explique, de
forma breve, seu caráter não oficial, seu público e sua finalidade. Essas
informações aparecem parcialmente no rodapé e podem ser reunidas em uma página
“Sobre”, mantendo o rodapé simples.

## Modificação proposta

Criar a rota pública `/sobre` com uma apresentação curta do site e a versão da
aplicação implantada. Adicionar no rodapé global um link textual “Sobre” para a
nova página, sem mostrar a versão diretamente no rodapé.

A versão exibida deve vir da mesma fonte usada para versionar a aplicação,
evitando manter uma cópia manual em um componente Svelte. A implementação deve
ser compatível com o build do adapter Node e não deve carregar o `package.json`
completo para o navegador.

## Conteúdo da página

A página deve apresentar, em português:

- o título “Sobre o site”;
- uma explicação breve de que o site é uma iniciativa não oficial voltada a
  ex-alunos da ETFSP, CEFET-SP e IFSP;
- a finalidade principal do site: facilitar o reencontro de colegas e a
  consulta do acervo de fotos;
- a identificação do responsável, mantendo o mesmo nome e contato já
  publicados no rodapé;
- um link para a Política de Privacidade;
- a versão atual da aplicação, no formato “Versão 2.0.1” ou equivalente.

O texto deve preservar o tom e a identidade visual existentes, sem transformar
a página em documentação técnica ou histórico detalhado do projeto.

## Regras a atender

- Implementar a página na rota canônica `/sobre`.
- Manter o conteúdo em português e usar os componentes compartilhados de
  layout e apresentação já existentes.
- Obter a versão a partir de uma única fonte de verdade vinculada ao campo
  `version` do `package.json` ou ao processo de build.
- Enviar ao navegador somente a string da versão, sem expor o conteúdo completo
  do `package.json`, dependências, caminhos do servidor ou variáveis de
  ambiente.
- Renderizar a versão no servidor ou incorporá-la no build, sem realizar uma
  requisição adicional no navegador.
- Adicionar o link “Sobre” ao rodapé global, próximo ao link da Política de
  Privacidade.
- Usar HTML semântico e manter navegação por teclado, foco visível e contraste
  compatível com o restante do site.
- Definir título, descrição e URL canônica adequados por meio do componente de
  metadados já utilizado pelo projeto.
- Manter a página indexável, salvo decisão posterior em contrário.
- Não informar versões do Node.js, pnpm, SvelteKit, SQLite, imagem Docker ou
  outras dependências na interface pública.
- Não expor hash de commit, nome de branch, hostname, endereço IP, caminhos de
  implantação, segredos ou estado interno do servidor.

## Decisão de implementação sugerida

Criar um módulo pequeno que disponibilize somente a versão da aplicação ao
código que renderiza a página. A origem pode ser o `package.json` importado no
build ou uma constante gerada a partir dele, desde que não haja duplicação
manual do número da versão.

A rota `/sobre` deve consumir apenas a string exportada por esse módulo. Se a
leitura do `package.json` precisar ocorrer em runtime, ela deve permanecer em
código server-only e o `Dockerfile` deve continuar incluindo o arquivo na
imagem final.

## Fora do escopo

- Exibir a versão em todas as páginas ou diretamente no rodapé.
- Criar endpoint público de status, saúde ou diagnóstico.
- Expor versões de dependências ou informações do ambiente de execução.
- Criar painel administrativo, autenticação ou área restrita.
- Publicar changelog, histórico de releases ou lista de contribuidores.
- Alterar a identidade visual, a navegação principal ou o conteúdo das demais
  páginas institucionais.
- Automatizar o incremento da versão ou o processo de release.

## Critérios de aceite

- A URL `/sobre` responde com sucesso e apresenta o conteúdo institucional
  definido nesta issue.
- A versão exibida corresponde ao campo `version` do `package.json` usado no
  build ou na execução da aplicação.
- Alterar a versão no `package.json` e refazer o build atualiza a informação da
  página sem editar manualmente outro arquivo.
- O HTML ou os dados enviados ao navegador não contêm a lista de dependências,
  caminhos privados, variáveis de ambiente ou outros campos do `package.json`.
- O rodapé contém um link “Sobre”, mas não exibe diretamente o número da
  versão.
- A página contém link funcional para a Política de Privacidade e preserva o
  contato público já utilizado no site.
- A página possui título, descrição e canonical adequados.
- A navegação e o conteúdo são utilizáveis por teclado e em telas estreitas.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passam.

## Validação manual sugerida

Acessar `/sobre` diretamente e pelo link do rodapé. Conferir conteúdo, versão,
contato, Política de Privacidade, metadados e comportamento em larguras de
desktop e celular.

Comparar a versão exibida com o campo `version` do `package.json`. Em ambiente
de desenvolvimento, alterar temporariamente a versão, refazer o build e
confirmar que a página acompanha a alteração sem edição adicional; não incluir
essa alteração temporária no commit.

Inspecionar o HTML e os dados da página no navegador para confirmar que somente
a string da versão foi publicada e que não há dependências ou informações do
ambiente expostas.

## Documentos complementares

### Ler antes da implementação

- `AGENTS.md`, especialmente as regras de privacidade e exposição mínima de
  dados.
- `docs/redesign/functional-spec.md`, nas seções de layout, rodapé e metadados.
- `src/lib/Footer.svelte` e `src/lib/Meta.svelte`.
- `package.json` e `Dockerfile`, para definir a origem da versão e garantir sua
  disponibilidade no build ou runtime.

### Atualizar ao implementar

- `docs/redesign/functional-spec.md`, registrando a página institucional e o
  novo link do rodapé.
- Esta issue, com a solução adotada, validações executadas e estado final.

## Arquivos de código previstos

- `src/routes/sobre/+page.svelte`.
- `src/lib/Footer.svelte`.
- Um módulo compartilhado ou arquivo server-only para disponibilizar somente a
  versão, caso necessário.
- `docs/redesign/functional-spec.md`.
- `Dockerfile`, somente se a estratégia escolhida exigir ajuste na
  disponibilidade da versão em runtime.

Não se prevê alteração de schema, migração, banco, diretório de fotos,
autenticação ou regras de negócio.
