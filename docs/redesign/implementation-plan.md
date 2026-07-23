# Plano de implementação

O plano está dividido em entregas pequenas e publicáveis. Uma fase só começa
quando suas dependências estiverem concluídas. Dentro de uma fase, tarefas podem
ser separadas em commits, mas a fase não deve ser publicada parcialmente se isso
deixar uma tela com regra de privacidade ou operação incompleta.

## Visão geral

| Fase | Entrega                                           | Depende de |
| ---- | ------------------------------------------------- | ---------- |
| 0    | Base, inventário e contratos                      | nenhuma    |
| 1    | Tokens, componentes essenciais e shell responsivo | 0          |
| 2    | Início e entrada de ex-alunos                     | 1          |
| 3    | Busca e relação de ex-alunos                      | 1, 2       |
| 4    | Perfil público e contrato de privacidade          | 1, 3       |
| 5    | Cadastro simples em uma página                    | 1, 4       |
| 6    | Galeria e filtros                                 | 1, 3       |
| 7    | Envio e entrega segura de fotos                   | 1, 4, 6    |
| 8    | Consolidação, acessibilidade e limpeza            | 2–7        |

As fases 5 e 6 podem ser executadas em qualquer ordem depois de suas
dependências. A fase 7 vem após a galeria porque seu sucesso aponta para ela.

## Orçamento de interação

O número de cliques não inclui digitação nem a navegação inicial até a rota.

| Tarefa                                | Meta do fluxo normal                                  |
| ------------------------------------- | ----------------------------------------------------- |
| buscar da home                        | 1 clique após digitar                                 |
| abrir um perfil a partir do resultado | mais 1 clique                                         |
| ver todos os ex-alunos                | 1 clique                                              |
| enviar cadastro                       | 1 página e 1 clique de envio                          |
| filtrar fotos                         | 1 clique de busca                                     |
| ampliar uma foto                      | 1 clique                                              |
| enviar foto                           | escolher nome, arquivo e enviar, sem trocar de página |

Não criar telas de confirmação intermediárias. Confirmação é reservada a ações
destrutivas, que não existem no escopo público atual.

## Fase 0 — Base, inventário e contratos

### RED-001 — Registrar o estado inicial

**Objetivo:** permitir comparação visual e funcional durante a migração.

**Tarefas:**

- registrar manualmente os fluxos existentes em desktop e em 320/390 px:
  início, busca, perfil, cadastro, galeria e upload;
- anotar registros de teste sem copiar dados pessoais para documentação ou
  fixtures versionadas;
- registrar comportamento com resultado vazio, ID inválido e erro de formulário;
- verificar quais assets de `static/images` aparecem efetivamente nas rotas;
- confirmar que o banco e `FOTOS_DIR` usados na validação são cópias ou dados de
  desenvolvimento, nunca recriados por `scripts/make_db.py`.

**Saída:** checklist local ou descrição no PR da fase; não versionar capturas com
dados reais.

### RED-002 — Fixar modelos e allowlists do domínio

**Arquivos previstos:** novo módulo server-only ou módulos por rota; tipos
públicos podem ficar em `src/lib` somente se não importarem servidor.

**Tarefas:**

- definir uma única allowlist para os cursos já aceitos: PRD, TEL, ELO, ELE,
  EDI, MEC e INF;
- definir mapeamento entre os valores legados de ordenação e os novos valores de
  URL;
- definir os modelos públicos mínimos descritos em `privacy-data.md`;
- remover `any` das novas interfaces; não é obrigatório corrigir todo o legado
  nesta tarefa;
- confirmar que “Tipo de curso” não é persistido pelo schema canônico e,
  portanto, não entra na nova interface.

**Aceite:** componentes públicos não precisam receber linhas completas do
banco; ordenações e cursos têm tipos e allowlists explícitos.

### Validação da fase 0

- executar `pnpm run check` para garantir uma base conhecida;
- executar `pnpm run lint` e registrar problemas já existentes, sem formatar o
  repositório inteiro;
- executar `pnpm run build` com as variáveis necessárias ou documentar de forma
  precisa se o ambiente não permitir.

## Fase 1 — Fundação visual e shell responsivo

### RED-101 — Introduzir tokens e reset controlado

**Arquivos:** `src/app.css`.

**Tarefas:**

