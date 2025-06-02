<script lang="ts">
  import PrettyDate from "$lib/PrettyDate.svelte";

  let { data } = $props();

  let homepage_url: URL | undefined = $state();
  if (data.HomePage) {
    try {
      homepage_url = new URL(data.HomePage);
    } catch (e) {
      try {
        homepage_url = new URL("https://" + data.HomePage);
      } catch (e) {}
    }
  }
</script>

<h1>Dados detalhados de ex-aluno</h1>
<p>
  {#if data.NomeMiniaturaPes}
    <a href="/lista_foto?idExAluno={data.ID}">
      <img
        src="Fotos/{data.NomeMiniaturaPes}"
        alt="Veja todas as {data.QtdFotos} fotos do ex-aluno"
      />
    </a>
    <br />
  {/if}

  <b>Nome</b>: {data.Nome}{data.Apelidos ? ` - ${data.Apelidos}` : ""}<br />

  <b>Curso</b>: {data.TipoCurso} <font color="#FF0000"> {data.Curso} </font>
  {data.AnoInicio} <b> a </b>
  {data.AnoTermino}

  <br /><b>Email</b>: <a href="mailto:{data.Email}">{data.Email}</a>

  <br /><b>HomePage</b>:
  {#if homepage_url}
    <a href={homepage_url.toString()} target="_blank">{data.HomePage}</a>
  {/if}

  {#if data.QtdFotos ?? 0 > 0}
    <br /><a href="/lista_foto?idExAluno={data.ID}"
      >Clique aqui para ver as {data.QtdFotos} fotos enviadas</a
    >
  {/if}

  <br /><b>ICQ #</b>: {data.ICQ}
  <br /><b>Outros dados: </b>{data.DadoPubl}
  <br /><b>Cadastro</b>:
  {#if data.DtCadastro}
    <PrettyDate date={Number(data.DtCadastro)} />
  {/if}
  <br /><b>Como nos encontrou</b>: {data.ComoEncontrou}{data.ComoEncontrouExtra
    ? ` - ${data.ComoEncontrouExtra}`
    : ""}
  <br /><b>Histórico</b>:
  <br />{data.Comentarios}
</p>
