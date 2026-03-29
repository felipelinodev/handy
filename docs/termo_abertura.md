# Termo de Abertura do Projeto

**Handy – Plataforma para Prestadores de Serviços**

## 1. Identificação do Projeto
| | |
|---|---|
| **Nome do Projeto** | Handy |
| **Data de Início** | Março de 2026 |

## 2. Equipe do Projeto
| Integrante |
|---|
| Felipe Lino |
| Guilherme Garcia |
| Guilherme Antônio De Souza |
| Haristoneu |
| Melissa |

## 3. Descrição do Projeto
O Handy é uma plataforma digital voltada à conexão entre clientes que necessitam de serviços domésticos ou profissionais especializados e prestadores de serviço disponíveis. O sistema abrange uma aplicação web e um aplicativo mobile, oferecendo funcionalidades de busca, contratação, comunicação e gerenciamento de serviços em um único ambiente centralizado.

## 4. Justificativa e Problema
A contratação de serviços profissionais especializados frequentemente enfrenta obstáculos que prejudicam tanto clientes quanto prestadores. Os principais problemas identificados são:

- Ausência de plataformas centralizadas para busca e contratação de serviços;
- Dificuldade em verificar a confiabilidade e a reputação dos profissionais;
- Falta de transparência quanto a preços, disponibilidade e condições;
- Comunicação ineficiente entre cliente e prestador durante o processo de contratação.

O Handy propõe-se a solucionar esses problemas por meio de uma solução tecnológica acessível, transparente e intuitiva.

## 5. Objetivos do Projeto

### Objetivo Geral
Desenvolver uma plataforma digital funcional que conecte clientes e prestadores de serviços, facilitando o processo de busca, contratação e comunicação entre as partes.

### Objetivos Específicos
- Implementar módulo de cadastro e autenticação de usuários (OAuth + JWT);
- Desenvolver mecanismo de busca e filtragem de prestadores por categoria e localidade;
- Criar sistema de avaliação e reputação dos prestadores;
- Integrar processamento de pagamentos via Stripe;
- Disponibilizar aplicativo mobile (React Native) com paridade de funcionalidades ao web;
- Hospedar a solução em infraestrutura AWS com arquitetura monolítica modular.

## 6. Escopo

### Incluso no Escopo
- Aplicação web (React + Vite) e mobile (React Native);
- API backend em NestJS com banco de dados PostgreSQL via Amazon RDS (Prisma ORM);
- Autenticação segura com JWT, Bcrypt / Argon2 e OAuth;
- Integração com Stripe para pagamentos;
- Deploy em ambiente AWS (EC2 + RDS).

### Fora do Escopo
- Suporte a múltiplos idiomas;
- Integrações com sistemas legados externos.

## 7. Stack Tecnológica
| Camada | Tecnologias |
|---|---|
| **Frontend** | TypeScript · React · Vite · Shadcn UI · Axios |
| **Backend** | TypeScript · Node.js · NestJS · Prisma ORM · JWT · Bcrypt / Argon2 · Stripe · OAuth · Redis · Cookies |
| **Banco de Dados** | PostgreSQL (via Amazon RDS) |
| **Mobile** | TypeScript · React Native · Zod · React Hook Form |
| **Infraestrutura** | AWS (EC2 + RDS) · Arquitetura Monolítica Modular · API RESTful / Serverless-ready |

## 8. Restrições e Premissas

### Restrições
- O prazo de entrega das funcionalidades é definido pelo calendário da Uniube;
- Os recursos de infraestrutura AWS serão dimensionados conforme a demanda inicial.

### Premissas
- A equipe manterá ciclos de entrega incrementais com revisões periódicas.

## 9. Principais Riscos
| Risco | Probabilidade | Mitigação |
|---|:---:|---|
| Conflito de agenda entre integrantes | Alta | Reuniões semanais fixas + comunicação assíncrona |
| Complexidade técnica além do nível atual | Média | Divisão de tarefas por nível de habilidade |
| Atraso no prazo de entrega | Média | Sprints curtos com entregas incrementais |

## 10. Aprovação
Ao assinar este documento, os integrantes da equipe reconhecem e concordam com o escopo, os objetivos e as premissas definidas neste Termo de Abertura.

<br><br>
___________________________________________
**Gerente do Projeto**
Data: _____ / _____ / 2026
