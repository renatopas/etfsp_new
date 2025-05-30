<script lang="ts">
  import { onMount } from "svelte";
  import type { PageProps } from "./$types";

  let search: string | null = $state(null);

  let { data }: PageProps = $props();

  onMount(() => {
    search = new URL(document.location.toString()).searchParams.get("busca");
  });
</script>

<h1>Relação de Ex-alunos</h1>
<p></p>
<form action="exalunos_lista">
  <input type="text" name="busca" size="20" value={search} />
  <input name="B1" type="submit" class="formbutton" value="Outra busca" />
  <input type="hidden" name="Titulo" value="Busca" />
  <font size="2"><i>Ex: "Maria", "Ricardo PRD", "ELO 1997"</i></font>
</form>
<p>Clique no nome para mais detalhes</p>
<table class="tablelist" style="border: 2px solid black; border-spacing: 0;">
  <thead>
    <tr>
      <th>Nome</th>
      <th>Curso</th>
      <th>Período</th>
      <th>Fotos</th>
    </tr>
  </thead>
  <tbody>
    {#each data.alunos as aluno}
      <tr>
        <td>
          <a href="detalhe_exaluno?id={aluno.ID}">
            {aluno.Nome}{aluno.Apelidos ? " - " + aluno.Apelidos : ""}
          </a>
        </td>
        <td>
          {aluno.Curso}
        </td>
        <td>
          {aluno.Periodo}
        </td>
        <td> fotos! </td>
      </tr>
    {/each}
  </tbody>
</table>
