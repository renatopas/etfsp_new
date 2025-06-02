<script lang="ts">
  type Tab = "Home" | "CadastreSe" | "ExAlunos" | "Fotos";

  interface Props {
    selected?: Tab;
  }

  const SELECTED_STYLE = "background-color: #c30; color: #fff;";

  let { selected }: Props = $props();
</script>

<div id="layoutpage" style="border: 0">
  <div id="header">
    <a
      title="Ex-alunos da Escola Técnica / Instituto Federal de São Paulo"
      href="/"
    >
      <img style="position: absolute;" src="/images/header.jpg" />
      <img
        style="z-index: 1000; position: relative;"
        src="/images/logoex.gif"
        alt="Ex-alunos da Escola Técnica / Instituto Federal de São Paulo"
        width="345"
        height="75"
        id="imaheader"
      />
    </a>
  </div>

  <div id="menu">
    <a
      title="Voltar para página principal"
      href="/"
      class={selected == "Home" ? "selected" : ""}>Home</a
    >
    <a
      title="Cadastre seus dados"
      href="novocadastro"
      class={selected == "CadastreSe" ? "selected" : ""}
    >
      Cadastre-se</a
    >
    <a
      title="Busca de ex-alunos"
      href="exalunos"
      class={selected == "ExAlunos" ? "selected" : ""}>Ex-Alunos</a
    >
    <a
      title="Veja e envie fotos"
      href="lista_foto"
      class={selected == "Fotos" ? "selected" : ""}>Fotos</a
    >
  </div>
</div>
