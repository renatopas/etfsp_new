<script lang="ts">
  import Meta from "$lib/Meta.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import SearchForm from "$lib/components/SearchForm.svelte";
  import type { AlumniOrder } from "$lib/domain";
  import { absoluteSiteUrl } from "$lib/site";

  const orderOptions: Array<{ value: AlumniOrder; label: string }> = [
    { value: "nome", label: "Nome" },
    { value: "cursoIngresso", label: "Curso e ano de ingresso" },
    { value: "cursoSaida", label: "Curso e ano de saída" },
    { value: "ingressoCurso", label: "Ano de ingresso e curso" },
    { value: "saidaCurso", label: "Ano de saída e curso" },
  ];
</script>

<Meta
  canonical={absoluteSiteUrl("/exalunos")}
  title="Ex-alunos da Escola Técnica Federal de São Paulo"
  description="Busque ex-alunos pelo nome ou consulte a relação de ex-alunos da ETFSP, CEFET-SP e IFSP."
/>

<section class="alumni-entry">
  <PageHeader
    title="Ex-alunos"
    description="Busque pelo nome de um colega ou consulte a relação de ex-alunos."
  />

  <div class="alumni-entry__search">
    <SearchForm example="Ex.: Maria da Silva" />
  </div>

  <section
    class="alumni-entry__quick-actions"
    aria-labelledby="consultas-rapidas"
  >
    <h2 id="consultas-rapidas">Consultas rápidas</h2>
    <div>
      <a class="button button--secondary" href="/exalunos_lista?ordem=nome"
        >Ver todos em ordem alfabética</a
      >
      <a class="button button--secondary" href="/exalunos_lista?recentes=1"
        >Ver cadastros recentes</a
      >
    </div>
  </section>

  <form class="alumni-entry__order" method="GET" action="/exalunos_lista">
    <label for="ordem-exalunos">Ordenar por</label>
    <div>
      <select id="ordem-exalunos" name="ordem">
        {#each orderOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
      <button type="submit" class="button button--primary">Ver relação</button>
    </div>
  </form>
</section>

<style>
  .alumni-entry {
    max-width: var(--content-reading);
  }

  .alumni-entry__search,
  .alumni-entry__quick-actions,
  .alumni-entry__order {
    padding: var(--space-6);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
  }

  .alumni-entry__quick-actions,
  .alumni-entry__order {
    margin-top: var(--space-6);
  }

  h2 {
    margin: 0;
    color: var(--color-heading);
    font-size: var(--text-lg);
    line-height: var(--leading-tight);
  }

  .alumni-entry__quick-actions > div,
  .alumni-entry__order > div {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-top: var(--space-4);
  }

  label {
    color: var(--color-heading);
    font-weight: 700;
  }

  select {
    min-width: min(100%, 18rem);
    max-width: 100%;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    color: var(--color-text);
    padding: var(--space-2) var(--space-3);
  }
</style>
