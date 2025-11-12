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

**Exemplo:**

```typescript
// create-account.service.spec.ts
describe('CreateAccountService', () => {
  let sut: CreateAccountService;
  let stubRepository: jest.Mocked<AccountRepository>;

  beforeEach(() => {
    stubRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as any;
    
    sut = new CreateAccountService(stubRepository);
  });

  it('should create an account', async () => {
    // Arrange
    const inputData = { name: 'Test', email: 'test@test.com' };
    const expectedAccount = { id: '1', ...inputData };
    stubRepository.create.mockResolvedValue(expectedAccount);

    // Act
    const actualAccount = await sut.execute(inputData);

    // Assert
    expect(actualAccount).toEqual(expectedAccount);
  });
});
```

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

**Exemplo:**

```typescript
describe('AccountModule Integration', () => {
  let app: INestApplication;
  let repository: AccountRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AccountModule, OrmModule],
    }).compile();

    app = moduleRef.createNestApplication();
    repository = moduleRef.get<AccountRepository>(AccountRepository);
    await app.init();
  });

  it('should create and find account', async () => {
    // Arrange
    const accountData = { name: 'Test', email: 'test@test.com' };

    // Act
    const created = await repository.create(accountData);
    const found = await repository.findById(created.id);

    // Assert
    expect(found).toEqual(created);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

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

**Exemplo:**

```typescript
describe('Account E2E', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Obter token de autenticação
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' });
    
    authToken = loginResponse.body.access_token;
  });

  it('/account (POST)', async () => {
    return request(app.getHttpServer())
      .post('/account')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test User',
        email: 'test@example.com',
        identification: '12345678900',
        password: 'SecurePass123!',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('Test User');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

---

## ⚙️ Configuração

### jest.config.js

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: './',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e-spec.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.dto.ts',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^test/(.*)$': '<rootDir>/test/$1',
    '^prisma/client$': '<rootDir>/test/mocks/utils.ts',
  },
  testTimeout: 30000,
  maxWorkers: 1,
};
```

### test/setup.ts

```typescript
// Configurações globais para testes
beforeAll(() => {
  // Setup global
});

afterAll(() => {
  // Cleanup global
});

