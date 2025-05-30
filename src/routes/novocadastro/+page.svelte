<script lang="ts">
  import Meta from "$lib/Meta.svelte";
  import Formulario from "./Formulario.svelte";
  import Sucesso from "./Sucesso.svelte";

  let { form } = $props();
</script>

<Meta
  title="Cadastro - Ex-alunos da Escola Tecnica / Instituto Federal de Sao Paulo - IFSP / ETFSP / CEFET-SP"
  description=""
/>

{#if form?.success === true}
  <Sucesso {...form?.data} />
{:else}
  <h1>Cadastre-se</h1>
  <p>
    Basta preencher o formulário abaixo. O sigilo dos seus dados é garantido
    <br />
    <strong>DIVULGUE </strong>para seus amigos! É nossa melhor propaganda!
  </p>
  {#if form?.success === false}
    <strong>Erro de validação no fomulário: {form.reason}</strong>
  {/if}
  <Formulario />
{/if}
