# ISSUE-010 — Criar página de Política de Privacidade

**Estado:** Concluída

**Áreas:** Conteúdo institucional, cadastro e navegação

**Rotas afetadas:** nova rota `/politica-de-privacidade`, `/novocadastro` e
rodapé global

## Contexto

O site tem como finalidade reunir e publicar informações fornecidas por
ex-alunos para que antigos colegas possam encontrá-los e entrar em contato. O
formulário de cadastro já avisa que os dados informados serão publicados, mas
o site ainda não possui uma página permanente que explique, em conjunto, quais
dados são tratados, para que são usados e como solicitar sua exclusão.

Por se tratar de um diretório público, a política precisa destacar antes de
qualquer detalhe que os dados preenchidos no cadastro ficam disponíveis para
consulta por qualquer visitante. A página também deve informar que a exclusão
pode ser solicitada a qualquer momento pelo endereço `exclusao@etfsp.com`.

O texto abaixo é uma proposta editorial baseada no funcionamento conhecido do
site. Antes da publicação, o responsável pelo site deve validar sua exatidão e,
se necessário, submetê-lo a revisão jurídica.

## Modificação proposta

- Criar a página pública “Política de Privacidade” na rota
  `/politica-de-privacidade`.
- Adicionar no rodapé global um link textual para a nova página.
- Adicionar ao formulário de cadastro, próximo ao botão de envio, uma frase
  curta com link para a política e confirmação inequívoca da finalidade
  pública do cadastro.
- Usar o texto sugerido nesta issue como conteúdo inicial, após a validação dos
  pontos em aberto.
- Manter o conteúdo em português, com a identidade visual e os componentes já
  utilizados pelo site.

## Aviso resumido no cadastro

Apresentar antes do envio, sem caixa pré-marcada e sem substituir o aviso já
existente de que os dados serão publicados:

> Ao enviar o cadastro, você declara estar ciente de que os dados informados
> serão publicados para consulta por qualquer visitante, conforme a
> [Política de Privacidade].

“Política de Privacidade” deve ser um link para `/politica-de-privacidade`. O
texto não deve afirmar que a pessoa “leu e concordou” apenas por ter enviado o
formulário; ele registra ciência sobre a publicação, que é essencial à
finalidade do serviço.

## Texto sugerido para a página

### Política de Privacidade

**Última atualização: [data de publicação]**

O ETFSP.com é um site não oficial criado para reunir ex-alunos da ETFSP,
CEFET-SP e IFSP e facilitar o reencontro e o contato entre antigos colegas.
Esta política explica como os dados enviados ao site são utilizados.

#### 1. Dados do cadastro e publicação

O cadastro de ex-aluno pode incluir nome, apelido, curso, anos de ingresso e
saída, e-mail, WhatsApp, página pessoal, perfis em redes sociais e um texto para
o perfil.

A finalidade do cadastro é formar uma relação pública de ex-alunos. Por isso,
os dados que você informar nesse formulário serão publicados no site e poderão
ser consultados por qualquer visitante, sem necessidade de login. Informe
somente dados que você deseja tornar públicos.

Dados históricos que possuam uma regra específica de visibilidade somente são
publicados quando essa regra autorizar. Campos internos, técnicos ou não
destinados ao perfil público não devem ser exibidos pelo site.

#### 2. Fotos

As fotos enviadas e as informações usadas para identificá-las, como título,
curso, turma e ano, podem ser publicadas nas galerias e nos perfis do site.
Envie somente imagens que você esteja autorizado a compartilhar. Uma foto pode
conter outras pessoas; caso alguém queira solicitar a retirada de uma imagem,
deve usar o contato indicado na seção “Exclusão e contato”.

#### 3. Como os dados são utilizados

Os dados são utilizados para:

- incluir e apresentar o perfil na relação de ex-alunos;
- permitir a busca de ex-alunos por visitantes;
- facilitar o contato e o reencontro entre antigos colegas;
- organizar, apresentar e relacionar as fotos publicadas; e
- proteger o cadastro contra abuso e manter o funcionamento e a segurança do
  site.

O site não deve utilizar os dados para finalidades incompatíveis com essas sem
atualizar esta política e, quando necessário, solicitar uma nova autorização.

