<script lang="ts">
  import Meta from "$lib/Meta.svelte";
  let theForm: HTMLFormElement;

  function FrontPage_Form1_Validator() {
    const checkOkAlpha =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzƒŠŒŽšœžŸÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ' \t\r\n\f";
    const checkOkNum = "0123456789-";
    const checkOkEmail =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzƒŠŒŽšœžŸÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ0123456789-@._";

    if (theForm.Nome.value == "") {
      alert('Digite um valor para o campo "Nome".');
      theForm.Nome.focus();
      return false;
    }

    if (theForm.Nome.value.length < 5) {
      alert('Digite pelo menos 5 caracteres no campo "Nome".');
      theForm.Nome.focus();
      return false;
    }

    for (const char of theForm.Nome.value) {
      if (!checkOkAlpha.includes(char)) {
        alert(
          'Digite somente letra, espaço em branco e "\'" caracteres no campo "Nome".',
        );
        theForm.Nome.focus();
        return false;
      }
    }

    if (theForm.AnoInicio.value == "") {
      alert('Digite um valor para o campo "Ano de Ingresso".');
      theForm.AnoInicio.focus();
      return false;
    }

    if (theForm.AnoInicio.value.length < 2) {
      alert('Digite pelo menos 2 caracteres no campo "Ano de Ingresso".');
      theForm.AnoInicio.focus();
      return false;
    }

    if (theForm.AnoInicio.value.length > 4) {
      alert('Digite no máximo 4 caracteres no campo "Ano de Ingresso".');
      theForm.AnoInicio.focus();
      return false;
    }

    for (const char of String(theForm.AnoInicio.value)) {
      if (!checkOkNum.includes(char)) {
        alert('Digite somente dígito caracteres no campo "Ano de Ingresso".');
        theForm.AnoInicio.focus();
        return false;
      }
    }

    let anoInicio = parseInt(theForm.AnoInicio.value);
    if (!(anoInicio >= 1960 && anoInicio <= 2001)) {
      alert(
        'Digite um valor maior que ou igual a "1960" e menor que ou igual a "2001" no campo "Ano de Ingresso".',
      );
      theForm.AnoInicio.focus();
      return false;
    }

    if (theForm.AnoTermino.value == "") {
      alert('Digite um valor para o campo "Ano de Saída".');
      theForm.AnoTermino.focus();
      return false;
    }

    if (theForm.AnoTermino.value.length < 2) {
      alert('Digite pelo menos 2 caracteres no campo "Ano de Saída".');
      theForm.AnoTermino.focus();
      return false;
    }

    if (theForm.AnoTermino.value.length > 4) {
      alert('Digite no máximo 4 caracteres no campo "Ano de Saída".');
      theForm.AnoTermino.focus();
      return false;
    }

    for (const char of String(theForm.AnoTermino.value)) {
      if (!checkOkNum.includes(char)) {
        alert('Digite somente dígito caracteres no campo "Ano de Saída".');
        theForm.AnoTermino.focus();
        return false;
      }
    }

    let anoTermino = parseInt(theForm.AnoTermino.value);
    if (!(anoTermino >= 1960 && anoTermino <= 2005)) {
      alert(
        'Digite um valor maior que ou igual a "1960" e menor que ou igual a "2005" no campo "Ano de Saída".',
      );
      theForm.AnoTermino.focus();
      return false;
    }

    if (theForm.Email.value == "") {
      alert('Digite um valor para o campo "Email".');
      theForm.Email.focus();
      return false;
    }

    if (theForm.Email.value.length < 8) {
      alert('Digite pelo menos 8 caracteres no campo "Email".');
      theForm.Email.focus();
      return false;
    }

    for (const char of theForm.Email.value) {
      if (!checkOkEmail.includes(char)) {
        alert(
          'Digite somente letra, dígito e "@._" caracteres no campo "Email".',
        );
        theForm.Email.focus();
        return false;
      }
    }

    if (theForm.ICQ.value.length > 10) {
      alert('Digite no máximo 10 caracteres no campo "ICQ".');
      theForm.ICQ.focus();
      return false;
    }

    for (const char of theForm.ICQ.value) {
      if (!checkOkAlpha.includes(char)) {
        alert('Digite somente dígito caracteres no campo "ICQ".');
        theForm.ICQ.focus();
        return false;
      }
    }

    if (theForm.CEP.value.length > 8) {
      alert('Digite no máximo 8 caracteres no campo "CEP".');
      theForm.CEP.focus();
      return false;
    }

    let allNum = "";
    for (const char of theForm.CEP.value) {
      if (!checkOkNum.includes(char)) {
        alert('Digite somente dígito caracteres no campo "CEP".');
        theForm.CEP.focus();
        return false;
      }
    }

    if (theForm.Pais.value == "") {
      alert('Digite um valor para o campo "Pais".');
      theForm.Pais.focus();
      return false;
    }

    if (theForm.ComoEncontrou.selectedIndex < 0) {
      alert('Selecione uma das opções "Como nos encontrou".');
      theForm.ComoEncontrou.focus();
      return false;
    }

    if (theForm.ComoEncontrou.selectedIndex == 0) {
      alert(
        'A primeira opção "Como nos encontrou" não é uma seleção válida. Escolha uma das outras opções.',
      );
      theForm.ComoEncontrou.focus();
      return false;
    }
    return true;
  }
