# Padrões de Código

Este documento define os padrões de código, convenções e boas práticas que devem ser seguidas no projeto.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [TypeScript](#-typescript)
- [NestJS](#-nestjs)
- [Banco de Dados](#-banco-de-dados)
- [Testes](#-testes)
- [Comentários e Documentação](#-comentários-e-documentação)
- [Git](#-git)

---

## 🎯 Visão Geral

### Princípios Fundamentais

1. **Código em Inglês, Documentação em Português**
2. **Clean Code** - Código limpo e legível
3. **SOLID** - Princípios de design orientado a objetos
4. **DRY** - Don't Repeat Yourself
5. **KISS** - Keep It Simple, Stupid
6. **YAGNI** - You Ain't Gonna Need It

### Ferramentas de Qualidade

```bash
# ESLint - Análise estática
npm run lint

# Prettier - Formatação
npm run format

# Testes - Qualidade
npm run test

# SonarQube - Análise completa
npm run sonar:analysis
```

---

## 📘 TypeScript

### Princípios Básicos

#### 1. Use Inglês para Código

```typescript
// ❌ Ruim
const nomeUsuario = 'João';
function buscarProduto() {}

// ✅ Bom
const userName = 'João';
function fetchProduct() {}
```

#### 2. Sempre Declare Tipos

```typescript
// ❌ Ruim
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Bom
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

#### 3. Evite `any`

```typescript
// ❌ Ruim
function processData(data: any): any {
  return data.value;
}

// ✅ Bom
interface DataInput {
  value: string;
}

function processData(data: DataInput): string {
  return data.value;
}

// ✅ Bom - Se realmente não sabe o tipo
function processData(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return String((data as { value: unknown }).value);
  }
  throw new Error('Invalid data');
}
```

#### 4. Crie Tipos Necessários

```typescript
// ✅ Bom - Tipos específicos
type UserId = string;
type Email = string;
type Timestamp = number;

interface User {
  id: UserId;
  email: Email;
  createdAt: Timestamp;
}

// ✅ Bom - Union types
type UserRole = 'admin' | 'user' | 'guest';

// ✅ Bom - Utility types
type CreateUserInput = Omit<User, 'id' | 'createdAt'>;
type UpdateUserInput = Partial<CreateUserInput>;
```

---

### Nomenclatura

#### Classes: PascalCase

```typescript
class UserService {}
class AccountRepository {}
class CreateUserDTO {}
```

#### Variáveis e Funções: camelCase

```typescript
const userName = 'John';
const totalAmount = 100;

function calculateTotal() {}
function findUserById() {}
```

#### Constantes: UPPERCASE

```typescript
const API_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 5000;
```

#### Arquivos e Diretórios: kebab-case

```
user-service.ts
account-controller.ts
create-user.dto.ts
my-module/
```

#### Booleanos: Prefixo com Verbo

```typescript
const isLoading = true;
const hasError = false;
const canDelete = true;
const shouldUpdate = false;
const wasCreated = true;
```

#### Funções: Iniciar com Verbo

```typescript
// ✅ Bom
function createUser() {}
function findUserById() {}
function updateAccount() {}
function deleteRecord() {}
function isValidEmail() {}
function hasPermission() {}
function canAccess() {}

// ❌ Ruim
function user() {}
function account() {}
function validation() {}
```

---

### Funções

#### 1. Funções Curtas (< 20 linhas)

```typescript
// ❌ Ruim - Função muito longa
function processUser(user: User): void {
  // validação
  if (!user) throw new Error('User required');
  if (!user.email) throw new Error('Email required');
  if (!user.name) throw new Error('Name required');

  // processamento
  const normalizedEmail = user.email.toLowerCase();
  const trimmedName = user.name.trim();

  // salvamento
  database.save({ ...user, email: normalizedEmail, name: trimmedName });

  // notificação
  emailService.send(normalizedEmail, 'Welcome!');

  // logging
  logger.info(`User ${user.id} processed`);
}

// ✅ Bom - Funções pequenas e focadas
function processUser(user: User): void {
  validateUser(user);
  const normalizedUser = normalizeUser(user);
  saveUser(normalizedUser);
  notifyUser(normalizedUser);
  logUserProcessing(normalizedUser);
}

function validateUser(user: User): void {
  if (!user) throw new Error('User required');
  if (!user.email) throw new Error('Email required');
  if (!user.name) throw new Error('Name required');
}

function normalizeUser(user: User): User {
  return {
    ...user,
    email: user.email.toLowerCase(),
    name: user.name.trim(),
  };
}
```

#### 2. Propósito Único (Single Responsibility)

```typescript
// ❌ Ruim - Faz muitas coisas
function handleUser(user: User): void {
  validateUser(user);
  saveUser(user);
  sendEmail(user);
  updateCache(user);
  logActivity(user);
}

// ✅ Bom - Uma responsabilidade por função
function createUser(user: User): User {
  return saveUser(user);
}

function notifyUser(user: User): void {
  sendEmail(user);
}

function updateUserCache(user: User): void {
  updateCache(user);
}
```

#### 3. Early Return

```typescript
// ❌ Ruim - Muito aninhamento
function processOrder(order: Order): void {
  if (order) {
    if (order.isValid) {
      if (order.hasItems) {
        if (order.total > 0) {
          // processar
        }
      }
    }
  }
}

// ✅ Bom - Early return
function processOrder(order: Order): void {
  if (!order) return;
  if (!order.isValid) return;
  if (!order.hasItems) return;
  if (order.total <= 0) return;

  // processar
}
```

#### 4. Valores Padrão

```typescript
// ❌ Ruim
function fetchUsers(limit?: number): User[] {
  const actualLimit = limit || 10;
  return repository.find(actualLimit);
}

// ✅ Bom
function fetchUsers(limit: number = 10): User[] {
  return repository.find(limit);
}
```

#### 5. RO-RO Pattern (Receive Object, Return Object)

```typescript
// ❌ Ruim - Muitos parâmetros
function createUser(
  name: string,
  email: string,
  password: string,
  age: number,
  address: string,
  phone: string,
): User {
  // implementação
}

// ✅ Bom - Objeto de entrada
interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  age: number;
  address: string;
  phone: string;
}

interface CreateUserOutput {
  user: User;
  token: string;
}

function createUser(input: CreateUserInput): CreateUserOutput {
  // implementação
}
```

---

### Classes

#### 1. Classes Pequenas (< 200 linhas)

```typescript
// ✅ Bom - Classe focada
@Injectable()
export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async createUser(data: CreateUserDTO): Promise<User> {
    const existingUser = await this.repository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }
    const user = await this.repository.create(data);
    await this.emailService.sendWelcome(user.email);
    return user;
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}
```

#### 2. Poucos Métodos Públicos (< 10)

```typescript
// ✅ Bom - Interface clara
export class UserService {
  // Métodos públicos (< 10)
  async create(data: CreateUserDTO): Promise<User> {}
  async findById(id: string): Promise<User> {}
  async update(id: string, data: UpdateUserDTO): Promise<User> {}
  async delete(id: string): Promise<void> {}
  async list(params: PaginationParams): Promise<User[]> {}

  // Métodos privados
  private async validateEmail(email: string): Promise<void> {}
  private async hashPassword(password: string): Promise<string> {}
  private async sendNotification(user: User): Promise<void> {}
}
```

#### 3. Poucas Propriedades (< 10)

```typescript
// ❌ Ruim - Muitas propriedades
class UserService {
  private repo1: Repository1;
  private repo2: Repository2;
  private service1: Service1;
  private service2: Service2;
  private service3: Service3;
  private config1: Config1;
  private config2: Config2;
  private logger: Logger;
  private cache: Cache;
  private queue: Queue;
  private validator: Validator;
  // ... muitas mais
}

// ✅ Bom - Poucas dependências focadas
class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly emailService: EmailService,
    private readonly logger: Logger,
  ) {}
}
```

#### 4. SOLID Principles

```typescript
// Single Responsibility - Uma responsabilidade
class UserRepository {
  // Apenas acesso a dados
}

class UserService {
  // Apenas lógica de negócio
}

// Open/Closed - Aberto para extensão, fechado para modificação
abstract class BaseRepository<T> {
  abstract findById(id: string): Promise<T>;
}

class UserRepository extends BaseRepository<User> {
  async findById(id: string): Promise<User> {
    // implementação específica
  }
}

// Liskov Substitution - Subclasses substituem classes base
interface Repository<T> {
  findById(id: string): Promise<T>;
}

class UserRepository implements Repository<User> {}
class ProductRepository implements Repository<Product> {}

// Interface Segregation - Interfaces específicas
interface Readable<T> {
  findById(id: string): Promise<T>;
}

interface Writable<T> {
  create(data: T): Promise<T>;
}

// Dependency Inversion - Depender de abstrações
class UserService {
  constructor(
    private readonly repository: Repository<User>, // abstração
  ) {}
}
```

---

### Data e Validação

#### 1. Evite Primitivos, Use Tipos

```typescript
// ❌ Ruim
function createUser(name: string, email: string, age: number): User {}

// ✅ Bom
interface CreateUserData {
  name: string;
  email: string;
  age: number;
}

function createUser(data: CreateUserData): User {}
```

#### 2. Validação em DTOs

```typescript
// ✅ Bom - Validação declarativa
export class CreateUserDTO {
  @IsString()
  @Length(3, 100)
  name: string;

  @IsEmail()
  email: string;

  @IsInt()
  @Min(18)
  @Max(120)
  age: number;
}
```

#### 3. Imutabilidade

```typescript
// ✅ Bom - readonly
interface User {
  readonly id: string;
  readonly email: string;
  readonly createdAt: Date;
}

// ✅ Bom - as const
const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

// ✅ Bom - Readonly utility
type ReadonlyUser = Readonly<User>;
```

---

### Exceções

#### 1. Use para Erros Inesperados

```typescript
// ✅ Bom - AppError para erros de negócio
if (!user) {
  throw new AppError('User not found', 404);
}

// ✅ Bom - Erro técnico
try {
  await externalService.call();
} catch (error) {
  logger.error('External service failed', error);
  throw new AppError('Service unavailable', 503);
}
```

#### 2. Capture para Tratar

```typescript
// ❌ Ruim - Captura e ignora
try {
  await someOperation();
} catch (error) {
  // silêncio
}

// ✅ Bom - Captura e trata
try {
  await someOperation();
} catch (error) {
  logger.error('Operation failed', error);
  throw new AppError('Could not complete operation', 500);
}

// ✅ Bom - Captura para adicionar contexto
try {
  await user.save();
} catch (error) {
  throw new AppError(`Failed to save user ${user.id}`, 500);
}
```

---

## 🏗 NestJS

### Estrutura de Módulo

```
module/
├── domain/              # DTOs e tipos
│   ├── create.dto.ts
│   └── update.dto.ts
├── services/            # Lógica de negócio
│   ├── create.ts
│   ├── find.ts
│   ├── findOne.ts
│   ├── update.ts
│   └── delete.ts
├── utils/               # Utilitários do módulo
│   └── validators.ts
├── repository.ts        # Acesso a dados
├── module.controller.ts # Controller
└── module.module.ts     # Module definition
```

### Controllers

```typescript
// ✅ Bom - Controller magro
@Controller('users')
@Roles({ roles: ['admin'] })
export class UserController {
  constructor(
    private readonly createService: CreateUserService,
    private readonly findService: FindUsersService,
  ) {}

  @Post()
  async create(@Body() data: CreateUserDTO) {
    return this.createService.execute(data);
  }

  @Get()
  async find(@Query() query: PaginationParams<User>) {
    return this.findService.execute(new PaginationParams(query));
  }
}

// ❌ Ruim - Lógica no controller
@Controller('users')
export class UserController {
  @Post()
  async create(@Body() data: CreateUserDTO) {
    // ❌ validação no controller
    if (!data.email) throw new Error('Email required');

    // ❌ lógica de negócio no controller
    const existingUser = await this.repository.findByEmail(data.email);
    if (existingUser) throw new Error('Email in use');

    // ❌ persistência direta no controller
    return this.repository.create(data);
  }
}
```

### Services

```typescript
// ✅ Bom - Service focado
@Injectable()
export class CreateUserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  public async execute(data: CreateUserDTO): Promise<User> {
    await this.validateEmail(data.email);
    const user = await this.createUser(data);
    await this.notifyUser(user);
    return user;
  }

  private async validateEmail(email: string): Promise<void> {
    const exists = await this.repository.findByEmail(email);
    if (exists) {
      throw new AppError('Email already in use', 409);
    }
  }

  private async createUser(data: CreateUserDTO): Promise<User> {
    return this.repository.create(data);
  }

  private async notifyUser(user: User): Promise<void> {
    await this.emailService.sendWelcome(user.email);
  }
}
```

### Repositories

```typescript
// ✅ Bom - Repository abstrai Prisma
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDTO): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findAll(params: PaginationParams<User>): Promise<User[]> {
    const { offset, limit, orderBy, order } = params;
    return this.prisma.user.findMany({
      skip: offset,
      take: limit,
      orderBy: orderBy ? { [orderBy]: order } : undefined,
    });
  }
}
```

### DTOs

```typescript
// ✅ Bom - DTO com validação completa
export class CreateUserDTO {
  @IsString()
  @Length(3, 100)
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Name must contain only letters',
  })
  name: string;

  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(120)
  age?: number;
}

