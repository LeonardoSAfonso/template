# Documentação da API

Este documento descreve os endpoints disponíveis na API e como utilizá-los.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Autenticação](#-autenticação)
- [Endpoints de Autenticação](#-endpoints-de-autenticação)
- [Endpoints de Account](#-endpoints-de-account)
- [Paginação e Filtros](#-paginação-e-filtros)
- [Tratamento de Erros](#-tratamento-de-erros)
- [Exemplos de Requisições](#-exemplos-de-requisições)

---

## 🎯 Visão Geral

### Base URL

```
Development: http://localhost:3000
Production: https://api.example.com
```

### Formato

- **Request**: JSON
- **Response**: JSON
- **Encoding**: UTF-8

### Headers Comuns

```http
Content-Type: application/json
Authorization: Bearer {access_token}
```

---

## 🔐 Autenticação

A API utiliza **JWT (JSON Web Tokens)** gerenciados pelo **Keycloak** para autenticação.

### Fluxo de Autenticação

1. **Login**: Enviar credenciais para `/auth/login`
2. **Receber tokens**: `access_token` e `refresh_token`
3. **Usar access_token**: Em todas as requisições autenticadas
4. **Renovar token**: Usar `/auth/refresh` quando expirar

### Tokens

**Access Token:**
- Válido por: 5 minutos (configurável)
- Usado em: Header `Authorization: Bearer {token}`

**Refresh Token:**
- Válido por: 30 minutos (configurável)
- Usado para: Renovar access_token

---

## 🔑 Endpoints de Autenticação

### POST /auth/login

Autentica usuário e retorna tokens.

**Request:**

```http
POST /auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response 200:**

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "token_type": "Bearer"
}
```

**Errors:**

- `401 Unauthorized`: Credenciais inválidas
- `400 Bad Request`: Dados inválidos

---

### POST /auth/refresh

Renova o access_token usando refresh_token.

**Request:**

```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 200:**

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "token_type": "Bearer"
}
```

**Errors:**

- `401 Unauthorized`: Refresh token inválido ou expirado

---

### POST /auth/logout

Invalida os tokens do usuário.

**Request:**

```http
POST /auth/logout
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 200:**

```json
{
  "message": "Logout successful"
}
```

---

## 👤 Endpoints de Account

### POST /account

Cria uma nova conta.

**Autenticação:** Requerida  
**Role:** `admin`

**Request:**

```http
POST /account
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "identification": "12345678900",
  "password": "SecurePass123!"
}
```

**Validações:**

- `name`: String, 3-100 caracteres
- `email`: Email válido
- `identification`: CPF ou CNPJ válido
- `password`: Senha forte (8+ caracteres, maiúscula, minúscula, número, símbolo)

**Response 201:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "identification": "12345678900",
  "first_access": true,
  "email_checked": false,
  "keycloakId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:**

- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Sem permissão (role `admin` necessária)
- `409 Conflict`: Email ou CPF/CNPJ já cadastrado

---

### GET /account

Lista todas as contas com paginação.

**Autenticação:** Requerida  
**Role:** `admin`

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Default | Descrição |
|-----------|------|-------------|---------|-----------|
| `limit` | integer | Não | 10 | Número de registros por página |
| `offset` | integer | Não | 0 | Número de registros a pular |
| `orderBy` | string | Não | - | Campo para ordenação |
| `order` | string | Não | 'asc' | Direção da ordenação ('asc' ou 'desc') |
| `searchBy` | string | Não | - | Campo para busca |
| `searchFor` | string | Não | - | Valor a ser buscado |

**Request:**

```http
GET /account?limit=10&offset=0&orderBy=createdAt&order=desc
Authorization: Bearer {access_token}
```

**Response 200:**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "identification": "12345678900",
    "first_access": true,
    "email_checked": false,
    "keycloakId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "660f9511-f3ac-52e5-b827-557766551111",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "identification": "98765432100",
    "first_access": false,
    "email_checked": true,
    "keycloakId": "b2c3d4e5-f6g7-8901-bcde-fg2345678901",
    "createdAt": "2024-01-02T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
]
```

**Errors:**

- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Sem permissão

---

### GET /account/:id

Busca uma conta por ID.

**Autenticação:** Requerida  
**Role:** `admin`

**Request:**

```http
GET /account/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer {access_token}
```

**Response 200:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "identification": "12345678900",
  "first_access": true,
  "email_checked": false,
  "keycloakId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:**

- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Sem permissão
- `404 Not Found`: Conta não encontrada

---

### PUT /account

Atualiza uma conta existente.

**Autenticação:** Requerida  
**Role:** `admin`

**Request:**

```http
PUT /account
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "first_access": false,
  "email_checked": true
}
```

**Validações:**

- `id`: UUID válido (obrigatório)
- `name`: String, 3-100 caracteres (opcional)
- `email`: Email válido (opcional)
- Outros campos podem ser atualizados conforme modelo

**Response 200:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "identification": "12345678900",
  "first_access": false,
  "email_checked": true,
  "keycloakId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

**Errors:**

- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Sem permissão
- `404 Not Found`: Conta não encontrada
- `409 Conflict`: Email já cadastrado para outra conta

---

### DELETE /account/:id

Deleta uma conta.

**Autenticação:** Requerida  
**Role:** `admin`

**Request:**

```http
DELETE /account/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer {access_token}
```

**Response 200:**

```json
{
  "message": "Account deleted successfully"
}
```

**Errors:**

- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Sem permissão
- `404 Not Found`: Conta não encontrada

---

## 📄 Paginação e Filtros

### Paginação

Use os parâmetros `limit` e `offset`:

```http
GET /account?limit=20&offset=40
```

- Retorna registros 41-60
- `offset`: Quantos registros pular
- `limit`: Quantos registros retornar

### Ordenação

Use os parâmetros `orderBy` e `order`:

```http
GET /account?orderBy=createdAt&order=desc
```

- `orderBy`: Nome do campo (ex: `name`, `createdAt`, `email`)
- `order`: `asc` (crescente) ou `desc` (decrescente)

### Busca

Use os parâmetros `searchBy` e `searchFor`:

```http
GET /account?searchBy=name&searchFor=John
```

- `searchBy`: Campo para buscar (ex: `name`, `email`)
- `searchFor`: Valor a buscar (busca parcial)

### Combinando Parâmetros

```http
GET /account?limit=10&offset=0&orderBy=name&order=asc&searchBy=email&searchFor=@example.com
```

---

## ⚠️ Tratamento de Erros

### Estrutura de Erro

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "email must be a valid email"
    }
  ]
}
```

### Códigos de Status

| Código | Nome | Descrição |
|--------|------|-----------|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Dados inválidos na requisição |
| 401 | Unauthorized | Não autenticado |
| 403 | Forbidden | Sem permissão para o recurso |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito (ex: email duplicado) |
| 500 | Internal Server Error | Erro interno do servidor |

### Erros Comuns

**401 Unauthorized:**

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Causas:**
- Token ausente
- Token inválido
- Token expirado

**Solução:** Fazer login novamente ou renovar o token

---

**403 Forbidden:**

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

**Causas:**
- Usuário não possui a role necessária
- Tentando acessar recurso de outro usuário

**Solução:** Usar conta com permissões adequadas

---

**400 Bad Request (Validação):**

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be stronger"
  ],
  "error": "Bad Request"
}
```

**Causas:**
- Dados não atendem às validações
- Formato de dados incorreto

**Solução:** Corrigir dados conforme mensagens de erro

---

**409 Conflict:**

```json
{
  "statusCode": 409,
  "message": "ERRO: O endereço de e-mail já está sendo utilizado",
  "error": "Conflict"
}
```

**Causas:**
- Email já cadastrado
- CPF/CNPJ já cadastrado

**Solução:** Usar dados únicos

---

## 📝 Exemplos de Requisições

### cURL

**Login:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@example.com",
    "password": "admin123"
  }'
```

**Criar Conta:**

```bash
curl -X POST http://localhost:3000/account \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "identification": "12345678900",
    "password": "SecurePass123!"
  }'
