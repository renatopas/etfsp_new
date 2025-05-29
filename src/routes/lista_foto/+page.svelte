<script lang="ts">
  import type { Foto } from "./+page.server";

  async function carregarFotos() {
    fetch("/pesquisa_fotos?" + new URLSearchParams());
  }

  let { form } = $props();
  let rows: Foto[][] = [];
  for (let i = 0; i < Math.ceil((form?.fotos.length ?? 0) / 5); i++) {
    rows.push(form?.fotos.slice(i * 5, i * 5 + 5) ?? []);
  }
</script>

<div id="mainbody2">
  <h1>Lista fotos</h1>
  <p><a href="cadfoto.asp"><big>Envie mais uma foto</big></a></p>
  <form method="POST" name="form01" id="form01">
    <table
      width="100%"
      border="0"
      cellpadding="0"
      cellspacing="0"
      class="tableforms"
      id="tablefotofiltro"
    >
      <tbody>
        <tr>
          <td colspan="2"><b>Busca de fotos</b></td>
        </tr>
        <tr>
          <td>
            Título
            <input
              type="text"
              name="titulo"
              maxlength="20"
              size="20"
              tabindex="1"
              value="{form?.params.titulo}"
            />
          </td>
          <td
            >Curso<font size="2" face="Verdana"
              ><strong>
                <!-- TODO: bindar esses valores -->
                <select name="curso" tabindex="2">
                  <option selected={form?.params.curso==""} value="">Todos</option>
                  <option selected={form?.params.curso=="PRD"}>PRD</option>
                  <option selected={form?.params.curso=="TEL"}>TEL</option>
                  <option selected={form?.params.curso=="ELO"}>ELO</option>
                  <option selected={form?.params.curso=="ELE"}>ELE</option>
                  <option selected={form?.params.curso=="EDI"}>EDI</option>
                  <option selected={form?.params.curso=="MEC"}>MEC</option>
                  <option selected={form?.params.curso=="INF"}>INF</option>
                </select></strong
              ></font
            >Apenas carômetro?
            <input
              type="radio"
              value="true"
              checked={form?.params.isCarometro}
              name="carometro"
            />Sim
            <input
              type="radio"
              value="false"
              checked={!form?.params.isCarometro}
              name="carometro"
            />Não
          </td>
        </tr>
        <tr>
          <td
            >Ano da foto entre
            <!-- TODO: reimplementar autoTab -->
            <input
              type="text"
              maxlength="4"
              name="range_ano_foto_start"
              size="6"
              value={form?.params.range_ano_foto_start}
            />e
            <input
              type="text"
              name="range_ano_foto_end"
              maxlength="4"
              size="6"
              value={form?.params.range_ano_foto_end}
            />
          </td>
          <td
            >Ano da formatura entre
            <input
              type="text"
              name="range_ano_formatura_start"
              maxlength="4"
              size="6"
              value={form?.params.range_ano_formatura_start}
            />e
            <input
              type="text"
              name="range_ano_formatura_end"
              maxlength="4"
              size="6"
              value={form?.params.range_ano_formatura_end}
            />
          </td>
        </tr>
      </tbody>
    </table>
    <input type="submit" value="Buscar" name="Enviar" class="formbutton" />
  </form>

  <table
    width="100%"
    border="1"
    cellpadding="0"
    cellspacing="1"
    id="tablefotos"
  >
    <caption
      >Encontradas {form?.fotos.length ?? 0} fotos.

      <!-- <a onclick={() => exibirTodas()}>Clique aqui para exibir todas.</a> -->
    </caption>
    <tbody>
      {#each rows as row}
        <tr>
          {#each row as img}
            <td style="text-align: center;">
              <a href="/Fotos/{img.NomeArqStored}">
                <img src="/Fotos/{img.NomeMiniaturaStored}" />
              </a>
              <br />
              {img.TituloFoto}
              <br />
              <span style="color: red;">{img.AnoFoto}</span>
              {img.CursoFoto}
              <span style="color: blue;">{img.AnoFormatura}</span>
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
  <p>
    Ano da foto em <font color="#FF0000">vermelho. </font>Ano da formatura em
    <font color="#0000FF">azul</font>.
  </p>
</div>