// ✅ Bom - Update DTO herda de Create
export class UpdateUserDTO extends PartialType(CreateUserDTO) {
  @IsUUID()
  id: string;
}
```

---

## 🗄️ Banco de Dados

### Prisma Schema

```prisma
// ✅ Bom - Schema bem definido
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  age       Int?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relacionamentos
  posts     Post[]
  profile   Profile?

  // Índices
  @@index([email])
  @@index([createdAt])
}

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String   @db.Text
  published Boolean  @default(false)
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([authorId])
  @@index([published, createdAt])
}
```

### Queries Eficientes

```typescript
// ❌ Ruim - N+1 query
async function getUsersWithPosts(): Promise<User[]> {
  const users = await prisma.user.findMany();
  for (const user of users) {
    user.posts = await prisma.post.findMany({
      where: { authorId: user.id },
    });
  }
  return users;
}

// ✅ Bom - Query única com include
async function getUsersWithPosts(): Promise<User[]> {
  return prisma.user.findMany({
    include: {
      posts: true,
    },
  });
}

// ✅ Bom - Select apenas campos necessários
async function getUserNames(): Promise<Array<{ id: string; name: string }>> {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
    },
  });
}
```

---

## 🧪 Testes

### Nomenclatura

```typescript
// ✅ Bom - Descrições claras
describe('CreateUserService', () => {
  describe('execute', () => {
    it('should create user when data is valid', async () => {});
    it('should throw error when email already exists', async () => {});
    it('should throw error when email is invalid', async () => {});
    it('should send welcome email after creation', async () => {});
  });
});