```

**Listar Contas:**

```bash
curl -X GET "http://localhost:3000/account?limit=10&offset=0" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### JavaScript (Fetch)

**Login:**

```javascript
const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin@example.com',
    password: 'admin123',
  }),
});

const { access_token, refresh_token } = await response.json();
```

**Criar Conta:**

```javascript
const response = await fetch('http://localhost:3000/account', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`,
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    identification: '12345678900',
    password: 'SecurePass123!',
  }),
});

const account = await response.json();
```

**Listar Contas:**

```javascript
const response = await fetch(
  'http://localhost:3000/account?limit=10&offset=0',
  {
    headers: {
      'Authorization': `Bearer ${access_token}`,
    },
  }
);

const accounts = await response.json();
```

---

### Python (Requests)

**Login:**

```python
import requests

response = requests.post(
    'http://localhost:3000/auth/login',
    json={
        'username': 'admin@example.com',
        'password': 'admin123'
    }
)

tokens = response.json()
access_token = tokens['access_token']
```

**Criar Conta:**

```python
response = requests.post(
    'http://localhost:3000/account',
    headers={
        'Authorization': f'Bearer {access_token}'
    },
    json={
        'name': 'John Doe',
        'email': 'john@example.com',
        'identification': '12345678900',
        'password': 'SecurePass123!'
    }
)

account = response.json()
```

**Listar Contas:**

```python
response = requests.get(
    'http://localhost:3000/account',
    headers={
        'Authorization': f'Bearer {access_token}'
    },
    params={
        'limit': 10,
        'offset': 0,
        'orderBy': 'createdAt',
        'order': 'desc'
    }
)

accounts = response.json()
```

---

## 🔒 Segurança

### CORS

A API aceita requisições de qualquer origem em desenvolvimento:

```javascript
app.enableCors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
});
```

**⚠️ Em produção**, configure origins específicas:

```javascript
app.enableCors({
  origin: ['https://app.example.com'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
});
```

### Rate Limiting

**Recomendação:** Implementar rate limiting em produção.

Exemplo com `@nestjs/throttler`:

```typescript
ThrottlerModule.forRoot({
  ttl: 60,
  limit: 10,
})
```

### HTTPS

**Produção:** Sempre usar HTTPS

```
https://api.example.com
```

---

## 📚 Recursos Adicionais

### Postman Collection

Crie uma collection do Postman para facilitar os testes:

1. Importe os endpoints descritos neste documento
2. Configure variáveis de ambiente:
   - `baseUrl`: URL da API
   - `accessToken`: Token de acesso

### Swagger/OpenAPI

**Futuro:** Adicionar documentação interativa com Swagger.

```bash
npm install @nestjs/swagger swagger-ui-express
```

---

## 🆘 Suporte

Para dúvidas sobre a API:

1. Consulte este documento
2. Verifique os exemplos de código
3. Entre em contato com a equipe de desenvolvimento

