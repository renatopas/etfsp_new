<script lang="ts">
  import type { PageProps } from "./$types";
  import { COURSES, COURSE_CATALOG, courseLabel } from "$lib/domain";
  import Meta from "$lib/Meta.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import { absoluteSiteUrl } from "$lib/site";
  let { data }: PageProps = $props();
  let dialog: HTMLDialogElement;
  let selectedIndex = $state<number | undefined>();
  let pointerStart = $state<{ id: number; x: number; y: number }>();
  const activeTouchPointers = new Set<number>();
  let gestureHadMultiplePointers = false;
  const selected = $derived(
    selectedIndex === undefined ? undefined : data.photos[selectedIndex],
  );
  const hasPrevious = $derived(
    selectedIndex !== undefined && selectedIndex > 0,
  );
  const hasNext = $derived(
    selectedIndex !== undefined && selectedIndex < data.photos.length - 1,
  );
  const params = $derived({
    titulo: data.filters.title || undefined,
    curso: data.filters.course,
    tipo: data.filters.type === "carometro" ? "carometro" : undefined,
    fotoDe: data.filters.photoFrom?.toString(),
    fotoAte: data.filters.photoTo?.toString(),
    formaturaDe: data.filters.graduationFrom?.toString(),
    formaturaAte: data.filters.graduationTo?.toString(),
    idExAluno: data.filters.alumnusId?.toString(),
  });
  const hasAdvancedFilters = $derived(
    Boolean(
      data.filters.photoFrom ||
      data.filters.photoTo ||
      data.filters.graduationFrom ||
      data.filters.graduationTo,
    ),
  );

  interface ActiveFilter {
    label: string;
    href: string;
  }

  function hrefWithout(...names: (keyof typeof params)[]): string {
    const searchParams = new URLSearchParams();
    for (const [name, value] of Object.entries(params)) {
      if (value && !names.includes(name as keyof typeof params)) {
        searchParams.set(name, value);
      }
    }
    const query = searchParams.toString();
    return query ? `/lista_foto?${query}` : "/lista_foto";
  }

  function rangeLabel(from?: number, to?: number): string {
    if (from && to) return from === to ? `${from}` : `${from}–${to}`;
    if (from) return `a partir de ${from}`;
    return `até ${to}`;
  }

  const activeFilters = $derived.by(() => {
    const filters: ActiveFilter[] = [];
    const f = data.filters;
    if (f.title) {
      filters.push({
        label: `Título: “${f.title}”`,
        href: hrefWithout("titulo"),
      });
    }
    if (f.course) {
      filters.push({
        label: `Curso: ${COURSE_CATALOG[f.course].shortName}`,
        href: hrefWithout("curso"),
      });
    }
    if (f.type === "carometro") {
      filters.push({ label: "Tipo: Carômetro", href: hrefWithout("tipo") });
    }
    if (f.photoFrom || f.photoTo) {
      filters.push({
        label: `Foto: ${rangeLabel(f.photoFrom, f.photoTo)}`,
        href: hrefWithout("fotoDe", "fotoAte"),
      });
    }
    if (f.graduationFrom || f.graduationTo) {
      filters.push({
        label: `Formatura: ${rangeLabel(f.graduationFrom, f.graduationTo)}`,
        href: hrefWithout("formaturaDe", "formaturaAte"),
      });
    }
    if (f.alumnusId) {
      filters.push({
        label: "Enviadas por um ex-aluno",
        href: hrefWithout("idExAluno"),
      });
    }
    return filters;
  });

  function open(index: number) {
    selectedIndex = index;
    dialog?.showModal();
  }
  function close() {
    dialog?.close();
  }
  function previous() {
    if (hasPrevious && selectedIndex !== undefined) selectedIndex -= 1;
  }
  function next() {
    if (hasNext && selectedIndex !== undefined) selectedIndex += 1;
  }
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      previous();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    }
  }
  function handlePointerDown(event: PointerEvent) {
    if (event.pointerType !== "touch") return;
    activeTouchPointers.add(event.pointerId);
    if (activeTouchPointers.size > 1) {
      gestureHadMultiplePointers = true;
      pointerStart = undefined;
      return;
    }
    pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
  }
  function handlePointerUp(event: PointerEvent) {
    if (event.pointerType !== "touch") return;
    activeTouchPointers.delete(event.pointerId);
    if (gestureHadMultiplePointers) {
      pointerStart = undefined;
      if (activeTouchPointers.size === 0) gestureHadMultiplePointers = false;
      return;
    }
    if (!pointerStart || event.pointerId !== pointerStart.id) return;
    const horizontal = event.clientX - pointerStart.x;
    const vertical = event.clientY - pointerStart.y;
    pointerStart = undefined;

    if (Math.abs(horizontal) < 50 || Math.abs(horizontal) <= Math.abs(vertical))
      return;
    if (horizontal > 0) previous();
    else next();
  }
  function handlePointerCancel(event: PointerEvent) {
    activeTouchPointers.delete(event.pointerId);
    pointerStart = undefined;
    if (activeTouchPointers.size === 0) gestureHadMultiplePointers = false;
  }