- adicionar os tokens de `design-system.md`;
- aplicar `box-sizing: border-box`, tipografia, fundo e estilos base sem remover
  ainda regras legadas exigidas pelas páginas não migradas;
- estilizar foco visível, links, títulos, imagens e controles nativos;
- adicionar utilitários mínimos de contêiner, leitura e espaçamento; evitar uma
  coleção genérica extensa;
- incluir regra de redução de movimento;
- criar contenção temporária de overflow para telas legadas ainda não migradas.

**Aceite:** nenhuma rota perde conteúdo; 320 px não corta o cabeçalho; controles
têm foco visível.

### RED-102 — Criar os componentes essenciais

**Arquivos previstos:** `src/lib/components/`.

**Tarefas:**

- criar `PageContainer`, `PageHeader`, `Button`, campos base, `FormSection`,
  `ErrorSummary`, `Notice`, `EmptyState` e `Pagination` conforme o design system;
- fornecer tipos explícitos e slots/snippets limitados às necessidades reais;
- não criar `AlumniCard`, `PhotoCard` ou diálogo antes das respectivas fases;
- validar estrutura semântica e estados de foco em uma página real de teste ou
  já no shell; não manter página de demonstração em produção.

### RED-103 — Substituir cabeçalho, navegação e rodapé

**Arquivos:** `src/routes/+layout.svelte`, `src/lib/Header.svelte`,
`src/lib/Footer.svelte`; renomear componentes somente se todos os imports forem
atualizados na mesma tarefa.

**Tarefas:**

- adicionar link para pular ao conteúdo e elemento `main` com ID estável;
- fazer o cabeçalho derivar a rota ativa;
- corrigir links relativos para links iniciados por `/`;
- implementar menu móvel com botão textual, `aria-expanded`, fechamento por
  `Escape` e foco previsível;
- manter a navegação expandida e o botão “Menu” oculto a partir de `48rem`,
  retornando o menu móvel ao estado fechado ao reduzir a largura;
- atualizar o rodapé e remover créditos visuais obsoletos quando não forem mais
  aplicáveis;
- declarar dimensões da marca e fornecer alternativa textual.

**Aceite:** os quatro destinos continuam acessíveis e ficam visíveis sem clique
a partir de `48rem`; navegação funciona por teclado; não há largura fixa de
760 px ou `position: absolute` no shell.

### Validação da fase 1

- rotas principais em 320, 390, 768, 1024 e 1440 px;
- zoom de 200%; teclado no menu e no link de salto;
- `pnpm run check`, `pnpm run lint` e `pnpm run build`.

## Fase 2 — Início e entrada de ex-alunos

### RED-201 — Redesenhar a página inicial

**Arquivo:** `src/routes/+page.svelte`; ajustar `+page.server.ts` somente se um
dado real for necessário.

**Tarefas:**

- implementar a hierarquia descrita na seção 2 da especificação funcional;
- criar/reutilizar `SearchForm` com rótulo visível;
- disponibilizar os atalhos para relação completa e cadastros recentes com o
  parâmetro `recentes=1`;
- manter o texto sobre ETFSP, CEFET-SP e IFSP em versão curta e UTF-8;
- destacar “Cadastre-se” e “Ver fotos” sem adicionar métricas inventadas;
- remover floats, estilos inline e entidades HTML desnecessárias;
- não criar a seção “Memória da ETFSP”.

**Aceite:** busca envia o parâmetro correto; principais destinos cabem sem
rolagem horizontal e fazem sentido sem imagens.

### RED-202 — Simplificar `/exalunos`

**Arquivos:** `src/routes/exalunos/+page.svelte` e, se necessário,
`+page.server.ts`.

**Tarefas:**

- reutilizar `SearchForm`;
- substituir a lista de oito links por ações rápidas e seletor de ordenação;
- gerar apenas parâmetros aceitos pelo contrato da rota de resultados;
- explicar a busca em uma única frase e remover exclamações promocionais.

**Aceite:** todas as ordenações previstas apontam para URL válida; a página não
usa listas em fonte reduzida nem controles menores que 44 px.

### Validação da fase 2

- busca vazia, nome com acento, `%` e `_`;
- navegação Início → cadastro/fotos/resultados;
- `pnpm run check`, `pnpm run lint` e `pnpm run build`.

## Fase 3 — Busca e relação de ex-alunos

