<script lang="ts">
  let { course, startYear }: { course: string; startYear: number } = $props();
</script>

<section class="success">
  <h1>Cadastro recebido</h1>
  <p>Registramos seu cadastro para {course}, com ingresso em {startYear}.</p>
  <div>
    <a class="button button--primary" href="/exalunos">Ver ex-alunos</a><a
      class="button button--secondary"
      href="/cadfoto">Enviar uma foto</a
    >
  </div>
</section>

<style>
  .success {
    max-width: var(--content-reading);
    padding: var(--space-6);
    border-radius: var(--radius-md);
    background: var(--color-success-surface);
    color: var(--color-success);
  }
  .success h1,
  .success p {
    margin-top: 0;
  }
  .success div {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-top: var(--space-4);
  }
</style>
