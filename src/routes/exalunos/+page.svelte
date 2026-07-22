<script lang="ts">
  import Meta from "$lib/Meta.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import SearchForm from "$lib/components/SearchForm.svelte";
  import { ALUMNI_ORDER_TO_LEGACY } from "$lib/domain";
</script>

<Meta
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
      <a
        class="button button--secondary"
        href={`/exalunos_lista?ORDEM=${ALUMNI_ORDER_TO_LEGACY.nome}`}
        >Ver todos em ordem alfabética</a
      >
      <a class="button button--secondary" href="/exalunos_lista?Restricao=LAST"
        >Ver cadastros recentes</a
      >
    </div>
  </section>

  <form class="alumni-entry__order" method="GET" action="/exalunos_lista">
    <label for="ordem-exalunos">Ordenar por</label>
    <div>
      <select id="ordem-exalunos" name="ORDEM">
        <option value={ALUMNI_ORDER_TO_LEGACY.nome}>Nome</option>
        <option value={ALUMNI_ORDER_TO_LEGACY.cursoIngresso}
          >Curso e ano de ingresso</option
        >
        <option value={ALUMNI_ORDER_TO_LEGACY.cursoSaida}
          >Curso e ano de saída</option
        >
        <option value={ALUMNI_ORDER_TO_LEGACY.ingressoCurso}
          >Ano de ingresso e curso</option
        >
        <option value={ALUMNI_ORDER_TO_LEGACY.saidaCurso}
          >Ano de saída e curso</option
        >
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
