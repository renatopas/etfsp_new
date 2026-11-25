<!--
  Marca do site recriada a partir da composição tipográfica do logotipo
  legado: “EX / ALUNOS”, barra vertical e o nome da escola em duas linhas.
  O texto usa as fontes do próprio site; o SVG é decorativo e o nome
  acessível fica no link que o contém.
-->
<svg
  class="brand"
  viewBox="0 0 352 62"
  width="352"
  height="62"
  aria-hidden="true"
  focusable="false"
>
  <g class="brand__mark">
    <rect x="0" y="2" width="9" height="32" rx="1.5" />
    <rect x="0" y="2" width="42" height="8" rx="1.5" />
    <rect x="0" y="14" width="34" height="8" rx="1.5" />
    <rect x="0" y="26" width="42" height="8" rx="1.5" />
    <path
      d="M50 2h11l11 12.5L83 2h11L77.5 18 94 34H83L72 21.5 61 34H50l16.5-16Z"
    />
    <text
      class="brand__alunos"
      x="0"
      y="57"
      textLength="94"
      lengthAdjust="spacingAndGlyphs">ALUNOS</text
    >
  </g>
  <rect class="brand__divider" x="108" y="0" width="3" height="62" rx="1.5" />
  <text class="brand__school" x="124" y="25">Escola Técnica</text>
  <text
    class="brand__school"
    x="124"
    y="54"
    textLength="226"
    lengthAdjust="spacingAndGlyphs">Federal de São Paulo</text
  >
</svg>

<style>
  .brand {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .brand__mark,
  .brand__divider {
    fill: var(--color-primary);
  }

  .brand__alunos {
    font-family: var(--font-sans);
    font-size: 17px;
    font-weight: 800;
  }

  .brand__school {
    fill: var(--color-heading);
    font-family: var(--font-serif);
    font-size: 23px;
    font-weight: 600;
  }
</style>
