<script lang="ts">
  let { nome, id }: { nome: string; id: number } = $props();
</script>

<section class="success">
  <h1>Foto enviada</h1>
  <p>A foto associada a {nome} foi recebida.</p>
  <div>
    <a class="button button--primary" href={`/lista_foto?idExAluno=${id}`}
      >Ver fotos de {nome}</a
    ><a class="button button--secondary" href="/cadfoto">Enviar outra foto</a>
  </div>
</section>

<style>
  .success {
    max-width: var(--content-reading);
    padding: var(--space-6);
    background: var(--color-success-surface);
    border-radius: var(--radius-md);
    color: var(--color-success);
  }
  .success h1,
  .success p {
    margin-top: 0;
  }
  .success div {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
</style>
