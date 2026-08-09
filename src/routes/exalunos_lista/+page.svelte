<script lang="ts">
  import type { PageProps } from "./$types";
  import { COURSES, type AlumniOrder } from "$lib/domain";
  import AlumniCard from "$lib/components/AlumniCard.svelte";
  import Button from "$lib/components/Button.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import Meta from "$lib/Meta.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import SearchForm from "$lib/components/SearchForm.svelte";
  import { absoluteSiteUrl } from "$lib/site";

  let { data }: PageProps = $props();

  const orderOptions: Array<{ value: AlumniOrder; label: string }> = [
    { value: "nome", label: "Nome" },
    { value: "cursoIngresso", label: "Curso e ingresso" },
    { value: "cursoSaida", label: "Curso e saída" },
    { value: "ingressoCurso", label: "Ingresso e curso" },
    { value: "ingressoNome", label: "Ingresso e nome" },
    { value: "saidaCurso", label: "Saída e curso" },
    { value: "saidaNome", label: "Saída e nome" },
  ];

  const preservedSearchFilters = $derived({
    curso: data.filters.curso,
    ordem: data.filters.ordem,
    recentes: data.filters.recentes ? "1" : undefined,
  });

  const paginationParameters = $derived({
    busca: data.filters.busca || undefined,
    curso: data.filters.curso,
    ordem: data.filters.ordem,
    recentes: data.filters.recentes ? "1" : undefined,
  });

  const resetHref = $derived(
    `/exalunos_lista?${new URLSearchParams({
      ...(data.filters.curso ? { curso: data.filters.curso } : {}),
      ordem: data.filters.ordem,
      ...(data.filters.recentes ? { recentes: "1" } : {}),
    }).toString()}`.replace(/\?$/, ""),
  );

  const allCoursesHref = $derived(
    `/exalunos_lista?${new URLSearchParams({
      ...(data.filters.busca ? { busca: data.filters.busca } : {}),
      ordem: data.filters.ordem,
      ...(data.filters.recentes ? { recentes: "1" } : {}),
    }).toString()}`.replace(/\?$/, ""),
  );
</script>

<Meta
  canonical={absoluteSiteUrl("/exalunos_lista")}
  title="Relação de ex-alunos"
  description="Consulte os perfis públicos dos ex-alunos da ETFSP."
  robots={data.noindex ? "noindex,follow" : undefined}
/>

<PageHeader
  title="Relação de ex-alunos"
  description={data.filters.recentes
    ? "Ex-alunos cadastrados nos últimos 30 dias."
    : "Encontre colegas pelo nome e consulte seus perfis públicos."}
/>

<section class="directory-search" aria-label="Buscar na relação de ex-alunos">
  <SearchForm
    action="/exalunos_lista"
    buttonLabel="Buscar"
    label="Buscar por nome"
    query={data.filters.busca}
    hiddenValues={preservedSearchFilters}
  />
</section>

<section class="directory-results" aria-labelledby="results-title">
  <div class="directory-results__heading">
    <div>
      <h2 id="results-title">Resultados</h2>
      <p aria-live="polite">
        {data.pagination.total}
        {data.pagination.total === 1
          ? "ex-aluno encontrado"
          : "ex-alunos encontrados"}.
      </p>
    </div>

    <form class="filter-form" method="GET" action="/exalunos_lista">
      {#if data.filters.busca}
        <input type="hidden" name="busca" value={data.filters.busca} />
      {/if}
      {#if data.filters.recentes}
        <input type="hidden" name="recentes" value="1" />
      {/if}
      <div class="filter-form__fields">
        <div>
          <label for="curso">Curso</label>
          <select id="curso" name="curso" value={data.filters.curso ?? ""}>
            <option value="">Todos os cursos</option>
            {#each COURSES as course}
              <option value={course}>{course}</option>
            {/each}
          </select>
        </div>
        <div>
          <label for="ordem">Ordenar por</label>
          <select id="ordem" name="ordem" value={data.filters.ordem}>
            {#each orderOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </div>
      </div>
      <Button type="submit" variant="secondary">Aplicar filtros</Button>
    </form>
  </div>

  {#if data.filters.recentes}
    <p class="recent-notice">
      <a href="/exalunos_lista">Ver toda a relação de ex-alunos</a>
    </p>
  {/if}

  {#if data.alunos.length > 0}
    <div class="alumni-grid">
      {#each data.alunos as alumnus (alumnus.id)}
        <AlumniCard {alumnus} />
      {/each}
    </div>
    <Pagination
      basePath="/exalunos_lista"
      currentPage={data.pagination.page}
      totalPages={data.pagination.totalPages}
      parameters={paginationParameters}
    />
  {:else}
    <EmptyState
      title="Não encontramos ex-alunos com esses filtros."
      description="Tente buscar apenas parte do nome, escolher outro curso ou consultar a relação completa."
    >
      {#snippet children()}
        <a href={resetHref}>Limpar busca</a>
        {#if data.filters.curso}
          <a href={allCoursesHref}>Ver todos os cursos</a>
        {/if}
        <a href="/novocadastro/">Cadastre-se</a>
      {/snippet}
    </EmptyState>
  {/if}
</section>

<style>
  .directory-search,
  .directory-results {
    max-width: var(--content-max-readable);
    margin-inline: auto;
  }

  .directory-search {
    margin-top: var(--space-6);
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface-muted);
  }

  .directory-results {
    margin-top: var(--space-7);
  }

  .directory-results__heading {
    display: grid;
    gap: var(--space-4);
    align-items: end;
  }

  h2,
  p {
    margin: 0;
  }

  h2 {
    color: var(--color-heading);
    font-size: var(--text-2xl);
  }

  .directory-results__heading p,
  .recent-notice {
    margin-top: var(--space-1);
    color: var(--color-text-muted);
  }

  .filter-form,
  .filter-form__fields,
  .filter-form__fields > div {
    display: grid;
    gap: var(--space-2);
  }

  label {
    color: var(--color-heading);
    font-weight: 700;
  }

  select {
    width: 100%;
    min-width: 0;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    color: var(--color-text);
    padding: var(--space-2) var(--space-3);
  }

  .recent-notice {
    margin-top: var(--space-4);
  }

  .alumni-grid {
    display: grid;
    gap: var(--space-2);
    margin-top: var(--space-4);
  }

  @media (min-width: 48rem) {
    .directory-results__heading {
      grid-template-columns: minmax(0, 1fr) minmax(16rem, 22rem);
    }

    .alumni-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .filter-form__fields {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
