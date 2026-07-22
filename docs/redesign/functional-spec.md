# Especificação funcional

Esta especificação define o comportamento esperado da interface redesenhada.
Quando houver conflito com a apresentação atual, este documento prevalece para
o trabalho de redesign. Regras de banco e privacidade continuam sujeitas a
[privacy-data.md](./privacy-data.md).

## 1. Regras comuns a todas as telas

### 1.1 Cabeçalho e navegação

- Exibir a marca do site como link para `/`.
- Exibir os destinos Início, Ex-alunos, Fotos e Cadastre-se, nessa ordem.
- Destacar o destino correspondente à tela atual com cor e `aria-current`.
- A partir de `48rem`, manter os quatro destinos visíveis no cabeçalho e não
  exibir o botão “Menu”.
- Abaixo de `48rem`, exibir um botão “Menu” com rótulo textual. Ao acioná-lo,
  abrir os mesmos quatro destinos em um painel no fluxo normal da página.
- O menu fecha ao escolher um destino, ao pressionar `Escape` ou ao acionar
  novamente o botão.
- Ao retornar do layout largo para o estreito, o painel do menu começa fechado.
- A abertura do menu não pode deslocar o foco para um local imprevisível nem
  impedir navegação por teclado.
- Exibir um link “Ir para o conteúdo” como primeiro item focável.

### 1.2 Rodapé

- Exibir que o site é não oficial e voltado aos ex-alunos da ETFSP/CEFET-SP/IFSP.
- Manter um único contato com o responsável pelo site.
- Não repetir a navegação inteira nem incluir redes sociais inexistentes.

### 1.3 Carregamento, vazio e erro

- Toda listagem tem estado vazio escrito em linguagem simples e uma ação útil.
- Toda submissão desabilita apenas o botão de envio enquanto estiver em curso e
  troca seu texto, por exemplo, para “Enviando…”.
- Falha recuperável preserva os valores digitados e exibe um resumo no início
  do formulário, além do erro junto ao campo correspondente.
- Erros técnicos não exibem SQL, caminhos, stack trace ou valores privados.
- Uma página inexistente usa mensagem amigável, link para o início e busca de
  ex-aluno quando fizer sentido.

### 1.4 URLs e formulários

- Busca, ordenação, filtros e paginação usam parâmetros `GET`, permitindo
  atualizar a página, copiar a URL e usar voltar/avançar.
- Cadastro e upload usam `POST`.
- Recursos básicos continuam funcionais sem JavaScript. Autocomplete,
  pré-visualização e atualização sem recarregar são melhorias progressivas.

## 2. Início — `/`

### Objetivo

Explicar o site em poucas linhas e permitir que a pessoa encontre um colega ou
se cadastre imediatamente.

### Conteúdo e ordem

1. Título: “Encontre seus colegas da Federal de São Paulo”.
2. Texto curto explicando que o site reúne ex-alunos, professores e
   funcionários da ETFSP, CEFET-SP e IFSP.
3. Busca por nome com botão “Buscar ex-aluno”.
4. Links auxiliares “Ver todos os ex-alunos” e “Ver cadastros recentes”.
5. Duas ações secundárias: “Cadastre-se” e “Ver fotos”.
6. Uma nota curta informando que o site é não oficial.

Não exibir números de cadastros ou fotos sem que sejam calculados pelo servidor
em tempo real. Não criar seção histórica sem conteúdo disponível.

### Busca

- Campo com rótulo visível “Nome do ex-aluno”.
- Exemplo abaixo do campo: “Ex.: Maria da Silva”.
- O formulário envia para `/exalunos_lista?busca=...`.
- Entrada vazia leva à relação completa em ordem alfabética.
- Não executar autocomplete nesta tela na primeira versão.
- O link “Ver cadastros recentes” envia para `/exalunos_lista?recentes=1`.

### Critérios de aceite

- Em 320 px de largura não existe rolagem horizontal.
- Busca exige no máximo digitar o nome e acionar um botão.
- Os links para relação completa e cadastros recentes funcionam por teclado e
  sem JavaScript.
- A ação “Cadastre-se” aparece sem abrir o menu em celular.
- O conteúdo principal é compreensível sem imagens.

## 3. Entrada de ex-alunos — `/exalunos`

### Objetivo

Oferecer uma porta de entrada simples para busca e formas comuns de consulta.

### Conteúdo

