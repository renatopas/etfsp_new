# Redesign do etfsp.com

Este diretório é a fonte de verdade para a modernização da interface do
`etfsp.com`. O trabalho deve ser executado em partes, sem reescrever o sistema
inteiro e sem interromper os fluxos atuais.

## Objetivo

Oferecer uma interface responsiva, legível e simples para ex-alunos que podem
ter pouca familiaridade com serviços digitais. As tarefas mais importantes
devem exigir poucos cliques, usar linguagem direta e funcionar bem em celular,
tablet e computador.

## Decisões já tomadas

- Manter SvelteKit 2, Svelte 5, TypeScript e a infraestrutura atual.
- Não implementar autenticação, conta, senha, login ou recuperação de acesso.
- Manter o cadastro aberto e protegido pelo Turnstile.
- Usar uma página única para cadastro, dividida visualmente em seções; não usar
  um assistente de várias etapas.
- Manter somente quatro destinos principais: Início, Ex-alunos, Fotos e
  Cadastre-se.
- Não criar a seção “Memória da ETFSP” nesta fase.
- Não alterar o schema nem migrar dados apenas para realizar o redesign.
- Preservar a identidade e o conteúdo histórico relevante, mas remover técnicas
  de layout legado, como largura fixa, tabelas de apresentação e posicionamento
  absoluto.
- Aplicar privacidade no servidor. Campos internos nunca são enviados ao
  navegador; campos condicionais obedecem às flags existentes.
- Não introduzir uma biblioteca visual pesada. Os componentes serão Svelte e os
  tokens ficarão em CSS próprio.

## Princípios de experiência

1. **Uma ação principal por tela.** A busca é a ação principal nas telas de
   consulta; enviar é a ação principal nos formulários.
2. **Poucos passos.** Buscar um ex-aluno deve exigir uma digitação e um clique.
   Cadastrar-se deve ocorrer em uma única página. Enviar foto deve usar uma única
   página após a escolha do nome.
3. **Sem depender de conhecimento técnico.** Usar “Ano em que entrou” no lugar
   de termos de sistema e explicar siglas quando necessário.
4. **Controles fáceis de tocar.** Alvos interativos com pelo menos 44 × 44 px,
   textos com pelo menos 16 px e espaçamento confortável.
5. **Erros próximos do problema.** Não usar `alert()` como validação principal;
   informar o erro junto ao campo e levar o foco ao resumo de erros.
6. **Melhoria progressiva.** Busca, cadastro e filtros devem funcionar com o
   envio HTML normal. JavaScript pode melhorar a experiência, mas não ser a
   única forma de concluir a tarefa.
7. **Sem surpresas.** Não abrir nova aba por padrão, não apagar formulários sem
   confirmação e não esconder ações essenciais em gestos ou hover.

## Arquitetura de informação

| Destino     | Rota atual                      | Finalidade                                        |
| ----------- | ------------------------------- | ------------------------------------------------- |
| Início      | `/`                             | Apresentar o site e iniciar rapidamente uma busca |
| Ex-alunos   | `/exalunos` e `/exalunos_lista` | Buscar, ordenar e consultar ex-alunos             |
| Perfil      | `/exalunos/{id}`                | Exibir somente os dados públicos de uma pessoa    |
| Fotos       | `/lista_foto`                   | Consultar e filtrar a galeria                     |
| Enviar foto | `/cadfoto`                      | Identificar o remetente e enviar uma imagem       |
| Cadastre-se | `/novocadastro`                 | Incluir um ex-aluno sem criar uma conta           |

A URL legada `/detalhe_exaluno?id={id}` é mantida por redirecionamento
permanente para `/exalunos/{id}`, preservando favoritos e links externos sem
criar uma segunda versão indexável do perfil.

## Ordem de leitura

1. [Especificação funcional](./functional-spec.md): comportamento completo de
   cada tela e critérios de aceite.
2. [Design system](./design-system.md): tokens, componentes, responsividade,
   conteúdo e acessibilidade.
3. [Privacidade e dados](./privacy-data.md): contrato de publicação e regras de
   servidor.
4. [Plano de implementação](./implementation-plan.md): fases, tarefas,
   dependências e validação.

## Escopo não contemplado

- autenticação ou área privada;
- edição automática de um cadastro existente;
- painel de administração ou moderação;
- seção histórica ou “Memória da ETFSP”;
- alteração ampla do banco de dados;
- aplicativo nativo para Android ou iOS;
- rede social, mensagens privadas, comentários em fotos ou notificações;
- troca do SvelteKit por outro framework.

Esses itens só devem entrar em um planejamento futuro mediante decisão
explícita de produto.

## Como alterar este planejamento

Uma decisão que modifique navegação, publicação de dados, campos obrigatórios ou
schema deve ser registrada primeiro nestes documentos. Cada tarefa de código
deve apontar para uma fase do plano e para os critérios de aceite da tela
afetada.
