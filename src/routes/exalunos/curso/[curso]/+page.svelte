<script lang="ts">
  import type { PageProps } from "./$types";
  import AlumniDirectory from "../../../exalunos_lista/+page.svelte";

  let { data }: PageProps = $props();
</script>

<AlumniDirectory {data} form={null} />