### RED-301 — Normalizar parâmetros e paginação no servidor

**Arquivo:** `src/routes/exalunos_lista/+page.server.ts`.

**Tarefas:**

- validar e normalizar `busca`, `curso`, `ordem`, `recentes` e `pagina`;
- filtrar curso somente por valor da allowlist, com comparação SQL
  parametrizada;
- manter compatibilidade com `ORDEM` e `Restricao=LAST`;
- manter allowlist de ordenação, sem interpolar entrada livre;
- escapar curingas de `LIKE` e remover logs da busca;
- aplicar `LIMIT 300` e `OFFSET`, mais uma consulta `COUNT` com os mesmos filtros;
- selecionar apenas colunas do modelo `AlumniListItem`;
- garantir `Excluido = 0` diretamente ou por view cujo contrato seja explícito;
- retornar contagem, página atual, total de páginas e filtros normalizados.

**Aceite:** página inválida é normalizada; URL legada continua funcionando;
consultas são parametrizadas e não retornam homepage/e-mail.

### RED-302 — Criar `AlumniCard` e tela de resultados

**Arquivos:** novo componente e `src/routes/exalunos_lista/+page.svelte`.

**Tarefas:**

- substituir tabela por lista responsiva de cartões;
- manter formulário, filtro de curso e ordenação preenchidos com valores vindos
  do servidor, sem depender de `onMount` para ler a URL;
- implementar singular/plural, estado vazio e paginação;
- construir links absolutos de rota e URLs de imagem seguras;
- reservar espaço da miniatura e omiti-la de modo limpo quando ausente;
- remover a função de homepage, pois homepage não pertence à listagem.

**Aceite:** itens contêm apenas os campos especificados; voltar do perfil
preserva a URL e o contexto via histórico do navegador.

### Validação da fase 3

- zero, um, 300 e mais de 300 resultados;
- primeira, intermediária, última e página acima do limite;
- todas as ordenações, cursos válidos e modo recentes, inclusive em combinação;
- busca contendo `%`, `_`, acentos e espaços externos;
- teclado, leitor de tela na contagem e 320–1440 px;
- `pnpm run check`, `pnpm run lint` e `pnpm run build`.

## Fase 4 — Perfil público e privacidade

### RED-401 — Restringir o `load` ao contrato público

**Arquivo:** `src/routes/detalhe_exaluno/+page.server.ts`; a view
`qryExAlunos` só deve ser modificada se estritamente necessário.

**Tarefas:**

- validar `id` como inteiro positivo completo;
- retornar 400 para formato inválido e 404 para ausente/excluído;
- selecionar explicitamente os campos do perfil público;
- aplicar `OcultarEmail` e `PublicaTelefone` antes de formar o retorno;
- não retornar `ComoEncontrou` ou `ComoEncontrouExtra`;
- contar somente fotos `Excluido = 0` e obter foto pessoal não excluída;
- normalizar homepage para `http`/`https` no servidor;
- remover logs de dados e tipos `Partial` excessivamente permissivos.

**Aceite:** inspecionar o payload serializado confirma ausência de campos
internos; registro excluído não pode ser consultado pelo ID.

### RED-402 — Redesenhar a apresentação do perfil

**Arquivo:** `src/routes/detalhe_exaluno/+page.svelte`.

**Tarefas:**

- implementar ordem e blocos da seção 5 da especificação;
- ocultar blocos e rótulos vazios;
- usar listas semânticas de descrição quando adequadas;
- renderizar comentários como texto, preservando quebras de linha sem HTML
  fornecido pelo usuário;
- oferecer retorno para ex-alunos e link de fotos somente quando aplicável;
- corrigir URLs relativas de imagens.

**Aceite:** a tela funciona com qualquer combinação de campos opcionais e não
vaza informação condicionada.

### RED-403 — Remediar logs de dados pessoais nas rotas tocadas

**Arquivos:** rotas de ex-alunos e módulos de servidor relacionados.

**Tarefas:** remover logs de valores de busca quando desnecessários e qualquer
log de registros ou dados pessoais. Manter, se necessário, somente evento
genérico e código de correlação.

### Validação da fase 4

- IDs ausente, zero, negativo, decimal, `12abc`, existente e excluído;
- registros com e sem foto, contato e comentários;
- combinações das flags de e-mail e telefone;
- inspeção de HTML/payload e logs;
- `pnpm run check`, `pnpm run lint` e `pnpm run build`.

