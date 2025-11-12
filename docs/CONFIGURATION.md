# Guia de Configuração

Este documento detalha todas as variáveis de ambiente e configurações necessárias para executar o projeto.

---

## 📋 Variáveis de Ambiente

### Banco de Dados

```bash
DATABASE_URL="postgresql://root:docker@localhost:5432/osiris_db?schema=public"
```

**Formato:** `postgresql://[user]:[password]@[host]:[port]/[database]?schema=[schema]`

- **user**: Usuário do PostgreSQL (padrão: `root`)
- **password**: Senha do PostgreSQL (padrão: `docker`)
- **host**: Endereço do servidor (padrão: `localhost`)
- **port**: Porta do PostgreSQL (padrão: `5432`)
- **database**: Nome do banco de dados (padrão: `osiris_db`)
- **schema**: Schema do banco (padrão: `public`)

### Keycloak

```bash
# URL do servidor Keycloak
KC_AUTH_SERVER_URL=http://localhost:8088/auth

# Nome do realm
KC_REALM=template

# ID do cliente
KC_CLIENT_ID=template-client

# Secret do cliente
KC_SECRET=your-client-secret-here

# Credenciais do administrador
KC_ADMIN_USER=admin
KC_ADMIN_PASSWORD=admin
```

#### Como Obter o Client Secret

1. Acesse o Keycloak Admin Console: `http://localhost:8088/auth/admin`
2. Faça login com as credenciais de admin
3. Selecione o realm `template`
4. Vá em **Clients** → **template-client**
5. Na aba **Credentials**, copie o valor do **Secret**

### JWT

```bash
JWT_SECRET=your-super-secret-jwt-key
```

⚠️ **Importante:** 
- Use uma chave forte e aleatória em produção
- Nunca compartilhe ou commite esta chave
- Exemplo de geração: `openssl rand -base64 32`

### Aplicação

```bash
PORT=3000
NODE_ENV=development
```

**NODE_ENV** valores possíveis:
- `development`: Ambiente de desenvolvimento
- `production`: Ambiente de produção
- `test`: Ambiente de testes

### SonarQube (Opcional)

```bash
SONAR_HOST_URL=http://localhost:9000
SONAR_TOKEN=your-sonar-token
```

#### Como Gerar Token SonarQube

1. Acesse: `http://localhost:9000`
2. Login: `admin` / `admin`
3. Vá em **My Account** → **Security** → **Generate Token**
4. Dê um nome ao token e copie o valor gerado

---

## 🔧 Arquivo .env

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```bash
# Banco de Dados
DATABASE_URL="postgresql://root:docker@localhost:5432/osiris_db?schema=public"

# Keycloak
KC_AUTH_SERVER_URL=http://localhost:8088/auth
KC_REALM=template
KC_CLIENT_ID=template-client
KC_SECRET=your-client-secret-here
KC_ADMIN_USER=admin
KC_ADMIN_PASSWORD=admin

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Aplicação
PORT=3000
NODE_ENV=development

# SonarQube (Opcional)
SONAR_HOST_URL=http://localhost:9000
SONAR_TOKEN=
```

---

## 🐳 Configuração Docker

### docker-compose.yml

O arquivo `docker-compose.yml` define os seguintes serviços:

#### API (Aplicação NestJS)

```yaml
api:
  build:
    context: .
    target: dev
  ports:
    - '3000:3000'
  depends_on:
    - postgres
    - keycloak
```

#### PostgreSQL

```yaml
postgres:
  image: postgres:15
  environment:
    POSTGRES_DB: osiris_db
    POSTGRES_USER: root
    POSTGRES_PASSWORD: docker
  ports:
    - '5432:5432'
```

#### Keycloak

```yaml
keycloak:
  image: quay.io/keycloak/keycloak:19.0.1
  command:
    - start-dev
    - --import-realm
  environment:
    KEYCLOAK_ADMIN: admin
    KEYCLOAK_ADMIN_PASSWORD: admin
  ports:
    - '8088:8080'
```

#### SonarQube

```yaml
sonarqube:
  image: sonarqube:community
  depends_on:
    - sonarqube-db
  ports:
    - '9000:9000'
```

---

## ⚙️ Configuração Prisma

### schema.prisma

Localizado em `prisma/schema.prisma`:

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
  output        = "./client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Configurações:**

- **binaryTargets**: Suporta execução em containers Linux
- **output**: Cliente gerado em `prisma/client` (importar como `prisma/client`)

### Comandos Prisma

```bash
# Gerar cliente
npx prisma generate

# Criar migração
npx prisma migrate dev --name nome_da_migracao

# Aplicar migrações
npx prisma migrate deploy

# Visualizar banco de dados
npx prisma studio

# Resetar banco de dados (CUIDADO!)
npx prisma migrate reset
```

---

## 🔐 Configuração Keycloak

### Realm Template

O arquivo `docker/template-realm.json` contém a configuração pré-definida do realm.

**Recursos incluídos:**

- Realm `template` configurado
- Cliente `template-client` configurado
- Roles padrão: `admin`, `user`
- Usuários de teste (opcional)

### Importação Manual

Se necessário importar manualmente:

1. Acesse Keycloak Admin Console
2. Vá em **Realm Settings** → **Partial Import**
3. Selecione o arquivo `docker/template-realm.json`
4. Marque as opções desejadas
5. Clique em **Import**

### Criar Cliente Manualmente

1. **Create Client:**
   - Client ID: `template-client`
   - Client Protocol: `openid-connect`

