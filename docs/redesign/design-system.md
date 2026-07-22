# Design system

O sistema visual recebe o nome de trabalho **Arquivo Vivo**. A aparência deve
ser contemporânea e acolhedora, com referências discretas à origem escolar, sem
transformar o site em um museu ou acrescentar conteúdo histórico inexistente.

## 1. Tecnologia e organização

- Manter SvelteKit e CSS.
- Definir tokens globais em `src/app.css` dentro de `:root`.
- Criar componentes reutilizáveis em `src/lib/components/`.
- Manter estilos específicos junto ao componente Svelte.
- Não adicionar Tailwind, framework de componentes ou biblioteca de ícones na
  primeira implementação. Embora dependências de Tailwind apareçam no projeto,
  o redesign não deve passar a depender delas sem uma decisão separada.
- Preferir SVG simples criado no próprio componente ou texto a imagens GIF
  legadas usadas como botões.
- Não carregar fontes, scripts ou ícones de CDN.

## 2. Tokens

Os nomes abaixo são o contrato semântico. Valores podem receber pequenos
ajustes após teste visual e de contraste, mas componentes não devem usar cores
hexadecimais avulsas.

```css
:root {
  /* Cores de superfície */
  --color-page: #f6f3ed;
  --color-surface: #ffffff;
  --color-surface-muted: #eaf1f4;
  --color-border: #c7d1d6;

  /* Texto */
  --color-text: #24323a;
  --color-text-muted: #586870;
  --color-heading: #153f5b;

  /* Marca e ações */
  --color-primary: #155473;
  --color-primary-hover: #0f405a;
  --color-primary-soft: #dbeaf0;
  --color-accent: #a94321;
  --color-accent-hover: #843318;

  /* Estados */
  --color-success: #28653c;
  --color-success-surface: #e6f3e9;
  --color-warning: #7a5511;
  --color-warning-surface: #fff3d6;
  --color-danger: #a32929;
  --color-danger-surface: #fae7e7;
  --color-focus: #0b70b5;

  /* Tipografia */
  --font-sans:
    system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-serif: Georgia, "Times New Roman", serif;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-md: 1.125rem;
  --text-lg: clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem);
  --text-xl: clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem);
  --leading-tight: 1.2;
  --leading-normal: 1.6;

  /* Espaço */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* Forma e layout */
  --radius-sm: 0.375rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --shadow-card: 0 1px 3px rgb(18 59 82 / 0.12);
  --content-max: 72rem;
  --content-reading: 46rem;
  --control-min-height: 2.75rem;
}
```

O fundo “papel” e o azul profundo dão continuidade à memória do site. O cobre
é reservado a destaques pequenos; ações primárias usam azul. Estados de erro e
sucesso não dependem somente de cor.

## 3. Tipografia

- Corpo e interface usam `--font-sans` em 16 px ou mais.
- Títulos de página podem usar `--font-serif`; títulos de componentes e rótulos
  continuam em sans-serif.
- Corpo usa entrelinha 1,6 e largura de leitura máxima de 46 rem.
- Não usar texto menor que 14 px.
- Não usar caixa alta em frases, espaçamento artificial entre letras ou texto
  piscando.
- Siglas podem permanecer em maiúsculas, acompanhadas de contexto na primeira
  ocorrência relevante.

## 4. Layout responsivo

O CSS deve ser mobile-first. Não existe largura fixa da página.

- Contêiner: `width: min(100% - 2rem, var(--content-max))`.
- Em telas abaixo de 360 px, a margem lateral pode cair para 12 px.
- Formulários usam uma coluna por padrão.
- Campos curtos podem formar duas colunas apenas quando cada coluna tiver pelo
  menos 16 rem.
- Grades usam `repeat(auto-fit, minmax(...))` quando isso produzir os pontos de
  quebra descritos na especificação funcional.
- Evitar breakpoints orientados a modelos de aparelho. Referências iniciais:
  30 rem, 48 rem e 64 rem, ajustadas pelo conteúdo.
- Não usar `position: absolute` para a estrutura principal.
- Não usar tabela para posicionar campos ou cartões. Tabelas ficam reservadas a
  dados genuinamente tabulares.
- Nenhum controle depende de hover para revelar informação essencial.

## 5. Componentes

### `SiteHeader`

- Marca textual ou imagem responsiva com dimensões declaradas.
- A partir de `48rem`, navegação expandida com os quatro destinos visíveis; o
  botão “Menu” não é exibido.
- Abaixo de `48rem`, botão de menu móvel com os mesmos destinos no fluxo da
  página.
- Recebe ou deriva a rota ativa; não exige que cada página passe manualmente um
  nome de aba quando a informação já está disponível em `$page.url.pathname`.
- Links sempre começam por `/`.

### `SiteFooter`

- Nota de site não oficial e contato.
- Texto compacto, contraste normal e área de toque adequada no e-mail.

### `PageContainer` e `PageHeader`

- `PageContainer` controla largura e margens.
- `PageHeader` recebe título, descrição opcional e espaço opcional para uma ação.
- Apenas um `h1` por página.

### `Button`

Variantes: `primary`, `secondary` e `quiet`. A variante destrutiva só deve ser
criada quando surgir uma ação destrutiva real.

