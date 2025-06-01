<script lang="ts">
  interface Props {
    nome: string;
    id: number;
  }

  let { nome, id }: Props = $props();
</script>

<h1 style="color: green; font-size: x-large;">Sucesso!</h1>
<p>Foto enviada com sucesso.</p>
<p>
  Clique <a href="/lista_foto?idExAluno={id}">aqui</a> para ver todas as fotos enviadas
  por você.
</p>
<p>
  Clique <a href="/lista_foto">aqui</a> para ver as fotos enviadas por outros alunos.
</p>
