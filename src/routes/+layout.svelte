<script lang="ts">
  import "../app.css";
  import Footer from "../lib/Footer.svelte";
  import Header from "../lib/Header.svelte";
  import PageContainer from "../lib/components/PageContainer.svelte";

  let { children } = $props();
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
