<script lang="ts">
  import type { PageProps } from "./$types";
  import {
    COURSE_CATALOG,
    COURSES,
    courseLabel,
    type AlumniOrder,
  } from "$lib/domain";
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

  const basePath = $derived(
    data.courseLanding
      ? `/exalunos/curso/${data.courseLanding.slug}`
      : "/exalunos_lista",
  );
  const canonical = $derived(absoluteSiteUrl(data.canonicalPath));
  const pageTitle = $derived(
    data.courseLanding
      ? `Ex-alunos de ${data.courseLanding.shortName}`
      : "Relação de ex-alunos",
  );
  const pageDescription = $derived(
    data.courseLanding
      ? `Encontre ex-alunos do curso ${data.courseLanding.name} da ETFSP, CEFET-SP e IFSP.`
      : "Consulte os perfis públicos dos ex-alunos da ETFSP.",
  );
  const metaTitle = $derived(
    data.pagination.page > 1
      ? `${pageTitle} — Página ${data.pagination.page}`
      : pageTitle,
  );

  const preservedSearchFilters = $derived({
    curso: data.courseLanding ? undefined : data.filters.curso,
    ordem: data.filters.ordem === "nome" ? undefined : data.filters.ordem,
    recentes: data.filters.recentes ? "1" : undefined,
  });

  const paginationParameters = $derived({
    busca: data.filters.busca || undefined,
    curso: data.courseLanding ? undefined : data.filters.curso,
    ordem: data.filters.ordem === "nome" ? undefined : data.filters.ordem,
    recentes: data.filters.recentes ? "1" : undefined,
  });

  const resetHref = $derived(
    `${basePath}?${new URLSearchParams({
      ...(!data.courseLanding && data.filters.curso
        ? { curso: data.filters.curso }
        : {}),
      ...(data.filters.ordem !== "nome" ? { ordem: data.filters.ordem } : {}),
      ...(data.filters.recentes ? { recentes: "1" } : {}),
    }).toString()}`.replace(/\?$/, ""),
  );

  const allCoursesHref = $derived(
    `/exalunos_lista?${new URLSearchParams({
      ...(data.filters.busca ? { busca: data.filters.busca } : {}),
      ...(data.filters.ordem !== "nome" ? { ordem: data.filters.ordem } : {}),
      ...(data.filters.recentes ? { recentes: "1" } : {}),
    }).toString()}`.replace(/\?$/, ""),
  );
</script>

<Meta
  {canonical}
  title={`${metaTitle} — ETFSP`}
  description={pageDescription}
  robots={data.noindex ? "noindex,follow" : undefined}
/>

<PageHeader
  title={pageTitle}
  description={data.filters.recentes
    ? "Ex-alunos cadastrados nos últimos 30 dias."
    : data.courseLanding
      ? `${data.courseLanding.name} (${data.courseLanding.code}). Consulte os perfis públicos e encontre antigos colegas.`
      : "Encontre colegas pelo nome e consulte seus perfis públicos."}
/>

{#if !data.courseLanding}
  <nav class="course-links" aria-label="Consultar ex-alunos por curso">
    <span>Por curso:</span>
    {#each COURSES as course}
      <a href={`/exalunos/curso/${COURSE_CATALOG[course].slug}`}>
        {COURSE_CATALOG[course].shortName}
        <span>({course})</span>
      </a>
    {/each}
  </nav>
{/if}

<section class="directory-search" aria-label="Buscar na relação de ex-alunos">
  <SearchForm
    action={basePath}
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

    <form class="filter-form" method="GET" action={basePath}>
      {#if data.filters.busca}
        <input type="hidden" name="busca" value={data.filters.busca} />
      {/if}
      {#if data.filters.recentes}
        <input type="hidden" name="recentes" value="1" />
      {/if}
      <div class="filter-form__fields">
        {#if data.courseLanding}
          <div class="course-context">
            <span>Curso</span>
            <strong
              >{data.courseLanding.code} — {data.courseLanding.name}</strong
            >
            <a href="/exalunos_lista">Ver todos os cursos</a>
          </div>
        {:else}
          <div>
            <label for="curso">Curso</label>
            <select id="curso" name="curso" value={data.filters.curso ?? ""}>
              <option value="">Todos os cursos</option>
              {#each COURSES as course}
                <option value={course}>{courseLabel(course)}</option>
              {/each}
            </select>
          </div>
        {/if}
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
      <a href={basePath}>Ver toda a relação de ex-alunos</a>
    </p>
  {/if}

  {#if data.alunos.length > 0}
    <div class="alumni-grid">
      {#each data.alunos as alumnus (alumnus.id)}
        <AlumniCard {alumnus} />
      {/each}
    </div>
    <Pagination
      {basePath}
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

  .course-links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-4);
    max-width: var(--content-max-readable);
    margin: 0 auto;
  }

  .course-links > span {
    font-weight: 700;
  }

  .course-links a span {
    color: var(--color-text-muted);
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
