# Handy — Projetos Integrados 2 (VIA231) — 2026/1

## 👥 Integrantes

| Nome | GitLab |
|------|--------|
| Felipe Lino | @felipe |
| Guilherme | @guilhermex |
| Melissa Martins | @melissa |
| Garcia | @garcia |
| Guilherme Faleiros | @guilherme.faleiros |

## 🎯 Problema Escolhido

> A plataforma visa
> solucionar quatro problemas identificados na contratação de serviços profissionais: a
> ausência de plataformas centralizadas, a dificuldade em verificar a confiabilidade de
> profissionais, a falta de transparência quanto a preços e disponibilidade, e a
> comunicação ineficiente entre as partes durante o processo de contratação.


## 🛠️ Stack Utilizada

| Camada | Tecnologia |
|--------|-----------|
| Frontend | NodeJS, TypeScript, React Native |
| Backend | NodeJS, TypeScript, NestJS |
| Banco de Dados | PostgreSQL, Redis, PrismaORM |
| Hospedagem | Amazon AWS (EC2 e RDS) |


## 🚀 Guia de Setup e Execução

### Pré-requisitos

```bash
Node.js 20+
PostgreSQL 15+
Redis
Git
```

### Instalação

```bash
# Clone o repositório
git clone https://gitlab.com/uniube-pi2-2026-1/handy.git
cd handy

# Instale as dependências do backend
cd src/backend/handy-backend-nest
npm install

# Configure o arquivo .env com as credenciais do PostgreSQL e Redis
# Execute as migrações do banco de dados
npx prisma migrate dev
```

### Executar localmente

```bash
# Dentro de src/backend/handy-backend-nest
```

### Acessar

- **Local:** http://localhost:4000
- **Produção:** https://SEU-APP.vercel.app _(preencher no CP-5)_

## 📅 Checkpoints

| CP | Data | Entrega | Status |
|----|------|---------|--------|
| CP-1 | 12/03 | Banco de Dados (SQL + ER) | |
| CP-2 | 26/03 | Backend (API CRUD) | |
| CP-3 | 16/04 | Integração (Frontend + API) | |
| CP-4 | 07/05 | MVP end-to-end | |
| CP-5 | 21/05 | Hospedagem + README final | |

## 📝 Licença

Este projeto é parte da disciplina Projetos Integrados 2 — Uniube Uberlândia, 2026/1.
