# Fixture do Codex Cloud

Esta fixture é versionada e pode ser usada em um clone público.

- Os 30 perfis são fictícios e descaracterizados.
- IDs, nomes, apelidos, anos e eventuais e-mails foram criados para teste.
- E-mails usam exclusivamente o domínio reservado `example.invalid`.
- Não há telefones, redes sociais ou identificadores de pessoas reais.
- As duas imagens são placeholders institucionais derivados de assets públicos
  já existentes no repositório; não são fotos de ex-alunos.
- `pnpm run cloud:data:init` cria um SQLite novo a partir destes arquivos.

O inicializador rejeita classificações diferentes de `synthetic` e
`institutional-placeholders`, além de executar as verificações gerais de
privacidade e integridade.