#### 4. Acesso por terceiros

Como a relação de ex-alunos e as fotos são públicas, as informações publicadas
podem ser vistas, copiadas ou compartilhadas por terceiros fora do controle do
ETFSP.com. Mecanismos de busca também podem indexar essas páginas e levar algum
tempo para atualizar ou remover suas próprias cópias depois de uma exclusão no
site.

Dados também podem ser processados pelos serviços técnicos necessários à
hospedagem, segurança e operação do site, limitados à prestação desses
serviços, ou quando houver obrigação legal.

#### 5. Exclusão e contato

Você pode solicitar a exclusão dos seus dados ou de uma foto a qualquer
momento. Envie o pedido para
[exclusao@etfsp.com](mailto:exclusao@etfsp.com), indicando informações
suficientes para localizar o cadastro ou a imagem.

Para proteger os dados contra pedidos indevidos, poderão ser solicitadas
informações adicionais razoáveis para confirmar a identidade da pessoa ou sua
relação com o conteúdo. Essa confirmação não será usada para acrescentar novos
dados ao perfil público.

Depois que um conteúdo for retirado das páginas públicas, registros técnicos
ou cópias de segurança poderão ser mantidos de forma restrita somente pelo
tempo necessário para segurança, recuperação do serviço, cumprimento de
obrigações legais ou preservação de direitos. Cópias mantidas por terceiros,
como mecanismos de busca, devem ser atualizadas por esses próprios serviços.

#### 6. Segurança e limites

São adotadas medidas técnicas e organizacionais razoáveis para proteger os
dados administrados pelo site. Ainda assim, nenhum serviço conectado à
internet pode garantir segurança absoluta. Evite informar no cadastro dados
sensíveis, documentos, senhas, informações financeiras ou qualquer conteúdo
que não queira tornar público.

#### 7. Alterações desta política

Esta política pode ser atualizada para refletir mudanças no site ou em seus
procedimentos. A versão vigente e a data da última atualização permanecerão
disponíveis nesta página.

#### 8. Responsável pelo site

O ETFSP.com é mantido por Renato Paschoalinoto. Pedidos de exclusão devem ser
enviados para [exclusao@etfsp.com](mailto:exclusao@etfsp.com).

## Requisitos de conteúdo e apresentação

- A página deve possuir título, descrição de metadados e data real da última
  atualização.
- O endereço de exclusão deve ser um link `mailto:` e também permanecer
  legível como texto.
- A política deve ser acessível sem autenticação e não deve depender de
  JavaScript para que seu conteúdo seja lido.
- Títulos devem seguir uma hierarquia sem saltos e os links devem ter foco
  visível.
- O texto deve usar largura de leitura confortável e se adaptar a telas a
  partir de 320 px e zoom de 200%, sem rolagem horizontal.
- Não carregar scripts, fontes, imagens ou rastreadores externos para compor a
  página.
- A página não deve listar campos internos específicos, detalhes de
  infraestrutura, caminhos, segredos ou controles que facilitem abuso.
- Mudanças futuras na coleta, publicação, compartilhamento ou exclusão de dados
  devem provocar a revisão desta página e da data de atualização.

## Pontos a validar antes da implementação

- Confirmar se “Renato Paschoalinoto” é a identificação pública suficiente do
  responsável ou se devem constar nome completo, endereço ou outro canal de
  contato.
- Confirmar se o site utiliza cookies, analytics, publicidade ou outros
  serviços de terceiros além dos componentes estritamente necessários à
  hospedagem e à proteção antiabuso. Se utilizar, descrevê-los de forma
  específica na política.
- Definir o prazo operacional esperado para responder e concluir pedidos de
  exclusão, antes de prometer um prazo no texto público.
- Confirmar como cópias de segurança e registros excluídos são retidos e
  eliminados, para que a seção de exclusão corresponda à prática real.
- Definir um procedimento proporcional de confirmação de identidade para
  impedir que terceiros removam cadastros ou fotos indevidamente.
- Confirmar se existe alguma forma de compartilhamento de dados não descrita
  na proposta.
