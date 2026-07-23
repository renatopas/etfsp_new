<script lang="ts">
  import Meta from "$lib/Meta.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import SearchForm from "$lib/components/SearchForm.svelte";
</script>

<Meta
  title="Ex-alunos da Escola Técnica Federal de São Paulo"
  description="Encontre colegas e participe do cadastro de ex-alunos da ETFSP, CEFET-SP e IFSP."
/>

<section class="home-page">
  <PageHeader
    title="Encontre seus colegas da Federal de São Paulo"
    description="Este site reúne ex-alunos, professores e funcionários da ETFSP, CEFET-SP e IFSP."
  />

  <div class="home-page__search">
    <SearchForm example="Ex.: Maria da Silva" />
    <div class="home-page__directory-links" aria-label="Consultar ex-alunos">
      <a href="/exalunos_lista">Ver todos os ex-alunos</a>
      <a href="/exalunos_lista?recentes=1">Ver cadastros recentes</a>
    </div>
  </div>

  <div class="home-page__actions" aria-label="Outras opções">
    <a class="button button--primary" href="/novocadastro">Cadastre-se</a>
    <a class="button button--secondary" href="/lista_foto">Ver fotos</a>
  </div>

  <p class="home-page__note">
    Site não oficial, mantido para facilitar o reencontro entre colegas.
  </p>
</section>

<style>
  .home-page {
    max-width: var(--content-reading);
  }

  .home-page__search {
    display: grid;
    gap: var(--space-4);
    padding: var(--space-6);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
  }

  .home-page__directory-links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .home-page__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-top: var(--space-6);
  }

  .home-page__note {
    margin: var(--space-6) 0 0;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
</style>
