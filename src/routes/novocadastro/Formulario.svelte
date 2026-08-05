<script lang="ts">
  import { enhance } from "$app/forms";
  import Turnstile from "$lib/Turnstile.svelte";
  import Button from "$lib/components/Button.svelte";
  import { COURSES } from "$lib/domain";

  let {
    form,
  }: {
    form?: {
      success?: boolean;
      errors?: Record<string, string>;
      values?: Record<string, string>;
    } | null;
  } = $props();

  let submitting = $state(false);
  let values = $derived(form?.values ?? {});
  const error = (name: string) => form?.errors?.[name];
</script>

{#if form?.errors?.form}
  <div class="notice notice--error" role="alert">{form.errors.form}</div>
{/if}

{#if form?.errors && Object.keys(form.errors).some((name) => name !== "form")}
  <div class="notice notice--error" tabindex="-1" role="alert">
    <strong>Revise os campos indicados.</strong>
    <ul>
      {#each Object.entries(form.errors).filter(([name]) => name !== "form") as [name, message]}
        <li><a href={`#${name}`}>{message}</a></li>
      {/each}
    </ul>
  </div>
{/if}

<div class="form-intro">
  <p>Todos os dados informados serão publicados no seu perfil.</p>
  <p>(*) Campo obrigatório.</p>
</div>

<form
  method="POST"
  use:enhance={() => {
    submitting = true;
    return async ({ update }) => {
      await update({ reset: false });
      submitting = false;
    };
  }}
>
  <fieldset>
    <legend>Dados principais</legend>

    <div class="field">
      <label for="Nome">Nome completo (*)</label>
      <input
        id="Nome"
        name="Nome"
        value={values.Nome ?? ""}
        autocomplete="name"
        required
        minlength="5"
        maxlength="120"
        aria-invalid={Boolean(error("Nome"))}
        aria-describedby={error("Nome") ? "Nome-error" : undefined}
      />
      {#if error("Nome")}
        <p id="Nome-error" class="field-error">{error("Nome")}</p>
      {/if}
    </div>

    <div class="field">
      <label for="Apelidos">Apelido</label>
      <input
        id="Apelidos"
        name="Apelidos"
        value={values.Apelidos ?? ""}
        maxlength="80"
        aria-invalid={Boolean(error("Apelidos"))}
        aria-describedby={error("Apelidos") ? "Apelidos-error" : undefined}
      />
      {#if error("Apelidos")}
        <p id="Apelidos-error" class="field-error">{error("Apelidos")}</p>
      {/if}
    </div>

    <div class="field">
      <label for="Curso">Curso (*)</label>
      <select
        id="Curso"
        name="Curso"
        required
        value={values.Curso ?? ""}
        aria-invalid={Boolean(error("Curso"))}
        aria-describedby={error("Curso") ? "Curso-error" : undefined}
      >
        <option value="">Selecione</option>
        {#each COURSES as course}
          <option value={course}>{course}</option>
        {/each}
      </select>
      {#if error("Curso")}
        <p id="Curso-error" class="field-error">{error("Curso")}</p>
      {/if}
    </div>

    <div class="field-grid">
      <div class="field">
        <label for="AnoInicio">Ano em que entrou (*)</label>
        <input
          id="AnoInicio"
          name="AnoInicio"
          value={values.AnoInicio ?? ""}
          type="number"
          inputmode="numeric"
          min="1909"
          max="2100"
          step="1"
          required
          aria-invalid={Boolean(error("AnoInicio"))}
          aria-describedby={error("AnoInicio") ? "AnoInicio-error" : undefined}
        />
        {#if error("AnoInicio")}
          <p id="AnoInicio-error" class="field-error">{error("AnoInicio")}</p>
        {/if}
      </div>

      <div class="field">
        <label for="AnoTermino">Ano em que saiu (*)</label>
        <input
          id="AnoTermino"
          name="AnoTermino"
          value={values.AnoTermino ?? ""}
          type="number"
          inputmode="numeric"
          min="1909"
          max="2100"
          step="1"
          required
          aria-invalid={Boolean(error("AnoTermino"))}
          aria-describedby={error("AnoTermino")
            ? "AnoTermino-error"
            : undefined}
        />
        {#if error("AnoTermino")}
          <p id="AnoTermino-error" class="field-error">{error("AnoTermino")}</p>
        {/if}
      </div>
    </div>
  </fieldset>

  <fieldset
    id="Contato"
    aria-describedby={error("Contato") ? "Contato-error" : undefined}
  >
    <legend>Contato</legend>
    <p class="section-help">Informe pelo menos um.</p>
    {#if error("Contato")}
      <p id="Contato-error" class="field-error">{error("Contato")}</p>
    {/if}

    <div class="contact-grid">
      <div class="field">
        <label for="Email">E-mail</label>
        <input
          id="Email"
          name="Email"
          value={values.Email ?? ""}
          type="email"
          autocomplete="email"
          aria-invalid={Boolean(error("Email"))}
          aria-describedby={error("Email") ? "Email-error" : undefined}
        />
        {#if error("Email")}
          <p id="Email-error" class="field-error">{error("Email")}</p>
        {/if}
      </div>

      <div class="field">
        <label for="WhatsApp">WhatsApp</label>
        <input
          id="WhatsApp"
          name="WhatsApp"
          value={values.WhatsApp ?? ""}
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          maxlength="24"
          placeholder="+55 11 99999-9999"
          aria-invalid={Boolean(error("WhatsApp"))}
          aria-describedby={error("WhatsApp") ? "WhatsApp-error" : undefined}
        />
        {#if error("WhatsApp")}
          <p id="WhatsApp-error" class="field-error">{error("WhatsApp")}</p>
        {/if}
      </div>

      <div class="field">
        <label for="Instagram">Instagram</label>
        <input
          id="Instagram"
          name="Instagram"
          value={values.Instagram ?? ""}
          type="url"
          inputmode="url"
          autocomplete="url"
          maxlength="500"
          placeholder="https://www.instagram.com/seu-perfil"
          aria-invalid={Boolean(error("Instagram"))}
          aria-describedby={error("Instagram") ? "Instagram-error" : undefined}
        />
        {#if error("Instagram")}
          <p id="Instagram-error" class="field-error">{error("Instagram")}</p>
        {/if}
      </div>

      <div class="field">
        <label for="Facebook">Facebook</label>
        <input
          id="Facebook"
          name="Facebook"
          value={values.Facebook ?? ""}
          type="url"
          inputmode="url"
          autocomplete="url"
          maxlength="500"
          placeholder="https://www.facebook.com/seu-perfil"
          aria-invalid={Boolean(error("Facebook"))}
          aria-describedby={error("Facebook") ? "Facebook-error" : undefined}
        />
        {#if error("Facebook")}
          <p id="Facebook-error" class="field-error">{error("Facebook")}</p>
        {/if}
      </div>

      <div class="field">
        <label for="LinkedIn">LinkedIn</label>
        <input
          id="LinkedIn"
          name="LinkedIn"
          value={values.LinkedIn ?? ""}
          type="url"
          inputmode="url"
          autocomplete="url"
          maxlength="500"
          placeholder="https://www.linkedin.com/in/seu-perfil"
          aria-invalid={Boolean(error("LinkedIn"))}
          aria-describedby={error("LinkedIn") ? "LinkedIn-error" : undefined}
        />
        {#if error("LinkedIn")}
          <p id="LinkedIn-error" class="field-error">{error("LinkedIn")}</p>
        {/if}
      </div>

      <div class="field">
        <label for="HomePage">Página pessoal</label>
        <input
          id="HomePage"
          name="HomePage"
          value={values.HomePage ?? ""}
          type="url"
          inputmode="url"
          autocomplete="url"
          maxlength="250"
          placeholder="https://exemplo.com.br"
          aria-invalid={Boolean(error("HomePage"))}
          aria-describedby={error("HomePage") ? "HomePage-error" : undefined}
        />
        {#if error("HomePage")}
          <p id="HomePage-error" class="field-error">{error("HomePage")}</p>
        {/if}
      </div>
    </div>
  </fieldset>

  <fieldset>
    <legend>Texto para seu perfil</legend>
    <div class="field">
      <label for="DadoPubl">Texto (opcional)</label>
      <textarea
        id="DadoPubl"
        name="DadoPubl"
        rows="6"
        maxlength="2000"
        aria-invalid={Boolean(error("DadoPubl"))}
        aria-describedby={error("DadoPubl") ? "DadoPubl-error" : undefined}
        >{values.DadoPubl ?? ""}</textarea
      >
      {#if error("DadoPubl")}
        <p id="DadoPubl-error" class="field-error">{error("DadoPubl")}</p>
      {/if}
    </div>
  </fieldset>

  <p class="privacy-notice">
    Ao enviar o cadastro, você declara estar ciente de que os dados informados
    serão publicados para consulta por qualquer visitante, conforme a
    <a href="/politica-de-privacidade">Política de Privacidade</a>.
  </p>

  <div class="turnstile">
    <p>Confirme o desafio antes de enviar.</p>
    <Turnstile />
  </div>

  <Button type="submit" disabled={submitting}>
    {submitting ? "Enviando cadastro…" : "Enviar cadastro"}
  </Button>

  <p class="update">
    Já está cadastrado e precisa corrigir seus dados?
    <a href="mailto:renato@etfsp.com">
      Entre em contato com o responsável pelo site.
    </a>
  </p>
</form>

<style>
  .form-intro,
  form,
  .notice {
    max-width: var(--content-reading);
  }

  .form-intro {
    display: grid;
    gap: var(--space-1);
    margin-bottom: var(--space-4);
    padding: var(--space-4);
    border-left: 4px solid var(--color-primary);
    background: var(--color-primary-soft);
  }

  .form-intro p {
    margin: 0;
  }

  form {
    display: grid;
    gap: var(--space-6);
  }

  fieldset {
    display: grid;
    gap: var(--space-4);
    margin: 0;
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface-muted);
    box-shadow: var(--shadow-card);
  }

  legend {
    padding: 0 var(--space-2);
    color: var(--color-heading);
    font-size: var(--text-lg);
    font-weight: 700;
  }

  .field,
  .field-grid,
  .contact-grid {
    display: grid;
    gap: var(--space-2);
    min-width: 0;
  }

  .field-grid,
  .contact-grid {
    gap: var(--space-4);
  }

  label {
    font-weight: 700;
  }

  input,
  select,
  textarea {
    width: 100%;
    border: 2px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    color: var(--color-text);
    padding: var(--space-2) var(--space-3);
  }

  input:hover,
  select:hover,
  textarea:hover {
    border-color: var(--color-text-muted);
  }

  input[aria-invalid="true"],
  select[aria-invalid="true"],
  textarea[aria-invalid="true"] {
    border-color: var(--color-danger);
  }

  p {
    margin: 0;
  }

  .section-help,
  .update,
  .privacy-notice,
  .turnstile p {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .notice {
    margin-bottom: var(--space-4);
    padding: var(--space-4);
    border-radius: var(--radius-sm);
  }

  .notice--error,
  .field-error {
    color: var(--color-danger);
    background: var(--color-danger-surface);
  }

  .field-error {
    padding: var(--space-2);
    border-left: 3px solid currentColor;
    font-size: var(--text-sm);
  }

  .turnstile {
    padding: var(--space-4);
    background: var(--color-surface-muted);
    border-radius: var(--radius-md);
  }

  .update {
    margin-top: var(--space-2);
  }

  @media (min-width: 36rem) {
    .field-grid,
    .contact-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
