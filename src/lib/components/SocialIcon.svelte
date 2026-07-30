<script lang="ts">
  let {
    network,
  }: {
    network: "instagram" | "facebook" | "linkedin" | "whatsapp";
  } = $props();
</script>

<svg
  class="social-icon"
  viewBox="0 0 24 24"
  width="20"
  height="20"
  aria-hidden="true"
  focusable="false"
>
  {#if network === "instagram"}
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle class="social-icon__fill" cx="17.5" cy="6.5" r="1" />
  {:else if network === "facebook"}
    <path
      d="M14 21v-8h2.8l.4-3H14V8.1c0-.9.3-1.6 1.7-1.6h1.8V3.8c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5V10H8v3h2.5v8"
    />
  {:else if network === "linkedin"}
    <rect class="social-icon__fill" x="4" y="9" width="3.5" height="11" />
    <circle class="social-icon__fill" cx="5.75" cy="5.5" r="1.75" />
    <path
      d="M11 20V9h3.3v1.5c.8-1.2 2-1.9 3.6-1.9 3 0 3.6 2.1 3.6 5V20H18v-5.7c0-1.5-.3-2.7-1.8-2.7-1.7 0-2 1.4-2 3.1V20z"
    />
  {:else}
    <path
      class="social-icon__stroke"
      d="M20 11.6a8 8 0 0 1-11.8 7l-4.2 1.1 1.1-4A8 8 0 1 1 20 11.6z"
    />
    <path
      class="social-icon__stroke"
      d="M9 7.8c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.8 1.8c.1.3.1.5-.1.7l-.6.7c-.2.2-.1.4 0 .6.5.9 1.3 1.7 2.3 2.2.2.1.4.1.6-.1l.8-1c.2-.2.4-.3.7-.1l1.9.9c.3.1.4.3.4.5 0 .5-.2 1.5-.8 2-.6.6-1.5.9-2.4.7-1.5-.3-3.4-1.2-5-2.7-1.3-1.3-2.3-3-2.6-4.4-.2-.8.1-1.4.5-1.8.5-.5 1.1-.5 1.8-.5"
    />
  {/if}
</svg>

<style>
  .social-icon {
    flex: 0 0 auto;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.8;
  }

  .social-icon__fill,
  path {
    fill: currentColor;
    stroke: none;
  }

  .social-icon__stroke {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.4;
  }

  rect:not(.social-icon__fill) {
    fill: none;
  }
</style>
