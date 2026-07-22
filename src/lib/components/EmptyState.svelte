<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children?: Snippet;
    description?: string;
    title: string;
  }

  let { children, description, title }: Props = $props();
</script>

<section class="empty-state" aria-labelledby="empty-state-title">
  <h2 id="empty-state-title">{title}</h2>
  {#if description}
    <p>{description}</p>
  {/if}
  {#if children}
    <div class="empty-state__actions">{@render children()}</div>
  {/if}
</section>

<style>
  .empty-state {
    padding: var(--space-6) var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface-muted);
    text-align: center;
  }

  h2,
  p {
    margin: 0;
  }

  h2 {
    color: var(--color-heading);
    font-size: var(--text-xl);
  }

  p {
    margin-top: var(--space-2);
    color: var(--color-text-muted);
  }

  .empty-state__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    justify-content: center;
    margin-top: var(--space-4);
  }
</style>