- Título “Ex-alunos”.
- O mesmo formulário de busca da página inicial.
- Ações rápidas:
  - “Ver todos em ordem alfabética”;
  - “Ver cadastros recentes”.
- Controle “Ordenar por” com as opções:
  - nome;
  - curso e ano de ingresso;
  - curso e ano de saída;
  - ano de ingresso e curso;
  - ano de saída e curso.

Oito links de ordenação não devem ser apresentados como uma lista. Opções
equivalentes são agrupadas no controle “Ordenar por”.

### Critérios de aceite

- Busca e ações rápidas são acessíveis por teclado.
- Nenhuma sigla de curso é necessária para realizar uma busca por nome.
- Acionar uma ordenação leva a `/exalunos_lista` com um valor aceito pela
  allowlist do servidor.

## 4. Relação de ex-alunos — `/exalunos_lista`

### Objetivo

Encontrar uma pessoa e acessar seu perfil com leitura confortável em qualquer
tamanho de tela.

### Parâmetros

| Parâmetro  | Regra                                                     |
| ---------- | --------------------------------------------------------- |
| `busca`    | texto opcional, aparado; busca literal por trecho do nome |
| `curso`    | curso opcional da allowlist; ausente não restringe        |
| `ordem`    | valor da allowlist de ordenação; padrão `nome`            |
| `recentes` | `1` limita aos 30 dias anteriores; ausente não limita     |
| `pagina`   | inteiro positivo; padrão `1`                              |

Durante a migração, os parâmetros legados `ORDEM` e `Restricao=LAST` devem
continuar aceitos e ser normalizados no servidor. Links novos usam apenas os
nomes em minúsculas da tabela acima.

### Comportamento da busca

- `%` e `_` são tratados como caracteres literais, não curingas fornecidos pelo
  visitante.
- A consulta usa parâmetros SQL e filtra registros logicamente excluídos.
- O valor digitado permanece no campo após a busca.
- Uma busca vazia retorna todos os registros permitidos.
- A busca por nome permanece por trecho. Busca por apelido ou ano fica fora do
  escopo para não alterar resultados durante o redesign.

### Filtro de curso

- O seletor apresenta “Todos os cursos” e os cursos da allowlist compartilhada.
- Um curso válido restringe a consulta por igualdade; vazio, ausente, repetido
  ou inválido equivale a “Todos os cursos”.
- Busca, curso, ordenação e cadastros recentes podem ser combinados.
- A filtragem é feita no servidor com parâmetro SQL; ela não acrescenta colunas
  retornadas ao navegador.

### Resultados

- Mostrar a contagem: “1 ex-aluno encontrado” ou “N ex-alunos encontrados”.
- Mostrar até 30 registros por página.
- Cada item contém somente:
  - miniatura, quando existir;
  - nome;
  - apelido, quando existir;
  - curso;
  - período de ingresso e saída, quando conhecido;
  - link “Ver perfil”.
- A área do nome e da miniatura é clicável; não tornar o cartão inteiro um link
  se ele vier a conter outras ações.
- Não mostrar homepage ou e-mail na listagem.
- Em celular, usar lista de cartões em uma coluna. Em telas largas, usar a mesma
  lista em duas colunas; não usar tabela como layout.

### Paginação

- Exibir “Anterior” e “Próxima”, mais “Página X de Y”.
- Manter `busca`, `curso`, `ordem` e `recentes` ao trocar de página.
- Ocultar “Anterior” na primeira página e “Próxima” na última.
- Se `pagina` exceder a última página, redirecionar ou normalizar para a última
  página válida; não retornar uma tela vazia enganosa.

### Estado vazio

Texto: “Não encontramos ex-alunos com esses filtros.” Ações: “Limpar busca”,
“Ver todos os cursos”, quando houver curso selecionado, e “Cadastre-se”, sem
sugerir que a ausência autoriza criar cadastro em nome de outra pessoa.

### Critérios de aceite

- Nenhum resultado inclui campos internos ou e-mail.
- Ordenação e paginação funcionam com JavaScript desativado.
- O filtro de curso aceita somente a allowlist no servidor e preserva os demais
  filtros ao buscar, ordenar e paginar.
- A busca literal por `100%` ou `_` não amplia indevidamente a consulta SQL.
- Miniaturas mantêm proporção e reservam espaço para evitar saltos de layout.

## 5. Perfil público — `/detalhe_exaluno?id=`