</script>

<Meta
  canonical={absoluteSiteUrl("/lista_foto")}
  title="Fotos"
  description="Consulte as fotos enviadas pelos ex-alunos da ETFSP, CEFET-SP e IFSP."
  robots={data.noindex ? "noindex,follow" : undefined}
/><PageHeader title="Fotos"
  >{#snippet children()}<a class="button button--primary" href="/cadfoto"
      >Enviar uma foto</a
    >{/snippet}</PageHeader
>
<form class="filters" method="GET" aria-label="Filtrar fotos">
  {#if data.filters.alumnusId}
    <input type="hidden" name="idExAluno" value={data.filters.alumnusId} />
  {/if}
  <div class="filters__main">
    <div class="field">
      <label for="titulo">Título ou descrição</label>
      <input id="titulo" name="titulo" value={data.filters.title} />
    </div>
    <div class="field">
      <label for="curso">Curso</label>
      <select id="curso" name="curso" value={data.filters.course ?? ""}>
        <option value="">Todos os cursos</option>
        {#each COURSES as course}
          <option value={course}>{courseLabel(course)}</option>
        {/each}
      </select>
    </div>
    <fieldset class="segmented">
      <legend>Tipo de foto</legend>
      <div class="segmented__options">
        <label>
          <input
            type="radio"
            name="tipo"
            value="gerais"
            checked={data.filters.type === "gerais"}
          />
          <span>Fotos gerais</span>
        </label>
        <label>
          <input
            type="radio"
            name="tipo"
            value="carometro"
            checked={data.filters.type === "carometro"}
          />
          <span>Carômetro</span>
        </label>
      </div>
    </fieldset>
  </div>
  <div class="filters__footer">
    <details open={hasAdvancedFilters}>
      <summary>Filtros avançados</summary>
      <div class="ranges">
        <div class="field">
          <label for="fotoDe">Ano da foto — de</label>
          <input
            id="fotoDe"
            name="fotoDe"
            value={data.filters.photoFrom ?? ""}
            inputmode="numeric"
          />
        </div>
        <div class="field">
          <label for="fotoAte">até</label>
          <input
            id="fotoAte"
            name="fotoAte"
            value={data.filters.photoTo ?? ""}
            inputmode="numeric"
          />
        </div>
        <div class="field">
          <label for="formaturaDe">Formatura — de</label>
          <input
            id="formaturaDe"
            name="formaturaDe"
            value={data.filters.graduationFrom ?? ""}
            inputmode="numeric"
          />
        </div>
        <div class="field">
          <label for="formaturaAte">até</label>
          <input
            id="formaturaAte"
            name="formaturaAte"
            value={data.filters.graduationTo ?? ""}
            inputmode="numeric"
          />
        </div>
      </div>
    </details>
    <button class="button button--primary filters__submit" type="submit"
      >Buscar</button
    >
  </div>
</form>

<section class="results" aria-labelledby="resultados">
  <div class="results__bar">
    <h2 id="resultados" aria-live="polite">
      {data.pagination.total}
      {data.pagination.total === 1 ? "foto encontrada" : "fotos encontradas"}
    </h2>
    {#if activeFilters.length}
      <ul class="chips" aria-label="Filtros ativos">
        {#each activeFilters as filter}
          <li>
            <a
              class="chip"
              href={filter.href}
              aria-label={`Remover filtro ${filter.label}`}
            >
              <span>{filter.label}</span>
              <span class="chip__remove" aria-hidden="true">✕</span>
            </a>
          </li>
        {/each}
        {#if activeFilters.length > 1}
          <li><a class="chips__clear" href="/lista_foto">Limpar filtros</a></li>
        {/if}
      </ul>
    {/if}
  </div>
  {#if data.photos.length}
    <ul class="grid">
      {#each data.photos as photo, index}
        <li class="photo">
          <a
            class="photo__thumb"
            href={photo.imageUrl}
            onclick={(event) => {
              event.preventDefault();
              open(index);
            }}
          >
            <img
              src={photo.thumbnailUrl}
              alt={photo.title ? `Foto: ${photo.title}` : "Foto enviada"}
              width="320"
              height="240"
              loading="lazy"
            />
          </a>
          {#if photo.title}<h3 class="photo__title">{photo.title}</h3>{/if}
          {#if photo.course || photo.className}
            <p class="photo__meta">
              {[
                photo.course ? COURSE_CATALOG[photo.course].shortName : "",
                photo.className ? `Turma ${photo.className}` : "",
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          {/if}
          {#if photo.photoYear || photo.graduationYear}
            <p class="photo__meta">
              {[
                photo.photoYear ? `Foto ${photo.photoYear}` : "",
                photo.graduationYear ? `Formatura ${photo.graduationYear}` : "",
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          {/if}
        </li>
      {/each}
    </ul>
    <Pagination
      basePath="/lista_foto"
      currentPage={data.pagination.page}
      totalPages={data.pagination.totalPages}
      parameters={params}
    />
  {:else}
    <EmptyState
      title="Não encontramos fotos com esses filtros."
      description="Tente remover algum filtro."
    >
      {#snippet children()}<a href="/lista_foto">Limpar filtros</a>{/snippet}
    </EmptyState>
  {/if}
</section>
<dialog
  bind:this={dialog}
  aria-labelledby="photo-dialog-title"
  onkeydown={handleKeydown}
  onclose={() => {
    selectedIndex = undefined;
    pointerStart = undefined;
    activeTouchPointers.clear();
    gestureHadMultiplePointers = false;
  }}
>
  {#if selected && selectedIndex !== undefined}<div class="dialog-header">
      <h2 id="photo-dialog-title">{selected.title ?? "Foto enviada"}</h2>
      <button class="button button--quiet" onclick={close}>Fechar</button>
    </div>
    <div
      class="photo-viewer"
      role="presentation"
      onpointerdown={handlePointerDown}
      onpointerup={handlePointerUp}
      onpointercancel={handlePointerCancel}
    >
      <img
        src={selected.imageUrl}
        alt={selected.title ? `Foto: ${selected.title}` : "Foto enviada"}
      />
    </div>
    <div class="viewer-controls">
      <button
        class="button button--secondary"
        type="button"
        aria-label="Foto anterior"
        disabled={!hasPrevious}
        onclick={previous}>← Anterior</button
      >
      <p class="photo-position" aria-live="polite">
        Foto {selectedIndex + 1} de {data.photos.length}
      </p>
      <button
        class="button button--secondary"
        type="button"
        aria-label="Próxima foto"
        disabled={!hasNext}
        onclick={next}>Próxima →</button
      >
    </div>
    {#if selected.course || selected.className || selected.photoYear || selected.graduationYear}
      <div class="photo-metadata">
        {#if selected.course || selected.className}<p>
            {selected.course}{selected.className
              ? `${selected.course ? " · " : ""}Turma ${selected.className}`
              : ""}
          </p>{/if}
        {#if selected.photoYear}<p>Foto: {selected.photoYear}</p>{/if}
        {#if selected.graduationYear}<p>
            Formatura: {selected.graduationYear}
          </p>{/if}
      </div>
    {/if}{/if}
</dialog>

<style>
  .filters {
    display: grid;
    gap: var(--space-4);
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    box-shadow: var(--shadow-sm);
  }
  .filters__main {
    display: grid;
    gap: var(--space-3);
  }
  .filters__main .segmented {
    grid-column: 1 / -1;
  }
  .field {
    display: grid;
    gap: var(--space-1);
    min-width: 0;
  }
  .field label,
  .segmented legend {
    font-size: var(--text-sm);
    font-weight: 700;
  }
  .field input,
  .field select {
    width: 100%;
    padding: var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
  }
  .segmented {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }
  .segmented legend {
    margin-bottom: var(--space-1);
    padding: 0;
  }
  .segmented__options {
    display: inline-flex;
    padding: 2px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface-muted);
  }
  .segmented label {
    position: relative;
    cursor: pointer;
  }
  .segmented input {
    position: absolute;
    opacity: 0;
    inset: 0;
    margin: 0;
    cursor: pointer;
  }
  .segmented span {
    display: flex;
    min-height: calc(var(--control-min-height) - 6px);
    align-items: center;
    padding: 0 var(--space-4);
    border-radius: calc(var(--radius-sm) - 2px);
    color: var(--color-text);
    font-weight: 650;
    transition:
      background-color 150ms ease,
      color 150ms ease;
  }
  .segmented input:checked + span {
    background: var(--color-primary);
    color: var(--color-surface);
  }
  .segmented input:focus-visible + span {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
  .filters__footer {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
  }
  .filters__footer details {
    flex: 1 1 10rem;
  }
  .filters__footer details[open] {
    flex-basis: 100%;
  }
  .filters__footer details[open] + .filters__submit {
    margin-left: auto;
  }
  summary {
    display: inline-flex;
    min-height: var(--control-min-height);
    align-items: center;
    color: var(--color-primary);
    font-weight: 650;
    cursor: pointer;
  }
  .ranges {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
    margin-top: var(--space-2);
  }
  .filters__submit {
    min-width: 8rem;
  }
  h2,
  h3,
  p {
    margin: 0;
  }
  .results {
    margin-top: var(--space-8);
  }
  .results__bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-4);
  }
  .results__bar h2 {
    color: var(--color-text-muted);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    font-weight: 700;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .chips li {
    margin: 0;
  }
  .chip {
    display: inline-flex;
    min-height: var(--control-min-height);
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-3) var(--space-1) var(--space-4);
    border: 1px solid var(--color-primary);
    border-radius: 999px;
    background: var(--color-primary-soft);
    color: var(--color-primary-hover);
    font-size: var(--text-sm);
    text-decoration: none;
  }
  .chip:hover {
    background: var(--color-surface);
  }
  .chip__remove {
    font-size: var(--text-base);
    line-height: 1;
  }
  .chips__clear {
    display: inline-flex;
    min-height: var(--control-min-height);
    align-items: center;
    font-size: var(--text-sm);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
    gap: var(--space-6) var(--space-4);
    margin: var(--space-4) 0 0;
    padding: 0;
    list-style: none;
  }
  .photo {
    min-width: 0;
    margin: 0;
  }
  .photo__thumb {
    display: block;
    overflow: hidden;
    max-width: 320px;
    aspect-ratio: 4 / 3;
    border-radius: var(--radius-md);
    background: var(--color-surface-muted);
    transition: box-shadow 150ms ease;
  }
  .photo__thumb:hover {
    box-shadow:
      0 0 0 2px var(--color-primary),
      var(--shadow-card);
  }
  .photo__thumb img {
    width: 100%;
    height: 100%;
    object-fit: scale-down;
  }
  .photo__title {
    overflow: hidden;
    margin-top: var(--space-2);
    color: var(--color-heading);
    font-size: var(--text-base);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .photo__meta {
    margin-top: var(--space-1);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    line-height: 1.4;
  }
  @media (min-width: 30rem) {
    .filters__main {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (min-width: 48rem) {
    .filters__main {
      grid-template-columns: minmax(0, 2fr) minmax(0, 1.4fr) auto;
      align-items: end;
    }
    .filters__main .segmented {
      grid-column: auto;
    }
    .ranges {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
  dialog {
    width: min(90vw, 60rem);
    max-height: 92vh;
    overflow: auto;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-4);
  }
  .dialog-header,
  .viewer-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }
  .dialog-header h2 {
    min-width: 0;
  }
  .dialog-header button {
    flex: 0 0 auto;
  }
  .photo-viewer {
    display: grid;
    place-items: center;
    margin-top: var(--space-3);
    touch-action: pan-y pinch-zoom;
  }
  .photo-viewer img {
    display: block;
    width: auto;
    height: auto;
    max-width: 100%;
  }
  .viewer-controls {
    margin-top: var(--space-3);
  }
  .viewer-controls button {
    min-height: 2.75rem;
  }
  .viewer-controls button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
  .photo-position {
    text-align: center;
    color: var(--color-text-muted);
  }
  .photo-metadata {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-4);
    margin-top: var(--space-3);
  }
</style>
