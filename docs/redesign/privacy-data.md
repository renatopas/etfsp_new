# Privacidade e contrato de dados

Este documento fixa quais dados podem chegar às interfaces públicas. O
redesign não cria um novo modelo de privacidade e não implementa autenticação.
A classificação deve ser aplicada nas consultas e respostas do servidor, não
apenas com condicionais ou CSS no navegador.

## 1. Classificações

- **Público:** pode aparecer para qualquer visitante quando houver valor.
- **Público condicional:** aparece somente quando a flag já persistida autoriza.
- **Interno:** pode ser coletado e persistido, mas nunca é enviado em páginas,
  endpoints de busca, JSON, metadados HTML ou mensagens públicas.
- **Técnico:** usado pelo servidor para executar uma operação; enviar ao cliente
  somente o identificador mínimo quando a navegação exigir.

Campos vazios não aparecem. “Interno” não significa secreto para operadores do
banco, mas significa não publicável pelo site.

## 2. `ExAlunos`

| Campo                            | Classificação       | Regra de apresentação                                                |
| -------------------------------- | ------------------- | -------------------------------------------------------------------- |
| `ID`                             | técnico             | pode compor links e campos ocultos; não é identidade nem autorização |
| `Nome`                           | público             | listagem, perfil e busca de remetente de foto                        |
| `Apelidos`                       | público             | listagem, perfil e desambiguação na busca                            |
| `Curso`                          | público             | listagem, perfil e desambiguação                                     |
| `AnoInicio`                      | público             | período escolar                                                      |
| `AnoTermino`                     | público             | período escolar                                                      |
| `Email`                          | público condicional | retornar somente se `OcultarEmail = 0`                               |
| `OcultarEmail`                   | interno             | aplicar no SQL/servidor; não enviar ao componente                    |
| `Telefone`                       | público condicional | retornar somente se `PublicaTelefone = 1`                            |
| `PublicaTelefone`                | interno             | aplicar no SQL/servidor; não enviar ao componente                    |
| `WhatsApp`                       | público opcional    | somente E.164 válido; publicar como link seguro para `wa.me`         |
| `HomePage`                       | público             | somente URL `http`/`https` validada                                  |
| `Instagram`                      | público opcional    | publicar somente URL HTTPS válida em `instagram.com`                 |
| `Facebook`                       | público opcional    | publicar somente URL HTTPS válida em `facebook.com`                  |
| `LinkedIn`                       | público opcional    | publicar somente URL HTTPS válida em `linkedin.com`                  |
| `ICQ`                            | público             | compatibilidade histórica; omitir quando vazio                       |
| `DadoPubl`                       | público             | o próprio nome do campo define finalidade pública                    |
| `Comentarios`                    | público             | texto fornecido para o perfil; renderizar como texto, não HTML bruto |
| `DtCadastro`                     | público             | exibir somente data legível, sem precisão desnecessária              |
| `EmailAlternativo`               | interno             | nunca publicar sem nova decisão de produto e flag específica         |
| `Endereco`                       | interno             | nunca publicar                                                       |
| `Cidade`                         | interno             | nunca publicar nesta fase                                            |
| `Estado`                         | interno             | nunca publicar nesta fase                                            |
| `CEP`                            | interno             | nunca publicar                                                       |
| `Pais`                           | interno             | nunca publicar nesta fase                                            |
| `ComoEncontrou`                  | interno             | dado de origem/uso administrativo                                    |
| `ComoEncontrouExtra`             | interno             | dado de origem/uso administrativo                                    |
| `CPF`                            | interno             | nunca selecionar em fluxo público                                    |
| `Prontuario`                     | interno             | nunca selecionar em fluxo público                                    |
| `Browser`                        | interno             | não coletar no redesign; nunca publicar                              |
| `RemoteUserIP`                   | interno             | não registrar pela aplicação do redesign; nunca publicar             |
| `Excluido`                       | interno             | usar como filtro obrigatório em consultas públicas                   |
| demais flags e campos auxiliares | interno             | não selecionar nem serializar para o cliente                         |

### Regra para novos cadastros

O redesign não acrescenta escolhas genéricas de privacidade. Para manter o
contrato existente do schema:

- e-mail novo segue o padrão existente `OcultarEmail = 0` e, portanto, é
  público; isso deve ser informado claramente antes do envio;
- telefone não é coletado em novos cadastros; os valores históricos continuam
  sujeitos a `PublicaTelefone`;
- WhatsApp é um campo público independente, normalizado para E.164, e vazio
  permanece `NULL`;
- cada rede social é pública somente quando sua URL é informada
  voluntariamente no campo correspondente; valor vazio permanece `NULL`;
- alteração dessas flags em registros existentes continua sendo operação
  administrativa fora do site público.

Se o produto decidir futuramente inverter o padrão do e-mail, isso exigirá uma
decisão explícita, ajuste do formulário e avaliação dos dados existentes; não
deve ser feito incidentalmente numa tarefa visual.

## 3. `Fotos`

