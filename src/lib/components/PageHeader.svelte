<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    title: string;
    description?: string;
    children?: Snippet;
  }

  let { title, description, children }: Props = $props();
</script>

<header class="page-header">
  <div>
    <h1>{title}</h1>
    {#if description}
      <p>{description}</p>
    {/if}
  </div>
  {#if children}
    <div class="page-header__action">
      {@render children()}
    </div>
  {/if}
</header>

<style>
  .page-header {
    display: flex;
    flex-wrap: wrap;
    align-items: start;
    justify-content: space-between;
    gap: var(--space-4);
    max-width: var(--content-reading);
    margin-bottom: var(--space-6);
  }

  h1 {
    margin: 0;
    color: var(--color-heading);
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    line-height: var(--leading-tight);
  }

  p {
    margin: var(--space-3) 0 0;
    color: var(--color-text-muted);
    font-size: var(--text-md);
  }

  .page-header__action {
    flex: 0 0 auto;
  }
</style>
