<script lang="ts">
  import { enhance } from "$app/forms";
  import type { Foto } from "./+page.server";

  async function carregarFotos() {
    fetch("/pesquisa_fotos?" + new URLSearchParams());
  }

  let { form } = $props();

  let rows = $derived.by(() => {
    let tmp: Foto[][] = [];
    let formData = form;
    for (let i = 0; i < Math.ceil((formData?.fotos.length ?? 0) / 5); i++) {
      tmp.push(formData?.fotos.slice(i * 5, i * 5 + 5) ?? []);
    }
    return tmp;
  });

  function validarForm(this: HTMLFormElement, e: SubmitEvent) {
    let alerted = false;
    const validarAno = (elem: HTMLInputElement) => {
      console.assert(elem instanceof HTMLInputElement);
      if (!elem.value) {
        return;
      }
      const parsed = parseInt(elem.value);
      if (parsed < 1960 || parsed > 2040) {
        if (!alerted) alert("Por favor digite um ano entre 1960 e 2040");
      }
      if (!Number.isSafeInteger(parsed)) {
        if (!alerted) alert("Por favor digite um número nos campos de ano");
      }
      e.preventDefault();
    };
    validarAno(this.range_ano_foto_start);
    validarAno(this.range_ano_foto_end);
    validarAno(this.range_ano_formatura_start);
    validarAno(this.range_ano_formatura_end);
  }
</script>

<div id="mainbody2">
  <h1>Lista fotos</h1>
  <p><a href="cadfoto.asp"><big>Envie mais uma foto</big></a></p>
  <form
    method="POST"
    name="form01"
    id="form01"
    use:enhance={() => (o) => {
      o.update({ reset: false });
    }}
    onsubmit={validarForm}
  >
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
            />
          </td>
          <td
            >Curso<font size="2" face="Verdana"
              ><strong>
                <select name="curso" tabindex="2">
                  <option selected value="">Todos</option>
                  <option>PRD</option>
                  <option>TEL</option>
                  <option>ELO</option>
                  <option>ELE</option>
                  <option>EDI</option>
                  <option>MEC</option>
                  <option>INF</option>
                </select></strong
              ></font
            >Apenas carômetro?
            <input
              type="radio"
              value="true"
              name="carometro"
              id="carometro_sim"
            /><label for="carometro_sim">Sim</label>
            <input
              type="radio"
              value="false"
              checked
              name="carometro"
              id="carometro_nao"
            /><label for="carometro_nao">Não</label>
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
            />e
            <input
              type="text"
              name="range_ano_foto_end"
              maxlength="4"
              size="6"
            />
          </td>
          <td
            >Ano da formatura entre
            <input
              type="text"
              name="range_ano_formatura_start"
              maxlength="4"
              size="6"
            />e
            <input
              type="text"
              name="range_ano_formatura_end"
              maxlength="4"
              size="6"
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
    <caption>Encontradas {form?.fotos.length ?? 0} fotos. </caption>
    <tbody>
      {#each rows as row}
        <tr>
          {#each row as img}
            <td style="text-align: center;">
              <a
                href="/Fotos/{img.NomeArqStored}"
                aria-label="Foto enviada por usuário"
              >
                <img
                  src="/Fotos/{img.NomeMiniaturaStored}"
                  alt="Foto enviada por usuário"
                />
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
