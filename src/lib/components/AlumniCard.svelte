<script lang="ts">
  import type { AlumniListItem } from "$lib/domain";

  interface Props {
    alumnus: AlumniListItem;
  }

  let { alumnus }: Props = $props();

  const detailHref = $derived(`/detalhe_exaluno?id=${alumnus.id}`);
  const period = $derived(
    alumnus.startYear && alumnus.endYear
      ? `${alumnus.startYear}–${alumnus.endYear}`
      : (alumnus.startYear?.toString() ?? alumnus.endYear?.toString()),
  );
</script>

<article class="alumni-card">
  {#if alumnus.thumbnail}
    <a class="alumni-card__photo" href={detailHref}>
      <img
        src={`/Fotos/${encodeURIComponent(alumnus.thumbnail)}`}
        alt={`Foto pessoal de ${alumnus.name}`}
        width="112"
        height="112"
        loading="lazy"
      />
    </a>
  {:else}
    <div class="alumni-card__placeholder" aria-hidden="true">ETFSP</div>
  {/if}

  <div class="alumni-card__content">
    <h2><a href={detailHref}>{alumnus.name}</a></h2>
    {#if alumnus.nickname}
      <p class="alumni-card__nickname">{alumnus.nickname}</p>
    {/if}
    {#if alumnus.course || period}
      <p class="alumni-card__details">
        {[alumnus.course, period].filter(Boolean).join(" · ")}
      </p>
    {/if}
  </div>
</article>

<style>
  .alumni-card {
    display: grid;
    grid-template-columns: 3.5rem minmax(0, 1fr);
    gap: var(--space-2);
    align-items: start;
    min-width: 0;
    padding: var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    box-shadow: var(--shadow-sm);
  }

  .alumni-card__photo,
  .alumni-card__placeholder {
    display: grid;
    width: 3.5rem;
    height: 3.5rem;
    place-items: center;
    overflow: hidden;
    border-radius: var(--radius-sm);
    background: var(--color-surface-muted);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .alumni-card__placeholder {
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-weight: 700;
  }

  .alumni-card__content {
    min-width: 0;
  }

  :global(#mainbody2) .alumni-card h2 {
    margin: 0;
    color: var(--color-heading);
    font-size: var(--text-base);
    line-height: var(--leading-tight);
  }

  h2 a {
    color: inherit;
    text-decoration-thickness: 0.08em;
    text-underline-offset: 0.14em;
  }

  p {
    margin: var(--space-1) 0 0;
  }

  .alumni-card__nickname,
  .alumni-card__details {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
</style>