## Fase 5 — Cadastro simples em uma página

### RED-501 — Reestruturar validação e action

**Arquivo:** `src/routes/novocadastro/+page.server.ts` e tipos auxiliares.

**Tarefas:**

- definir tipo de entrada e estrutura de erros por campo;
- extrair, aparar e validar todos os valores no servidor conforme a tabela da
  seção 6;
- validar curso e “Como encontrou” por allowlist;
- validar relação entre os anos e usar o ano civil atual;
- normalizar homepage e e-mail;
- remover “Operacao” e “TipoCurso” da entrada nova;
- não coletar, validar nem inserir ICQ em novos cadastros, preservando a coluna
  e valores históricos;
- não aceitar vários e-mails em um campo;
- manter os padrões `OcultarEmail = 0` e `PublicaTelefone = 0`, informados na
  interface;
- parametrizar o `INSERT`, aguardar a escrita e tratar erro sem expor detalhes;
- remover logs do formulário e dados pessoais;
- preservar campos permitidos no retorno de erro e nunca retornar o token do
  Turnstile;
- definir resposta sem cache compartilhado.

**Aceite:** o `INSERT` só ocorre depois de validação e Turnstile; erro do banco
não resulta em sucesso; logs não contêm valores pessoais.

### RED-502 — Redesenhar o formulário

**Arquivos:** `src/routes/novocadastro/+page.svelte`, `Formulario.svelte` e
`Sucesso.svelte`.

**Tarefas:**

- substituir tabela por `FormSection` e componentes de campo;
- manter uma única página e colocar os cinco campos obrigatórios primeiro;
- usar tipos corretos, `autocomplete`, `inputmode` e descrições de privacidade;
- remover operação de atualização, tipo de curso, reset e imagem decorativa;
- substituir validação por `alert()` por validação nativa complementar e erros
  retornados pela action;
- integrar Turnstile imediatamente antes do envio;
- implementar estado ocupado sem impedir correção após falha;
- focar o resumo de erros e ligar itens aos campos;
- criar confirmação simples com as duas ações previstas.

**Aceite:** cadastro completo em uma página, valores preservados após erro e
nenhuma informação pública/privada descrita de forma ambígua.

### RED-503 — Tratar pedido de atualização sem autenticação

**Tarefa:** incluir perto do formulário um texto discreto: “Já está cadastrado e
precisa corrigir seus dados? Entre em contato com o responsável pelo site.” O
link usa o mesmo contato do rodapé. Não implementar edição por ID, campo oculto
ou e-mail como suposta verificação.

### Validação da fase 5

- envio válido e cada obrigatório ausente;
- limites de caracteres, e-mail e homepage inválidos;
- anos mínimo, atual, invertidos e fora do intervalo;
- Turnstile ausente, inválido e válido;
- falha simulada de banco sem mensagem interna;
- teclado, zoom de 200%, 320–1440 px e reexibição de campos;
- `pnpm run check`, `pnpm run lint` e `pnpm run build`.

## Fase 6 — Galeria e filtros

### RED-601 — Implementar contrato GET e filtros reais

**Arquivo:** `src/routes/lista_foto/+page.server.ts`.

**Tarefas:**

- trocar a filtragem principal para parâmetros GET; durante a transição, a
  action POST pode redirecionar para uma URL GET equivalente;
- validar título, curso, tipo, intervalos, `idExAluno` e página;
- aplicar efetivamente título, ano da foto e ano de formatura, hoje coletados
  mas não usados na consulta;
- escapar curingas do título;
- aplicar `Excluido = 0` em todos os caminhos, inclusive `idExAluno`;
- parametrizar filtros e paginar em 100 itens;
- retornar modelo `PublicPhoto`, contagem e filtros normalizados;
- incluir `TurmaFoto` se ela for exibida no cartão;
- definir ordenação estável, preferencialmente `idFoto DESC`.

**Aceite:** cada controle altera o resultado esperado; consulta por ex-aluno não
mostra fotos excluídas; filtros podem ser copiados pela URL.

### RED-602 — Criar grade, filtros e paginação

**Arquivos:** `src/routes/lista_foto/+page.svelte` e novos `PhotoCard`,
`FilterPanel` e componentes auxiliares.

**Tarefas:**

