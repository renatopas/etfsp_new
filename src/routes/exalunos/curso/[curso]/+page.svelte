<script lang="ts">
  import type { PageProps } from "./$types";
  import AlumniDirectory from "../../../exalunos_lista/+page.svelte";

  let { data, params }: PageProps = $props();
</script>

<AlumniDirectory {data} {params} form={null} />
