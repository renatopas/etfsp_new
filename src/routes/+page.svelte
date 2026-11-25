<script lang="ts">
  import type { PageProps } from "./$types";
  import { COURSES, COURSE_CATALOG } from "$lib/domain";
  import Meta from "$lib/Meta.svelte";
  import AlumniCard from "$lib/components/AlumniCard.svelte";
  import SearchForm from "$lib/components/SearchForm.svelte";
  import { absoluteSiteUrl } from "$lib/site";

  let { data }: PageProps = $props();

  const number = new Intl.NumberFormat("pt-BR");
  const alumniLabel = $derived(
    `${number.format(data.stats.alumni)} ${
      data.stats.alumni === 1 ? "ex-aluno cadastrado" : "ex-alunos cadastrados"
    }`,
  );
  const photosLabel = $derived(
    `${number.format(data.stats.photos)} ${
      data.stats.photos === 1 ? "foto" : "fotos"
    }`,
  );
</script>

<Meta
  canonical={absoluteSiteUrl("/")}
  title="Ex-alunos da Escola Técnica Federal de São Paulo"
  description="Encontre colegas e participe do cadastro de ex-alunos da ETFSP, CEFET-SP e IFSP."
/>

<section class="home-hero" aria-labelledby="home-title">
  <div class="home-hero__intro">
    <h1 id="home-title">Encontre seus colegas da Federal de São Paulo</h1>
    <p class="home-hero__description">
      Este site reúne ex-alunos, professores e funcionários da ETFSP, CEFET-SP e
      IFSP.
    </p>
  </div>

  <div class="home-hero__search">
    <SearchForm example="Ex.: Maria da Silva" />
    <div class="home-hero__links" aria-label="Consultar ex-alunos">
      <a href="/exalunos_lista">Ver todos os ex-alunos</a>
      <a href="/exalunos_lista?recentes=1">Ver cadastros recentes</a>
    </div>
  </div>

  <div class="home-hero__extra">
    <p class="home-hero__stats">
      <span>{alumniLabel}</span>
      <span aria-hidden="true"> · </span>
      <span>{photosLabel}</span>
    </p>
    <div class="home-hero__actions" aria-label="Participar">
      <a class="button button--primary" href="/novocadastro">Cadastre-se</a>
      <a class="button button--secondary" href="/cadfoto">Enviar uma foto</a>
    </div>
  </div>
</section>

<section class="home-section" aria-labelledby="recent-alumni-title">
  <div class="home-section__heading">
    <h2 id="recent-alumni-title">Cadastros recentes</h2>
    {#if data.recentAlumni.length}
      <a href="/exalunos_lista">Ver todos os ex-alunos</a>
    {/if}
  </div>

  {#if data.recentAlumni.length}
    <ul class="alumni-grid">
      {#each data.recentAlumni as alumnus (alumnus.id)}
        <li><AlumniCard {alumnus} headingLevel={3} /></li>
      {/each}
    </ul>
  {:else}
    <p class="home-section__empty">
      Ainda não há cadastros.
      <a href="/novocadastro">Cadastre-se</a>
    </p>
  {/if}
</section>

<section class="home-section" aria-labelledby="courses-title">
  <h2 id="courses-title">Ex-alunos por curso</h2>
  <ul class="course-chips">
    {#each COURSES as course}
      <li>
        <a href={`/exalunos/curso/${COURSE_CATALOG[course].slug}`}>
          {COURSE_CATALOG[course].shortName}
        </a>
      </li>
    {/each}
  </ul>
</section>

<p class="home-note">
  Site não oficial, mantido para facilitar o reencontro entre colegas.
</p>

<style>
  .home-hero {
    display: grid;
    grid-template-areas: "intro" "search" "extra";
    gap: var(--space-6);
    align-items: start;
  }

  .home-hero__intro {
    grid-area: intro;
  }

  .home-hero__search {
    grid-area: search;
  }

  .home-hero__extra {
    grid-area: extra;
  }

  .home-hero__intro h1 {
    margin: 0;
  }

  .home-hero__description {
    margin: var(--space-3) 0 0;
    max-width: 36rem;
    color: var(--color-text-muted);
    font-size: var(--text-md);
  }

  .home-hero__stats {
    margin: 0;
    color: var(--color-heading);
    font-weight: 700;
  }

  .home-hero__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-top: var(--space-6);
  }

  .home-hero__search {
    display: grid;
    gap: var(--space-4);
    padding: var(--space-6);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
  }

  .home-hero__links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-4);
  }

  .home-section {
    margin-top: var(--space-12);
  }

  .home-section h2 {
    margin: 0;
  }

  .home-section__heading {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-2) var(--space-4);
  }

  .home-section__empty {
    margin: var(--space-4) 0 0;
    color: var(--color-text-muted);
  }

  .alumni-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));
    gap: var(--space-3);
    margin: var(--space-4) 0 0;
    padding: 0;
    list-style: none;
  }

  .alumni-grid li {
    min-width: 0;
    margin: 0;
  }

  .course-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin: var(--space-4) 0 0;
    padding: 0;
    list-style: none;
  }

  .course-chips li {
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
  }

  .course-chips a:hover {
    border-color: var(--color-primary);
    background: var(--color-primary-soft);
  }

  .home-note {
    margin: var(--space-12) 0 0;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  @media (min-width: 64rem) {
    .home-hero {
      grid-template-areas:
        "intro search"
        "extra search";
      grid-template-columns: minmax(0, 1fr) minmax(0, 28rem);
      column-gap: var(--space-12);
      row-gap: var(--space-4);
    }

    .home-hero__search {
      align-self: center;
    }
  }
</style>
