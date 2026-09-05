<script lang="ts">
  import Meta from "$lib/Meta.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import { absoluteSiteUrl } from "$lib/site";
</script>

<Meta
  canonical={absoluteSiteUrl("/politica-de-privacidade")}
  title="Política de Privacidade — ETFSP.com"
  description="Saiba quais dados são publicados pelo ETFSP.com, como são utilizados e como solicitar sua exclusão."
/>

<article class="privacy-policy">
  <PageHeader
    title="Política de Privacidade"
    description="Saiba como os dados enviados ao ETFSP.com são utilizados e publicados."
  />

  <p class="privacy-policy__updated">
    <strong>Última atualização:</strong>
    <time datetime="2026-08-05">5 de agosto de 2026</time>
  </p>

  <p>
    O ETFSP.com é um site não oficial criado para reunir ex-alunos da ETFSP,
    CEFET-SP e IFSP e facilitar o reencontro e o contato entre antigos colegas.
    Esta política explica como os dados enviados ao site são utilizados.
  </p>

  <section class="privacy-policy__highlight" aria-labelledby="dados-publicos">
    <h2 id="dados-publicos">1. Dados do cadastro e publicação</h2>
    <p>
      O cadastro de ex-aluno pode incluir nome, apelido, curso, anos de ingresso
      e saída, e-mail, WhatsApp, página pessoal, perfis em redes sociais e um
      texto para o perfil.
    </p>
    <p>
      <strong
        >A finalidade do cadastro é formar uma relação pública de ex-alunos.</strong
      >
      Por isso, os dados que você informar nesse formulário serão publicados no site
      e poderão ser consultados por qualquer visitante, sem necessidade de login.
      Informe somente dados que você deseja tornar públicos.
    </p>
    <p>
      Dados históricos que possuam uma regra específica de visibilidade somente
      são publicados quando essa regra autorizar. Campos internos, técnicos ou
      não destinados ao perfil público não devem ser exibidos pelo site.
    </p>
  </section>

  <section aria-labelledby="fotos">
    <h2 id="fotos">2. Fotos</h2>
    <p>
      As fotos enviadas e as informações usadas para identificá-las, como
      título, curso, turma e ano, podem ser publicadas nas galerias e nos perfis
      do site. Envie somente imagens que você esteja autorizado a compartilhar.
      Uma foto pode conter outras pessoas; caso alguém queira solicitar a
      retirada de uma imagem, deve usar o contato indicado na seção “Exclusão e
      contato”.
    </p>
  </section>

  <section aria-labelledby="utilizacao">
    <h2 id="utilizacao">3. Como os dados são utilizados</h2>
    <p>Os dados são utilizados para:</p>
    <ul>
      <li>incluir e apresentar o perfil na relação de ex-alunos;</li>
      <li>permitir a busca de ex-alunos por visitantes;</li>
      <li>facilitar o contato e o reencontro entre antigos colegas;</li>
      <li>organizar, apresentar e relacionar as fotos publicadas; e</li>
      <li>
        proteger o cadastro contra abuso e manter o funcionamento e a segurança
        do site.
      </li>
    </ul>
    <p>
      O site não deve utilizar os dados para finalidades incompatíveis com essas
      sem atualizar esta política e, quando necessário, solicitar uma nova
      autorização.
    </p>
  </section>

  <section aria-labelledby="terceiros">
    <h2 id="terceiros">4. Acesso por terceiros e serviços técnicos</h2>
    <p>
      Como a relação de ex-alunos e as fotos são públicas, as informações
      publicadas podem ser vistas, copiadas ou compartilhadas por terceiros fora
      do controle do ETFSP.com. Mecanismos de busca também podem indexar essas
      páginas e levar algum tempo para atualizar ou remover suas próprias cópias
      depois de uma exclusão no site.
    </p>
    <p>
      Dados também podem ser processados pelos serviços técnicos necessários à
      hospedagem, segurança e operação do site, limitados à prestação desses
      serviços, ou quando houver obrigação legal. O site pode utilizar o Umami
      para produzir estatísticas de acesso e compreender o uso das páginas. Esse
      recurso respeita a preferência “Não rastrear” do navegador e não registra
      os termos digitados nas buscas do site.
    </p>
  </section>

  <section aria-labelledby="exclusao">
    <h2 id="exclusao">5. Exclusão e contato</h2>
    <p>
      Você pode solicitar a exclusão dos seus dados ou de uma foto a qualquer
      momento. Envie o pedido para
      <a href="mailto:exclusao@etfsp.com">exclusao@etfsp.com</a>, indicando
      informações suficientes para localizar o cadastro ou a imagem.
    </p>
    <p>
      Para proteger os dados contra pedidos indevidos, poderão ser solicitadas
      informações adicionais razoáveis para confirmar a identidade da pessoa ou
      sua relação com o conteúdo. Essa confirmação não será usada para
      acrescentar novos dados ao perfil público.
    </p>
    <p>
      Depois que um conteúdo for retirado das páginas públicas, registros
      técnicos ou cópias de segurança poderão ser mantidos de forma restrita
      somente pelo tempo necessário para segurança, recuperação do serviço,
      cumprimento de obrigações legais ou preservação de direitos. Cópias
      mantidas por terceiros, como mecanismos de busca, devem ser atualizadas
      por esses próprios serviços.
    </p>
  </section>

  <section aria-labelledby="seguranca">
    <h2 id="seguranca">6. Segurança e limites</h2>
    <p>
      São adotadas medidas técnicas e organizacionais razoáveis para proteger os
      dados administrados pelo site. Ainda assim, nenhum serviço conectado à
      internet pode garantir segurança absoluta. Evite informar no cadastro
      dados sensíveis, documentos, senhas, informações financeiras ou qualquer
      conteúdo que não queira tornar público.
    </p>
  </section>

  <section aria-labelledby="alteracoes">
    <h2 id="alteracoes">7. Alterações desta política</h2>
    <p>
      Esta política pode ser atualizada para refletir mudanças no site ou em
      seus procedimentos. A versão vigente e a data da última atualização
      permanecerão disponíveis nesta página.
    </p>
  </section>

  <section aria-labelledby="responsavel">
    <h2 id="responsavel">8. Responsável pelo site</h2>
    <p>
      O ETFSP.com é mantido por Renato Paschoalinoto. Pedidos de exclusão devem
      ser enviados para
      <a href="mailto:exclusao@etfsp.com">exclusao@etfsp.com</a>.
    </p>
  </section>
</article>

<style>
  .privacy-policy {
    max-width: var(--content-reading);
  }

  .privacy-policy__updated {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .privacy-policy section {
    margin-top: var(--space-8);
  }

  .privacy-policy h2 {
    margin: 0 0 var(--space-3);
    color: var(--color-heading);
    font-family: var(--font-serif);
    font-size: var(--text-lg);
    line-height: var(--leading-tight);
  }

  .privacy-policy p,
  .privacy-policy ul {
    margin-block: 0 var(--space-4);
  }

  .privacy-policy__highlight {
    padding: var(--space-4);
    border-left: 4px solid var(--color-primary);
    background: var(--color-primary-soft);
  }

  .privacy-policy__highlight p:last-child,
  .privacy-policy section p:last-child {
    margin-bottom: 0;
  }
</style>