// ❌ Ruim - Descrições vagas
describe('UserService', () => {
  it('test 1', () => {});
  it('works', () => {});
  it('should work', () => {});
});
```

### Convenções

```typescript
describe('CreateUserService', () => {
  let sut: CreateUserService; // System Under Test
  let stubRepository: jest.Mocked<UserRepository>;
  let stubEmailService: jest.Mocked<EmailService>;

  beforeEach(() => {
    stubRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    } as any;

    stubEmailService = {
      sendWelcome: jest.fn(),
    } as any;

    sut = new CreateUserService(stubRepository, stubEmailService);
  });

  it('should create user when data is valid', async () => {
    // Arrange
    const inputData = { name: 'John', email: 'john@example.com' };
    const expectedUser = { id: '1', ...inputData };
    stubRepository.findByEmail.mockResolvedValue(null);
    stubRepository.create.mockResolvedValue(expectedUser);

    // Act
    const actualUser = await sut.execute(inputData);

    // Assert
    expect(actualUser).toEqual(expectedUser);
    expect(stubRepository.create).toHaveBeenCalledWith(inputData);
    expect(stubEmailService.sendWelcome).toHaveBeenCalledWith(inputData.email);
  });
});
```

---

## 💬 Comentários e Documentação

### Quando Comentar

```typescript
// ❌ Ruim - Comentário óbvio
// Incrementa o contador
counter++;

