FROM node:20-slim AS builder

# Instalar OpenSSL, necessário para o Prisma funcionar em imagens slim
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copiar arquivos de configuração primeiro para aproveitar o cache do Docker
COPY package*.json ./
COPY prisma ./prisma/

# Instalar as dependências
RUN npm install

# Copiar todo o código fonte
COPY . .

# Gerar o cliente Prisma e compilar a aplicação NestJS
RUN npx prisma generate
RUN npm run build

# --- Stage 2: Produção ---
FROM node:20-slim

# Instalar OpenSSL na imagem final também
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar do estágio 'builder' apenas o que é necessário para rodar o app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expor a porta que o NestJS costuma usar
EXPOSE 3000

# Comando para iniciar a API
CMD [ "npm", "run", "start:prod" ]