### Objetivo

Apresentar de modo organizado apenas o que pode ser publicado sobre um
ex-aluno.

### Conteúdo e ordem

1. Link “Voltar para ex-alunos”.
2. Foto pessoal, nome e apelido.
3. Curso e período.
4. Bloco “Contato”, exibido somente se houver ao menos um contato publicável.
5. Bloco “Sobre”, com informações públicas e histórico fornecido para
   publicação.
6. Data de cadastro.
7. Ação “Ver fotos enviadas”, apenas quando a contagem for maior que zero.

Campos vazios não geram rótulos vazios. Homepage deve ser validada no servidor
ou convertida para uma URL `http`/`https` segura antes de chegar ao link. Links
externos abertos em nova aba, se usados, recebem `rel="noopener noreferrer"` e
aviso perceptível; a preferência desta fase é abrir na mesma aba.

### Identificador e erros

- `id` deve ser um inteiro positivo completo; valores como `12abc`, negativos,
  zero ou ausentes são inválidos.
- ID inválido retorna 400; registro inexistente ou excluído retorna 404.
- A consulta seleciona explicitamente somente as colunas públicas necessárias.
- O perfil nunca recebe um registro completo para ocultá-lo apenas no Svelte.

### Critérios de aceite

- A tela não contém rótulos legados sem utilidade, como ICQ vazio.
- Nenhum dado classificado como interno aparece no HTML serializado.
- A foto é responsiva, tem texto alternativo com o nome e não excede o espaço.
- A ausência de foto ou contato não deixa lacunas visuais.

## 6. Cadastro — `/novocadastro`

### Objetivo

Permitir cadastro aberto em uma única página e sem criar conta.

### Modelo de interação

- Não existe login, senha, confirmação de e-mail ou assistente de etapas.
- O formulário é uma página única com três grupos visuais: “Dados principais”,
  “Contato” e “Informações opcionais”.
- Os cinco campos obrigatórios aparecem antes dos opcionais.
- Campos obrigatórios recebem a indicação textual “obrigatório”; não depender
  apenas de asterisco ou cor.
- Remover o seletor “Operação: Cadastro/Atualização”. O servidor atual não
  autentica nem atualiza com segurança. Quem precisar corrigir um cadastro usa
  o contato do rodapé.
- Remover o botão “Apaga tudo”. Um clique acidental não deve apagar a página.
- Não coletar “Tipo de curso” enquanto esse valor não tiver persistência
  canônica no schema.
- Não coletar ICQ em novos cadastros; valores históricos permanecem no banco.

### Campos

| Grupo                 | Campo                      | Obrigatório | Regras de interface                                            |
| --------------------- | -------------------------- | ----------- | -------------------------------------------------------------- |
| Dados principais      | Nome completo              | sim         | 5–120 caracteres; aceitar acentos, hífen e apóstrofo           |
| Dados principais      | Apelido                    | não         | até 80 caracteres                                              |
| Dados principais      | Curso                      | sim         | selecionar uma opção da allowlist existente                    |
| Dados principais      | Ano em que entrou          | sim         | quatro dígitos                                                 |
| Dados principais      | Ano em que saiu            | sim         | quatro dígitos, igual ou posterior ao ingresso                 |
| Contato               | E-mail                     | sim         | um endereço válido; não aceitar uma lista em um único campo    |
| Contato               | Telefone                   | não         | até 30 caracteres; permitir formatação internacional           |
| Contato               | Homepage                   | não         | URL `http` ou `https`; prefixar `https://` quando omitido      |
| Informações opcionais | Endereço                   | não         | até 200 caracteres; uso interno                                |
| Informações opcionais | Cidade                     | não         | até 100 caracteres; uso interno                                |
| Informações opcionais | Estado                     | não         | até 50 caracteres; uso interno                                 |
| Informações opcionais | CEP                        | não         | até 20 caracteres; uso interno                                 |
| Informações opcionais | País                       | não         | até 80 caracteres; padrão “Brasil”; uso interno                |
| Informações opcionais | Como encontrou o site      | não         | lista existente mais “Outro”; uso interno                      |
| Informações opcionais | Detalhes de como encontrou | não         | até 160 caracteres; só habilitar quando aplicável; uso interno |
| Informações opcionais | Informações para o perfil  | não         | até 2.000 caracteres; conteúdo público                         |

