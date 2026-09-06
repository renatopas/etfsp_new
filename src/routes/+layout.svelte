<script lang="ts">
  import { env } from "$env/dynamic/public";
  import { onMount } from "svelte";
  import "../app.css";
  import Footer from "../lib/Footer.svelte";
  import Header from "../lib/Header.svelte";
  import PageContainer from "../lib/components/PageContainer.svelte";

  const UMAMI_TRACKER_ID = "umami-tracker";

  let { children } = $props();

  onMount(() => {
    const umamiUrl = env.PUBLIC_UMAMI_URL?.replace(/\/+$/, "");
    const umamiWebsiteId = env.PUBLIC_UMAMI_WEBSITE_ID;

    if (
      !umamiUrl ||
      !umamiWebsiteId ||
      document.getElementById(UMAMI_TRACKER_ID)
    ) {
      return;
    }

    const tracker = document.createElement("script");
    tracker.id = UMAMI_TRACKER_ID;
    tracker.defer = true;
    tracker.src = `${umamiUrl}/script.js`;
    tracker.dataset.websiteId = umamiWebsiteId;
    tracker.dataset.domains = "etfsp.com,www.etfsp.com,etfsp.juliapixel.com";
    tracker.dataset.excludeSearch = "true";
    tracker.dataset.doNotTrack = "true";
    document.head.appendChild(tracker);

    return () => tracker.remove();
  });
</script>

<svelte:head>
  <link rel="icon" type="image/png" href="/favicon.png" />
</svelte:head>

<a class="skip-link" href="#conteudo-principal">Ir para o conteúdo</a>

<div class="site-shell">
  <Header />
  <main id="conteudo-principal" class="site-main" tabindex="-1">
    <PageContainer>
      <div id="mainbody2">
        {@render children()}
      </div>
    </PageContainer>
  </main>
  <Footer />
</div>
