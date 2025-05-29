<script lang="ts">
  import Meta from "$lib/Meta.svelte";
</script>

<Meta
  description=""
  title="Busca - Ex-Alunos da Escola Tecnica / Instituto Federal de Sao Paulo - ETFSP / IFSP / CEFET-SP"
/>

<div id="mainbody2">
  <h1>Ex-Alunos</h1>

  <form action="exalunos_lista">
    <input type="text" name="busca" size="20" />
    <input name="B1" type="submit" class="formbutton" value="Buscar" />
    <input type="hidden" name="Titulo" value="Busca" />
    <font size="1"><i>Ex: "Maria", "Ricardo PRD", "ELO 1997"</i></font>
  </form>

  <h2>
    Temos a lista dos ex-alunos com algumas opções e com atualização on-line:
  </h2>
  <ul>
    <li>
      <a href="exalunos_lista?Titulo=Últimas Atualizações&Restricao=LAST"
        >Últimas atualizações</a
      >
    </li>
    <li>
      <a href="exalunos_lista?ORDEM=ALFA&TITULO=Alfabético"
        >Geral por ordem alfabética</a
      >
    </li>
    <li>
      <a
        href="exalunos_lista?ORDEM=INGRESSOCURSO&Titulo=Por ano de Ingresso e Curso"
        >Geral por ano de ingresso e curso</a
      >
    </li>
    <li>
      <a href="exalunos_lista?ORDEM=SAIDACURSO&Titulo=Por ano de Saída e Curso"
        >Geral por ano de saída e curso</a
      >
    </li>
    <li>
      <a
        href="exalunos_lista?ORDEM=CURSOINGRESSO&Titulo=Por curso e ano de ingresso"
        >Geral por curso e ano de ingresso</a
      >
    </li>
    <li>
      <a href="exalunos_lista?ORDEM=CURSOSAIDA&Titulo=Por curso e ano de saída"
        >Geral por curso e ano de saída</a
      >
    </li>
    <li>
      <a
        href="exalunos_lista?ORDEM=INGRESSONOME&Titulo=Por ano de Ingresso e Nome"
        >Geral por ano de ingresso e nome</a
      >
    </li>
    <li>
      <a href="exalunos_lista?ORDEM=SAIDANOME&Titulo=Por ano de de saída e nome"
        >Geral por ano de saída e nome</a
      >
    </li>
  </ul>

  <p>
    Colabore com o crescimento indicando para amigos e&nbsp; <a
      href="novocadastro">cadastre-se</a
    > também! ! !
  </p>
</div>
