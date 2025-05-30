<script lang="ts">
  export interface Props {
    Curso: string;
    AnoInicio: number;
  }

  const { Curso, AnoInicio }: Props = $props();
</script>

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
        href="exalunos_lista?Titulo=Colegas do curso e ano&busca={Curso} {AnoInicio}"
      >
        Clique aqui
      </a> para buscar colegas do seu ano e curso
    </big>
  </b>
</p>

<p>
  <b>
    <big>
      <a href="lista_foto?curso={Curso}">Clique aqui</a> para buscar fotos do seu
      curso
    </big>
  </b>
</p>
