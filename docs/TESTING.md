# Guia de Testes

Este documento detalha as estratégias, convenções e melhores práticas para testes no projeto.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Tipos de Testes](#-tipos-de-testes)
- [Configuração](#-configuração)
- [Convenções](#-convenções)
- [Testes Unitários](#-testes-unitários)
- [Testes de Integração](#-testes-de-integração)
- [Testes E2E](#-testes-e2e)
- [Mocks e Stubs](#-mocks-e-stubs)
- [Cobertura de Código](#-cobertura-de-código)
- [Boas Práticas](#-boas-práticas)

---

## 🎯 Visão Geral

O projeto utiliza **Jest** como framework de testes principal, seguindo a convenção **Arrange-Act-Assert** (AAA).

### Stack de Testes

- **Jest**: Framework de testes
- **@nestjs/testing**: Utilitários de teste do NestJS
- **Supertest**: Testes HTTP/E2E
- **ts-jest**: Compilação TypeScript para Jest

### Comandos

```bash
# Testes unitários
npm run test

# Testes em modo watch
npm run test:watch

# Testes com cobertura
npm run test:cov

# Testes e2e
npm run test:e2e

# Testes com debug
npm run test:debug
```

---

## 🧪 Tipos de Testes

### 1. Testes Unitários (Unit Tests)

**Objetivo:** Testar unidades individuais de código em isolamento.

**Características:**

- Testam uma única função/classe
- Usam mocks para dependências
- Rápidos de executar
- Não dependem de recursos externos

**Quando usar:**

- Services
- Validators
- Utilities
- Helpers
- Transformers

---

### 2. Testes de Integração (Integration Tests)

**Objetivo:** Testar a integração entre múltiplos componentes.

**Características:**

- Testam interação entre componentes
- Podem usar banco de dados de teste
- Mais lentos que unitários
- Testam fluxos completos

**Quando usar:**

- Repositories com banco de dados
- Módulos completos
- Integração com serviços externos (mockados)

---

### 3. Testes E2E (End-to-End)

**Objetivo:** Testar o sistema completo do ponto de vista do usuário.

**Características:**

- Testam API completa (HTTP)
- Incluem autenticação
- Usam banco de dados de teste
- Mais lentos

**Quando usar:**

- Controllers
- Fluxos completos de API
- Autenticação/Autorização
- Validações de endpoints

---

## 📝 Convenções

### Nomenclatura de Arquivos

```
# Testes Unitários
filename.spec.ts

# Testes E2E
filename.e2e-spec.ts

# Mocks
filename.mock.ts

# Fixtures
filename.fixture.ts
```

### Estrutura de Diretórios

```
test/
├── account/              # Testes do módulo account
│   ├── services/
│   │   ├── create.spec.ts
│   │   ├── find.spec.ts
│   │   └── update.spec.ts
│   ├── repository.spec.ts
│   └── account.e2e-spec.ts
├── keycloak/             # Testes do módulo keycloak
│   └── keycloak-auth.spec.ts
├── mocks/                # Mocks compartilhados
│   ├── prisma.mock.ts
│   └── keycloak.mock.ts
└── setup.ts              # Setup global
```

### Convenção de Variáveis

```typescript
describe('MyService', () => {
  let sut: MyService;              // System Under Test
  let stubRepository: Repository;  // Stub/Mock de dependência

  // Dentro dos testes
  const inputData = {...};         // Dados de entrada
  const mockData = {...};          // Dados mockados
  const expectedResult = {...};    // Resultado esperado
  const actualResult = {...};      // Resultado obtido
});
```

---

## 🔬 Testes Unitários

### Estrutura AAA (Arrange-Act-Assert)

```typescript
it('should do something', async () => {
  // Arrange - Preparar
  const inputData = { name: 'Test' };
  const expectedOutput = { id: '1', name: 'Test' };
  stubRepository.create.mockResolvedValue(expectedOutput);

  // Act - Agir
  const actualOutput = await sut.execute(inputData);

  // Assert - Verificar
  expect(actualOutput).toEqual(expectedOutput);
  expect(stubRepository.create).toHaveBeenCalledWith(inputData);
});
```

## 🧪 Configuração de Testes

### jest.config.js

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

## 📊 Cobertura de Código

### Gerar Relatório

```bash
# Gerar cobertura
npm run test:cov

# Visualizar relatório HTML
open coverage/lcov-report/index.html
```

### Métricas

- **Lines**: Porcentagem de linhas executadas
- **Statements**: Porcentagem de statements executados
- **Branches**: Porcentagem de branches (if/else) testados
- **Functions**: Porcentagem de funções testadas

### Meta de Cobertura

- **Recomendado**: 100%
- **Mínimo aceitável**: 90%
- **Cobertura aceita na main**: 95%+

---

## 📊 Análise de Qualidade com SonarQube

### Configuração Inicial

Antes de executar a análise, certifique-se de que o SonarQube está configurado:

#### 1. Subir SonarQube

```bash
# Iniciar containers do SonarQube
npm run sonar:up

# Aguardar inicialização (2-3 minutos na primeira vez)
# Verificar status
docker-compose ps sonarqube
```

#### 2. Configurar Token de Acesso

**Primeira vez:**

1. Acesse: http://localhost:9000
2. Login inicial: `admin` / `admin`
3. O sistema pedirá para alterar a senha
4. Vá em **My Account** → **Security** → **Generate Token**
5. Dê um nome (ex: "local-dev") e clique em **Generate**
6. Copie o token gerado

**Adicionar token ao ambiente:**

```bash
# Opção 1: Adicionar ao arquivo .env
echo "SONAR_TOKEN=seu_token_aqui" >> .env

# Opção 2: Exportar temporariamente
export SONAR_TOKEN=seu_token_aqui
```

### Executar Análise

#### Análise Completa (Recomendado)

Executa testes com cobertura e depois envia para o SonarQube:

```bash
# Análise completa: testes + cobertura + scan
npm run sonar:analysis
```

Este comando executa:

1. `npm run test:cov` - Gera cobertura de testes
2. `docker-compose run sonar-scanner` - Analisa código e envia para SonarQube

**Tempo estimado:** 2-5 minutos (dependendo do tamanho do projeto)

#### Apenas Scan (Sem Testes)

Se você já executou os testes e só quer fazer o scan:

```bash
# Apenas scan do código
npm run sonar:scan
```

**Uso:** Quando você já tem o relatório de cobertura atualizado.

### Visualizar Resultados

#### No SonarQube UI

1. Acesse: http://localhost:9000
2. Clique no projeto "Template NestJS"
3. Visualize:
   - **Overview**: Resumo geral da qualidade
   - **Issues**: Problemas encontrados (Bugs, Vulnerabilities, Code Smells)
   - **Measures**: Métricas detalhadas
   - **Code**: Código com anotações

#### Via Logs

```bash
# Ver logs em tempo real
npm run sonar:logs

# ou
docker-compose logs -f sonarqube
```

### Métricas do SonarQube

O SonarQube avalia:

#### Quality Gate (Portão de Qualidade)

Critérios que o código deve atender:

- **Coverage**: >= 80% de cobertura
- **Duplications**: < 3% de código duplicado
- **Maintainability Rating**: A (melhor)
- **Reliability Rating**: A (sem bugs)
- **Security Rating**: A (sem vulnerabilidades)

#### Tipos de Issues

1. **Bugs** 🐛

   - Código que provavelmente está errado
   - Pode causar comportamento inesperado
   - **Prioridade:** Alta

2. **Vulnerabilities** 🔒

   - Problemas de segurança
   - Podem ser explorados por atacantes
   - **Prioridade:** Crítica

3. **Code Smells** 👃

   - Código que funciona mas pode ser melhorado
   - Dificulta manutenção
   - **Prioridade:** Média

4. **Security Hotspots** 🔥
   - Código que precisa revisão de segurança
   - Não necessariamente vulnerável, mas sensível
   - **Prioridade:** Alta

### Workflow Recomendado

#### Antes de Fazer Commit

```bash
# 1. Executar testes localmente
npm run test

# 2. Verificar cobertura
npm run test:cov

# 3. Executar linter
npm run lint

# 4. Análise SonarQube
npm run sonar:analysis

# 5. Verificar resultados no dashboard
# http://localhost:9000
```

#### Durante Desenvolvimento

```bash
# Modo watch para testes
npm run test:watch

# Quando finalizar uma feature, executar análise completa
npm run sonar:analysis
```

#### Antes de Pull Request

```bash
# 1. Análise completa
npm run sonar:analysis

# 2. Garantir que Quality Gate passou
# 3. Corrigir issues críticos encontrados
# 4. Documentar issues conhecidos (se aplicável)
```

### Comandos Úteis

```bash
# Subir apenas SonarQube
npm run sonar:up

# Parar SonarQube
npm run sonar:down

# Ver logs
npm run sonar:logs

# Análise completa
npm run sonar:analysis

# Apenas scan
npm run sonar:scan

# Reiniciar SonarQube (se travar)
docker-compose restart sonarqube

# Remover volumes (reset completo)
docker-compose down -v sonarqube sonarqube-db
```

### Configuração Avançada

#### Excluir Arquivos da Análise

Edite `sonar-project.properties`:

```properties
sonar.exclusions=\
  **/node_modules/**,\
  **/dist/**,\
  **/coverage/**,\
  **/test/**,\
  **/*.spec.ts,\
  **/*.test.ts
```

#### Ajustar Limites de Cobertura

```properties
sonar.coverage.exclusions=\
  **/*.dto.ts,\
  **/*.interface.ts,\
  **/*.module.ts,\
  **/main.ts
```

### Troubleshooting SonarQube

#### Erro: "Unauthorized"

**Causa:** Token inválido ou não configurado

**Solução:**

```bash
# Verificar se token está no .env
cat .env | grep SONAR_TOKEN

# Gerar novo token no SonarQube
# Atualizar .env
```

#### Erro: "Quality Gate Failed"

**Causa:** Código não atende aos critérios mínimos

**Solução:**

1. Acessar http://localhost:9000
2. Ver quais métricas falharam
3. Corrigir issues encontrados
4. Aumentar cobertura de testes se necessário

#### SonarQube Muito Lento

**Solução:**

```bash
# Aumentar memória do container
# Editar docker-compose.yml:
services:
  sonarqube:
    environment:
      - SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true
    deploy:
      resources:
        limits:
          memory: 4G
```

#### Container SonarQube Travou

**Solução:**

```bash
# Reiniciar
docker-compose restart sonarqube

# Se não resolver, recriar
docker-compose down sonarqube
docker-compose up -d sonarqube
```

### Boas Práticas

1. **Execute análise regularmente**: Idealmente a cada feature/fix
2. **Corrija issues críticos imediatamente**: Bugs e vulnerabilidades primeiro
3. **Mantenha cobertura alta**: Mínimo 80%, ideal 90%+
4. **Revise code smells**: Melhoram manutenibilidade
5. **Documente exceções**: Se não puder corrigir algo, documente o porquê
6. **Configure Quality Gate**: Adapte aos padrões do seu time
7. **Integre no CI/CD**: Automação garante qualidade contínua

---

## ✅ Boas Práticas

### 1. Testes Descritivos

```typescript
// ❌ Ruim
it('test 1', () => {});

// ✅ Bom
it('should create account when data is valid', () => {});
it('should throw error when email already exists', () => {});
```

### 2. Um Assert por Conceito

```typescript
// ❌ Ruim - Testando múltiplos conceitos
it('should work', () => {
  expect(result.name).toBe('Test');
  expect(result.email).toBe('test@test.com');
  expect(result.age).toBe(25);
});

// ✅ Bom - Foco em um conceito
it('should return account with correct name', () => {
  expect(result.name).toBe('Test');
});

it('should return account with correct email', () => {
  expect(result.email).toBe('test@test.com');
});
```

### 3. Independência de Testes

```typescript
// ❌ Ruim - Testes dependem uns dos outros
let sharedData;

it('test 1', () => {
  sharedData = createData();
});

it('test 2', () => {
  useData(sharedData); // Depende do test 1
});

// ✅ Bom - Testes independentes
it('test 1', () => {
  const data = createData();
  // usar data
});

it('test 2', () => {
  const data = createData();
  // usar data
});
```

### 4. Setup e Teardown

```typescript
describe('MyService', () => {
  let sut: MyService;

  beforeEach(() => {
    // Setup antes de cada teste
    sut = new MyService();
  });

  afterEach(() => {
    // Cleanup após cada teste
    jest.clearAllMocks();
  });

  beforeAll(() => {
    // Setup uma vez antes de todos os testes
  });

  afterAll(() => {
    // Cleanup uma vez após todos os testes
  });
});
```

### 5. Testes Rápidos

```typescript
// ❌ Ruim - Teste lento
it('should work', async () => {
  await sleep(5000); // Evitar delays
});

// ✅ Bom - Teste rápido
it('should work', async () => {
  // Mock de operações lentas
  stubService.slowOperation.mockResolvedValue(result);
});
```

### 6. Dados de Teste Claros

```typescript
// ❌ Ruim
const data = { n: 'T', e: 't@t.c' };

// ✅ Bom
const inputAccount = {
  name: 'Test User',
  email: 'test@example.com',
};
```

### 7. Testar Casos de Erro

```typescript
describe('CreateAccountService', () => {
  // Caso de sucesso
  it('should create account successfully', () => {});

  // Casos de erro
  it('should throw error when email is invalid', () => {});
  it('should throw error when email already exists', () => {});
  it('should throw error when identification is invalid', () => {});
});
```

### 8. Evitar Lógica nos Testes

```typescript
// ❌ Ruim - Lógica complexa no teste
it('should work', () => {
  for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) {
      // complexidade
    }
  }
});

// ✅ Bom - Teste simples e direto
it('should handle even numbers', () => {
  const input = 2;
  const result = sut.process(input);
  expect(result).toBe(expected);
});
```

---

## 📚 Referências

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Test Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
