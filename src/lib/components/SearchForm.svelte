<script lang="ts">
  import Button from "./Button.svelte";

  interface Props {
    action?: string;
    buttonLabel?: string;
    example?: string;
    hiddenValues?: Record<string, string | undefined>;
    id?: string;
    label?: string;
    query?: string;
  }

  let {
    action = "/exalunos_lista",
    buttonLabel = "Buscar ex-aluno",
    example,
    hiddenValues = {},
    id = "busca-exaluno",
    label = "Nome do ex-aluno",
    query = "",
  }: Props = $props();

  let hintId = `${id}-exemplo`;
</script>

<form class="search-form" method="GET" {action}>
  {#each Object.entries(hiddenValues) as [name, value]}
    {#if value !== undefined}
      <input type="hidden" {name} {value} />
    {/if}
  {/each}
  <label for={id}>{label}</label>
  <div class="search-form__controls">
    <input
      {id}
      type="search"
      name="busca"
      value={query}
      autocomplete="name"
      aria-describedby={example ? hintId : undefined}
    />
    <Button type="submit">{buttonLabel}</Button>
  </div>
  {#if example}
    <p id={hintId}>{example}</p>
  {/if}
</form>

<style>
  .search-form {
    display: grid;
    gap: var(--space-2);
  }

  label {
    color: var(--color-heading);
    font-weight: 700;
  }

  .search-form__controls {
    display: grid;
    gap: var(--space-3);
  }

  input {
    width: 100%;
    min-width: 0;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    color: var(--color-text);
    padding: var(--space-2) var(--space-3);
  }

  p {
    margin: 0;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  @media (min-width: 30rem) {
    .search-form__controls {
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: end;
    }
  }
</style>
