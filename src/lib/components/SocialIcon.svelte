<script lang="ts">
  let { network }: { network: "instagram" | "facebook" | "linkedin" } =
    $props();
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
  {:else}
    <rect class="social-icon__fill" x="4" y="9" width="3.5" height="11" />
    <circle class="social-icon__fill" cx="5.75" cy="5.5" r="1.75" />
    <path
      d="M11 20V9h3.3v1.5c.8-1.2 2-1.9 3.6-1.9 3 0 3.6 2.1 3.6 5V20H18v-5.7c0-1.5-.3-2.7-1.8-2.7-1.7 0-2 1.4-2 3.1V20z"
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

  rect:not(.social-icon__fill) {
    fill: none;
  }
</style>
