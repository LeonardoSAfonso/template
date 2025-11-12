# 🚀 Guia de Início Rápido

Comece a usar este template em minutos!

---

## ⚡ TL;DR (Muito Rápido)

```bash
# 1. Clonar e instalar
git clone <repository-url> meu-projeto
cd meu-projeto
npm install

# 2. Configurar ambiente
cp .env.example .env
# Editar .env se necessário

# 3. Subir serviços
docker-compose up -d

# 4. Aguardar inicialização (2-3 minutos)
# Keycloak demora um pouco...

# 5. Rodar migrações
npx prisma migrate dev

# 6. Iniciar aplicação
npm run start:dev

# ✅ Pronto! API rodando em http://localhost:3000
```

---

## 📋 Pré-requisitos

Antes de começar, instale:

- ✅ **Node.js** >= 20.x ([Download](https://nodejs.org/))
- ✅ **npm** >= 9.x (vem com Node.js)
- ✅ **Docker** >= 20.x ([Download](https://www.docker.com/))
- ✅ **Docker Compose** >= 2.x (vem com Docker Desktop)

Verificar instalação:

```bash
node --version  # v20.x.x
npm --version   # 9.x.x
docker --version # 20.x.x
docker-compose --version # 2.x.x
```

---

## 🎯 Passo a Passo Detalhado

### Passo 1: Clonar o Repositório

```bash
# Via HTTPS
git clone https://github.com/usuario/template.git meu-projeto

# Via SSH
git clone git@github.com:usuario/template.git meu-projeto

# Entrar no diretório
cd meu-projeto
```

---

### Passo 2: Instalar Dependências

```bash
npm install
```

**Tempo estimado:** 2-3 minutos

---

### Passo 3: Configurar Variáveis de Ambiente

#### Opção A: Usar valores padrão

```bash
# Criar arquivo .env com valores padrão
cat > .env << 'EOF'
DATABASE_URL="postgresql://root:docker@localhost:5432/osiris_db?schema=public"
KC_AUTH_SERVER_URL=http://localhost:8088/auth
KC_REALM=template
KC_CLIENT_ID=template-client
KC_SECRET=your-client-secret
KC_ADMIN_USER=admin
KC_ADMIN_PASSWORD=admin
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
NODE_ENV=development
EOF
```

#### Opção B: Copiar do exemplo

```bash
# Se houver arquivo .env.example
cp .env.example .env

# Editar conforme necessário
nano .env  # ou use seu editor preferido
```

---

### Passo 4: Subir Serviços Docker

```bash
# Subir todos os serviços
docker-compose up -d

# Ou subir apenas necessários
docker-compose up -d postgres keycloak
```

**Tempo estimado:** 
- PostgreSQL: ~10 segundos
- Keycloak: ~2-3 minutos (primeira vez)

#### Verificar status

```bash
# Ver status dos containers
docker-compose ps

# Ver logs do Keycloak (para saber quando está pronto)
docker-compose logs -f keycloak

# Aguarde por: "Keycloak X.X.X started"
# Pressione Ctrl+C para sair dos logs
```

#### Verificar se Keycloak está pronto

```bash
# Testar endpoint do Keycloak
curl http://localhost:8088/auth/realms/template

# Deve retornar JSON com informações do realm
```

---

### Passo 5: Configurar Banco de Dados

```bash
# Executar migrações do Prisma
npx prisma migrate dev

# Gerar cliente Prisma (se necessário)
npx prisma generate
```

**Tempo estimado:** 10-20 segundos

---

### Passo 6: Iniciar Aplicação

```bash
# Modo desenvolvimento (com hot-reload)
npm run start:dev

# Ou modo normal
npm run start
```

**Tempo estimado:** 10-15 segundos

#### Verificar se está rodando

```bash
# Testar endpoint
curl http://localhost:3000

# Ou abrir no navegador
open http://localhost:3000
```

---

## ✅ Verificação Pós-Instalação

### 1. Testar Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin"
  }'
```

**Resposta esperada:**

```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 300,
  "token_type": "Bearer"
}
```

---

### 2. Testar Endpoint Protegido

```bash
# Substitua {TOKEN} pelo access_token recebido
curl http://localhost:3000/account \
  -H "Authorization: Bearer {TOKEN}"
```

**Resposta esperada:**

```json
[]  # Lista vazia (ainda sem contas criadas)
```

---

### 3. Executar Testes

```bash
# Testes unitários
npm run test

# Testes com cobertura
npm run test:cov
```

**Resposta esperada:** Todos os testes passando ✓

---

## 🎨 Primeiro Uso

### Criar Primeira Conta

```bash
# 1. Fazer login e pegar token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}' \
  | jq -r '.access_token')

# 2. Criar conta
curl -X POST http://localhost:3000/account \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "identification": "12345678900",
    "password": "SenhaForte123!"
  }'