2. **Settings:**
   - Access Type: `confidential`
   - Valid Redirect URIs: `http://localhost:3000/*`
   - Web Origins: `*`

3. **Roles:**
   - Criar role `admin`
   - Criar role `user`

4. **Credentials:**
   - Copiar o Secret gerado

---

## 🧪 Configuração de Testes

### jest.config.js

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: './',
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.spec.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.dto.ts',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^prisma/client$': '<rootDir>/test/mocks/utils.ts',
  },
};
```

**Principais configurações:**

- **testRegex**: Arquivos de teste com `.spec.ts`
- **setupFilesAfterEnv**: Setup executado antes dos testes
- **moduleNameMapper**: Resolve imports e mocks

### Arquivo .env.test

Para testes, crie um arquivo `.env.test`:

```bash
DATABASE_URL="postgresql://root:docker@localhost:5432/osiris_db_test?schema=public"
NODE_ENV=test

# Keycloak (pode usar mock ou instância de teste)
KC_AUTH_SERVER_URL=http://localhost:8088/auth
KC_REALM=template
KC_CLIENT_ID=template-client
KC_SECRET=test-secret
KC_ADMIN_USER=admin
KC_ADMIN_PASSWORD=admin

JWT_SECRET=test-jwt-secret
```

---

## 📊 Configuração SonarQube

### sonar-project.properties

```properties
sonar.projectKey=template
sonar.projectName=Template NestJS
sonar.projectVersion=0.0.1

sonar.host.url=http://sonarqube:9000

sonar.sources=src
sonar.tests=test

sonar.exclusions=\
  **/node_modules/**,\
  **/dist/**,\
  **/coverage/**

sonar.typescript.tsconfigPath=tsconfig.json
sonar.typescript.lcov.reportPaths=coverage/lcov.info
```

### Primeira Execução

1. **Subir SonarQube:**
   ```bash
   npm run sonar:up
   ```

2. **Aguardar inicialização** (pode levar alguns minutos)

3. **Acessar:** http://localhost:9000
   - Login: `admin` / `admin`
   - Será solicitado trocar a senha

4. **Gerar Token:**
   - My Account → Security → Generate Token

5. **Adicionar ao .env:**
   ```bash
   SONAR_TOKEN=seu_token_aqui
   ```

6. **Executar análise:**
   ```bash
   npm run sonar:analysis
   ```

---

## 🔒 Segurança em Produção

### Variáveis de Ambiente

❌ **Não fazer:**
- Commitar arquivo `.env` com credenciais reais
- Usar senhas padrão em produção
- Compartilhar secrets em texto plano
- Usar `JWT_SECRET` simples

✅ **Fazer:**
- Usar gerenciadores de secrets (AWS Secrets Manager, Azure Key Vault, etc.)
- Gerar senhas fortes e aleatórias
- Rotacionar secrets regularmente
- Usar variáveis de ambiente do sistema ou container

### Exemplo de Geração de Secrets

```bash
# JWT Secret forte
openssl rand -base64 32

# Password forte
openssl rand -base64 24

# UUID
uuidgen
```

### Docker Secrets

Para usar Docker Secrets em produção:

```yaml
services:
  api:
    secrets:
      - db_password
      - jwt_secret

secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
```

---

## 🌍 Variáveis por Ambiente

### Development

```bash
NODE_ENV=development
DATABASE_URL="postgresql://root:docker@localhost:5432/osiris_db?schema=public"
KC_AUTH_SERVER_URL=http://localhost:8088/auth
PORT=3000
```

### Staging

```bash
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@staging-db:5432/db?schema=public"
KC_AUTH_SERVER_URL=https://keycloak-staging.example.com/auth
PORT=3000
```

### Production

```bash
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@prod-db:5432/db?schema=public"
KC_AUTH_SERVER_URL=https://keycloak.example.com/auth
PORT=3000
```

---

## 📝 Checklist de Configuração

- [ ] Arquivo `.env` criado com todas as variáveis
- [ ] PostgreSQL rodando e acessível
- [ ] Keycloak rodando e acessível
- [ ] Realm do Keycloak configurado
- [ ] Client Secret obtido do Keycloak
- [ ] JWT Secret gerado
- [ ] Migrações do Prisma executadas
- [ ] Cliente Prisma gerado
- [ ] Testes rodando com sucesso
- [ ] Aplicação iniciando sem erros

---

## 🆘 Troubleshooting

### Erro: "P1001: Can't reach database server"

**Causa:** PostgreSQL não está rodando ou não é acessível

**Solução:**
```bash
# Verificar se está rodando
docker-compose ps postgres

# Subir PostgreSQL
docker-compose up -d postgres

# Verificar logs
docker-compose logs postgres
```

### Erro: "Unable to connect to Keycloak"

**Causa:** Keycloak não está pronto ou realm não foi importado

**Solução:**
```bash
# Verificar status
docker-compose ps keycloak

# Aguardar healthcheck
docker-compose logs keycloak

# Verificar realm
curl http://localhost:8088/auth/realms/template
```

### Erro: "Invalid client credentials"

**Causa:** Client Secret incorreto no `.env`

**Solução:**
1. Acesse Keycloak Admin
2. Vá em Clients → template-client → Credentials
3. Copie o Secret correto
4. Atualize `KC_SECRET` no `.env`

### Erro: "Prisma Client not generated"

**Causa:** Cliente Prisma não foi gerado

**Solução:**
```bash
npx prisma generate
```

---

## 📚 Referências

- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [Prisma Environment Variables](https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-monorepo)
- [Keycloak Server Administration](https://www.keycloak.org/docs/latest/server_admin/)
- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)

