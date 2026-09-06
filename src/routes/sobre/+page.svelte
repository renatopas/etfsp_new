<script lang="ts">
  import Meta from "$lib/Meta.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import { absoluteSiteUrl } from "$lib/site";
  import { APP_VERSION } from "$lib/version";
</script>

<Meta
  canonical={absoluteSiteUrl("/sobre")}
  title="Sobre o site — ETFSP.com"
  description="Conheça a finalidade do ETFSP.com, uma iniciativa não oficial voltada a ex-alunos da ETFSP, CEFET-SP e IFSP."
/>

<article class="about-page">
  <PageHeader
    title="Sobre o site"
    description="Uma iniciativa para preservar histórias e facilitar o reencontro de antigos colegas."
  />

  <p>
    O ETFSP.com é um site não oficial voltado a ex-alunos da ETFSP, CEFET-SP e
    IFSP. Seu objetivo é facilitar o reencontro de colegas e preservar parte da
    memória da escola por meio dos perfis e do acervo de fotos publicados.
  </p>

  <section aria-labelledby="responsavel">
    <h2 id="responsavel">Responsável</h2>
    <p>
      O site é mantido por Renato Paschoalinoto. Para entrar em contato, envie
      uma mensagem para
      <a href="mailto:renato@etfsp.com">renato@etfsp.com</a>.
    </p>
  </section>

  <section aria-labelledby="privacidade">
    <h2 id="privacidade">Privacidade</h2>
    <p>
      Consulte a <a href="/politica-de-privacidade">Política de Privacidade</a>
      para saber como os dados e as fotos enviados ao site são utilizados e publicados.
    </p>
  </section>

  <p class="about-page__version">Versão {APP_VERSION}</p>
</article>

<style>
  .about-page {
    max-width: var(--content-reading);
  }

  .about-page section {
    margin-top: var(--space-8);
  }

  .about-page h2 {
    margin: 0 0 var(--space-3);
    color: var(--color-heading);
    font-family: var(--font-serif);
    font-size: var(--text-lg);
    line-height: var(--leading-tight);
  }

  .about-page p {
    margin-block: 0 var(--space-4);
  }

  .about-page__version {
    margin-top: var(--space-8);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
</style>
