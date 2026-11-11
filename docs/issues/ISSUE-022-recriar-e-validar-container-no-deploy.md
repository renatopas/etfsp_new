# ISSUE-022 — Recriar e validar o container no deploy

**Estado:** Concluída em 10 de novembro de 2026.

**Área:** Implantação e operação

## Contexto

O alvo `just send_container` construía e transferia as tags `etfsp:latest` e da
versão corrente para a VPS, mas terminava em `docker load`. Atualizar uma tag não
altera um container já criado: ele continua associado ao ID da imagem anterior
até ser recriado.

Essa lacuna apareceu na implantação da ISSUE-021. A imagem nova chegou
corretamente ao servidor, mas o container em execução permaneceu na imagem
antiga e, por isso, não encontrou o novo comando administrativo.

Também havia duas inconsistências no procedimento:

- o `justfile` declarava a variável `ssh`, mas a receita usava o alias `etfsp`
  de forma fixa;
- o README orientava executar `send_docker`, alvo que não existia, em vez de
  `send_container`.

## Objetivo

Fazer `just send_container` representar uma publicação completa da aplicação:
transferir a imagem, recriar somente o serviço `etfsp`, confirmar que ele
responde e recuperar automaticamente a imagem anterior se a ativação falhar.

## Solução

O `justfile` continua responsável pelo build e delega a publicação a
`deploy/send_container.sh`. O script:

1. valida as ferramentas locais e os parâmetros;
2. registra o ID da imagem `etfsp:latest` atualmente disponível na VPS;
3. envia as tags da versão e `latest` pelo fluxo existente com `zstd` e `pv`;
4. executa `docker compose up -d --no-deps --force-recreate etfsp`;
5. tenta acessar `http://127.0.0.1:3000/` por até 30 segundos;
6. mostra o estado do serviço quando o smoke test passa;
7. em caso de falha, restaura a tag anterior, recria o serviço e repete a
   verificação;
8. retorna erro mesmo quando o rollback termina com sucesso, deixando claro que
   a nova versão não foi publicada.

A imagem nova permanece carregada após um rollback para permitir diagnóstico,
mas deixa de ser apontada por `etfsp:latest`.

## Decisões operacionais

- O alias SSH padrão continua sendo `etfsp`.
- O diretório remoto padrão continua sendo `/home/ubuntu/etfsp`.
- Ambos podem ser substituídos por variáveis do `just`.
- Apenas o serviço `etfsp` é recriado; Umami e PostgreSQL não são reiniciados.
- O smoke test usa a porta publicada somente em loopback na VPS.
- O deploy não executa migrações de banco implicitamente.
- O backup continua sendo explícito antes da publicação, pois copiar banco e
  todo o acervo de fotos em cada execução possui custo e política de retenção
  próprios.
- Não há limpeza automática de imagens antigas.

Não há decisões pendentes nesta issue.

## Uso

```sh
ssh etfsp 'cd /home/ubuntu/etfsp && ./backup.sh'
just send_container
```

Para outro ambiente:

```sh
just ssh=outro-host deploy_dir=/outro/diretorio send_container
```

## Segurança e recuperação

- O script recusa um destino SSH iniciado por `-` e aceita apenas um caminho
  remoto absoluto com caracteres simples.
- O ID usado no rollback deve ter o formato completo de SHA-256 de imagem
  Docker.
- A transferência precisa terminar com sucesso antes da recriação.
- A recriação usa a mesma configuração Compose e os mesmos volumes externos.
- Banco, fotos, `.env`, Umami e PostgreSQL não são copiados nem modificados pelo
  script.
- Se ativação e rollback falharem, o comando destaca o erro crítico e preserva
  os logs recentes do serviço na saída.

## Critérios de aceite

- `just send_container` respeita `ssh=` e `deploy_dir=`.
- A imagem é carregada antes de qualquer recriação.
- Somente o serviço `etfsp` é recriado.
- A publicação só retorna sucesso depois do smoke test.
- Uma falha de ativação tenta restaurar a imagem anterior.
- Um deploy revertido retorna código diferente de zero.
- O README usa o nome real do alvo e descreve recriação, smoke test e rollback.
- Migrações continuam explícitas e separadas do deploy genérico.
- O fluxo possui teste automatizado para sucesso e rollback.

## Resultado da implementação

- `justfile` passou a chamar `deploy/send_container.sh` com os parâmetros
  configuráveis.
- O README principal e o guia de implantação foram atualizados.
- `scripts/test_send_container.sh` simula transferência, ativação e rollback sem
  acessar Docker ou a VPS.
- `pnpm run test:deploy` foi incluído em `pnpm run validate`.

## Validação realizada

- `bash -n` passou para o script de deploy e seu teste.
- `just --list` reconheceu o alvo e `just --dry-run` confirmou os parâmetros
  padrão e personalizados sem executar a publicação.
- `pnpm run test:deploy` passou nos caminhos de sucesso e rollback simulado.
- `pnpm run validate` passou; o check manteve três avisos preexistentes em
  componentes não alterados.
- `pnpm run test:cloud-data` passou com os seis testes existentes.
- A imagem `etfsp:issue-022` foi construída com sucesso.
- A VPS foi consultada apenas para confirmar a presença de `curl`, Docker e
  Docker Compose compatível; nenhum container ou arquivo remoto foi alterado.
