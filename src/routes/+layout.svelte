<script lang="ts">
  import { onMount } from "svelte";
  import "../app.css";
  import Footer from "$lib/Footer.svelte";
  import Header from "$lib/Header.svelte";

  let { children } = $props();
</script>

<svelte:document onload={() => (document.body.id = "sectionone")} />

<div id="layoutpage">
  <Header />
  {@render children()}
  <Footer />
</div>
