# Implantação

Este diretório contém exemplos e instruções de implantação. Segredos e dados
persistentes não pertencem ao Git.

## Arquivos e dados

- `compose.yaml`: serviços ETFSP, Umami e PostgreSQL.
- `.env.example`: nomes das variáveis necessárias, sem valores reais.
- `deploy/Caddyfile.example`: configuração pública do proxy reverso.
- `deploy/backup.sh`: gera backups locais consistentes para posterior envio a
  um armazenamento externo.
- `.env`, `db.sqlite3`, `Fotos/`, `backups/` e o volume `umami-db-data`: existem
  somente na VPS e/ou no armazenamento de backups.

Mantenha o `.env` real também em um cofre de senhas. Guarde os backups de dados
fora da VPS, preferencialmente criptografados (por exemplo, com restic).

## Primeira implantação

1. Aponte os registros DNS de `etfsp.com`, seus aliases e `umami.etfsp.com` para
   a VPS.
2. Clone o repositório na VPS.
3. Copie `.env.example` para `.env`, preencha os valores e execute
   `chmod 600 .env`.
4. Coloque `db.sqlite3` e `Fotos/` na raiz do checkout. O diretório deve existir
   mesmo que ainda esteja vazio.
5. Instale `deploy/Caddyfile.example` como `/etc/caddy/Caddyfile`, valide e
   recarregue o Caddy.
6. Valide e inicie os containers:

   ```sh
   docker compose config
   docker compose pull
   docker compose up -d
   docker compose ps
   ```

As portas 3000 e 3001 são publicadas apenas em `127.0.0.1`, para uso pelo Caddy
instalado no host. Não publique a porta 5432 nem abra essas três portas no
firewall da OCI.

No primeiro acesso a `https://umami.etfsp.com`, entre com `admin` / `umami`,
troque imediatamente a senha e cadastre `etfsp.com`. Copie o Website ID para
`PUBLIC_UMAMI_WEBSITE_ID` no `.env` e recrie o serviço:

```sh
docker compose up -d --force-recreate etfsp
```

Se `PUBLIC_UMAMI_URL` ou `PUBLIC_UMAMI_WEBSITE_ID` estiver vazia, o site
simplesmente não carrega o rastreador.

## Caddy

Antes de recarregar uma alteração:

```sh
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

O bloco `:80` criado pela instalação padrão do Caddy não é necessário depois
que os domínios reais estão configurados.

## Backup

O script exige `sqlite3`, `docker`, `gzip` e `tar` no host:

```sh
./deploy/backup.sh
```

Ele cria uma pasta ignorada pelo Git em `backups/<data UTC>/` contendo:

- uma cópia consistente do SQLite;
- as fotos compactadas;
- um dump lógico do PostgreSQL do Umami.

O resultado ainda está na mesma VPS e **não é um backup completo** até ser
copiado para armazenamento externo. Automatize o envio e teste periodicamente a
restauração em outra máquina.

## Atualizações

Faça um backup antes de atualizar. Depois:

```sh
docker compose pull
docker compose up -d
docker compose ps
docker compose logs --tail=100 umami umami-db etfsp
```

Em produção, prefira trocar gradualmente a tag `latest` do Umami por uma versão
testada e fixada. Acompanhe `free -h`, `docker stats` e reinícios com código 137;
1 GB de RAM é um limite apertado e recomenda-se swap ou uma VPS de 2 GB.
