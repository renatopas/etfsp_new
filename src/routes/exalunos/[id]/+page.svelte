<script lang="ts">
  import type { PageProps } from "./$types";
  import AlumniProfile from "../../detalhe_exaluno/+page.svelte";

  let { data }: PageProps = $props();
</script>

<AlumniProfile {data} />