</script>

<Meta
  title="Cadastro - Ex-alunos da Escola Tecnica / Instituto Federal de Sao Paulo - IFSP / ETFSP / CEFET-SP"
  description=""
/>

<div id="mainbody2">
  <h1>Cadastre-se</h1>
  <p>
    Basta preencher o formulário abaixo. O sigilo dos seus dados é garantido<br
    />
    <strong>DIVULGUE </strong>para seus amigos! É nossa melhor propaganda!
  </p>

  <form
    method="GET"
    action="cadexaluno"
    onsubmit={(e) => FrontPage_Form1_Validator()}
    bind:this={theForm}
    name="FrontPage_Form1"
  >
    <table
      border="0"
      align="center"
      cellpadding="0"
      cellspacing="0"
      class="tableforms"
    >
      <tbody>
        <tr>
          <td colspan="6"
            ><strong
              >Operação:
              <br />
              <input
                type="radio"
                name="Operacao"
                value="Cadastro"
                checked
              /></strong
            >Cadastro
            <input
              type="radio"
              name="Operacao"
              value="Atualizacao"
            />Atualização<font size="1"
              >(Envie sempre todos os dados que desejar. Mesmo na atualização)</font
            >
          </td>
        </tr>
        <tr>
          <td colspan="6"
            ><strong
              >Nome
              <br />
              <input type="text" size="60" name="Nome" value="" />
            </strong></td
          >
        </tr>
        <tr>
          <td colspan="4"
            ><strong>Apelido<br /> </strong><input
              type="text"
              size="30"
              name="Apelidos"
            /></td
          >
          <td colspan="2" rowspan="4"
            ><div style="align: left;">
              <p>
                <strong> &nbsp;&nbsp;&nbsp; </strong><img
                  src="images/BICHOCAD.GIF"
                  alt="Cadastro"
                  width="171"
                  height="138"
                />
              </p>
            </div></td
          >
        </tr>
        <tr>
          <td colspan="1"
            ><strong
              >Curso:<br />
              <select name="Curso" size="1">
                <option>PRD</option>
                <option>TEL</option>
                <option>ELO</option>
                <option>ELE</option>
                <option>EDI</option>
                <option>MEC</option>
                <option>INF</option>
              </select>
              <select name="TipoCurso" size="1">
                <option selected>Regular</option>
                <option>Complementar</option>
                <option value="Cubatão">Cubatão</option>
              </select></strong
            ></td
          >
          <td align="center" colspan="2"
            ><strong
              >Ano de ingresso e formatura<br />
              &nbsp;&nbsp;
              <input
                type="text"
                size="4"
                maxlength="4"
                name="AnoInicio"
              />&nbsp;
              <input
                type="text"
                size="4"
                name="AnoTermino"
                maxlength="4"
              />&nbsp;&nbsp;
            </strong>
          </td>
        </tr>
        <tr>
          <td colspan="2"
            ><strong
              >E-mail (pode ser mais de um)<br />
              <input type="text" size="40" name="Email" /></strong
            ></td
          >
          <td colspan="2"
            ><div style="align: left;">
              <strong
                >ICQ-UIN<br />
                <input
                  type="text"
                  size="10"
                  name="ICQ"
                  maxlength="10"
                /></strong
              >
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="4"
            ><strong
              >Home page <br />
              <input type="text" size="50" name="HomePage" value="" /></strong
            ></td
          >
        </tr>
        <tr>
          <td colspan="6"
            ><strong
              >Endereço
              <br />
              <input type="text" size="70" name="Endereco" /></strong
            ></td
          >
        </tr>
        <tr>
          <td width="122"
            ><strong
              >Cidade<br />
              <input
                type="text"
                size="20"
                name="Cidade"
                value="São Paulo"
              /></strong
            ></td
          >
          <td colspan="2"
            ><strong
              >Estado<br />
              <input type="text" size="2" name="Estado" value="SP" /></strong
            ></td
          >
          <td colspan="2"
            ><strong
              >CEP<br />
              <input type="text" size="8" name="CEP" maxlength="8" /></strong
            ></td
          >
          <td width="122"
            ><strong
              >Pais<br />
              <input type="text" size="20" name="Pais" value="Brasil" /></strong
            ></td
          >
        </tr>
        <tr>
          <td colspan="6">
            <strong
              >Telefone<br />
              <input type="text" size="20" name="Telefone" /></strong
            >
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <strong
              >Deseja publicar outro dado?<br />
              <input type="radio" name="publica_telefone" value="true" />Sim
              <input
                type="radio"
                checked
                name="publica_telefone"
                value="false"
              />Não</strong
            >
          </td>
          <td colspan="4"
            ><strong
              >Digite aqui o dado público. Ex: telefone<br />
              <input type="text" size="30" name="DadoPubl" /></strong
            >
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <strong
              >Como nos encontrou: <br />
              <select name="ComoEncontrou" size="1">
                <option selected>Selecione a opção</option>

                <option>Google</option>
                <option>Indicação de amigos</option>
                <option>Link em outras páginas</option>
                <option>Facebook</option>

                <option>Bing</option>
                <option>Outros</option>
              </select>
            </strong>
          </td>
          <td colspan="4"
            ><strong
              >Especifique:<br />
              <input type="text" size="40" name="ComoEncontrouExtra" /></strong
            ></td
          >
        </tr>
        <tr>
          <td colspan="6"
            ><strong
              ><br />
              Informações públicas para seus amigos lerem: <br />
              turmas da Federal, empregos, faculdade, celular para contato, uma história
              engraçada, etc.<br />
              <textarea name="Comentarios" rows="15" cols="110"
              ></textarea></strong
            ></td
          >
        </tr>
        <tr>
          <td colspan="6"></td>
        </tr>
        <tr
          ><td height="1"></td><td width="199"></td><td width="81"></td><td
            width="81"
          ></td><td width="82"></td><td></td></tr
        >
      </tbody>
    </table>

    <p>
      <input
        type="submit"
        value="Envia formulário de cadastramento"
        class="formbutton"
      /><input type="reset" value="Apaga tudo" class="formbutton" />&nbsp;&nbsp;
      <strong
        ><font color="#FF0000"> DIVULGUE para seus amigos !!!</font></strong
      >
    </p>
    <p>
      Em caso de problemas para enviar este formulario, envie e-mail para <a
        href="mailto:renato@etfsp.com">renato@etfsp.com</a
      >&nbsp;
    </p>
  </form>
</div>