// Mock de variáveis de ambiente
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test-secret';
```

### test/jest-e2e.json

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": "../",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

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

### Testando Services

```typescript
describe('CreateAccountService', () => {
  let sut: CreateAccountService;
  let stubRepository: jest.Mocked<AccountRepository>;
  let stubKeycloakService: jest.Mocked<KeycloakUserService>;

  beforeEach(() => {
    stubRepository = {
      findByEmail: jest.fn(),
      findByIdentification: jest.fn(),
      create: jest.fn(),
    } as any;

    stubKeycloakService = {
      create: jest.fn(),
    } as any;

    sut = new CreateAccountService(stubRepository, stubKeycloakService);
  });

  describe('execute', () => {
    it('should create account successfully', async () => {
      // Arrange
      const inputAccount = {
        name: 'John Doe',
        email: 'john@example.com',
        identification: '12345678900',
        password: 'SecurePass123!',
      };

      const mockKcUser = { id: 'kc-uuid' };
      const expectedAccount = {
        id: 'uuid',
        ...inputAccount,
        keycloakId: mockKcUser.id,
      };

      stubRepository.findByEmail.mockResolvedValue(null);
      stubRepository.findByIdentification.mockResolvedValue(null);
      stubKeycloakService.create.mockResolvedValue(mockKcUser);
      stubRepository.create.mockResolvedValue(expectedAccount);

      // Act
      const actualAccount = await sut.execute(inputAccount);

      // Assert
      expect(actualAccount).toEqual(expectedAccount);
      expect(stubRepository.findByEmail).toHaveBeenCalledWith(inputAccount.email);
      expect(stubKeycloakService.create).toHaveBeenCalled();
      expect(stubRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          keycloakId: mockKcUser.id,
        })
      );
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      const inputAccount = { email: 'existing@example.com' };
      const existingAccount = { id: '1', email: inputAccount.email };
      
      stubRepository.findByEmail.mockResolvedValue(existingAccount);

      // Act & Assert
      await expect(sut.execute(inputAccount as any)).rejects.toThrow(
        new AppError('ERRO: O endereço de e-mail já está sendo utilizado', 409)
      );
      expect(stubRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error if identification already exists', async () => {
      // Arrange
      const inputAccount = { 
        email: 'new@example.com',
        identification: '12345678900',
      };
      const existingAccount = { id: '1', identification: inputAccount.identification };
      
      stubRepository.findByEmail.mockResolvedValue(null);
      stubRepository.findByIdentification.mockResolvedValue(existingAccount);

      // Act & Assert
      await expect(sut.execute(inputAccount as any)).rejects.toThrow(
        new AppError('ERRO: O CPF/CNPJ já está sendo utilizado', 409)
      );
      expect(stubRepository.create).not.toHaveBeenCalled();
    });
  });
});
```

### Testando Validators

```typescript
describe('IsCPFOrCNPJ Validator', () => {
  let validator: IsCPFOrCNPJ;

  beforeEach(() => {
    validator = new IsCPFOrCNPJ();
  });

  it('should validate valid CPF', () => {
    const validCPF = '12345678900';
    expect(validator.validate(validCPF)).toBe(true);
  });

  it('should invalidate invalid CPF', () => {
    const invalidCPF = '11111111111';
    expect(validator.validate(invalidCPF)).toBe(false);
  });

  it('should validate valid CNPJ', () => {
    const validCNPJ = '12345678000190';
    expect(validator.validate(validCNPJ)).toBe(true);
  });
});
```

---

## 🔗 Testes de Integração

### Testando com TestingModule

```typescript
describe('AccountRepository Integration', () => {
  let repository: AccountRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [OrmModule],
      providers: [AccountRepository],
    }).compile();

    repository = moduleRef.get<AccountRepository>(AccountRepository);
    prisma = moduleRef.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Limpar banco de dados antes de cada teste
    await prisma.account.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('create', () => {
    it('should create account in database', async () => {
      // Arrange
      const accountData = {
        name: 'Test User',
        email: 'test@example.com',
        identification: '12345678900',
        keycloakId: 'kc-uuid',
      };

      // Act
      const created = await repository.create(accountData);

      // Assert
      expect(created).toHaveProperty('id');
      expect(created.email).toBe(accountData.email);

      // Verificar no banco
      const found = await prisma.account.findUnique({
        where: { id: created.id },
      });
      expect(found).toBeTruthy();
    });
  });

  describe('findByEmail', () => {
    it('should find account by email', async () => {
      // Arrange
      const accountData = {
        name: 'Test',
        email: 'test@test.com',
        identification: '12345678900',
        keycloakId: 'kc-uuid',
      };
      await repository.create(accountData);

      // Act
      const found = await repository.findByEmail(accountData.email);

      // Assert
      expect(found).toBeTruthy();
      expect(found.email).toBe(accountData.email);
    });

    it('should return null if not found', async () => {
      // Act
      const found = await repository.findByEmail('nonexistent@test.com');

      // Assert
      expect(found).toBeNull();
    });
  });
});
```

---

## 🌐 Testes E2E

### Testando Controllers

```typescript
describe('AccountController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdAccountId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(KeycloakUserService)
      .useValue({
        create: jest.fn().mockResolvedValue({ id: 'kc-mock-id' }),
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Obter token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' });
    
    authToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/account (POST)', () => {
    it('should create account', () => {
      return request(app.getHttpServer())
        .post('/account')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test User',
          email: 'test@example.com',
          identification: '12345678900',
          password: 'SecurePass123!',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Test User');
          createdAccountId = res.body.id;
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/account')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'T', // Muito curto
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/account')
        .send({ name: 'Test' })
        .expect(401);
    });
  });

  describe('/account (GET)', () => {
    it('should list accounts', () => {
      return request(app.getHttpServer())
        .get('/account')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should paginate accounts', () => {
      return request(app.getHttpServer())
        .get('/account?limit=10&offset=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('/account/:id (GET)', () => {
    it('should get account by id', () => {
      return request(app.getHttpServer())
        .get(`/account/${createdAccountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdAccountId);
        });
    });

    it('should return 404 for non-existent account', () => {
      return request(app.getHttpServer())
        .get('/account/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
```

---

## 🎭 Mocks e Stubs

### Mock de Repository

```typescript
// test/mocks/repository.mock.ts
export const mockAccountRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
```

### Mock de Prisma

```typescript
// test/mocks/prisma.mock.ts
export const mockPrismaService = {
  account: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};
```

### Mock de Keycloak

```typescript
// test/mocks/keycloak.mock.ts
export const mockKeycloakUserService = {
  create: jest.fn().mockResolvedValue({ id: 'kc-mock-id' }),
  update: jest.fn(),
  delete: jest.fn(),
  findById: jest.fn(),
};

export const mockKeycloakAuthService = {
  login: jest.fn().mockResolvedValue({
    access_token: 'mock-token',
    refresh_token: 'mock-refresh-token',
  }),
  logout: jest.fn(),
  refreshToken: jest.fn(),
};
```

### Usando Mocks nos Testes

```typescript
describe('MyService', () => {
  let sut: MyService;
  let stubRepository: typeof mockAccountRepository;

  beforeEach(() => {
    stubRepository = { ...mockAccountRepository };
    sut = new MyService(stubRepository as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
```

---

## 📊 Cobertura de Código

### Configuração

```javascript
// jest.config.js
collectCoverageFrom: [
  'src/**/*.(t|j)s',
  '!src/**/*.spec.ts',
  '!src/**/*.e2e-spec.ts',
  '!src/main.ts',
  '!src/**/*.module.ts',
  '!src/**/*.dto.ts',
  '!src/**/*.interface.ts',
],
coverageThresholds: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
},
```

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

- **Mínimo aceitável**: 80%
- **Recomendado**: 90%
- **Ideal**: 95%+

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