// ✅ Bom - Explica o porquê
// Adiciona 1 segundo de delay para evitar rate limiting da API externa
await sleep(1000);

// ✅ Bom - Explica lógica complexa
// Usa algoritmo de Luhn para validar número do cartão
function validateCardNumber(number: string): boolean {
  // implementação
}

// ✅ Bom - TODOs e FIXMEs
// TODO: Implementar cache Redis para melhor performance
// FIXME: Corrigir validação de CPF para casos especiais
// HACK: Workaround temporário até biblioteca ser atualizada
```

### Documentação JSDoc

````typescript
/**
 * Cria um novo usuário no sistema
 *
 * @param data - Dados do usuário a ser criado
 * @returns Usuário criado com ID gerado
 * @throws {AppError} 409 - Quando email já existe
 * @throws {AppError} 400 - Quando dados são inválidos
 *
 * @example
 * ```typescript
 * const user = await createUser({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 * });
 * ```
 */
async function createUser(data: CreateUserDTO): Promise<User> {
  // implementação
}
````

---

## 📝 Git

### Commits Semânticos

```bash
# Formato
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]

# Tipos
feat:     Nova funcionalidade
fix:      Correção de bug
docs:     Documentação
style:    Formatação
refactor: Refatoração
test:     Testes
chore:    Manutenção
perf:     Performance