| Campo ou conteúdo                       | Classificação      | Regra                                                                 |
| --------------------------------------- | ------------------ | --------------------------------------------------------------------- |
| imagem convertida e miniatura           | público            | servir apenas se houver registro `Excluido = 0` correspondente        |
| `idFoto`                                | técnico            | não precisa aparecer visualmente                                      |
| `TituloFoto`                            | público            | renderizar como texto                                                 |
| `CursoFoto`                             | público            | metadado e filtro                                                     |
| `AnoFoto`                               | público            | metadado e filtro                                                     |
| `AnoFormatura`                          | público            | metadado e filtro                                                     |
| `TurmaFoto`                             | público            | pode ajudar a identificar a foto                                      |
| `Carometro`                             | público            | classificação/filtro, não autorização                                 |
| `FotoPessoal`                           | público            | classificação para perfil/lista, não autorização                      |
| `idExAlunoUpload`                       | técnico            | usado para filtro e vínculo; não prova quem enviou                    |
| `NomeArqStored` e `NomeMiniaturaStored` | técnico público    | somente nomes gerados/controlados pelo servidor e validados ao servir |
| `NomeArqOriginal`                       | interno            | não expor; pode conter dados locais da pessoa                         |
| `EmailFoto`                             | interno            | nunca publicar                                                        |
| tamanho, MIME e dimensões originais     | interno/técnico    | validar e auditar no servidor; não mostrar na galeria                 |
| `DtUploadFoto`                          | interno nesta fase | não exibir sem necessidade de produto                                 |
| `Excluido`                              | interno            | filtro obrigatório em toda consulta e entrega de arquivo              |

## 4. Modelos públicos mínimos

Os tipos abaixo são orientativos; nomes finais podem seguir a convenção do
projeto. O ponto obrigatório é não reutilizar uma linha completa do banco como
retorno de `load`.

```ts
interface AlumniListItem {
  id: number;
  name: string;
  nickname?: string;
  course?: string;
  startYear?: number;
  endYear?: number;
  thumbnail?: string;
}

interface PublicAlumniProfile extends AlumniListItem {
  email?: string; // já filtrado por OcultarEmail no servidor
  phone?: string; // já filtrado por PublicaTelefone no servidor
  whatsapp?: string; // E.164 validado no servidor
  whatsappUrl?: string; // link HTTPS derivado pelo servidor
  homepage?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  icq?: string;
  publicInfo?: string;
  comments?: string;
  registeredAt?: number;
  photoCount: number;
}

interface PublicPhoto {
  title?: string;
  course?: string;
  className?: string;
  photoYear?: number;
  graduationYear?: number;
  thumbnailUrl: string;
  imageUrl: string;
}
```

As URLs das fotos devem ser construídas a partir de nomes armazenados já
validados. Nunca aceitar um caminho arbitrário vindo da URL.

## 5. Consultas públicas

- Selecionar colunas explicitamente; `SELECT *` é proibido.
- Incluir `Excluido = 0` em todas as consultas de ex-alunos e fotos, inclusive
  consultas por ID e relações auxiliares.
- Aplicar e-mail e telefone condicionais no servidor, preferencialmente com
  `CASE` ou mapeamento imediatamente após a leitura, antes de formar o retorno.
- Busca de nome para upload retorna apenas ID, nome, apelido, curso e período.
- Parâmetros de busca, ID, filtro, página e ordenação são validados no servidor.
- Ordenação usa allowlist de fragmentos SQL conhecidos.
- `%` e `_` fornecidos em buscas literais são escapados.
- Limitar resultados de autocomplete e paginação para reduzir coleta em massa.

## 6. Logs e mensagens

É proibido registrar:

- `FormData` completo;
- objetos completos de ex-alunos;
- e-mails, telefone, endereço, CEP, CPF ou prontuário;
- IP, token do Turnstile, nome original de arquivo ou caminhos privados;
- SQL com valores interpolados;
- stack trace em resposta ao visitante.

Logs operacionais podem usar código genérico do erro, rota, horário e um ID
interno de correlação. Mensagens públicas descrevem a ação possível, por
exemplo: “Não foi possível processar a imagem. Escolha outro arquivo e tente
novamente.”

## 7. Cache e reexibição de formulário

- Respostas de cadastro e upload não devem ser armazenadas por cache
  compartilhado.
- Em erro de cadastro, valores podem voltar apenas na resposta à mesma pessoa,
  exceto tokens e campos cujo retorno não seja necessário.
- Sucesso retorna contexto mínimo e não repete os dados internos enviados.
- Endpoints de autocomplete não devem devolver mais de 10 resultados por
  requisição.

## 8. Consequências de não haver autenticação

Esta é uma decisão de produto e deve permanecer explícita:

- selecionar um ID ou nome não comprova identidade;
- não existe “meu perfil” ou “minhas fotos”;
- não há edição ou exclusão automática por visitante;
- pedidos de correção e remoção seguem pelo contato do responsável;
- o site não deve afirmar que o remetente foi verificado;
- upload, Turnstile, validação e eventual limitação de requisições reduzem abuso,
  mas não criam autorização.

Adicionar autenticação não é requisito nem solução prevista neste redesign.

## 9. Correções obrigatórias identificadas antes da publicação

A modernização visual não pode perpetuar estes comportamentos do código atual:

- remoção de logs que imprimem formulário, dados pessoais ou caminhos;
- aplicação real de `OcultarEmail` antes de retornar o perfil;
- retirada de `ComoEncontrou` e `ComoEncontrouExtra` do perfil público;
- aplicação de `Excluido = 0` em fotos consultadas por ex-aluno;
- validação de que o nome de arquivo servido pertence a uma foto não excluída;
- espera efetiva (`await`) de gravações de foto antes de responder sucesso;
- mensagens de erro de imagem sem detalhes internos.

Essas correções fazem parte das fases funcionais correspondentes no plano de
implementação.
