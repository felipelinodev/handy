# Documentação Completa da API - Handy Backend (NestJS)

Esta documentação provê uma visão detalhada de todos os módulos, rotas (endpoints), parâmetros, corpos de requisição (bodies) e cenários de teste esperados do backend "Handy".

> A autenticação na maioria das rotas privadas utiliza JWT (JSON Web Token). Deve-se incluir no cabeçalho (*Header*) da requisição:
> `Authorization: Bearer <seu_token>`

---

## Índice
1. [Módulo: Analysis](#1-módulo-analysis)
2. [Módulo: Breakpoints](#2-módulo-breakpoints)
3. [Módulo: Category](#3-módulo-category)
4. [Módulo: Client](#4-módulo-client)
5. [Módulo: Contratations](#5-módulo-contratations)
6. [Módulo: Conversations](#6-módulo-conversations)
7. [Módulo: Messages](#7-módulo-messages)
8. [Módulo: Provider](#8-módulo-provider)
9. [Módulo: Services](#9-módulo-services)
10. [Módulo: Support](#10-módulo-support)

---

## 1. Módulo: Analysis

Responsável por análises de métricas, receitas e desempenho geral dos serviços e prestadores.

### Endpoints

#### `GET /analysis/contracted-services`
- **Descrição**: Retorna a listagem/relatório de serviços contratados do prestador/sistema.
- **Parâmetros de Rota (Params)**: Nenhum.
- **Body**: Nenhum.
- **Testes Recomendados**:
  - Validar se retorna `200 OK` e uma lista de objetos do tipo `contratacoes`.
  - Validar se o token do prestador/admin barra sem-autorização (`401 Unauthorized`).

#### `GET /analysis/revenue-services`
- **Descrição**: Obter dados sobre faturamento e receita financeira.
- **Parâmetros de Rota**: Nenhum (Geralmente via Query/Token).
- **Body**: Nenhum.
- **Testes Recomendados**: Garantir a formatação de valores no tipo numérico `Decimal`.

#### `GET /analysis/get-performance`
- **Descrição**: Extrai as métricas de desempenho.
- **Testes Recomendados**: Validar se retorna total de clientes, e `media_avaliacao`.

#### `GET /analysis/list-service-provider-clients`
- **Descrição**: Lista todos os clientes que um determinado prestador atendeu.

---

## 2. Módulo: Breakpoints

Gerencia "breakpoints" atrelados a uma mensagem ou conversa entre prestador e cliente de forma customizada.

### Endpoints

#### `POST /breakpoints/create-new-breakpoints`
- **Descrição**: Cria um novo breakpoint (marco temporal/aviso atrelado a mensagens).
- **Body Esperado**:
  ```json
  {
    "prestador_id": 1,
    "cliente_id": 2,
    "mensagem_id": 3,
    "titulo": "Revisão do código em andamento",
    "descricao": "..."
  }
  ```
- **Testes**: Validar regras do Zod/Schema para verificar se os identificadores numéricos e o título (string máx 100 char) estão corretos.

#### `GET /breakpoints/view-breakpoints/:id`
- **Parâmetros de Rota**: `id` (numérico, ID do breakpoint).
- **Retorno**: Um objeto do modelo `breakpoints`.

#### `PATCH /breakpoints/edit-a-breakpoint/:id`
- **Parâmetros de Rota**: `id` do breakpoint.
- **Body** (Parcial do Create, campos opcionais): `titulo`, `descricao`.

#### `DELETE /breakpoints/delete-a-breakpoint/:id`
- **Testes**: Enviar o ID e assertar que o banco retorna deleção com sucesso ou `404 Not Found` caso já excluído.

---

## 3. Módulo: Category

Categorização dos serviços prestados (ex: "Limpeza", "Jardinagem", "TI").

### Endpoints

#### `POST /category/register-category`
- **Body Esperado**:
  ```json
  {
    "nome_categoria": "Manutenção",
    "rank_categoria": 0
  }
  ```
- **Testes**: Tentar cadastrar nome duplicado e confirmar se retorna erro (Unique constraint).

#### `GET /category/view-category/:id`
- **Descrição**: Detalhe de uma categoria pelo ID.

#### `GET /category/view-all-category`
- **Descrição**: Lista global de categorias (paginação ignorada por default). 

#### `DELETE /category/remove-category/:id`

---

## 4. Módulo: Client

Gerencia os usuários do tipo "Cliente".

### Endpoints

#### `POST /client/create-client-account`
- **Descrição**: Registra um usuário na base e também na tabela de clientes.
- **Body Esperado**:
  ```json
  {
    "nome": "João Silva",
    "email": "joao@example.com",
    "senha": "password123",
    "cpf": "12345678901",
    "tipo_usuario": "cliente",
    "endereco": "Rua Exemplo"
  }
  ```
- **Testes**: Garantir integridade de e-mail e cpf únicos e `BadRequestException` se os dados Zod falharem.

#### `GET /client/view-client/:id`
- **Headers**: Autorização.
- **Parâmetros**: `id` via `ParseIntPipe`.
- **Testes**: Enviar letras no lugar de um número do `:id` e testar `400 Bad Request` do ParseIntPipe do NestJS.

#### `PATCH /client/update-client/:id`
- **Body Esperado**: (Qualquer campo string como `nome`, `endereco`, `descricao`, ou `photo_url`).

#### `POST /client/login-client`
- **Body Esperado**:
  ```json
  {
    "email": "joao@example.com",
    "senha": "password123"
  }
  ```
- **Retorna**:
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "user": { ... }
  }
  ```

#### `DELETE /client/delete-a-client/:email`
- **Headers**: Exige o Header customizado `admin-key`.
- **Parâmetros**: Param de URL `email`.

---

## 5. Módulo: Contratations

Fluxo onde um cliente formaliza o pedido/solicitação dos serviços de um prestador.

### Endpoints

#### `POST /contratations/create-a-contratation`
- **Body**:
  ```json
  {
    "cliente_id": 1,
    "prestador_id": 2,
    "servico_id": 10,
    "titulo": "Criação de APP Web",
    "detalhes": "...",
    "endereco": "..."
  }
  ```

#### `GET /contratations/view-a-contract/:id`
- **Descrição**: Visualiza o status da contratação (ex: 'Pendente', 'Concluído').

#### `GET /contratations/view-all-contracts`
- **Descrição**: Traz todas as contratações (admin/system) ou baseado no token.

#### `PATCH /contratations/update/:id`
- **Body**: Modificação de `status`, `conclusao` (Data), ou `vencimento`.

#### `DELETE /contratations/cancel-a-contratation/:id`
- **Testes**: Atualizar/Deletar e checar efeito em cascata (caso existam avaliações atreladas, devem ser apagadas de acordo com as actions Cascade criadas no Prisma Prisma).

---

## 6. Módulo: Conversations

Agrupa a conversa principal atrelada à uma contratação.

### Endpoints

#### `POST /conversations/create-new-chat`
- **Body**:
  ```json
  {
    "contratacao_id": 16,
    "cliente_id": 1,
    "prestador_id": 2
  }
  ```

#### `GET /conversations/view-chat/:conversaId`
- **Retorna**: Os detalhes do chat + Join das mensagens atreladas.

#### `PATCH /conversations/add-status-a-chat/:conversaId`
- **Body**:
  ```json
  { "status": "Fechada" }
  ```

#### `PATCH /conversations/update-chat/:conversaId`
- **Descrição**: Atualizações genéricas.

#### `DELETE /conversations/delete-chat/:conversaId`

---

## 7. Módulo: Messages

Aplica-se às linhas temporais e mensagens do chat de negociação da plataforma.

### Endpoints

#### `POST /messages/create-new-menssage` / `POST /messages/create-menssage`
- **Body Esperado**:
  ```json
  {
    "conversa_id": 1,
    "remetente_id": 2,
    "conteudo": "Olá, aceita minha proposta?",
    "remetente_tipo": "prestador",
    "anexo_url": ""
  }
  ```

#### `GET /messages/view-menssages/:conversaId`
- **Atenção**: Rota exposta exata definida com `menssages` no controlador.
- **Descrição**: Traz as mensagens ligadas pela constraint de `conversa_id`.

#### `GET /messages/view-all-menssages`

#### `DELETE /messages/delete-a-menssage/:mensagemId`

---

## 8. Módulo: Provider

Gerencia a conta e configurações dos Prestadores de Serviços (Service Providers).

### Endpoints

#### `POST /provider/create-service-provider-account`
- **Body**: 
  ```json
  {
    "nome": "Empresa X",
    "email": "contato@x.com",
    "senha": "password321",
    "cpf": "99988877711",
    "tipo_usuario": "prestador",
    "descricao": "..."
  }
  ```

#### `GET /provider/view-service-provider/:id`
#### `PATCH /provider/update-service-provider/:id`
#### `POST /provider/login-service-provider`
- **Body**: `{ "email": "", "senha": "" }`

#### `DELETE /provider/delete-a-service-provider/:email`

---

## 9. Módulo: Services

Serviços ofertados no perfil de um prestador.

### Endpoints

#### `POST /services/create-new-service`
- **Body**:
  ```json
  {
    "prestador_id": 2,
    "categoria_id": 1,
    "nome_servico": "Pintura Externa",
    "descricao": "Pintura com até duas demãos.",
    "preco": 150.00
  }
  ```

#### `GET /services/list-all-services`
#### `GET /services/list-a-service/:id`
#### `PATCH /services/edit-a-service/:id`
#### `DELETE /services/delete-a-service/:id`

---

## 10. Módulo: Support

Tickets para suporte nativo gerados pelo cliente ou prestador direcionados ao suporte.

### Endpoints

#### `POST /support/create-new-ticket/:usuarioId`
- **Body**:
  ```json
  {
    "titulo": "Erro ao tentar agendar",
    "descricao": "O botão fica travado após aceitar...",
    "categoria": "Bug Sistema"
  }
  ```

#### `GET /support/view-tickets/:usuarioId`
#### `GET /support/view-a-ticket/:ticketId`
#### `PATCH /support/update-ticket/:ticketId`
- **Body Recomendado**: Envio de "status", ex: `{"status": "Fechado"}`.

#### `DELETE /support/delete-a-ticket/:ticketId`

---

## Guia de Testes Esperados Gerais (E2E / Integração)
O NestJS possui uma base em Jest contida geralmente com testes E2E (`app.e2e-spec.ts`). As diretrizes recomendadas de testes unitários para esses controladores devem avaliar os seguintes cenários:

1. **Validação de Inputs (Zod/Class-validator)**
   - Passar corpos inválidos ou faltando partes, exigindo códigos HTTTP `400 BadRequest`.
2. **Autenticação e Permissão (Guards)**
   - Avaliar se requisições desacompanhadas de `Authorization: Bearer <token>` respondem com `401 Unauthorized`.
3. **Pipes e Variáveis Exatas**
   - Utilização do `ParseIntPipe` com strings na URL deve falhar nas rotas de busca de ID, provindo `400`.
4. **Relacionamento Prisma**
   - Garantir via mocks que o serviço repassa a camada de banco de dados e retorna chaves estrangeiras apropriadas ou relatórios de cascata (Cascade delete).
