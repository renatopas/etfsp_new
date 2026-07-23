<script lang="ts">
  import Meta from "$lib/Meta.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Formulario from "./Formulario.svelte";
  import Sucesso from "./Sucesso.svelte";
  let { form } = $props();
</script>

<Meta
  title="Cadastre-se"
  description="Cadastre-se na relação de ex-alunos da ETFSP."
/>
{#if form?.success && form.data?.course && form.data?.startYear}
  <Sucesso
    course={form.data?.course ?? ""}
    startYear={form.data?.startYear ?? 0}
  />
{:else}
  <PageHeader
    title="Cadastre-se"
    description="Preencha seus dados em uma única página. Os campos obrigatórios aparecem primeiro."
  />
  <Formulario {form} />
{/if}
