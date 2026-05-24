# Handy Admin CLI

Bem-vindo ao **Handy Admin CLI**, o painel administrativo de linha de comando oficial da Handy. Esta ferramenta foi construída para permitir o gerenciamento rápido e seguro da plataforma, manipulando dados do backend, gerenciando usuários administrativos e resolvendo pendências sem a necessidade de uma interface gráfica complexa.

---

## 🛠 Pré-requisitos

Para executar o CLI, você precisará ter instalado em sua máquina:
- **Node.js** (v18 ou superior recomendado)
- **NPM** (Node Package Manager)

---

## ⚙️ Configuração

Antes de rodar a ferramenta, você deve configurar as variáveis de ambiente necessárias para que o CLI consiga se comunicar e gerar as chaves seguras do backend.

Crie ou edite o arquivo `.env` na raiz do projeto `handy-admin-cli/` com as seguintes chaves (exatamente as mesmas usadas no seu backend):

```env
JWT_SECRET="sua_chave_secreta_jwt_aqui"
DEV_JWT_SECRET="sua_chave_secreta_dev_aqui"
ADMIN_JWT_SECRET="sua_chave_secreta_admin_aqui"

SUPER_ADMIN_EMAIL="email_master@admin.com"
SUPER_ADMIN_PASSWORD="senha_master"
```

> **Aviso de Segurança:** O CLI atua de forma "onipotente" gerando tokens em tempo real usando essas chaves do seu backend. Não compartilhe seu `.env` com terceiros.

---

## 🚀 Como Iniciar

1. Abra o terminal na pasta do `handy-admin-cli`.
2. Instale as dependências (se for a primeira vez):
   ```bash
   npm install
   ```
3. Compile e rode o CLI:
   ```bash
   npm run start
   ```
   *(Ou caso o seu script `start` já faça o build transparente, apenas execute o comando).*

---

## 🛡️ Níveis de Acesso e Perfis

Quando o CLI é iniciado, você deve entrar com um login. 
O **Super Admin** (cujas credenciais estão no `.env`) é o perfil Master. Somente ele pode criar contas para outras pessoas acessarem o painel CLI.

Existem 3 tipos de perfil dentro do painel:

### 1. Suporte
Focado em atendimento ao usuário.
- **Atualizar Ticket de Suporte:** Altera o status (ex: Aberto, Resolvido) e detalhes de um ticket informando apenas o seu ID numérico.
- **Deletar Ticket de Suporte:** Remove definitivamente um ticket do banco de dados.

### 2. Moderador
Focado na curadoria e limpeza da plataforma.
- **Deletar Cliente:** Exclui um usuário da plataforma.
- **Deletar Prestador de Serviço:** Exclui um profissional da plataforma.
- **Deletar Avaliação:** Apaga uma nota e comentário da plataforma baseando-se no e-mail do autor ou alvo.
- **Cancelar Contratação:** Invalida um contrato ativo.

### 3. Super Admin
Possui todas as permissões do **Moderador**, além de ferramentas técnicas exclusivas:
- **Gerenciar Usuários do CLI:** Pode criar contas para novos membros da equipe acessarem o CLI, definindo se serão Suporte ou Moderadores. *(As senhas são salvas de forma segura no banco SQLite local do CLI)*.
- **Gerar Tokens de Acesso:** Gera chaves JWT limpas na tela para desenvolvedores utilizarem em testes externos no Postman ou integrações.

---

## 🔍 Busca Inteligente por E-mail (Magic Search)

Você não precisa decorar IDs de banco de dados para operar no CLI. 

Ao utilizar as opções de **Deletar Avaliação** ou **Cancelar Contratação**, você notará que o sistema não exige que você saiba o ID da contratação de cor. 
1. O CLI vai te perguntar apenas o **E-mail** do usuário (Cliente ou Prestador).
2. O sistema fará um cruzamento inteligente de dados chamando rotas de contratos e visualização de perfil no backend em segundo plano.
3. Após alguns instantes, o CLI imprimirá uma lista customizada contendo **apenas as avaliações/contratações vinculadas àquele e-mail** junto com seus IDs, permitindo que você apenas escolha o número que deseja deletar da lista mostrada na sua tela.

---

## ❌ Comandos Globais de Cancelamento

A qualquer momento do uso do CLI, se o painel fizer uma pergunta e você desistir da ação, você pode digitar os atalhos de saída para abortar o fluxo e voltar ao menu principal:

- `0`
- `/v`
- `/voltar`
- `/cancelar`

Isso previne que você exclua dados por acidente caso entre no menu errado.
