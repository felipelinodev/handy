# Handy - Prestação de Serviços Gerais

> Sistema integrado contendo Backend, Frontends (Admin CLI e Mobile) e Estrutura de Banco de Dados.

## Sobre o Projeto

O **Handy** é uma aplicação que tem como objetivo conectar prestadores de serviços e clientes que queiram consumir esses serviços. O nosso grande diferencial é ser uma plataforma descentralizada, feita para todos e atendendo a todos, provendo serviços escaláveis através de uma arquitetura organizada.

## Estrutura do Repositório

O projeto está estruturado no formato *monorepo*, contendo os seguintes diretórios principais:

```text
Handy/
├── database/            # Scripts, esquemas e configurações do Banco de Dados
├── docs/                # Documentação detalhada, arquitetura e notas de versão
└── src/
    ├── backend/         # API Principal e lógica de negócios
    ├── frontend-admin-cli/ # Interface de Linha de Comando (CLI) para Administração
    └── frontend-mobile/ # Aplicativo Mobile para usuários finais
```

## Stack de Tecnologias

**Ferramentas Principais**
- **Ecossistema:** Node.js | TypeScript | NestJS | React Native
- **Pagamentos:** Stripe

**Banco de Dados & Cache**
- **Relacional:** PostgreSQL
- **Cache:** Redis

**Infraestrutura & Deploy**
- **Provider:** Amazon AWS (EC2 e RDS)

**Segurança & Algoritmos**
- **Autenticação:** JWT (JSON Web Tokens) e OAuth
- **Hashing:** Argon2

**Bibliotecas & Validação**
- **ORM:** PrismaORM
- **Validação de Dados:** Zod-Validator

**Ferramentas Auxiliares**
- **Editor de Código:** Antigravity
- **Testes Api:** Postaman

## Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina as seguintes ferramentas:
- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)

## Instalação e Execução local

### 1. Clonando o Repositório

```bash
git clone https://gitlab.com/uniube-pi2-2026-1/handy.git
cd handy
```

### 2. Backend

Navegue até o diretório do backend e execute os comandos adequados para instalação das dependências:
```bash
cd src/backend
# Instale as dependências
npm install
# Execute o servidor em modo de desenvolvimento
npm run start:dev
```

### 3. Frontend Admin CLI

```bash
cd src/frontend-admin-cli
npm install
```

### 4. Frontend Mobile

```bash
cd src/frontend-mobile
npm install
```

### 5. Banco de Dados

As instruções e scripts para inicialização do banco de dados encontram-se no diretório `database/`. 

Com o repositório configurado, atualize seu `.env` com as credenciais do PostgreSQL e Redis, e em seguida aplique as migrações pelo Prisma no diretório do backend:
```bash
cd src/backend
npx prisma migrate dev
```

## Documentação Adicional

A documentação detalhada da API, arquitetura de sistemas e manuais de uso podem ser encontrados na pasta [`/docs`](./docs/).