# Exemplos
feat: adiciona módulo de produtos
feat(auth): implementa refresh token
fix: corrige validação de CPF
fix(user): corrige criação de usuário duplicado
docs: atualiza README com instruções Docker
refactor(account): simplifica serviço de criação
test: adiciona testes para UserService
chore: atualiza dependências
perf: otimiza query de listagem de produtos
```

### Mensagens de Commit

```bash
# ❌ Ruim
git commit -m "fix"
git commit -m "mudanças"
git commit -m "WIP"
git commit -m "teste"

# ✅ Bom
git commit -m "feat: adiciona validação de email único"
git commit -m "fix: corrige erro ao criar conta com CPF inválido"
git commit -m "refactor: extrai lógica de validação para helper"
git commit -m "test: adiciona testes para AccountService"
```

---

## 🔍 Code Review Checklist

### Para o Autor

- [ ] Código segue os padrões deste documento
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Linter passou (`npm run lint`)
- [ ] Testes passando (`npm run test`)
- [ ] Código formatado (`npm run format`)
- [ ] Commits semânticos
- [ ] PR com descrição clara

### Para o Revisor

- [ ] Código é legível e claro
- [ ] Nomes são descritivos
- [ ] Funções são pequenas e focadas
- [ ] Sem duplicação de código
- [ ] Tratamento de erros adequado
- [ ] Validações estão presentes
- [ ] Testes cobrem casos de sucesso e erro
- [ ] Performance adequada
- [ ] Segurança considerada

---

## 📚 Recursos Adicionais

### Livros Recomendados

- **Clean Code** - Robert C. Martin
- **Clean Architecture** - Robert C. Martin
- **Refactoring** - Martin Fowler
- **Design Patterns** - Gang of Four

### Links Úteis

- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [NestJS Best Practices](https://docs.nestjs.com/fundamentals/testing)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## ✅ Resumo Rápido

### DO (Faça)

✅ Use TypeScript com tipagem forte  
✅ Escreva funções pequenas (< 20 linhas)  
✅ Siga SOLID e Clean Code  
✅ Valide dados com DTOs  
✅ Trate erros adequadamente  
✅ Escreva testes  
✅ Use early returns  
✅ Prefira imutabilidade  
✅ Use commits semânticos  
✅ Documente código complexo

### DON'T (Não Faça)

❌ Não use `any`  
❌ Não deixe funções muito longas  
❌ Não coloque lógica em controllers  
❌ Não ignore erros  
❌ Não escreva código sem testes  
❌ Não duplique código  
❌ Não use magic numbers  
❌ Não commite código não formatado  
❌ Não deixe console.log em produção  
❌ Não exponha informações sensíveis

---

**Última atualização:** Novembro 2024
