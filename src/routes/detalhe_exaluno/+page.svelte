<script lang="ts">
  import {
    COURSE_CATALOG,
    isCourse,
    type PublicAlumniProfile,
  } from "$lib/domain";
  import { initials } from "$lib/initials";
  import Meta from "$lib/Meta.svelte";
  import SocialIcon from "$lib/components/SocialIcon.svelte";
  import { absoluteSiteUrl } from "$lib/site";

  interface Props {
    data: PublicAlumniProfile;
  }

  let { data }: Props = $props();

  const canonical = $derived(absoluteSiteUrl(`/exalunos/${data.id}`));
  const profileImage = $derived(
    data.thumbnail
      ? absoluteSiteUrl(`/Fotos/${encodeURIComponent(data.thumbnail)}`)
      : undefined,
  );
  const structuredData = $derived({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: canonical,
    mainEntity: {
      "@type": "Person",
      name: data.name,
      url: canonical,
      ...(profileImage ? { image: profileImage } : {}),
    },
  });
  const structuredDataMarkup = $derived(
    JSON.stringify(structuredData).replace(
      /[<>&\u2028\u2029]/g,
      (character) =>
        ({
          "<": "\\u003c",
          ">": "\\u003e",
          "&": "\\u0026",
          "\u2028": "\\u2028",
          "\u2029": "\\u2029",
        })[character] as string,
    ),
  );

  const period = $derived(
    data.startYear && data.endYear
      ? `${data.startYear}–${data.endYear}`
      : (data.startYear?.toString() ?? data.endYear?.toString()),
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

  const courseName = $derived(
    data.course && isCourse(data.course)
      ? COURSE_CATALOG[data.course].name
      : data.course,
  );

  type ContactNetwork =
    | "email"
    | "phone"
    | "whatsapp"
    | "website"
    | "instagram"
    | "facebook"
    | "linkedin";

  interface Contact {
    network: ContactNetwork;
    label: string;
    href: string;
    newWindowLabel?: string;
  }

  function hostname(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "Página pessoal";
    }
  }

  const contacts = $derived.by(() => {
    const list: Contact[] = [];
    if (data.email) {
      list.push({
        network: "email",
        label: data.email,
        href: `mailto:${data.email}`,
      });
    }
    if (data.phone) {
      list.push({
        network: "phone",
        label: data.phone,
        href: `tel:${data.phone}`,
      });
    }
    if (data.whatsapp && data.whatsappUrl) {
      list.push({
        network: "whatsapp",
        label: data.whatsapp,
        href: data.whatsappUrl,
        newWindowLabel: `Abrir WhatsApp de ${data.name} em nova janela`,
      });
    }
    if (data.homepage) {
      list.push({
        network: "website",
        label: hostname(data.homepage),
        href: data.homepage,
      });
    }
    for (const [network, label] of [
      ["instagram", "Instagram"],
      ["facebook", "Facebook"],
      ["linkedin", "LinkedIn"],
    ] as const) {
      const href = data[network];
      if (href) {
        list.push({
          network,
          label,
          href,
          newWindowLabel: `Abrir ${label} de ${data.name} em nova janela`,
        });
      }
    }
    return list;
  });
</script>

<Meta
  {canonical}
  title={`${data.name} — Ex-alunos ETFSP / IFSP`}
  description={`Perfil público de ${data.name}, ex-aluno da ETFSP, CEFET-SP ou IFSP.`}
  image={profileImage}
  type="profile"
/>

<svelte:head>
  <svelte:element this={"script"} type="application/ld+json">
    {structuredDataMarkup}
  </svelte:element>
</svelte:head>

<a class="back-link" href="/exalunos_lista">← Voltar à relação de ex-alunos</a>

