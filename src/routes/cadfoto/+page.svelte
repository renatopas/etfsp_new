<script lang="ts">
  import Meta from "$lib/Meta.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Formulario from "./Formulario.svelte";
  import Sucesso from "./Sucesso.svelte";
  import { absoluteSiteUrl } from "$lib/site";
  let { form } = $props();
</script>

<Meta
  canonical={absoluteSiteUrl("/cadfoto")}
  title="Enviar uma foto"
  description="Envie uma foto para o acervo de ex-alunos."
  robots="noindex,follow"
/>{#if form?.success && form.nome && form.id}<Sucesso
    nome={form.nome}
    id={form.id}
  />{:else}<PageHeader
    title="Enviar uma foto"
    description="Escolha o ex-aluno, selecione uma imagem e preencha as informações."
  /><Formulario {form} />{/if}
