<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/Button.svelte";
  import { COURSES } from "$lib/domain";
  import type { SearchResult } from "./search_id/+server";
  let { form }: { form?: { success?: boolean; reason?: string } | null } =
    $props();
  let query = $state("");
  let results = $state<SearchResult[]>([]);
  let selected = $state<SearchResult | undefined>();
  let preview = $state<string | undefined>();
  let submitting = $state(false);
  let timer: ReturnType<typeof setTimeout>;
  function search() {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      if (query.trim().length < 3) {
        results = [];
        return;
      }
      const response = await fetch(
        `/cadfoto/search_id?${new URLSearchParams({ name: query })}`,
      );
      results = response.ok ? await response.json() : [];
    }, 350);
  }
  function choose(result: SearchResult) {
    selected = result;
    results = [];
    query = "";
  }
  function previewFile(event: Event) {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (preview) URL.revokeObjectURL(preview);
    preview = file ? URL.createObjectURL(file) : undefined;
  }
</script>

{#if form?.success === false}<p class="error" role="alert">
    {form.reason}
  </p>{/if}
<form
  method="POST"
  enctype="multipart/form-data"
  use:enhance={() => {
    submitting = true;
    return async ({ update }) => {
      await update({ reset: false });
      submitting = false;
    };
  }}
>
  <fieldset>
    <legend>Em nome de qual ex-aluno a foto será enviada?</legend
    >{#if selected}<p>
        <strong>{selected.name}</strong>{selected.nickname
          ? ` (${selected.nickname})`
          : ""} · {selected.course}
        {selected.startYear
          ? `${selected.startYear}–${selected.endYear ?? ""}`
          : ""}
      </p>
      <input type="hidden" name="IdExAlunoUp" value={selected.id} /><Button
        type="button"
        variant="secondary"
        onclick={() => (selected = undefined)}>Trocar</Button
      >{:else}<label for="busca">Buscar pelo nome</label><input
        id="busca"
        bind:value={query}
        oninput={search}
        autocomplete="off"
      />
      <p>Digite pelo menos 3 caracteres.</p>
      <label for="IdExAlunoUp">ID do ex-aluno</label><input
        id="IdExAlunoUp"
        name="IdExAlunoUp"
        inputmode="numeric"
        required
      />{#if results.length}<ul>
          {#each results as result}<li>
              <button type="button" onclick={() => choose(result)}
                >{result.name}{result.nickname ? ` — ${result.nickname}` : ""} ·
                {result.course}
                {result.startYear
                  ? `${result.startYear}–${result.endYear ?? ""}`
                  : ""}</button
              >
            </li>{/each}
        </ul>{/if}{/if}
  </fieldset>
  <fieldset>
    <legend>Foto e informações</legend><label for="arquivo"
      >Arquivo <span>obrigatório</span></label
    ><input
      id="arquivo"
      name="arquivo"
      type="file"
      accept="image/png,image/gif,image/jpeg,image/webp,image/avif"
      onchange={previewFile}
      required
    />
    <p>PNG, GIF, JPEG, WebP ou AVIF, até 5 MB.</p>
    {#if preview}<img
        class="preview"
        src={preview}
        alt="Pré-visualização da imagem selecionada"
      />{/if}<label for="TituloFoto">Título <span>obrigatório</span></label
    ><input
      id="TituloFoto"
      name="TituloFoto"
      required
      minlength="4"
      maxlength="250"
    /><label for="CursoFoto">Curso <span>obrigatório</span></label><select
      id="CursoFoto"
      name="CursoFoto"
      required
      ><option value="">Selecione</option>{#each COURSES as course}<option
          value={course}>{course}</option
        >{/each}</select
    ><label for="TurmaFoto">Turma <span>obrigatório</span></label><input
      id="TurmaFoto"
      name="TurmaFoto"
      required
      maxlength="15"
    />
    <div class="years">
      <label for="AnoFoto"
        >Ano da foto<input
          id="AnoFoto"
          name="AnoFoto"
          inputmode="numeric"
          pattern="\d{4}"
        /></label
      ><label for="AnoFormatura"
        >Ano de formatura<input
          id="AnoFormatura"
          name="AnoFormatura"
          inputmode="numeric"
          pattern="\d{4}"
        /></label
      >
    </div>
    <fieldset>
      <legend>É carômetro?</legend><label
        ><input type="radio" name="Carometro" value="false" checked /> Não</label
      ><label><input type="radio" name="Carometro" value="true" /> Sim</label>
      <p>Carômetro é uma foto de identificação de turma.</p>
    </fieldset>
    <fieldset>
      <legend>É foto pessoal?</legend><label
        ><input type="radio" name="FotoPessoal" value="false" checked /> Não</label
      ><label><input type="radio" name="FotoPessoal" value="true" /> Sim</label>
      <p>A foto pessoal pode representar a pessoa na relação e no perfil.</p>
    </fieldset>
  </fieldset>
  <Button type="submit" disabled={submitting}
    >{submitting ? "Enviando foto…" : "Enviar foto"}</Button
  >
</form>

<style>
  form {
    display: grid;
    gap: var(--space-6);
    max-width: var(--content-reading);
  }
  fieldset {
    display: grid;
    gap: var(--space-2);
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
  }
  fieldset fieldset {
    background: var(--color-surface-muted);
  }
  legend,
  label {
    font-weight: 700;
  }
  input,
  select {
    width: 100%;
    padding: var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
  }
  p {
    margin: 0;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
  ul {
    margin: 0;
    padding-left: var(--space-6);
  }
  li button {
    width: 100%;
    text-align: left;
    margin-top: var(--space-1);
  }
  .preview {
    max-height: 16rem;
    object-fit: contain;
  }
  .years {
    display: grid;
    gap: var(--space-3);
  }
  .error {
    padding: var(--space-3);
    color: var(--color-danger);
    background: var(--color-danger-surface);
  }
  @media (min-width: 36rem) {
    .years {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