Os limites de ano são 1909 até o ano civil atual. O servidor calcula o ano
atual; o navegador pode usar o mesmo limite apenas para feedback imediato.

### Privacidade no formulário

- Abaixo do e-mail, informar se ele será publicado conforme o contrato vigente.
- Campos internos exibem a frase “Uso interno — não aparece no perfil”.
- O campo de informações para o perfil exibe “Este texto aparecerá no seu
  perfil público”.
- Não solicitar CPF, prontuário, IP ou dados de navegador no formulário novo.
- Não incluir opções genéricas de privacidade que contradigam as regras fixas de
  cada campo.

### Validação e envio

- O servidor valida todos os campos, independentemente da validação nativa do
  navegador.
- Curso e opções de seleção usam allowlists.
- Espaços externos são removidos antes de validar e persistir.
- Turnstile fica imediatamente antes do botão de envio, com instrução curta.
- Erros retornam por campo, preservam dados não sensíveis digitados e renovam o
  Turnstile quando necessário.
- Não registrar o formulário nem o endereço de e-mail em logs.
- O banco deve concluir a escrita antes da resposta de sucesso.

### Sucesso

Exibir “Cadastro recebido” e os dados mínimos de contexto (curso e ano de
ingresso), mais duas ações: “Ver ex-alunos” e “Enviar uma foto”. Não insinuar
que uma conta foi criada.

### Critérios de aceite

- Uma pessoa conclui o cadastro sem navegar para outra página antes do envio.
- Tecla Enter não envia acidentalmente enquanto o Turnstile está incompleto.
- Erros não apagam os campos preenchidos.
- Validação não usa `alert()`.
- O HTML e os logs da resposta não contêm campos internos além do necessário
  para reexibir o próprio formulário após erro.

## 7. Galeria — `/lista_foto`

### Objetivo

Permitir ver fotos rapidamente e refinar o acervo sem uma grade rígida.

### Cabeçalho e filtros

- Título “Fotos”.
- Ação visível “Enviar uma foto”.
- Campo “Título ou descrição”.
- Seletor de curso com “Todos os cursos”.
- Seletor “Tipo de foto”: “Fotos gerais” e “Carômetro”. O padrão é “Fotos
  gerais”; não usar uma pergunta Sim/Não ambígua.
- Filtros avançados recolhíveis, mas acessíveis sem JavaScript:
  - ano da foto, de/até;
  - ano de formatura, de/até.
- Botões “Buscar” e, quando houver filtros, “Limpar filtros”.
- Parâmetros ficam na URL e os controles refletem seus valores.

### Regras dos filtros

- Título procura um trecho literal e escapa `%` e `_`.
- Curso aceita somente a allowlist; valor desconhecido é ignorado ou retorna
  erro de validação, mas nunca é interpolado em SQL.
- Anos aceitam vazio ou inteiro entre 1909 e o ano atual.
- Em um intervalo, “de” não pode ser maior que “até”.
- Todas as consultas filtram `Fotos.Excluido = 0`.
- Quando a URL contém `idExAluno`, validar inteiro positivo e filtrar também por
  ele, sem deixar de aplicar exclusão lógica.

### Grade

- Uma coluna em telas muito estreitas, duas a partir de aproximadamente 480 px,
  três a partir de 760 px e quatro quando houver espaço suficiente.
- Cada cartão contém miniatura, título, curso e apenas os anos disponíveis.
- Substituir a legenda baseada somente em cores por rótulos “Foto:” e
  “Formatura:”.
- Imagens usam proporção consistente com `object-fit: cover`, sem deformação.
- Carregamento tardio é permitido fora da primeira linha.
- Paginar em 24 fotos por página, preservando os filtros.

### Visualização ampliada

- Acionar uma miniatura abre a imagem ampliada em diálogo acessível quando
  JavaScript estiver disponível.
- O diálogo contém título, metadados, botão textual “Fechar” e fecha com
  `Escape`. O foco retorna à miniatura de origem.
- Sem JavaScript, o link abre o arquivo da foto na mesma aba.
- Não implementar comentários, curtidas, download em lote ou compartilhamento.

### Critérios de aceite

- Todos os filtros declarados afetam efetivamente a consulta.
- Uma galeria vazia explica o resultado e oferece “Limpar filtros”.
- Não há legenda que dependa somente da percepção de vermelho ou azul.
- Fotos excluídas logicamente nunca aparecem, inclusive por `idExAluno`.

