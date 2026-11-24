# ISSUE-023 — Corrigir defeitos visuais e remover dependências sem uso

**Estado:** Aguardando validação

**Área:** Interface geral, galeria e envio de foto

**Rotas afetadas:** `/lista_foto`, `/cadfoto`, `/exalunos_lista`,
`/exalunos/{id}`

## Contexto

Uma rodada de capturas de tela em largura de celular (390 px) e de computador
(1366 px), feita com a fixture sintética de `.cloud-data`, revelou defeitos
visuais que não dependem de decisões de design e podem ser corrigidos antes da
modernização prevista nas ISSUES 024 a 030.

Também foi verificado que o Tailwind está instalado e carregado pelo Vite, mas
nenhum arquivo de `src/` o utiliza. O design system (`docs/redesign/
design-system.md`, seção 1) já determina que o redesign não deve depender dele.

## Defeitos observados

1. **Botões de rádio acima dos rótulos.** Em “Tipo de foto” (`/lista_foto`) e
   em “É carômetro?” e “É foto pessoal?” (`/cadfoto`), o botão de rádio aparece
   centralizado sobre o texto, como se fosse um campo de largura total. Causa
   provável: regras `input { width: 100% }` nos estilos dessas páginas, que
   também atingem `type="radio"`.
2. **Caractere `>` visível no envio de foto.** Ao lado de “Ano da foto” e de
   “Ano de formatura” aparece um `>` solto. Ele vem de quebras de linha após
   `{/if}` em `src/routes/cadfoto/Formulario.svelte` (por volta das linhas 172
   e 192), onde o `>` deixou de fechar uma tag e virou texto.
3. **Variáveis CSS inexistentes.** Componentes usam tokens que não existem em
   `src/app.css`, e o navegador descarta as declarações silenciosamente:
   - `--shadow-sm` (`AlumniCard.svelte`, perfil);
   - `--text-xs` (`AlumniCard.svelte`);
   - `--space-5` e `--space-7` (perfil e relação);
   - `--text-2xl` (relação);
   - `--content-max-readable` (perfil e relação).
4. **Card da galeria esticado.** Com poucos resultados, a grade
   `repeat(auto-fit, minmax(10rem, 1fr))` faz um único card ocupar a linha
   inteira, com a miniatura encostada à esquerda e um grande espaço vazio.
5. **Miniatura menor que 320 px ampliada.** A regra
   `width: min(100%, 320px)` força a largura de 320 px mesmo quando o arquivo
   é menor, o que amplia e borra a imagem. As miniaturas geradas pelo upload
   têm até 320 × 240 px, então o efeito é mais visível em arquivos antigos ou
   pequenos. Observação: as imagens da fixture são muito pequenas
   (100 × 121 e 133 × 29 px), o que exagera o borrado nas capturas; o defeito de
   CSS existe independentemente disso.
6. **Avisos do compilador Svelte.** O `vite dev` informa:
   - `a11y_no_static_element_interactions` na `div.photo-viewer` de
     `lista_foto/+page.svelte`;
   - `state_referenced_locally` em `SearchForm.svelte` (`hintId` calculado a
     partir de `id` apenas uma vez).

## Modificação proposta

- Restringir as regras de largura total a campos de texto, número e `select`,
  e alinhar rádio e rótulo na mesma linha, com área de toque de pelo menos
  44 × 44 px no conjunto rótulo + controle.
- Remover os `>` soltos do formulário de envio de foto.
- Substituir cada token inexistente por um token existente equivalente ou
  criá-lo em `src/app.css`, registrando-o no design system. Nenhum componente
  deve referenciar variável não declarada.
- Usar `auto-fill` (ou largura máxima de coluna) na grade da galeria para que
  poucos resultados não estiquem o card.
- Trocar a largura forçada da miniatura por `max-width`, para que ela reduza
  mas nunca amplie.
- Resolver os dois avisos do compilador sem suprimi-los com comentários, a
  menos que não haja alternativa acessível; nesse caso, justificar no código.
- Remover o Tailwind:
  - dependências `tailwindcss`, `@tailwindcss/vite`,
    `@tailwindcss/typography` e `prettier-plugin-tailwindcss`;
  - plugin em `vite.config.ts`;
  - plugin em `.prettierrc`;
  - entrada `@tailwindcss/oxide` em `pnpm-workspace.yaml`, se não houver outro
    motivo para mantê-la;
  - frase correspondente em `docs/redesign/design-system.md`, seção 1.
- Remover de `static/images/` as imagens legadas sem referência no código:
  `BICHOCAD.GIF`, `ETFSP2.GIF`, `Logo_25wht.gif`, `RENATO.GIF`, `ball.gif`,
  `btn_busca.gif`, `bullet.gif`, `camera.gif`, `header.gif`, `header.png`,
  `interrogacao1.gif`, `new.gif`, `novo1.gif`, `novo2.gif` e `seta.gif`.
  Manter `ETFSP.GIF` e `ifsp.png` (usados por `scripts/cloud_data.py`),
  `logo_cefet.gif` (usado em `src/app.html`), `header.jpg` e `logoex.gif` (em
  uso até a ISSUE-025).

## Fora do escopo

- Mudanças de layout, tipografia, cores ou cabeçalho além do necessário para
  corrigir os defeitos (ISSUES 024 a 030).
- Remover o wrapper legado `#mainbody2` (ISSUE-024).
- Esconder o campo “ID do ex-aluno” quando houver JavaScript (ISSUE-030).
- Alterar consultas, dados enviados ao navegador ou schema.

## Critérios de aceite

- Em `/lista_foto` e `/cadfoto`, cada rádio aparece na mesma linha do seu
  rótulo, em 320 px e em 1366 px.
- Nenhum `>` solto aparece em `/cadfoto`.
- Uma busca em `src/` por `var(--` não encontra variável que não esteja
  declarada em `src/app.css`.
- Com um único resultado, o card da galeria tem a mesma largura que teria em
  uma grade cheia.
- Uma miniatura menor que 320 px não é exibida maior que seu tamanho natural.
- `vite dev` não emite os dois avisos citados.
- Nenhuma referência a Tailwind permanece em `package.json`, `vite.config.ts`
  ou `.prettierrc`, e `pnpm install --frozen-lockfile` funciona com o lockfile
  atualizado.
- As imagens removidas não são referenciadas em `src/`, `scripts/`, `docs/` ou
  `deploy/`.
- `pnpm run validate` e `pnpm run test:cloud-data` passam.

## Validação manual sugerida

Repetir as capturas de `/lista_foto`, `/cadfoto`, `/exalunos_lista` e de um
perfil em 390 px e 1366 px e comparar com as anteriores. Conferir a seleção dos
rádios por toque e teclado.

## Documentos complementares

### Ler antes da implementação

- `docs/redesign/design-system.md`, seções 1, 2 e 5.

### Atualizar ao implementar

- `docs/redesign/design-system.md`: novos tokens, se criados, e remoção da
  menção ao Tailwind.
- Esta issue, com o resultado e o estado final.

## Arquivos de código previstos

- `src/routes/lista_foto/+page.svelte`
- `src/routes/cadfoto/Formulario.svelte`
- `src/routes/detalhe_exaluno/+page.svelte`
- `src/routes/exalunos_lista/+page.svelte`
- `src/lib/components/AlumniCard.svelte`
- `src/lib/components/SearchForm.svelte`
- `src/app.css`
- `vite.config.ts`, `.prettierrc`, `package.json`, `pnpm-lock.yaml`,
  `pnpm-workspace.yaml`
- `static/images/` (remoções)

Não há alteração server-side, de schema ou de migração.
