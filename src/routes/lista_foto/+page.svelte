<script lang="ts">
  import type { PageProps } from "./$types";
  import { COURSES } from "$lib/domain";
  import Meta from "$lib/Meta.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  let { data }: PageProps = $props();
  let dialog: HTMLDialogElement;
  let selected = $state<(typeof data.photos)[number] | undefined>();
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
  const hasFilters = $derived(
    Boolean(
      data.filters.title ||
        data.filters.course ||
        data.filters.type === "carometro" ||
        data.filters.photoFrom ||
        data.filters.photoTo ||
        data.filters.graduationFrom ||
        data.filters.graduationTo ||
        data.filters.alumnusId,
    ),
  );
  function open(photo: (typeof data.photos)[number]) {
    selected = photo;
    dialog?.showModal();
  }
  function close() {
    dialog?.close();
  }
</script>

<Meta
  title="Fotos"
  description="Consulte as fotos enviadas pelos ex-alunos da ETFSP."
/><PageHeader
  title="Fotos"
  description="Busque fotos por título, curso e período."
  >{#snippet children()}<a class="button button--primary" href="/cadfoto"
      >Enviar uma foto</a
    >{/snippet}</PageHeader
>
<form class="filters" method="GET">
  {#if data.filters.alumnusId}
    <input type="hidden" name="idExAluno" value={data.filters.alumnusId} />
  {/if}
  <label for="titulo">Título ou descrição</label><input
    id="titulo"
    name="titulo"
    value={data.filters.title}
  /><label for="curso">Curso</label><select
    id="curso"
    name="curso"
    value={data.filters.course ?? ""}
    ><option value="">Todos os cursos</option>{#each COURSES as course}<option
        value={course}>{course}</option
      >{/each}</select
  >
  <fieldset>
    <legend>Tipo de foto</legend><label
      ><input
        type="radio"
        name="tipo"
        value="gerais"
        checked={data.filters.type === "gerais"}
      /> Fotos gerais</label
    ><label
      ><input
        type="radio"
        name="tipo"
        value="carometro"
        checked={data.filters.type === "carometro"}
      /> Carômetro</label
    >
  </fieldset>
  <details
    open={Boolean(
      data.filters.photoFrom ||
        data.filters.photoTo ||
        data.filters.graduationFrom ||
        data.filters.graduationTo,
    )}
  >
    <summary>Filtros avançados</summary>
    <div class="ranges">
      <label
        >Ano da foto — de<input
          name="fotoDe"
          value={data.filters.photoFrom ?? ""}
          inputmode="numeric"
        /></label
      ><label
        >até<input
          name="fotoAte"
          value={data.filters.photoTo ?? ""}
          inputmode="numeric"
        /></label
      ><label
        >Formatura — de<input
          name="formaturaDe"
          value={data.filters.graduationFrom ?? ""}
          inputmode="numeric"
        /></label
      ><label
        >até<input
          name="formaturaAte"
          value={data.filters.graduationTo ?? ""}
          inputmode="numeric"
        /></label
      >
    </div>
  </details>
  <div>
    <button class="button button--primary" type="submit">Buscar</button
    >{#if hasFilters}<a class="button button--secondary" href="/lista_foto"
        >Limpar filtros</a
      >{/if}
  </div>
</form>
<section aria-labelledby="resultados">
  <h2 id="resultados">
    {data.pagination.total}
    {data.pagination.total === 1 ? "foto encontrada" : "fotos encontradas"}
  </h2>
  {#if data.photos.length}<div class="grid">
      {#each data.photos as photo}<article>
          <a
            href={photo.imageUrl}
            onclick={(event) => {
              event.preventDefault();
              open(photo);
            }}
            ><img
              src={photo.thumbnailUrl}
              alt={photo.title ? `Foto: ${photo.title}` : "Foto enviada"}
              width="320"
              height="240"
              loading="lazy"
            /></a
          >{#if photo.title}<h3>{photo.title}</h3>{/if}
          <p>
            {photo.course}{photo.className ? ` · Turma ${photo.className}` : ""}
          </p>
          {#if photo.photoYear}<p>
              Foto: {photo.photoYear}
            </p>{/if}{#if photo.graduationYear}<p>
              Formatura: {photo.graduationYear}
            </p>{/if}
        </article>{/each}
    </div>
    <Pagination
      basePath="/lista_foto"
      currentPage={data.pagination.page}
      totalPages={data.pagination.totalPages}
      parameters={params}
    />{:else}<EmptyState
      title="Não encontramos fotos com esses filtros."
      description="Tente remover algum filtro."
      >{#snippet children()}<a href="/lista_foto">Limpar filtros</a
        >{/snippet}</EmptyState
    >{/if}
</section>
<dialog
  bind:this={dialog}
  aria-labelledby="photo-dialog-title"
  onclose={() => (selected = undefined)}
>
  {#if selected}<button class="button button--quiet" onclick={close}
      >Fechar</button
    >
    <h2 id="photo-dialog-title">{selected.title ?? "Foto enviada"}</h2>
    <img
      src={selected.imageUrl}
      alt={selected.title ? `Foto: ${selected.title}` : "Foto enviada"}
    />{/if}
</dialog>

<style>
  .filters {
    display: grid;
    gap: var(--space-3);
    max-width: var(--content-reading);
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
  }
  input,
  select {
    width: 100%;
    padding: var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
  }
  fieldset {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    border: 0;
    padding: 0;
  }
  .ranges {
    display: grid;
    gap: var(--space-3);
    margin-top: var(--space-3);
  }
  .ranges label {
    display: grid;
    gap: var(--space-1);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    gap: var(--space-4);
    margin-top: var(--space-4);
  }
  article {
    padding: var(--space-3);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }
  article img {
    width: 100%;
    aspect-ratio: 4/3;
    object-fit: cover;
  }
  h2,
  h3,
  p {
    margin: 0;
  }
  article h3,
  article p {
    margin-top: var(--space-2);
  }
  dialog {
    width: min(90vw, 60rem);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-4);
  }
  dialog img {
    max-height: 70vh;
    margin-top: var(--space-3);
  }
  @media (min-width: 30rem) {
    .ranges {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