```

---

### Listar Contas

```bash
curl http://localhost:3000/account \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔧 Acessos Importantes

### Aplicação
- **URL**: http://localhost:3000
- **Status**: Sem endpoint de health (adicione se necessário)

### Keycloak Admin
- **URL**: http://localhost:8088/auth/admin
- **Usuário**: admin
- **Senha**: admin
- **Realm**: template

### PostgreSQL
- **Host**: localhost
- **Porta**: 5432
- **Database**: osiris_db
- **Usuário**: root
- **Senha**: docker

#### Conectar via CLI

```bash
docker exec -it postgres psql -U root -d osiris_db
```

#### Conectar via DBeaver/pgAdmin

```
Host: localhost
Port: 5432
Database: osiris_db
Username: root
Password: docker
```

---

## 🐛 Troubleshooting

### Problema: "Can't reach database server"

**Causa:** PostgreSQL não está rodando

**Solução:**

```bash
# Verificar status
docker-compose ps postgres

# Reiniciar PostgreSQL
docker-compose restart postgres

# Ver logs
docker-compose logs postgres
```

---

### Problema: "Unable to connect to Keycloak"

**Causa:** Keycloak ainda não terminou de inicializar

**Solução:**

```bash
# Aguardar mais tempo (pode levar 2-3 minutos)
docker-compose logs -f keycloak

# Reiniciar Keycloak
docker-compose restart keycloak
```

---

### Problema: "Prisma Client not found"

**Causa:** Cliente Prisma não foi gerado

**Solução:**

```bash
npx prisma generate
```

---

### Problema: "Port 3000 already in use"

**Causa:** Porta já está sendo usada

**Solução:**

```bash
# Opção 1: Mudar porta no .env
PORT=3001

# Opção 2: Encontrar e matar processo
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

### Problema: "Invalid client credentials"

**Causa:** Secret do Keycloak incorreto

**Solução:**

1. Acessar Keycloak Admin: http://localhost:8088/auth/admin
2. Login: admin/admin
3. Selecionar realm "template"
4. Ir em Clients → template-client → Credentials
5. Copiar Secret
6. Atualizar `KC_SECRET` no `.env`
7. Reiniciar aplicação

---

## 🛑 Parar Tudo

```bash
# Parar aplicação
# Pressionar Ctrl+C no terminal da aplicação

# Parar containers Docker
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados!)
docker-compose down -v
```

---

## 🔄 Resetar Tudo

```bash
# 1. Parar tudo
docker-compose down -v

# 2. Remover node_modules (opcional)
rm -rf node_modules

# 3. Instalar novamente
npm install

# 4. Subir serviços
docker-compose up -d

# 5. Aguardar Keycloak (2-3 min)

# 6. Executar migrações
npx prisma migrate dev

# 7. Iniciar
npm run start:dev
```

---

## 📚 Próximos Passos

Depois de ter tudo rodando:

1. ✅ **Explore a API**: [docs/API.md](./docs/API.md)
2. ✅ **Entenda a arquitetura**: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
3. ✅ **Crie seu primeiro módulo**: [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)
4. ✅ **Escreva testes**: [docs/TESTING.md](./docs/TESTING.md)
5. ✅ **Configure para produção**: [docs/CONFIGURATION.md](./docs/CONFIGURATION.md)

---

## 🆘 Precisa de Ajuda?

1. **Documentação completa**: [docs/README.md](./docs/README.md)
2. **Issues no GitHub**: [link-para-issues]
3. **Entre em contato**: equipe de desenvolvimento

---

## 🎉 Sucesso!

Agora você está pronto para desenvolver sua aplicação!

```bash
# Estrutura básica está pronta ✓
# API rodando ✓
# Autenticação configurada ✓
# Banco de dados pronto ✓
# Testes configurados ✓

# Happy Coding! 🚀
```

---

**Tempo total estimado:** 10-15 minutos (incluindo downloads)

**Última atualização:** Novembro 2024

