<!--
  Visualizador de fotos em tela cheia.

  Navegação: botões anterior/próxima, setas do teclado e gesto horizontal com
  um dedo. O zoom é o nativo do navegador (pinça); enquanto a página estiver
  ampliada, o gesto de um dedo apenas move a área ampliada e não troca de foto.
  Sem JavaScript, as miniaturas continuam abrindo o arquivo da imagem.
-->
<script lang="ts">
  import { fade } from "svelte/transition";
  import { prefersReducedMotion } from "svelte/motion";
  import { COURSE_CATALOG, type PublicPhoto } from "$lib/domain";

  interface Props {
    photos: PublicPhoto[];
  }

  let { photos }: Props = $props();

  const SWIPE_MIN_DISTANCE = 50;

  let dialog = $state<HTMLDialogElement>();
  let selectedIndex = $state<number | undefined>();
  let zoomed = $state(false);
  let pointerStart: { id: number; x: number; y: number } | undefined;
  const activeTouchPointers = new Set<number>();
  let gestureHadMultiplePointers = false;

  const selected = $derived(
    selectedIndex === undefined ? undefined : photos[selectedIndex],
  );
  const hasPrevious = $derived(
    selectedIndex !== undefined && selectedIndex > 0,
  );
  const hasNext = $derived(
    selectedIndex !== undefined && selectedIndex < photos.length - 1,
  );
  const title = $derived(selected?.title ?? "Foto enviada");
  const details = $derived(
    selected
      ? [
          selected.course ? COURSE_CATALOG[selected.course].shortName : "",
          selected.className ? `Turma ${selected.className}` : "",
          selected.photoYear ? `Foto ${selected.photoYear}` : "",
          selected.graduationYear ? `Formatura ${selected.graduationYear}` : "",
        ].filter(Boolean)
      : [],
  );

  export function open(index: number) {
    selectedIndex = index;
    document.documentElement.classList.add("photo-dialog-open");
    dialog?.showModal();
  }

  function close() {
    dialog?.close();
  }

  function handleClose() {
    document.documentElement.classList.remove("photo-dialog-open");
    selectedIndex = undefined;
    pointerStart = undefined;
    activeTouchPointers.clear();
    gestureHadMultiplePointers = false;
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

    // Com a página ampliada, o arrasto serve para mover a área visível.
    if (zoomed) return;
    if (
      Math.abs(horizontal) < SWIPE_MIN_DISTANCE ||
      Math.abs(horizontal) <= Math.abs(vertical)
    )
      return;
    if (horizontal > 0) previous();
    else next();
  }

  function handlePointerCancel(event: PointerEvent) {
    activeTouchPointers.delete(event.pointerId);
    pointerStart = undefined;
    if (activeTouchPointers.size === 0) gestureHadMultiplePointers = false;
  }

  // Acompanha o zoom nativo (pinça) pela escala do viewport visual.
  $effect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () => {
      zoomed = viewport.scale > 1.01;
    };
    update();
    viewport.addEventListener("resize", update);
    return () => viewport.removeEventListener("resize", update);
  });

  // Pré-carrega a foto anterior e a seguinte para trocas imediatas.
  $effect(() => {
    if (selectedIndex === undefined) return;
    for (const index of [selectedIndex - 1, selectedIndex + 1]) {
      const photo = photos[index];
      if (photo) new Image().src = photo.imageUrl;
    }
  });

  // Garante que a página não fique travada se o componente sair da tela aberto.
  $effect(
    () => () => document.documentElement.classList.remove("photo-dialog-open"),
  );
</script>

<dialog
  bind:this={dialog}
  class="viewer"
  aria-labelledby="photo-dialog-title"
  onkeydown={handleKeydown}
  onclose={handleClose}
