<script lang="ts">
  import { prettyDateOffset } from "$lib";

  interface Props {
    date: number | string | Date;
  }

  let { date }: Props = $props();
  const dateDate = new Date(date);
</script>

<span
  style="border-bottom: 1px black dotted;"
  title={dateDate.toLocaleDateString()}>{prettyDateOffset(dateDate)}</span
>
