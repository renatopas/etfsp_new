<script lang="ts">
  import Meta from "../lib/Meta.svelte";
</script>

<Meta
  description=""
  title="Ex-Alunos da Escola Tecnica Federal de Sao Paulo / Instituto Federal / ETFSP / CEFET-SP / IF-SP"
/>

<div style="float: left; width: 390px;">
  <h1>
    Bem-vindo &agrave; p&aacute;gina n&atilde;o oficial dos ex-alunos da Federal
    de S&atilde;o Paulo!
  </h1>
  <p>
    Nosso objetivo &eacute; promover o contato entre ex-alunos, professores e
    funcion&aacute;rios da nossa Escola, que hoje se chama Instituto Federal
    S&atilde;o Paulo - IFSP, mas j&aacute; foi Centro Federal de
    Educa&ccedil;&atilde;o Tecnol&oacute;gica de SP - CEFET-SP e Escola
    T&eacute;cnica Federal de S&atilde;o Paulo - ETFSP.
  </p>

  <p>
    Existe um cadastro de ex-alunos. Voc&ecirc; pode <a href="novocadastro"
      >inscrever-se</a
    >, <a href="exalunos">consultar e buscar</a> esse cadastro, com diversas op&ccedil;&otilde;es.
  </p>
  <p>Agora temos tamb&eacute;m <a href="lista_foto">FOTOS!!!</a></p>

  <!-- <p>
    Se voc&ecirc; gostou, n&atilde;o gostou, tem qualquer tipo de
    coment&aacute;rio ou sugest&atilde;o sobre esse site, <a href="sugestao"
      >clique aqui</a
    >
    e comunique-se conosco!
  </p> -->
</div>
<div id="sidebody">
  <div id="boxbusca">
    <div id="boxbuscaform">
      <h1>Procurar na lista de ex-alunos</h1>
      <form method="GET" action="exalunos_lista" id="busca">
        <input type="text" name="busca" size="20" />
        <input type="submit" value="Buscar" name="B1" />
        <input type="hidden" name="Titulo" value="Busca" />
      </form>
    </div>
  </div>

  <p>
    <img
      src="images/logo_cefet.gif"
      alt="Centro Federal de Educacão Tecnológica de SP"
      width="100"
      height="100"
      class="imagdir"
    />
    Cadastre-se ou apenas consulte as mensagens.
  </p>
  <p style="margin-bottom: 2rem;">
    Experimente! E, principalmente, DIVULGUE!!!
  </p>
</div>