<article class="profile">
  <header class="profile__header">
    {#if data.thumbnail}
      <a class="profile__photo" href={`/lista_foto?idExAluno=${data.id}`}>
        <img
          src={`/Fotos/${encodeURIComponent(data.thumbnail)}`}
          alt={`Foto pessoal de ${data.name}`}
          width="176"
          height="176"
        />
      </a>
    {:else}
      <div class="profile__photo profile__avatar" aria-hidden="true">
        {initials(data.name)}
      </div>
    {/if}

    <div class="profile__identity">
      <h1>{data.name}</h1>
      {#if data.nickname}
        <p class="profile__nickname">
          Também conhecido(a) como {data.nickname}.
        </p>
      {/if}
      {#if courseName || period}
        <dl class="profile__facts">
          {#if courseName}
            <div>
              <dt>Curso</dt>
              <dd>{courseName}</dd>
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
      {#if data.photoCount > 0}
        <a
          class="button button--secondary profile__photos"
          href={`/lista_foto?idExAluno=${data.id}`}
        >
          Ver {data.photoCount}
          {data.photoCount === 1 ? "foto enviada" : "fotos enviadas"}
        </a>
      {/if}
    </div>
  </header>

  {#if contacts.length || data.icq || hasAbout}
    <div class="profile__body">
      {#if contacts.length || data.icq}
        <section class="profile__section" aria-labelledby="contact-title">
          <h2 id="contact-title">Contato</h2>
          {#if contacts.length}
            <ul class="contact-list">
              {#each contacts as contact}
                <li>
                  <a
                    class="contact-button"
                    href={contact.href}
                    target={contact.newWindowLabel ? "_blank" : undefined}
                    rel={contact.newWindowLabel
                      ? "noopener noreferrer"
                      : undefined}
                    aria-label={contact.newWindowLabel}
                  >
                    <SocialIcon network={contact.network} />
                    <span>{contact.label}</span>
                  </a>
                </li>
              {/each}
            </ul>
          {/if}
          {#if data.icq}
            <p class="profile__icq">ICQ: {data.icq}</p>
          {/if}
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
    </div>
  {/if}

  {#if registeredDate}
    <p class="profile__registration">
      Cadastro em <time datetime={registeredDate.dateTime}
        >{registeredDate.label}</time
      >.
    </p>
  {/if}
</article>

<style>
  .back-link {
    display: inline-flex;
    min-height: var(--control-min-height);
    align-items: center;
    font-weight: 700;
  }

  .profile {
    margin-top: var(--space-2);
  }

  .profile__header {
    display: grid;
    gap: var(--space-4) var(--space-6);
    align-items: start;
    padding: var(--space-6);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    box-shadow: var(--shadow-sm);
  }

  .profile__photo {
    display: block;
    width: 7rem;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: var(--radius-md);
    background: var(--color-surface-muted);
  }

  .profile__photo img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .profile__avatar {
    display: grid;
    place-items: center;
    background: var(--color-primary-soft);
    color: var(--color-primary);
    font-family: var(--font-serif);
    font-size: 2.25rem;
    font-weight: 600;
  }

  .profile__identity h1 {
    margin: 0;
  }

  .profile__nickname {
    margin: var(--space-2) 0 0;
    color: var(--color-text-muted);
    font-size: var(--text-md);
  }

  .profile__facts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3) var(--space-8);
    margin: var(--space-4) 0 0;
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
    font-size: var(--text-md);
  }

  .profile__photos {
    margin-top: var(--space-6);
  }

  .profile__body {
    display: grid;
    gap: var(--space-8);
    margin-top: var(--space-8);
  }

  .profile__section h2 {
    margin: 0 0 var(--space-4);
    color: var(--color-heading);
    font-size: var(--text-lg);
  }

  .contact-list {
    display: grid;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .contact-list li {
    min-width: 0;
    margin: 0;
  }

  .contact-button {
    display: flex;
    min-height: var(--control-min-height);
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    color: var(--color-primary);
    text-decoration: none;
    transition:
      background-color 150ms ease,
      border-color 150ms ease;
  }

  .contact-button span {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .contact-button:hover {
    border-color: var(--color-primary);
    background: var(--color-primary-soft);
  }

  .profile__icq {
    margin: var(--space-3) 0 0;
    color: var(--color-text-muted);
  }

  .profile__text {
    max-width: var(--content-reading);
  }

  .profile__text + .profile__text {
    margin-top: var(--space-6);
  }

  .profile__text h3 {
    margin: 0;
    color: var(--color-heading);
    font-size: var(--text-base);
  }

  .profile__text p {
    margin: var(--space-2) 0 0;
    white-space: pre-line;
  }

  .profile__registration {
    margin: var(--space-8) 0 0;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  @media (min-width: 36rem) {
    .profile__header {
      grid-template-columns: 11rem minmax(0, 1fr);
    }

    .profile__photo {
      width: 11rem;
    }

    .profile__avatar {
      font-size: 3rem;
    }
  }

  @media (min-width: 56rem) {
    .profile__body {
      grid-template-columns: minmax(0, 20rem) minmax(0, 1fr);
      align-items: start;
    }
  }
</style>
