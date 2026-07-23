<script lang="ts">
  import type { Snippet } from "svelte";

  type ButtonVariant = "primary" | "secondary" | "quiet";

  interface Props {
    children: Snippet;
    variant?: ButtonVariant;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    className?: string;
    ariaLabel?: string;
    ariaControls?: string;
    ariaExpanded?: boolean;
    onclick?: (event: MouseEvent) => void;
    element?: HTMLButtonElement;
  }

  let {
    children,
    variant = "primary",
    type = "button",
    disabled = false,
    className = "",
    ariaLabel,
    ariaControls,
    ariaExpanded,
    onclick,
    element = $bindable<HTMLButtonElement>(),
  }: Props = $props();
</script>

<button
  class={`button button--${variant} ${className}`}
  {type}
  {disabled}
  aria-label={ariaLabel}
  aria-controls={ariaControls}
  aria-expanded={ariaExpanded}
  {onclick}
  bind:this={element}
>
  {@render children()}
</button>
