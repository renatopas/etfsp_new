<script lang="ts">
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<div id="mainbody2">
  <h1 style="align: center;">
    <font color="#008000" size="6">Cadastro com sucesso !!!</font>
  </h1>
  <p>
    <b><big><a href="cadfoto">Clique aqui</a> para enviar fotos</big></b>
  </p>

  <p>
    <b>
      <big>
        <a
          href="exalunos_lista?Titulo=Colegas do curso e ano&busca={data.Curso} {data.AnoInicio}"
        >
          Clique aqui
        </a> para buscar colegas do seu ano e curso
      </big>
    </b>
  </p>

  <p>
    <b>
      <big>
        <a href="lista_foto?curso={data.Curso}">Clique aqui</a> para buscar fotos
        do seu curso
      </big>
    </b>
  </p>

  <p>
    <b>
      <big>
        Clique em
        <a href="http://br.groups.yahoo.com/group/ExETFSP" target="_blank">
          http://br.groups.yahoo.com/group/ExETFSP
        </a>
        &nbsp;para ver as mensagens mais recentes da lista de bate-papo.
      </big>
    </b>
  </p>
</div>
