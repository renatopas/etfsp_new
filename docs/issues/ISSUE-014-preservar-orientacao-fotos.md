# ISSUE-014 — Preservar orientação das fotos enviadas

**Estado:** Concluída

**Área:** Envio e processamento de fotos

**Rota afetada:** `/cadfoto`

## Contexto

Algumas imagens, especialmente fotografias feitas por celulares, armazenam a
orientação correta no metadado EXIF `Orientation` em vez de reorganizar os
pixels do arquivo. Visualizadores que interpretam esse metadado exibem a foto
na posição esperada.

No fluxo atual, o arquivo recebido é convertido para WebP e também usado para
gerar uma miniatura, mas a orientação EXIF não é aplicada antes dessas
operações. Como a conversão não preserva esse metadado por padrão, uma foto que
parecia corretamente orientada no dispositivo pode aparecer girada ou
espelhada no site.

As dimensões `OrigLargura` e `OrigAltura` também são obtidas antes da aplicação
da orientação. Em imagens que exigem rotação de 90° ou 270°, os valores podem
ficar invertidos em relação à imagem efetivamente publicada.

## Modificação proposta

Normalizar a orientação da imagem no servidor, com base no metadado EXIF,
antes de gerar o WebP publicado e sua miniatura. Após a normalização, os
arquivos não devem depender do metadado de orientação para serem exibidos
corretamente.

Persistir em `OrigLargura` e `OrigAltura` as dimensões visuais da imagem já
orientada.

## Regras a atender

- Aplicar no servidor a transformação correspondente à orientação EXIF antes
  da conversão para WebP e antes do redimensionamento da miniatura.
- Tratar corretamente todas as orientações EXIF válidas, inclusive as que
  envolvem espelhamento, e não apenas rotações de 90°, 180° e 270°.
- Gerar a imagem publicada e a miniatura a partir da mesma orientação
  normalizada.
- Não depender da preservação do metadado EXIF nos WebPs gerados.
- Manter o limite de 5 MB, o limite de pixels, os formatos aceitos e as demais
  validações atuais do upload.
- Manter nomes de arquivo controlados pelo servidor e aguardar as gravações no
  filesystem e no banco antes de retornar sucesso.
- Imagens sem orientação EXIF devem continuar sendo processadas normalmente,
  sem alteração visual indevida.
- Arquivos com metadados ausentes ou malformados não devem expor detalhes
  internos em mensagens de erro.
- Não registrar metadados EXIF, caminhos privados ou outros dados da imagem em
  logs.

## Fora do escopo

- Corrigir automaticamente arquivos já enviados e publicados.
- Criar ferramentas de rotação ou edição manual no navegador.
- Preservar GPS, identificação do dispositivo ou outros metadados EXIF.
- Alterar formatos aceitos, tamanho máximo do upload ou dimensões máximas da
  miniatura.
- Alterar o schema do banco, a galeria ou as regras de visibilidade das fotos.

## Critérios de aceite

- Uma imagem JPEG com orientação EXIF diferente de 1 é exibida na mesma
  orientação visual apresentada por um visualizador compatível com EXIF antes
  do envio.
- As oito orientações EXIF possíveis, incluindo os casos espelhados, produzem
  resultados visuais corretos.
- O WebP principal e a respectiva miniatura possuem a mesma orientação.
- O redimensionamento respeita a largura e a altura já orientadas e continua
  limitado a 320 × 240, sem ampliação.
- `OrigLargura` e `OrigAltura` correspondem às dimensões da imagem orientada;
  nos casos de 90° e 270°, os eixos são corretamente trocados.
- Imagens sem EXIF e imagens cuja orientação já seja normal continuam sendo
  processadas sem rotação adicional.
- Uma falha de processamento não cria registro no banco nem deixa arquivos
  parciais no diretório de fotos.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passam.

## Validação manual sugerida

Preparar imagens de teste sem dados pessoais, com conteúdo assimétrico e
marcação visível dos cantos, cobrindo as orientações EXIF de 1 a 8. Enviar cada
arquivo e conferir tanto a imagem principal quanto a miniatura na galeria e no
perfil, quando aplicável.

Confirmar no banco de teste que `OrigLargura` e `OrigAltura` correspondem às
dimensões visuais após a orientação. Repetir o envio com PNG ou outro arquivo
sem orientação EXIF para verificar que o comportamento existente foi
preservado.

## Documentos complementares

### Ler antes da implementação

- `AGENTS.md`, especialmente as regras de upload, privacidade e consistência
  entre filesystem e banco.
- `docs/redesign/functional-spec.md`, na seção referente ao envio de fotos.
- `docs/redesign/privacy-data.md`, para preservar o contrato público dos
  metadados de fotos.

### Atualizar ao implementar

- A documentação funcional do envio de fotos, registrando a normalização da
  orientação no servidor.
- Esta issue, com a validação executada, o resultado e o estado final.

## Arquivos de código previstos

- `src/routes/cadfoto/+page.server.ts`.

Não se prevê alteração de schema, migração, importador legado ou componentes
visuais.

## Resultado da implementação

- A imagem recebida passa por `sharp().autoOrient()` antes da conversão do
  arquivo principal e antes do redimensionamento da miniatura.
- Arquivo principal e miniatura são gerados a partir da mesma entrada e com a
  mesma normalização de orientação.
- `OrigLargura` e `OrigAltura` agora vêm das informações do WebP principal já
  orientado, inclusive com os eixos trocados nas orientações 5 a 8.
- Um teste isolado com as orientações EXIF 1 a 8 confirmou as dimensões visuais
  esperadas e a ausência do campo de orientação nos WebPs resultantes.
- Não houve alteração de schema, formatos aceitos, limites ou tratamento de
  falhas de escrita.
- `pnpm run check`, `pnpm run lint` e `pnpm run build` passaram em 14 de agosto
  de 2026.
