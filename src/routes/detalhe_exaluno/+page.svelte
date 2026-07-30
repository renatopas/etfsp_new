<script lang="ts">
  import type { PageProps } from "./$types";
  import Meta from "$lib/Meta.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import SocialIcon from "$lib/components/SocialIcon.svelte";

  let { data }: PageProps = $props();

  const period = $derived(
    data.startYear && data.endYear
      ? `${data.startYear}–${data.endYear}`
      : (data.startYear?.toString() ?? data.endYear?.toString()),
  );
  const hasContact = $derived(
    Boolean(
      data.email ||
        data.phone ||
        data.homepage ||
        data.instagram ||
        data.facebook ||
        data.linkedin ||
        data.icq,
    ),
  );
  const hasAbout = $derived(Boolean(data.publicInfo || data.comments));
  const registeredDate = $derived(
    data.registeredAt
      ? {
          dateTime: new Date(data.registeredAt).toISOString(),
          label: new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "long",
          }).format(new Date(data.registeredAt)),
        }
      : undefined,
  );
</script>

<Meta
  title={`${data.name} — Ex-alunos ETFSP`}
  description={`Perfil público de ${data.name}, ex-aluno da ETFSP.`}
/>

<a class="back-link" href="/exalunos_lista">← Voltar à relação de ex-alunos</a>

<PageHeader title={data.name}>
  {#snippet children()}
    {#if data.nickname}
      <p>Também conhecido(a) como {data.nickname}.</p>
    {/if}
  {/snippet}
</PageHeader>

<article class="profile">
  <section class="profile__summary" aria-label="Resumo do perfil">
    {#if data.thumbnail}
      <a class="profile__photo" href={`/lista_foto?idExAluno=${data.id}`}>
        <img
          src={`/Fotos/${encodeURIComponent(data.thumbnail)}`}
          alt={`Foto pessoal de ${data.name}`}
          width="176"
          height="176"
        />
      </a>
    {/if}

    {#if data.course || period}
      <dl class="profile__facts">
        {#if data.course}
          <div>
            <dt>Curso</dt>
            <dd>{data.course}</dd>
          </div>
        {/if}
        {#if period}
          <div>
            <dt>Período</dt>
            <dd>{period}</dd>
          </div>
        {/if}
      </dl>
    {/if}
  </section>

  {#if hasContact}
    <section class="profile__section" aria-labelledby="contact-title">
      <h2 id="contact-title">Contato</h2>
      <dl class="profile__facts">
        {#if data.email}
          <div>
            <dt>E-mail</dt>
            <dd><a href={`mailto:${data.email}`}>{data.email}</a></dd>
          </div>
        {/if}
        {#if data.phone}
          <div>
            <dt>Telefone</dt>
            <dd><a href={`tel:${data.phone}`}>{data.phone}</a></dd>
          </div>
        {/if}
        {#if data.homepage}
          <div>
            <dt>Página pessoal</dt>
            <dd><a href={data.homepage}>{data.homepage}</a></dd>
          </div>
        {/if}
        {#if data.instagram}
          <div>
            <dt>Instagram</dt>
            <dd>
              <a
                class="social-link"
                href={data.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Abrir Instagram de ${data.name} em nova janela`}
              >
                <SocialIcon network="instagram" />
                <span>Instagram</span>
              </a>
            </dd>
          </div>
        {/if}
        {#if data.facebook}
          <div>
            <dt>Facebook</dt>
            <dd>
              <a
                class="social-link"
                href={data.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Abrir Facebook de ${data.name} em nova janela`}
              >
                <SocialIcon network="facebook" />
                <span>Facebook</span>
              </a>
            </dd>
          </div>
        {/if}
        {#if data.linkedin}
          <div>
            <dt>LinkedIn</dt>
            <dd>
              <a
                class="social-link"
                href={data.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Abrir LinkedIn de ${data.name} em nova janela`}
              >
                <SocialIcon network="linkedin" />
                <span>LinkedIn</span>
              </a>
            </dd>
          </div>
        {/if}
        {#if data.icq}
          <div>
            <dt>ICQ</dt>
            <dd>{data.icq}</dd>
          </div>
        {/if}
      </dl>
    </section>
  {/if}

  {#if hasAbout}
    <section class="profile__section" aria-labelledby="about-title">
      <h2 id="about-title">Sobre</h2>
      {#if data.publicInfo}
        <div class="profile__text">
          <h3>Outras informações</h3>
          <p>{data.publicInfo}</p>
        </div>
      {/if}
      {#if data.comments}
        <div class="profile__text">
          <h3>Histórico</h3>
          <p>{data.comments}</p>
        </div>
      {/if}
    </section>
  {/if}

  {#if registeredDate}
    <p class="profile__registration">
      Cadastro em <time datetime={registeredDate.dateTime}
        >{registeredDate.label}</time
      >.
    </p>
  {/if}

  {#if data.photoCount > 0}
    <a
      class="button button--secondary"
      href={`/lista_foto?idExAluno=${data.id}`}
    >
      Ver {data.photoCount}
      {data.photoCount === 1 ? "foto enviada" : "fotos enviadas"}
    </a>
  {/if}
</article>

<style>
  .back-link {
    display: inline-block;
    margin-bottom: var(--space-5);
    font-weight: 700;
  }

  .profile {
    max-width: var(--content-max-readable);
    margin: var(--space-6) auto 0;
  }

  .profile__summary {
    display: grid;
    gap: var(--space-5);
    align-items: start;
    padding: var(--space-5);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    box-shadow: var(--shadow-sm);
  }

  .profile__photo {
    display: block;
    width: min(11rem, 100%);
    overflow: hidden;
    border-radius: var(--radius-sm);
  }

  img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    object-fit: cover;
  }

  .profile__section {
    margin-top: var(--space-7);
  }

  h2 {
    margin: 0 0 var(--space-4);
    color: var(--color-heading);
    font-size: var(--text-xl);
  }

  h3 {
    margin: 0;
    color: var(--color-heading);
    font-size: var(--text-base);
  }

  .profile__facts {
    display: grid;
    gap: var(--space-3);
    margin: 0;
  }

  .profile__facts div {
    display: grid;
    gap: var(--space-1);
  }

  dt {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    font-weight: 700;
  }

  dd {
    margin: 0;
  }

  .social-link {
    display: inline-flex;
    gap: var(--space-2);
    align-items: center;
  }

  .profile__text + .profile__text {
    margin-top: var(--space-5);
  }

  .profile__text p {
    margin: var(--space-2) 0 0;
    white-space: pre-line;
  }

  .profile__registration {
    margin: var(--space-7) 0 var(--space-4);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  @media (min-width: 36rem) {
    .profile__summary {
      grid-template-columns: minmax(0, 11rem) minmax(0, 1fr);
    }
  }
</style>
