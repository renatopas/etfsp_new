<script lang="ts">
  import { type SearchResult } from "./search_id/+server";

  let showSearch = $state(false);
  let searchText = $state("");
  let searchResults: SearchResult[] = $state([]);

  let nomeExAluno = $state("");
  let idExAluno = $state("");

  let timer: ReturnType<typeof setTimeout>;
  async function pesquisarPorNome() {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      if (!searchText) {
        searchResults = [];
      }
      searchResults = await (
        await fetch(
          "/cadfoto/search_id?" +
            new URLSearchParams({ name: searchText }).toString(),
        )
      ).json();
    }, 500);
  }

  function clearSearchForm() {
    showSearch = false;
    searchText = "";
    searchResults = [];
  }

  function setAluno(nome: string, id: number) {
    nomeExAluno = nome;
    idExAluno = id.toString();
    clearSearchForm();
  }
</script>

<div style:display={showSearch ? "inherit" : "none"}>
  <div
    style="position: absolute; top: 0; left: 0; width: 100%; height:100%; background-color: #0005;"
    onclick={clearSearchForm}
  />
  <div class="idsearch">
    <h1>Pesquise seu Nome</h1>
    <label for="idsearchname" style="font-size: 70%; font-weight: bold;"
      >Nome:
    </label>
    <input
      type="text"
      id="idsearchname"
      onkeyup={() => pesquisarPorNome()}
      bind:value={searchText}
    />
    <div class="searchresult">
      {#each searchResults as result}
        <div
          class="result"
          role="button"
          onclick={() => setAluno(result.Nome, result.ID)}
        >
          {result.Nome}
        </div>
      {/each}
    </div>
  </div>
</div>

<h1>Fotos: envio</h1>
<form method="POST" encType="multipart/form-data" name="Form01" id="Form01">
  <table class="tableforms">
    <tbody>
      <tr>
        <td colspan="2">
          <strong>Sua identificação<br /></strong>
          <input
            type="hidden"
            name="IdExAlunoUp"
            size="5"
            pattern="[0-9]+"
            required
            id="IdExAlunoUp"
            bind:value={idExAluno}
          />
          <input
            type="text"
            name="NomeExAlunoUpload"
            size="35"
            required
            readonly
            tabindex="-1"
            id="NomeExAlunoUpload"
            bind:value={nomeExAluno}
          />
          <button
            type="button"
            aria-label="Pesquisar ID"
            style="display: contents; cursor: pointer;"
            onclick={() => {
              showSearch = true;
            }}><img src="images/seta.gif" /></button
          >
        </td>
      </tr>
      <tr>
        <td width="755" colspan="2">
          <strong>Arquivo (somente imagens, até 5MB)</strong>
          <input
            type="file"
            size="50"
            minlength="4"
            maxlength="250"
            required
            accept="image/png,image/gif,image/jpg,image/jpeg,image/avif,image/webp"
            name="arquivo"
          />
        </td>
      </tr>
      <tr>
        <td width="755" colspan="2">
          <strong
            >Titulo
            <input
              type="text"
              name="TituloFoto"
              size="75"
              maxlength="250"
              required
            />
          </strong>
        </td>
      </tr>
      <tr>
        <td width="755" colspan="2">
          <strong>Curso </strong><strong>
            <select name="CursoFoto" size="1" required>
              <option selected value="">Escolha</option>
              <option>PRD</option>
              <option>TEL</option>
              <option>ELO</option>
              <option>ELE</option>
              <option>EDI</option>
              <option>MEC</option>
              <option>INF</option>
            </select>
            Turma(s)<input
              type="text"
              maxlength="15"
              name="TurmaFoto"
              required
              size="20"
            />
            Ano de formatura<input
              type="text"
              name="AnoFormatura"
              size="6"
              pattern="[0-9]{'{4}'}"
              maxlength="4"
            />
          </strong>
        </td>
      </tr>
      <tr>
        <td width="755" colspan="2">
          <strong>
            Ano da foto
            <input
              type="text"
              name="AnoFoto"
              id="AnoFoto"
              size="6"
              pattern="[0-9]{'{4}'}"
              maxlength="4"
            />
          </strong>
        </td>
      </tr>
      <tr>
        <td width="755" colspan="2">
          <strong>
            É &quot;carômetro&quot;?
            <input
              type="radio"
              value="false"
              name="Carometro"
              required
              checked
            />Não
            <input type="radio" name="Carometro" value="true" />Sim
          </strong>
        </td>
      </tr>
      <tr>
        <td width="755" colspan="2">
          <strong>
            É foto sua pessoal?
            <input
              type="radio"
              value="false"
              name="FotoPessoal"
              required
              checked
            />Não
            <input type="radio" name="FotoPessoal" value="true" />Sim
          </strong>
          <font face="Verdana" size="1">
            (para sair na lista geral de alunos)
          </font>
        </td>
      </tr>
      <tr>
        <td width="755" colspan="2"></td>
      </tr>
    </tbody>
  </table>
  <p>
    <input type="submit" value="Enviar foto" class="formbutton" />
    <input type="reset" value="Apaga tudo" class="formbutton" />
    &nbsp;&nbsp;&nbsp;
  </p>
</form>
