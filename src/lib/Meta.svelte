<script lang="ts">
  import { absoluteSiteUrl } from "$lib/site";

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

  const DEFAULT_IMAGE = {
    url: absoluteSiteUrl("/images/og-etfsp.png"),
    width: "1200",
    height: "630",
    alt: "Ex-alunos da Escola Técnica Federal de São Paulo",
  };
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
  <meta name="twitter:card" content="summary_large_image" />
  {#if image}
    <meta name="twitter:image" content={image} />
    <meta property="og:image" content={image} />
  {:else}
    <meta name="twitter:image" content={DEFAULT_IMAGE.url} />
    <meta name="twitter:image:alt" content={DEFAULT_IMAGE.alt} />
    <meta property="og:image" content={DEFAULT_IMAGE.url} />
    <meta property="og:image:width" content={DEFAULT_IMAGE.width} />
    <meta property="og:image:height" content={DEFAULT_IMAGE.height} />
    <meta property="og:image:alt" content={DEFAULT_IMAGE.alt} />
  {/if}
</svelte:head>
