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
      : "Consulte os perfis públicos dos ex-alunos da ETFSP, CEFET-SP e IFSP.",
  );
  const metaTitle = $derived(
    data.pagination.page > 1
      ? `${pageTitle} — Página ${data.pagination.page}`
      : pageTitle,
  );

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
  title={`${metaTitle} — ETFSP / IFSP`}
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

<form
  class="directory-filters"
  method="GET"
  action={basePath}
  aria-label="Buscar na relação de ex-alunos"
>
  {#if data.filters.recentes}
    <input type="hidden" name="recentes" value="1" />
  {/if}
  <div class="field field--name">
    <label for="busca">Nome do ex-aluno</label>
    <input
      id="busca"
      type="search"
      name="busca"
      value={data.filters.busca}
      autocomplete="name"
    />
  </div>
  {#if data.courseLanding}
    <div class="field course-context">
      <span class="field__label">Curso</span>
      <strong>{data.courseLanding.shortName}</strong>
      <a href={allCoursesHref}>Ver todos os cursos</a>
    </div>
  {:else}
    <div class="field">
      <label for="curso">Curso</label>
      <select id="curso" name="curso" value={data.filters.curso ?? ""}>
        <option value="">Todos os cursos</option>
        {#each COURSES as course}
          <option value={course}>{courseLabel(course)}</option>
        {/each}
      </select>
    </div>
  {/if}
  <div class="field">
    <label for="ordem">Ordenar por</label>
    <select id="ordem" name="ordem" value={data.filters.ordem}>
      {#each orderOptions as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </div>
  <Button type="submit">Buscar</Button>
</form>

{#if !data.courseLanding}
  <nav class="course-chips" aria-labelledby="course-chips-title">
    <h2 id="course-chips-title">Por curso</h2>
    <ul>
      {#each COURSES as course}
        <li>
          <a href={`/exalunos/curso/${COURSE_CATALOG[course].slug}`}>
            {COURSE_CATALOG[course].shortName}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
{/if}

<section class="directory-results" aria-labelledby="results-title">
  <h2 id="results-title" aria-live="polite">
    {data.pagination.total}
    {data.pagination.total === 1
      ? "ex-aluno encontrado"
      : "ex-alunos encontrados"}
  </h2>

  {#if data.filters.recentes}
    <p class="recent-notice">
      <a href={basePath}>Ver toda a relação de ex-alunos</a>
    </p>
  {/if}

  {#if data.alunos.length > 0}
    <div class="alumni-grid">
      {#each data.alunos as alumnus (alumnus.id)}
        <AlumniCard {alumnus} headingLevel={3} />
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
  .directory-filters {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    box-shadow: var(--shadow-sm);
  }

  .field {
    display: grid;
    gap: var(--space-1);
    min-width: 0;
    align-content: start;
  }

  .field label,
  .field__label {
    color: var(--color-heading);
    font-size: var(--text-sm);
    font-weight: 700;
  }

  .field input,
  .field select {
    width: 100%;
    min-width: 0;
  }

  .course-context strong {
    display: flex;
    min-height: var(--control-min-height);
    align-items: center;
  }

  .course-context a {
    font-size: var(--text-sm);
  }

  .course-chips {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-4);
  }

  .course-chips h2 {
    flex: 0 0 auto;
    margin: 0;
    color: var(--color-heading);
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    font-weight: 700;
  }

  .course-chips ul {
    display: flex;
    gap: var(--space-2);
    margin: 0;
    padding: var(--space-1) 0;
    overflow-x: auto;
    list-style: none;
    scrollbar-width: thin;
  }

  .course-chips li {
    flex: 0 0 auto;
    margin: 0;
  }

  .course-chips a {
    display: inline-flex;
    min-height: var(--control-min-height);
    align-items: center;
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: var(--color-surface);
    color: var(--color-primary);
    text-decoration: none;
    white-space: nowrap;
  }

  .course-chips a:hover {
    border-color: var(--color-primary);
    background: var(--color-primary-soft);
  }

  .directory-results {
    margin-top: var(--space-8);
  }

  .directory-results h2 {
    margin: 0;
    color: var(--color-text-muted);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    font-weight: 700;
  }

  .recent-notice {
    margin: var(--space-2) 0 0;
    color: var(--color-text-muted);
  }

  .alumni-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));
    gap: var(--space-3);
    margin-top: var(--space-4);
  }

  @media (min-width: 30rem) {
    .directory-filters {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .field--name {
      grid-column: 1 / -1;
    }

    .directory-filters :global(button[type="submit"]) {
      grid-column: 1 / -1;
      justify-self: start;
      min-width: 8rem;
    }
  }

  @media (min-width: 56rem) {
    .directory-filters {
      grid-template-columns:
        minmax(0, 2fr) minmax(0, 1.3fr) minmax(0, 1fr)
        auto;
      align-items: end;
    }

    .field--name,
    .directory-filters :global(button[type="submit"]) {
      grid-column: auto;
    }

    .course-chips ul {
      flex-wrap: wrap;
      overflow: visible;
    }
  }
</style>