- Altura mínima de 44 px.
- Estados normal, hover, foco, ativo, desabilitado e ocupado.
- Botão ocupado mantém a largura para evitar deslocamento.
- Links estilizados como botão são usados apenas quando navegam; botão é usado
  quando executa uma ação.

### Campos de formulário

Componentes: `TextField`, `SelectField`, `TextAreaField`, `RadioGroup`,
`CheckboxField`, `FileField` e `FieldError`.

Cada campo tem:

- `label` visível;
- indicação textual de obrigatório ou opcional;
- descrição opcional;
- erro associado por `aria-describedby`;
- `autocomplete` apropriado quando houver padrão conhecido;
- altura mínima de 44 px nos controles de uma linha.

Placeholder nunca substitui rótulo. Não validar apenas no evento `keyup`; erros
são apresentados após saída do campo ou tentativa de envio, evitando repreender
a pessoa enquanto ela ainda digita.

### `FormSection` e `ErrorSummary`

- `FormSection` agrupa campos sob um `h2` e descrição curta, sem criar uma etapa.
- `ErrorSummary` aparece no topo após falha, recebe foco programaticamente e
  contém links para os campos inválidos.

### `SearchForm`

- Campo e botão lado a lado quando couberem e empilhados em telas estreitas.
- Permite variantes de rótulo, mas mantém a mesma aparência na home e em
  Ex-alunos.
- Envio HTML tradicional é sempre possível.

### `AlumniCard`

- Foto opcional de tamanho estável, nome como título, apelido, curso e período.
- Não recebe o objeto completo do banco; recebe somente um modelo público.
- Estado sem foto usa bloco neutro com iniciais apenas se isso não criar
  complexidade desnecessária; caso contrário, omite a imagem.

### `PhotoCard` e `PhotoDialog`

- `PhotoCard` contém miniatura com dimensões e metadados textuais.
- `PhotoDialog` usa elemento `dialog` quando suportado, título acessível,
  fechamento por botão e `Escape`, retenção de foco e retorno à origem.
- O link para a foto permanece válido sem o diálogo.

### `FilterPanel`

- Filtros principais sempre visíveis.
- Filtros avançados em `details/summary`, que já funciona sem JavaScript.
- O estado abre automaticamente quando algum filtro avançado estiver ativo.

### `Pagination`

- Links reais com parâmetros GET.
- Texto “Página X de Y”.
- Não renderizar links desabilitados como se fossem acionáveis.

### `Notice` e `EmptyState`

- Variantes informativa, sucesso, atenção e erro com ícone ou rótulo textual.
- `EmptyState` explica o estado em uma frase e oferece no máximo duas ações.

## 6. Imagens e identidade existente

- Avaliar o logotipo existente em fundo transparente. Se a resolução for
  insuficiente, recriar apenas a composição tipográfica; não inventar um brasão
  ou símbolo institucional.
- Remover GIFs usados como setas, bullets, botões “novo” e decoração.
- Preservar fotos do acervo sem filtros de cor ou cortes irreversíveis.
- Definir `width` e `height` ou `aspect-ratio` para evitar deslocamento durante o
  carregamento.
- Miniaturas de pessoas usam proporção 1:1; fotos do acervo podem usar 4:3.

## 7. Interação, foco e movimento

```css
:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 3px;
}
```

- Não remover outline sem substituto equivalente.
- Transições se limitam a cor, borda e opacidade, em torno de 150 ms.
- Respeitar `prefers-reduced-motion: reduce` e desativar movimentos não
  essenciais.
- Não usar carrossel automático, parallax, rolagem forçada ou animação de
  entrada em conteúdo.

## 8. Acessibilidade mínima

- Alvo WCAG 2.2 nível AA para as telas alteradas.
- Contraste de texto normal de pelo menos 4,5:1 e texto grande de 3:1.
- Zoom de 200% sem perda de informação ou função.
- Reflow em 320 CSS px sem rolagem horizontal, exceto conteúdo que
  necessariamente a exija — o redesign atual não possui tal conteúdo.
- Ordem de foco acompanha a ordem visual.
- Campos têm nome acessível, propósito e mensagens de erro associadas.
- Ícones decorativos usam `aria-hidden`; imagens informativas têm `alt` útil.
- Contagens, sucesso e erro enviados dinamicamente usam região viva moderada
  quando isso ajudar, sem anunciar cada tecla digitada.
- Testar ao menos com teclado e um leitor de tela disponível no ambiente de
  validação.

## 9. Escrita da interface

- Frases curtas, tom respeitoso e direto.
- “Você” pode ser usado em instruções; evitar linguagem infantilizada.
- Uma ação por botão e verbos no infinitivo: “Buscar”, “Enviar”, “Limpar”.
- Explicar consequências antes da ação, especialmente publicação de conteúdo.
- Evitar jargão técnico, mensagens em inglês e mensagens humorísticas em erros.

## 10. Definição de pronto de um componente

Um componente só está pronto quando:

- possui tipos explícitos para propriedades;
- cobre estados padrão, foco, erro, desabilitado e ocupado aplicáveis;
- funciona com teclado e zoom;
- não recebe dados privados desnecessários;
- não contém cores ou espaçamentos fora dos tokens sem justificativa;
- foi usado em pelo menos uma tela real ou removido do escopo para evitar uma
  biblioteca abstrata sem consumidor.