- Realizar revisão editorial e, se considerada necessária pelo responsável,
  revisão jurídica antes da publicação.

## Fora do escopo

- Criar autenticação, área do usuário ou exclusão automática.
- Alterar quais campos são coletados ou publicados pelo cadastro atual.
- Modificar registros existentes ou executar exclusões em massa.
- Criar banner ou painel de preferências de cookies sem antes confirmar que
  há tecnologias que o exijam.
- Definir nesta issue políticas internas completas de retenção, backup,
  resposta a incidentes ou atendimento de solicitações.

## Critérios de aceite

- A rota `/politica-de-privacidade` responde com uma página pública em
  português e contém o texto aprovado pelo responsável.
- A página informa com destaque que os dados fornecidos no cadastro são
  públicos e podem ser consultados sem login.
- A página descreve os tipos de dados atualmente solicitados, a finalidade do
  diretório, o tratamento de fotos e a possibilidade de acesso por terceiros.
- A página informa que a exclusão pode ser solicitada a qualquer momento por
  `exclusao@etfsp.com`, com link de e-mail funcional.
- A política não promete prazo, eliminação imediata de backups nem remoção de
  cópias mantidas por terceiros sem que esses compromissos tenham sido
  validados.
- O formulário de cadastro apresenta o aviso resumido com link para a política
  antes do envio.
- O rodapé global contém link para a política em todas as páginas.
- A página possui data real de atualização, metadados adequados, estrutura de
  títulos acessível, foco visível e layout responsivo.
- Nenhum dado privado, segredo ou detalhe interno novo é exposto ao navegador,
  a logs ou a mensagens de erro.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passam.

## Validação manual sugerida

- Abrir a página diretamente e pelos links do rodapé e do cadastro.
- Conferir os links em navegação por teclado e o `mailto:` em dispositivo com
  cliente de e-mail configurado.
- Ler a página em tela estreita, com zoom de 200% e com leitor de tela.
- Desabilitar JavaScript e confirmar que todo o conteúdo continua disponível.
- Conferir título, descrição, hierarquia de títulos e data de atualização.
- Comparar os campos mencionados com o formulário vigente e revisar o texto
  sempre que o cadastro mudar.

## Documentos complementares

### Ler antes da implementação

- `AGENTS.md`, especialmente as regras de privacidade e segurança.
- `docs/redesign/privacy-data.md`, que classifica os dados públicos, internos e
  técnicos.
- `docs/redesign/functional-spec.md`, para os fluxos de cadastro, perfil e
  fotos.
- `docs/redesign/design-system.md`, para tipografia, links, largura de leitura
  e acessibilidade.

### Atualizar ao implementar

- `docs/redesign/functional-spec.md`, registrando a nova rota e seus pontos de
  entrada.
- `docs/redesign/privacy-data.md`, caso a validação da política revele diferença
  entre o texto público e o tratamento real.
- Esta issue, com o texto aprovado, a data de publicação, as decisões tomadas e
  o estado final.

## Arquivos de código previstos

- `src/routes/politica-de-privacidade/+page.svelte`.
- `src/lib/Footer.svelte`.
- `src/routes/novocadastro/Formulario.svelte`.
- `src/app.css`, somente se os estilos existentes não cobrirem texto
  institucional longo.

## Resultado da implementação

- Criada a rota pública `/politica-de-privacidade` com o texto aprovado, data
  de atualização, metadados e conteúdo sem dependência de JavaScript.
- Destacada a finalidade pública do cadastro e informado o canal
  `exclusao@etfsp.com` para pedidos de exclusão de dados ou fotos.
- Documentado o uso opcional do Umami identificado no layout, incluindo as
  configurações vigentes de respeito a “Não rastrear” e exclusão dos termos de
  busca.
- Adicionados links para a política no rodapé global e no aviso anterior ao
  envio do formulário de cadastro.
- Atualizadas a especificação funcional e a definição do rodapé no design
  system.
- `git diff --check` passou. Não foi possível executar `pnpm run check`,
  `pnpm run lint` ou `pnpm run build` neste ambiente porque o `pnpm` depende do
  Node do Windows e a interoperabilidade WSL falhou ao iniciar o executável.
