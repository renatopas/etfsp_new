<script lang="ts">
  import Formulario from "./Formulario.svelte";
  import Sucesso from "./Sucesso.svelte";

  let { form } = $props();
</script>

{#if !form}
  <Formulario />
{:else if form.success}
  <Sucesso nome={form.nome} id={form.id} />
{:else}
  <h1 style="color: red;">ERRO: {form.reason}</h1>
  <Formulario />
{/if}
