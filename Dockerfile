# ========================
#  Base Build Stage
# ========================
FROM node:20-alpine3.20 AS base

WORKDIR /app
# Instala o curl
RUN apk add --no-cache curl

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

COPY docker/wait-for-it.sh /wait-for-it.sh
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /wait-for-it.sh /entrypoint.sh

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

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

COPY docker/wait-for-it.sh /wait-for-it.sh
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /wait-for-it.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/main.js"]