- substituir as tabelas por formulário semântico e CSS Grid;
- refletir filtros da URL, indicar quantidade e criar estado vazio;
- substituir significado por vermelho/azul por rótulos textuais;
- implementar `details/summary` para intervalos avançados;
- implementar paginação, cartões compactos, dimensões de imagem sem upscaling e
  lazy loading adequado;
- manter link básico para a imagem antes de adicionar diálogo.

### RED-603 — Adicionar visualização ampliada progressiva

**Tarefas:**

- criar `PhotoDialog` conforme o design system;
- manter o `href` funcional sem JavaScript;
- gerenciar fechamento, foco, `Escape`, título e metadados;
- carregar imagem maior somente quando solicitada, quando viável.

**Aceite:** fechar retorna o foco à foto acionada; leitor de tela identifica o
diálogo e seu título.

### Validação da fase 6

- nenhum filtro, cada filtro isolado e combinações;
- intervalos vazios, invertidos e inválidos;
- zero, um, 100 e mais de 100 resultados;
- fotos gerais, carômetro e fotos por ex-aluno;
- JavaScript ativado/desativado, teclado e 320–1440 px;
- `pnpm run check`, `pnpm run lint` e `pnpm run build`.

## Fase 7 — Envio e entrega segura de fotos

### RED-701 — Restringir busca de nome para upload

**Arquivo:** `src/routes/cadfoto/search_id/+server.ts`.

**Tarefas:**

- validar e aparar busca; exigir 3 caracteres;
- escapar `%` e `_` e parametrizar SQL;
- limitar a 10 resultados;
- retornar apenas ID, nome, apelido, curso e período;
- filtrar `Excluido = 0` e remover logs do termo;
- responder a entrada inválida com resultado vazio ou erro público consistente.

### RED-702 — Tornar o processamento e persistência atômicos do ponto de vista da resposta

**Arquivo:** `src/routes/cadfoto/+page.server.ts` e possíveis auxiliares
server-only.

**Tarefas:**

- validar o ID consultando um ex-aluno não excluído e ignorar o nome enviado;
- validar todos os metadados e allowlists conforme a seção 8;
- validar anos opcionais no servidor e persistir `AnoFoto` e `AnoFormatura` nas
  respectivas colunas;
- manter limite de 5 MB e formatos aceitos;
- decodificar com `sharp`, impor limites razoáveis de dimensões/pixels e gerar
  nomes independentes do nome original;
- gerar original convertido e miniatura sem mutação compartilhada da instância;
- aguardar gravações de arquivos e banco antes do sucesso;
- planejar compensação: se o banco falhar, remover arquivos criados; se arquivo
  falhar, não deixar registro público válido;
- evitar colisão de nomes sem depender de `max(idFoto) + 1` concorrente;
- remover gravação duplicada pelo nome original se ela não tiver consumidor
  comprovado;
- remover logs de `FormData`, caminhos e dados pessoais;
- mapear falhas para mensagens públicas genéricas;
- manter exclusão lógica e metadados necessários para auditoria.

Se a solução de nomes exigir alteração de schema, separar migração explícita,
atualizar `scripts/initial.sql` e preservar compatibilidade com os arquivos
existentes. Não alterar schema silenciosamente nesta tarefa.

**Aceite:** sucesso ocorre apenas com banco e arquivos consistentes; duas
submissões concorrentes não escolhem o mesmo nome.

### RED-703 — Redesenhar o formulário de foto

**Arquivos:** `src/routes/cadfoto/+page.svelte`, `Formulario.svelte` e
`Sucesso.svelte`.

**Tarefas:**

- substituir overlay absoluto e tabelas por busca embutida acessível;
- implementar debounce, resultados limitados, seleção e ação “Trocar”;
- oferecer fallback sem JavaScript descrito na especificação, sem inserir essa
  explicação técnica no texto de ajuda destinado ao usuário;
- usar componentes de campo, explicações de carômetro/foto pessoal e uma única
  ação principal;
- criar pré-visualização local e permitir troca de arquivo;
- indicar 5 MB e formatos antes da seleção;
- preservar metadados em erro quando seguro e exigir nova escolha de arquivo
  quando o navegador não permitir preservá-lo;
- reexibir os anos e seus erros junto aos campos, sem tratar ano inválido como
  valor vazio;
- implementar estado ocupado e tela de sucesso com links corretos.

