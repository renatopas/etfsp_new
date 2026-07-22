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

{#if form?.errors?.form}<div class="notice notice--error" role="alert">
    {form.errors.form}
  </div>{/if}
{#if form?.errors && Object.keys(form.errors).some((name) => name !== "form")}
  <div class="notice notice--error" tabindex="-1" role="alert">
    <strong>Revise os campos indicados.</strong>
    <ul>
      {#each Object.entries(form.errors).filter(([name]) => name !== "form") as [name, message]}<li
        >
          <a href={`#${name}`}>{message}</a>
        </li>{/each}
    </ul>
  </div>
{/if}

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
    <label for="Nome">Nome completo <span>obrigatório</span></label><input
      id="Nome"
      name="Nome"
      value={values.Nome ?? ""}
      autocomplete="name"
      required
      minlength="5"
      maxlength="120"
      aria-invalid={Boolean(error("Nome"))}
      aria-describedby={error("Nome") ? "Nome-error" : undefined}
    />{#if error("Nome")}<p id="Nome-error" class="field-error">
        {error("Nome")}
      </p>{/if}
    <label for="Apelidos">Apelido <span>opcional</span></label><input
      id="Apelidos"
      name="Apelidos"
      value={values.Apelidos ?? ""}
      maxlength="80"
    />
    <label for="Curso">Curso <span>obrigatório</span></label><select
      id="Curso"
      name="Curso"
      required
      value={values.Curso ?? ""}
      ><option value="">Selecione</option>{#each COURSES as course}<option
          value={course}>{course}</option
        >{/each}</select
    >
    <div class="years">
      <div>
        <label for="AnoInicio">Ano em que entrou <span>obrigatório</span></label
        ><input
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
      <div>
        <label for="AnoTermino">Ano em que saiu <span>obrigatório</span></label
        ><input
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
  <fieldset>
    <legend>Contato</legend>
    <label for="Email">E-mail <span>obrigatório</span></label><input
      id="Email"
      name="Email"
      value={values.Email ?? ""}
      type="email"
      autocomplete="email"
      required
    />
    <p>Seu e-mail será publicado no perfil conforme a regra atual do site.</p>
    <label for="Telefone">Telefone <span>opcional</span></label><input
      id="Telefone"
      name="Telefone"
      value={values.Telefone ?? ""}
      type="tel"
      autocomplete="tel"
      maxlength="30"
    />
    <p>Uso interno — não aparece no perfil.</p>
    <label for="HomePage">Página pessoal <span>opcional</span></label><input
      id="HomePage"
      name="HomePage"
      value={values.HomePage ?? ""}
      inputmode="url"
      maxlength="250"
    />
  </fieldset>
  <fieldset>
    <legend>Informações opcionais</legend>
    <p>
      Endereço, cidade, estado, CEP, país e como conheceu o site são de uso
      interno — não aparecem no perfil.
    </p>
    <label for="Endereco">Endereço</label><input
      id="Endereco"
      name="Endereco"
      value={values.Endereco ?? ""}
      maxlength="200"
      autocomplete="street-address"
    />
    <div class="years">
      <div>
        <label for="Cidade">Cidade</label><input
          id="Cidade"
          name="Cidade"
          value={values.Cidade ?? ""}
          maxlength="100"
          autocomplete="address-level2"
        />
      </div>
      <div>
        <label for="Estado">Estado</label><input
          id="Estado"
          name="Estado"
          value={values.Estado ?? ""}
          maxlength="50"
          autocomplete="address-level1"
        />
      </div>
    </div>
    <div class="years">
      <div>
        <label for="CEP">CEP</label><input
          id="CEP"
          name="CEP"
          value={values.CEP ?? ""}
          maxlength="20"
          autocomplete="postal-code"
        />
      </div>
      <div>
        <label for="Pais">País</label><input
          id="Pais"
          name="Pais"
          value={values.Pais ?? "Brasil"}
          maxlength="80"
          autocomplete="country-name"
        />
      </div>
    </div>
    <label for="ComoEncontrou">Como encontrou o site?</label><select
      id="ComoEncontrou"
      name="ComoEncontrou"
      value={values.ComoEncontrou ?? ""}
      ><option value="">Não informar</option><option>Google</option><option
        >Indicação de amigos</option
      ><option>Link em outras páginas</option><option>Facebook</option><option
        >Bing</option
      ><option>Outros</option></select
    >
    <label for="ComoEncontrouExtra">Detalhes</label><input
      id="ComoEncontrouExtra"
      name="ComoEncontrouExtra"
      value={values.ComoEncontrouExtra ?? ""}
      maxlength="160"
    />
    <label for="DadoPubl">Informações para o perfil</label><textarea
      id="DadoPubl"
      name="DadoPubl"
      rows="6"
      maxlength="2000">{values.DadoPubl ?? ""}</textarea
    >
    <p>Este texto aparecerá no seu perfil público.</p>
  </fieldset>
  <div class="turnstile">
    <p>Confirme o desafio antes de enviar.</p>
    <Turnstile />
  </div>
  <Button type="submit" disabled={submitting}
    >{submitting ? "Enviando cadastro…" : "Enviar cadastro"}</Button
  >
  <p class="update">
    Já está cadastrado e precisa corrigir seus dados? <a
      href="mailto:renato@etfsp.com"
      >Entre em contato com o responsável pelo site.</a
    >
  </p>
</form>

<style>
  form {
    max-width: var(--content-reading);
    display: grid;
    gap: var(--space-6);
  }
  fieldset {
    display: grid;
    gap: var(--space-2);
    margin: 0;
    padding: var(--space-5);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
  }
  legend {
    color: var(--color-heading);
    font-weight: 700;
    font-size: var(--text-lg);
  }
  label {
    font-weight: 700;
  }
  label span {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    font-weight: 400;
  }
  input,
  select,
  textarea {
    width: 100%;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: var(--space-2);
  }
  p {
    margin: 0;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
  .years {
    display: grid;
    gap: var(--space-3);
  }
  .notice {
    max-width: var(--content-reading);
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
    padding: var(--space-1);
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
    .years {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