>
  {#if selected && selectedIndex !== undefined}
    <div class="viewer__top">
      {#if photos.length > 1}
        <p class="viewer__position" aria-live="polite">
          {selectedIndex + 1} de {photos.length}
        </p>
      {/if}
      <button class="viewer__close" type="button" onclick={close}>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
        Fechar
      </button>
    </div>

    <div
      class="viewer__stage"
      role="presentation"
      style:touch-action={zoomed ? "auto" : "pan-y pinch-zoom"}
      onpointerdown={handlePointerDown}
      onpointerup={handlePointerUp}
      onpointercancel={handlePointerCancel}
    >
      {#key selected.imageUrl}
        <img
          src={selected.imageUrl}
          alt={selected.title ? `Foto: ${selected.title}` : "Foto enviada"}
          in:fade={{ duration: prefersReducedMotion.current ? 0 : 150 }}
        />
      {/key}
    </div>

    {#if photos.length > 1}
      <button
        class="viewer__nav viewer__nav--previous"
        type="button"
        aria-label="Foto anterior"
        disabled={!hasPrevious}
        onclick={previous}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      <button
        class="viewer__nav viewer__nav--next"
        type="button"
        aria-label="Próxima foto"
        disabled={!hasNext}
        onclick={next}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    {/if}

    <div class="viewer__info">
      <h2 id="photo-dialog-title">{title}</h2>
      {#if details.length}
        <p>{details.join(" · ")}</p>
      {/if}
    </div>
  {/if}
</dialog>

<style>
  :global(html.photo-dialog-open) {
    overflow: hidden;
  }

  .viewer {
    width: 100vw;
    max-width: none;
    height: 100vh;
    height: 100dvh;
    max-height: none;
    margin: 0;
    padding: 0;
    border: 0;
    background: var(--color-viewer);
    color: var(--color-viewer-text);
    overflow: hidden;
  }

  .viewer[open] {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
  }

  .viewer::backdrop {
    background: var(--color-viewer);
  }

  .viewer__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: max(var(--space-2), env(safe-area-inset-top))
      max(var(--space-3), env(safe-area-inset-right)) var(--space-2)
      max(var(--space-3), env(safe-area-inset-left));
  }

  .viewer__position {
    margin: 0;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .viewer__close {
    display: inline-flex;
    min-height: var(--control-min-height);
    align-items: center;
    gap: var(--space-2);
    margin-left: auto;
    padding: var(--space-2) var(--space-4);
    border: 0;
    border-radius: 999px;
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.25);
    background: var(--color-viewer-control);
    color: inherit;
    font-weight: 700;
  }

  .viewer__stage {
    position: relative;
    min-height: 0;
  }

  .viewer__stage img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    padding: 0 var(--space-2);
    object-fit: scale-down;
    user-select: none;
    -webkit-user-drag: none;
  }

  .viewer__nav {
    position: absolute;
    top: 50%;
    display: grid;
    width: 3.25rem;
    height: 3.25rem;
    place-items: center;
    padding: 0;
    border: 0;
    border-radius: 50%;
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.25);
    background: var(--color-viewer-control);
    color: inherit;
    transform: translateY(-50%);
  }

  .viewer__nav--previous {
    left: max(var(--space-2), env(safe-area-inset-left));
  }

  .viewer__nav--next {
    right: max(var(--space-2), env(safe-area-inset-right));
  }

  .viewer__nav:disabled {
    opacity: 0.25;
  }

  .viewer__close:hover,
  .viewer__nav:not(:disabled):hover {
    background: var(--color-viewer-control-hover);
  }

  .viewer :focus-visible {
    outline-color: var(--color-viewer-text);
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2.5;
  }

  .viewer__close svg {
    width: 1.125rem;
    height: 1.125rem;
  }

  .viewer__info {
    padding: var(--space-3) max(var(--space-4), env(safe-area-inset-right))
      max(var(--space-4), env(safe-area-inset-bottom))
      max(var(--space-4), env(safe-area-inset-left));
  }

  .viewer__info h2 {
    margin: 0;
    color: inherit;
    font-family: var(--font-sans);
    font-size: var(--text-md);
    line-height: var(--leading-tight);
  }

  .viewer__info p {
    margin: var(--space-1) 0 0;
    color: var(--color-viewer-text-muted);
    font-size: var(--text-sm);
  }

  @media (min-width: 48rem) {
    .viewer__stage img {
      padding: 0 5rem;
    }

    .viewer__nav {
      width: 3.5rem;
      height: 3.5rem;
    }

    .viewer__nav--previous {
      left: var(--space-4);
    }

    .viewer__nav--next {
      right: var(--space-4);
    }
  }
</style>