## 8. Envio de foto — `/cadfoto`

### Objetivo

Enviar uma foto em uma única página, sem autenticação, deixando claro a qual
cadastro ela será associada.

### Identificação do ex-aluno

- Rótulo: “Em nome de qual ex-aluno a foto será enviada?”.
- Busca embutida por nome; começar a consultar após 3 caracteres e 300–500 ms
  sem digitação.
- Exibir no máximo 10 resultados contendo nome, apelido, curso e período para
  reduzir homônimos.
- A pessoa escolhe um resultado; a seleção vira um resumo visível com ação
  “Trocar”.
- Manter o ID em campo oculto apenas como transporte, nunca como prova de
  identidade.
- Sem JavaScript, manter o campo numérico de identificação, sujeito à validação
  no servidor. A ajuda visível da busca limita-se a “Digite pelo menos 3
  caracteres.” e não descreve esse mecanismo técnico.
- O servidor valida que o ID existe e que `Excluido = 0`; o nome enviado pelo
  navegador é ignorado e relido do banco.

Como não há autenticação, qualquer visitante pode associar uma foto a um
cadastro existente. O redesign não deve declarar que a identidade foi
verificada.

### Campos

| Campo                | Obrigatório | Regra                                                                         |
| -------------------- | ----------- | ----------------------------------------------------------------------------- |
| Ex-aluno selecionado | sim         | ID existente e não excluído                                                   |
| Arquivo              | sim         | PNG, GIF, JPEG, WebP ou AVIF; máximo 5 MB; conteúdo decodificável por `sharp` |
| Título               | sim         | 4–250 caracteres                                                              |
| Curso                | sim         | allowlist existente                                                           |
| Turma                | sim         | 1–15 caracteres                                                               |
| Ano de formatura     | não         | 1909 até ano atual                                                            |
| Ano da foto          | não         | 1909 até ano atual                                                            |
| Carômetro            | sim         | escolha “Sim” ou “Não”; padrão “Não”                                          |
| Foto pessoal         | sim         | escolha “Sim” ou “Não”; padrão “Não”                                          |

“Foto pessoal” deve ser explicada como a imagem que pode representar a pessoa
na relação e no perfil. “Carômetro” deve receber uma descrição curta, sem
presumir que todos conhecem o termo.

### Arquivo e pré-visualização

- O seletor aceita câmera ou biblioteca em celulares sem forçar apenas câmera.
- Após escolher, mostrar pré-visualização, nome e tamanho do arquivo.
- Permitir trocar o arquivo antes de enviar.
- A pré-visualização é conveniência; tipo, tamanho e decodificação são validados
  novamente no servidor.
- Não oferecer botão “Apaga tudo”.

### Envio e persistência

- O servidor gera nomes controlados, converte a imagem e cria miniatura.
- Escrita dos arquivos e do registro deve terminar antes do sucesso.
- Uma falha não pode deixar um registro que aponta para arquivo inexistente; a
  implementação deve compensar ou ordenar as operações de forma segura.
- Mensagens de erro não incluem caminho de arquivo, stack trace, conteúdo do
  formulário ou detalhes de `sharp`.
- Não registrar `FormData` completo.

### Sucesso

Exibir “Foto enviada” com ações “Ver fotos de [nome]” e “Enviar outra foto”. A
segunda ação mantém o ex-aluno selecionado somente se isso puder ser feito sem
tratar o ID como autenticação; caso contrário, volta à seleção.

### Critérios de aceite

- O fluxo normal exige selecionar o nome, escolher o arquivo, preencher os
  metadados e enviar na mesma página.
- Resultado de busca de nomes nunca inclui e-mail ou outros contatos.
- Arquivo inválido é rejeitado no servidor mesmo com `accept` contornado.
- A resposta de sucesso só ocorre depois de banco e arquivos terminarem.

## 9. Conteúdo e terminologia

- Usar português do Brasil com acentuação real em UTF-8, não entidades HTML em
  texto Svelte.
- Preferir “ex-aluno” e “ex-alunos”; manter ETFSP, CEFET-SP e IFSP apenas onde
  dão contexto.
- Botões descrevem ações: “Buscar ex-aluno”, “Enviar cadastro”, “Enviar foto”.
- Evitar caixa alta, múltiplas exclamações e instruções como “clique aqui”.
- Mensagens de sucesso confirmam o resultado; mensagens de erro dizem como
  corrigir o problema.
