<script lang="ts">
  interface Props {
    basePath: string;
    currentPage: number;
    parameters?: Record<string, string | undefined>;
    totalPages: number;
  }

  let { basePath, currentPage, parameters = {}, totalPages }: Props = $props();

  function pageHref(page: number): string {
    const searchParams = new URLSearchParams();

    for (const [name, value] of Object.entries(parameters)) {
      if (value !== undefined && value !== "") {
        searchParams.set(name, value);
      }
    }

    if (page > 1) {
      searchParams.set("pagina", page.toString());
    }

    const query = searchParams.toString();
    return query ? `${basePath}?${query}` : basePath;
  }
</script>

{#if totalPages > 1}
  <nav class="pagination" aria-label="Paginação">
    {#if currentPage > 1}
      <a href={pageHref(currentPage - 1)} rel="prev">Página anterior</a>
    {/if}

    <p>Página {currentPage} de {totalPages}</p>

    {#if currentPage < totalPages}
      <a href={pageHref(currentPage + 1)} rel="next">Próxima página</a>
    {/if}
  </nav>
{/if}

<style>
  .pagination {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    align-items: center;
    justify-content: space-between;
    margin-top: var(--space-6);
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-border);
  }

  p {
    margin: 0;
    color: var(--color-text-muted);
  }

  a {
    font-weight: 700;
  }
</style>
