# ========================
#  Base Build Stage
# ========================
FROM node:20-alpine3.20 AS base

WORKDIR /app
# Instala ferramentas necessárias
RUN apk add --no-cache curl netcat-openbsd

COPY package*.json ./

# ========================
#  Dependencies Stage
# ========================
FROM base AS deps
RUN npm install

# ========================
#  Development Build
# ========================
FROM deps AS dev

COPY . .

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "run", "start:dev"]

# ========================
#  Production Build
# ========================
FROM deps AS builder

COPY . .
RUN npm run build

# ========================
#  Final Production Image
# ========================
FROM node:20-alpine3.20 AS production

WORKDIR /app

# Instala ferramentas necessárias para produção
RUN apk add --no-cache curl netcat-openbsd

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/main.js"]
