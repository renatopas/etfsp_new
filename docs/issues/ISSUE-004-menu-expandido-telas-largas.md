# ISSUE-004 — Navegação sempre expandida em telas largas

**Estado:** Concluída
**Área:** Cabeçalho e navegação principal  
**Rotas afetadas:** todas as páginas do site

## Contexto

O cabeçalho possui os quatro destinos principais — “Início”, “Ex-alunos”,
“Fotos” e “Cadastre-se” — mas, com JavaScript ativo, pode exigir que a pessoa
acione o botão “Menu” mesmo quando o navegador dispõe de espaço lateral para
mostrar todas as opções. Em notebooks e desktops, esse clique adicional não é
necessário.

O design responsivo já prevê navegação expandida em telas largas e menu
recolhível em telas estreitas. A implementação deve tornar essa distinção
efetiva e consistente.

## Modificação proposta

Quando houver largura suficiente para apresentar a marca e os quatro destinos
principais sem sobreposição ou corte, manter a navegação sempre visível e não
exibir o botão “Menu”. Em telas estreitas, preservar o botão “Menu” e o
comportamento recolhível atual.

O ponto de mudança deve ser definido pela capacidade do conteúdo, não pela
identificação do tipo de aparelho ou pelo `User-Agent`. A referência inicial é
o breakpoint já adotado pelo cabeçalho, `48rem`, que deve ser confirmado
visualmente durante a implementação.

## Regras a atender

- Em telas largas, exibir continuamente e na mesma ordem: “Início”,
  “Ex-alunos”, “Fotos” e “Cadastre-se”.
- Em telas largas, ocultar o botão “Menu” e não exigir clique para acessar os
  destinos principais.
- A visibilidade da navegação larga não pode depender do estado aberto/fechado
  usado pelo menu móvel nem da execução de JavaScript.
- Em telas estreitas, manter o botão textual “Menu”, `aria-expanded`,
  `aria-controls`, fechamento ao escolher um destino, fechamento por `Escape`
  e devolução previsível do foco.
- Manter o destino atual identificado com `aria-current="page"` nos dois modos.
- Preservar os links como navegação HTML normal, utilizável por teclado e sem
  JavaScript.
- Ao redimensionar de uma tela estreita para uma tela larga, mostrar a
  navegação independentemente do estado anterior do menu móvel.
- Ao retornar para uma tela estreita, apresentar um estado recolhido e coerente;
  não manter um painel móvel visualmente aberto apenas porque a navegação estava
  visível no modo largo.
- A marca e os quatro links não podem se sobrepor, ser cortados ou provocar
  rolagem horizontal.
- Não usar detecção de notebook/desktop por JavaScript ou `User-Agent`; usar CSS
  responsivo e media query orientada ao espaço necessário pelo conteúdo.
- Respeitar zoom de 200%, preferências de tamanho de fonte e alvos interativos
  de pelo menos 44 × 44 px.
- Preservar a identidade visual e os estilos gerais do cabeçalho.

## Fora do escopo

- Alterar os quatro destinos, seus textos ou sua ordem.
- Criar novos níveis, submenus ou menus suspensos.
- Redesenhar a marca ou todo o cabeçalho.
- Tornar o cabeçalho fixo durante a rolagem.
- Alterar a navegação do rodapé.
- Usar uma largura fixa baseada em modelos específicos de notebook, monitor ou
  celular.

## Critérios de aceite

- Em larguras nas quais o layout largo esteja ativo, os quatro destinos ficam
  visíveis sem qualquer clique e o botão “Menu” não aparece.
- Em larguras abaixo do breakpoint, o botão “Menu” controla a navegação e
  informa corretamente seu estado às tecnologias assistivas.
- A navegação larga permanece visível com JavaScript ativado ou desativado.
- A troca de largura entre os modos estreito e largo não deixa a navegação em
  estado invisível ou inconsistente.
- O destino correspondente à rota atual continua marcado visualmente e com
  `aria-current="page"`.
- Não há sobreposição, corte nem rolagem horizontal nos tamanhos de validação:
  320, 390, 768, 1024 e 1440 px.
- Com zoom de 200%, todas as opções continuam disponíveis; se faltar espaço, o
  layout pode adotar o modo de menu recolhível.
- Toda a navegação funciona por teclado, inclusive abertura, fechamento por
  `Escape` e retorno do foco no modo estreito.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passam.

## Validação manual sugerida

Percorrer as rotas principais em 320, 390, 768, 1024 e 1440 px, com JavaScript
ativado e desativado. Redimensionar a janela com o menu móvel fechado e aberto,
testar zoom de 200% e navegar somente com teclado. Confirmar em cada rota a
ordem dos links e a indicação do destino atual.

## Documentos complementares

### Ler antes da implementação

- `AGENTS.md`, especialmente as orientações para preservar o conteúdo em
  português e evitar modernização visual além do escopo.
- `docs/redesign/README.md`, para os princípios de poucos passos, controles
  acessíveis e melhoria progressiva.
- `docs/redesign/functional-spec.md`, seção 1.1, sobre cabeçalho e navegação.
- `docs/redesign/design-system.md`, seções 4 e 5, sobre breakpoints responsivos
  e o componente `SiteHeader`.
- `docs/redesign/implementation-plan.md`, tarefa RED-103 e validação da fase 1.

### Atualizar ao implementar

- `docs/redesign/functional-spec.md`, seção 1.1: explicitar que o botão “Menu” é
  exclusivo do modo estreito e que a navegação permanece expandida quando há
  espaço.
- `docs/redesign/design-system.md`, componente `SiteHeader`: registrar a regra
  responsiva e o breakpoint confirmado pelo conteúdo.
- `docs/redesign/implementation-plan.md`, RED-103 e validação da fase 1, caso o
  documento continue como controle de execução.
- Esta issue, registrando validação, breakpoint confirmado, resultado e estado
  final.

## Arquivos de código previstos

- `src/app.css`, para as regras responsivas e a precedência dos seletores que
  controlam botão e navegação.
- `src/lib/Header.svelte`, somente se for necessário ajustar o estado móvel ou
  a semântica; a preferência é resolver a apresentação responsiva em CSS.

Não se prevê mudança em rotas, banco de dados, schema, conteúdo privado ou
contratos de servidor.

## Resultado da implementação

- Confirmado o breakpoint de `48rem`, que comporta a marca e os quatro destinos
  no layout existente.
- A partir desse breakpoint, a navegação fica sempre visível e o botão “Menu”
  permanece oculto, inclusive com JavaScript ativo.
- Abaixo do breakpoint, foi preservado o menu acessível existente; ao reduzir a
  largura a partir do modo largo, o painel móvel volta ao estado fechado.
- Atualizados `docs/redesign/functional-spec.md`,
  `docs/redesign/design-system.md` e `docs/redesign/implementation-plan.md`.
