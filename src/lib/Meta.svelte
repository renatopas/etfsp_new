<script lang="ts">
  interface Props {
    canonical: string;
    description: string;
    title: string;
    image?: string | undefined;
    robots?: "noindex,follow" | undefined;
    type?: "profile" | "website";
  }

  let {
    canonical,
    description,
    title,
    image = undefined,
    robots = undefined,
    type = "website",
  }: Props = $props();
</script>

<svelte:head>
  <link rel="canonical" href={canonical} />
  <meta name="description" content={description} />
  {#if robots}<meta name="robots" content={robots} />{/if}
  <meta name="twitter:description" content={description} />
  <meta property="og:description" content={description} />
  <meta name="twitter:title" content={title} />
  <meta property="og:title" content={title} />
  <meta property="og:type" content={type} />
  <meta property="og:url" content={canonical} />
  <title>{title}</title>
  {#if image}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content={image} />
    <meta property="og:image" content={image} />
  {:else}
    <meta name="twitter:card" content="summary" />
  {/if}
</svelte:head>