### RED-704 — Restringir entrega de arquivos

**Arquivo:** `src/routes/Fotos/[file]/+server.ts`.

**Tarefas:**

- rejeitar nome vazio, separadores, `..`, caminho absoluto e resolução fora de
  `FOTOS_DIR`;
- consultar o nome solicitado em um registro de foto `Excluido = 0`, aceitando
  somente imagem convertida ou miniatura armazenada;
- retornar 404 tanto para arquivo ausente quanto para registro não publicável;
- usar `Content-Type` controlado e cabeçalhos de segurança/cache apropriados;
- nunca revelar o caminho real em erro ou log público.

**Aceite:** conhecer o nome de um arquivo excluído ou arbitrário não permite
obtê-lo pela rota.

### Validação da fase 7

- busca curta, longa, com curingas, homônimos e registro excluído;
- cada formato aceito, MIME falso, imagem corrompida, arquivo acima de 5 MB e
  dimensões extremas;
- ID ausente, adulterado, inexistente e excluído;
- falha simulada de arquivo e banco; conferir ausência de sucesso inconsistente;
- tentativas de path traversal e acesso a foto excluída;
- fluxo com e sem JavaScript, teclado e celular;
- `pnpm run check`, `pnpm run lint` e `pnpm run build`.

## Fase 8 — Consolidação

### RED-801 — Auditoria de consistência visual e conteúdo

- conferir uso dos tokens e remover estilos inline restantes das rotas migradas;
- padronizar títulos, botões, singular/plural e mensagens em português;
- conferir uma única ação principal por tela;
- conferir que não foi adicionada seção de memória, login ou área do usuário;
- confirmar orçamentos de interação da tabela inicial.

### RED-802 — Auditoria de acessibilidade

- navegar todas as rotas somente com teclado;
- testar link de salto, menu, erros, `details`, paginação e diálogo;
- testar zoom de 200%, reflow em 320 px e preferência por movimento reduzido;
- executar ferramenta automática disponível e revisar manualmente os resultados;
- testar ao menos um leitor de tela disponível;
- corrigir contraste, nomes acessíveis, hierarquia de títulos e foco.

### RED-803 — Auditoria de privacidade e segurança

- inspecionar HTML, payloads JSON/action e logs dos seis fluxos;
- procurar `SELECT *`, SQL interpolado, consultas sem `Excluido = 0`, logs de
  formulário e acesso ao filesystem por caminho fornecido pelo usuário;
- confirmar o contrato de e-mail/telefone e campos internos;
- confirmar que ID não é tratado como autenticação em textos ou lógica.

### RED-804 — Remover legado não utilizado

- usar `rg` para comprovar que seletores, componentes e assets não têm
  consumidores;
- remover CSS legado somente após todas as telas dependentes terem migrado;
- remover GIFs e imagens decorativas sem uso em commit separado e revisável;
- não remover fotos, banco, `FOTOS_DIR` ou assets cuja origem seja incerta;
- não executar formatação global se houver mudanças alheias no worktree.

### RED-805 — Validação final

- repetir matriz de estado inicial e comparar cada fluxo;
- validar em navegador baseado em Chromium e, se disponível, Firefox/Safari;
- executar `pnpm run check`;
- executar `pnpm run lint`;
- executar `pnpm run build`;
- registrar qualquer validação manual e limitação no handoff.

## Definição de pronto por fase

Uma fase está concluída quando:

- todos os critérios de aceite das tarefas e da especificação funcional passam;
- não há regressão conhecida nos fluxos ainda não redesenhados;
- não há novo dado privado em HTML, JSON, logs ou mensagens;
- servidor valida toda entrada nova ou alterada;
- consultas permanecem parametrizadas e respeitam exclusão lógica;
- operações assíncronas afetadas terminam antes do sucesso;
- check, lint e build passam, ou a limitação externa está documentada com
  evidência;
- a entrega pode ser revertida isoladamente sem exigir reversão das fases
  anteriores.

## Estratégia de commits sugerida

- Um commit para comportamento de servidor e seus tipos.
- Um commit para componentes/tela que consomem esse comportamento.
- Um commit separado para remoção de legado, quando houver.

Não misturar schema, redesign de várias rotas e limpeza global no mesmo commit.
Cada mensagem deve citar os IDs `RED-xxx` cobertos.
