<script>
  import { dev } from "$app/environment";
  import { env } from "$env/dynamic/public";

  const sitekey = dev
    ? "1x00000000000000000000BB"
    : env.PUBLIC_CF_TURNSTILE_SITEKEY;
</script>

<svelte:head>
  <script
    src="https://challenges.cloudflare.com/turnstile/v0/api.js"
    defer
  ></script>
</svelte:head>

<div class="cf-turnstile" data-sitekey={sitekey}></div>
