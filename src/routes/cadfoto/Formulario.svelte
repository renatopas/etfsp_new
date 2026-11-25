<script lang="ts">
  import { enhance } from "$app/forms";
  import { onMount, tick } from "svelte";
  import Button from "$lib/components/Button.svelte";
  import { COURSES, courseLabel, courseShortName } from "$lib/domain";
  import type { SearchResult } from "./search_id/+server";

  type FormValues = Partial<
    Record<
      | "IdExAlunoUp"
      | "TituloFoto"
      | "CursoFoto"
      | "TurmaFoto"
      | "AnoFoto"
      | "AnoFormatura"
      | "Carometro"
      | "FotoPessoal",
      string
    >
  >;

  let {
    form,
  }: {
    form?: {
      success?: boolean;
      reason?: string;
      errors?: Partial<Record<"AnoFoto" | "AnoFormatura", string>>;
      values?: FormValues;
    } | null;
  } = $props();

  // Os mesmos limites são validados no servidor; aqui servem só para avisar
  // antes do envio.
  const ACCEPTED_TYPES = [
    "image/png",
    "image/gif",
    "image/jpeg",
    "image/webp",
    "image/avif",
  ];
  const MAX_SIZE = 5 * 1024 * 1024;
  const currentYear = new Date().getFullYear();

  let enhanced = $state(false);
  let query = $state("");
  let results = $state<SearchResult[]>([]);
  let searchStatus = $state("");
  let selected = $state<SearchResult | undefined>();
  let identityError = $state<string>();
  let searchInput = $state<HTMLInputElement>();
  let fileInput = $state<HTMLInputElement>();
  let fileInfo = $state<{ name: string; size: string }>();
  let fileError = $state<string>();
  let preview = $state<string | undefined>();
  let dragging = $state(false);
  let submitting = $state(false);
  let summary = $state<HTMLElement>();
  let timer: ReturnType<typeof setTimeout>;

  let values = $derived(form?.values ?? {});
  const error = (name: "AnoFoto" | "AnoFormatura") => form?.errors?.[name];

  onMount(() => {
    enhanced = true;
    return () => {
      clearTimeout(timer);
      if (preview) URL.revokeObjectURL(preview);
    };
  });

  $effect(() => {
    if (form?.success === false && summary) summary.focus();
  });

  function describe(result: SearchResult): string {
    const period = result.startYear
      ? `${result.startYear}–${result.endYear ?? ""}`
      : "";
    return [result.nickname, courseShortName(result.course), period]
      .filter(Boolean)
      .join(" · ");
  }

  function search() {
    clearTimeout(timer);
    identityError = undefined;
    timer = setTimeout(async () => {
      const name = query.trim();
      if (name.length < 3) {
        results = [];
        searchStatus = "";
        return;
      }
      const response = await fetch(
        `/cadfoto/search_id?${new URLSearchParams({ name })}`,
      );
      results = response.ok ? await response.json() : [];
      searchStatus = results.length
        ? `${results.length} ${results.length === 1 ? "resultado" : "resultados"}.`
        : "Nenhum ex-aluno encontrado com esse nome.";
    }, 350);
  }

  function choose(result: SearchResult) {
    selected = result;
    results = [];
    query = "";
    searchStatus = "";
    identityError = undefined;
  }

  async function changeAlumnus() {
    selected = undefined;
    await tick();
    searchInput?.focus();
  }

  function formatSize(bytes: number): string {
    return bytes < 1024 * 1024
      ? `${Math.max(1, Math.round(bytes / 1024))} KB`
      : `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
  }

  function clearFile() {
    if (fileInput) fileInput.value = "";
    fileInfo = undefined;
    if (preview) URL.revokeObjectURL(preview);
    preview = undefined;
  }

  function handleFiles(files: FileList | null | undefined) {
    fileError = undefined;
    const file = files?.[0];
    if (preview) URL.revokeObjectURL(preview);
    preview = undefined;
    if (!file) {
      fileInfo = undefined;
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      clearFile();
      fileError = "Formato não aceito. Use PNG, GIF, JPEG, WebP ou AVIF.";
      return;
    }
    if (file.size > MAX_SIZE) {
      clearFile();
      fileError = `A imagem tem ${formatSize(file.size)}; o limite é 5 MB.`;
      return;
    }
    fileInfo = { name: file.name, size: formatSize(file.size) };
    preview = URL.createObjectURL(file);
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (!file || !fileInput) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    fileInput.files = transfer.files;
    handleFiles(fileInput.files);
  }
</script>

{#if form?.success === false && form.reason}
  <p class="error-summary" role="alert" tabindex="-1" bind:this={summary}>
    {form.reason}
  </p>
{/if}

<form
  class="form"
  method="POST"
  enctype="multipart/form-data"
  use:enhance={({ cancel }) => {
    if (enhanced && !selected) {
      identityError = "Escolha o ex-aluno na lista antes de enviar.";
      cancel();
      tick().then(() => searchInput?.focus());
      return;
    }
    if (enhanced && !fileInfo) {
      fileError = "Escolha a foto que será enviada.";
      cancel();
      return;
    }
    submitting = true;
    return async ({ update }) => {
      await update({ reset: false });
      submitting = false;
    };
  }}
>
  <fieldset class="form-section">
    <legend>Em nome de qual ex-aluno a foto será enviada?</legend>

    {#if selected}
      <div class="selected-alumnus">
        <p>
          <strong>{selected.name}</strong>
          {#if describe(selected)}<span>{describe(selected)}</span>{/if}
        </p>
        <input type="hidden" name="IdExAlunoUp" value={selected.id} />
        <Button type="button" variant="secondary" onclick={changeAlumnus}>
          Trocar
        </Button>
      </div>
    {:else if enhanced}
      <div class="form-field">
        <label for="busca">
          Buscar pelo nome <span class="form-required">(obrigatório)</span>
        </label>
        <input
          id="busca"
          bind:this={searchInput}
          bind:value={query}
          oninput={search}
          autocomplete="off"
          aria-describedby="busca-ajuda"
          aria-invalid={Boolean(identityError)}
        />
        <p id="busca-ajuda" class="form-hint">
          Digite pelo menos 3 caracteres.
        </p>
        {#if identityError}
          <p class="form-error">{identityError}</p>
        {/if}
        <p class="visually-hidden" aria-live="polite">{searchStatus}</p>
        {#if results.length}
          <ul class="search-results">
            {#each results as result (result.id)}
              <li>
                <button
                  type="button"
                  class="search-result"
                  onclick={() => choose(result)}
                >
                  <strong>{result.name}</strong>
                  {#if describe(result)}<span>{describe(result)}</span>{/if}
                </button>
              </li>
            {/each}
          </ul>
        {:else if searchStatus}
          <p class="form-hint" aria-hidden="true">{searchStatus}</p>
        {/if}
      </div>
    {:else}
      <div class="form-field">
        <label for="IdExAlunoUp">
          Número do cadastro do ex-aluno
          <span class="form-required">(obrigatório)</span>
        </label>
        <input
          id="IdExAlunoUp"
          name="IdExAlunoUp"
          value={values.IdExAlunoUp ?? ""}
          inputmode="numeric"
          required
        />
      </div>
    {/if}
  </fieldset>

  <fieldset class="form-section">
    <legend>Foto e informações</legend>

    <div class="form-field">
      <label for="arquivo">
        Arquivo <span class="form-required">(obrigatório)</span>
      </label>
      <label
        class="dropzone"
        class:dropzone--enhanced={enhanced}
        class:dropzone--active={dragging}
        for="arquivo"
        ondragover={(event) => {
          event.preventDefault();
          dragging = true;
        }}
        ondragleave={() => (dragging = false)}
        ondrop={handleDrop}
      >
        <input
          id="arquivo"
          bind:this={fileInput}
          class:visually-hidden={enhanced}
          name="arquivo"
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onchange={(event) => handleFiles(event.currentTarget.files)}
          required={!enhanced}
          aria-describedby="arquivo-ajuda"
        />
        {#if preview}
          <img
            class="dropzone__preview"
            src={preview}
            alt="Pré-visualização da imagem selecionada"
          />
        {/if}
        {#if enhanced}
          <span
            class="button button--secondary dropzone__action"
            aria-hidden="true"
          >
            {fileInfo ? "Trocar foto" : "Escolher foto"}
          </span>
          <span class="dropzone__hint" aria-hidden="true">
            {fileInfo
              ? `${fileInfo.name} · ${fileInfo.size}`
              : "ou arraste a imagem para cá"}
          </span>
        {/if}
      </label>
      <p id="arquivo-ajuda" class="form-hint">
        PNG, GIF, JPEG, WebP ou AVIF, até 5 MB.
      </p>
      {#if fileError}
        <p class="form-error" role="alert">{fileError}</p>
      {/if}
    </div>

    <div class="form-field">
      <label for="TituloFoto">
        Título <span class="form-required">(obrigatório)</span>
      </label>
      <input
        id="TituloFoto"
        name="TituloFoto"
        value={values.TituloFoto ?? ""}
        required
        minlength="4"
        maxlength="250"
      />
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label for="CursoFoto">
          Curso <span class="form-required">(obrigatório)</span>
        </label>
        <select
          id="CursoFoto"
          name="CursoFoto"
          required
          value={values.CursoFoto ?? ""}
        >
          <option value="">Selecione</option>
          {#each COURSES as course}
            <option value={course}>{courseLabel(course)}</option>
          {/each}
        </select>
      </div>
      <div class="form-field">
        <label for="TurmaFoto">
          Turma <span class="form-required">(obrigatório)</span>
        </label>
        <input
          id="TurmaFoto"
          name="TurmaFoto"
          value={values.TurmaFoto ?? ""}
          required
          maxlength="15"
        />
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label for="AnoFoto">Ano da foto</label>
        <input
          id="AnoFoto"
          name="AnoFoto"
          value={values.AnoFoto ?? ""}
          type="number"
          inputmode="numeric"
          min="1909"
          max={currentYear}
          step="1"
          aria-invalid={Boolean(error("AnoFoto"))}
          aria-describedby={error("AnoFoto") ? "AnoFoto-error" : undefined}
        />
        {#if error("AnoFoto")}
          <p id="AnoFoto-error" class="form-error">{error("AnoFoto")}</p>
        {/if}
      </div>
      <div class="form-field">
        <label for="AnoFormatura">Ano de formatura</label>
        <input
          id="AnoFormatura"
          name="AnoFormatura"
          value={values.AnoFormatura ?? ""}
          type="number"
          inputmode="numeric"
          min="1909"
          max={currentYear}
          step="1"
          aria-invalid={Boolean(error("AnoFormatura"))}
          aria-describedby={error("AnoFormatura")
            ? "AnoFormatura-error"
            : undefined}
        />
        {#if error("AnoFormatura")}
          <p id="AnoFormatura-error" class="form-error">
            {error("AnoFormatura")}
          </p>
        {/if}
      </div>
    </div>

    <fieldset class="form-field" aria-describedby="carometro-ajuda">
      <legend>É carômetro?</legend>
      <p id="carometro-ajuda" class="form-hint">
        Carômetro é uma foto de identificação de turma.
      </p>
      <div class="segmented__options">
        <label>
          <input
            type="radio"
            name="Carometro"
            value="false"
            checked={values.Carometro !== "true"}
          />
          <span>Não</span>
        </label>
        <label>
          <input
            type="radio"
            name="Carometro"
            value="true"
            checked={values.Carometro === "true"}
          />
          <span>Sim</span>
        </label>
      </div>
    </fieldset>

    <fieldset class="form-field" aria-describedby="pessoal-ajuda">
      <legend>É foto pessoal?</legend>
      <p id="pessoal-ajuda" class="form-hint">
        A foto pessoal pode representar a pessoa na relação e no perfil.
      </p>
      <div class="segmented__options">
        <label>
          <input
            type="radio"
            name="FotoPessoal"
            value="false"
            checked={values.FotoPessoal !== "true"}
          />
          <span>Não</span>
        </label>
        <label>
          <input
            type="radio"
            name="FotoPessoal"
            value="true"
            checked={values.FotoPessoal === "true"}
          />
          <span>Sim</span>
        </label>
      </div>
    </fieldset>
  </fieldset>

  <Button type="submit" disabled={submitting}>
    {submitting ? "Enviando foto…" : "Enviar foto"}
  </Button>
</form>

<style>
  .selected-alumnus {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border: 2px solid var(--color-primary);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
  }

  .selected-alumnus p,
  .search-result {
    display: grid;
    gap: var(--space-1);
    margin: 0;
  }

  .selected-alumnus span,
  .search-result span {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    font-weight: 400;
  }

  .search-results {
    display: grid;
    gap: var(--space-1);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .search-results li {
    margin: 0;
  }

  .search-result {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    color: var(--color-heading);
    text-align: left;
  }

  .search-result:hover {
    border-color: var(--color-primary);
    background: var(--color-primary-soft);
  }

  .dropzone {
    display: grid;
    justify-items: start;
    gap: var(--space-2);
  }

  .dropzone--enhanced {
    justify-items: center;
    padding: var(--space-6) var(--space-4);
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    text-align: center;
    cursor: pointer;
    transition:
      border-color 150ms ease,
      background-color 150ms ease;
  }

  .dropzone--enhanced:hover,
  .dropzone--active {
    border-color: var(--color-primary);
    background: var(--color-primary-soft);
  }

  .dropzone--enhanced:focus-within {
    outline: 3px solid var(--color-focus);
    outline-offset: 3px;
  }

  .dropzone__preview {
    max-width: 100%;
    max-height: 14rem;
    border-radius: var(--radius-sm);
    object-fit: contain;
  }

  .dropzone__hint {
    color: var(--color-text-muted);
    font-weight: 400;
    font-size: var(--text-sm);
    overflow-wrap: anywhere;
  }
</style>
