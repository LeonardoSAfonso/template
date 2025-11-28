# Arquitetura do Projeto

Este documento descreve a arquitetura e os padrões de design utilizados no template.

---

## 📐 Visão Geral da Arquitetura

O projeto segue uma **arquitetura modular** baseada em **Clean Architecture** e nos princípios **SOLID**.

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│                  (Controllers, Guards)                   │
├─────────────────────────────────────────────────────────┤
│                   Application Layer                      │
│              (Services, Use Cases, DTOs)                 │
├─────────────────────────────────────────────────────────┤
│                     Domain Layer                         │
│               (Entities, Business Logic)                 │
├─────────────────────────────────────────────────────────┤
│                 Infrastructure Layer                     │
│          (Repository, ORM, External Services)            │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗 Camadas da Aplicação

### 1. Presentation Layer (Camada de Apresentação)

**Responsabilidade:** Interface com o cliente, receber requisições HTTP e retornar respostas.

**Componentes:**
- **Controllers**: Recebem requisições HTTP e delegam para services
- **Guards**: Controle de autenticação e autorização
- **Interceptors**: Manipulação de request/response
- **Filters**: Tratamento de exceções

**Localização:**
```
src/
├── */
│   └── *.controller.ts
├── keycloak/
│   └── auth.controller.ts
```

**Exemplo:**

```typescript
@Controller('account')
@Roles({ roles: ['admin'] })
export class AccountController {
  constructor(
    private readonly createService: CreateAccountService,
    private readonly findService: FindAccountsService,
  ) {}

  @Post()
  async create(@Body() data: CreateAccountDTO) {
    return this.createService.execute(data);
  }

  @Get()
  async find(@Query() query: PaginationParams<Account>) {
    return this.findService.execute(new PaginationParams(query));
  }
}
```

**Princípios:**
- Controllers são "magros" - apenas roteamento
- Não contêm lógica de negócio
- Apenas validam formato de entrada (DTOs)
- Delegam processamento para services

---

### 2. Application Layer (Camada de Aplicação)

**Responsabilidade:** Orquestrar a lógica de negócio e coordenar diferentes componentes.

**Componentes:**
- **Services**: Implementam casos de uso
- **DTOs**: Objetos de transferência de dados com validação
- **Validators**: Validações customizadas

**Localização:**
```
src/
├── */
│   ├── services/
│   │   ├── create.ts
│   │   ├── find.ts
│   │   ├── findOne.ts
│   │   ├── update.ts
│   │   └── delete.ts
│   ├── domain/
│   │   ├── create.dto.ts
│   │   └── update.dto.ts
│   └── utils/
│       └── custom.validator.ts
```

**Exemplo de Service:**

```typescript
@Injectable()
export class CreateAccountService {
  constructor(
    private readonly repository: AccountRepository,
    private readonly keycloakService: KeycloakUserService,
  ) {}

  public async execute(data: CreateAccountDTO): Promise<Account> {
    // 1. Validações de negócio
    const existingAccount = await this.repository.findByEmail(data.email);
    
    if (existingAccount) {
      throw new AppError('Email already in use', 409);
    }

    // 2. Orquestração de serviços externos
    const kcUser = await this.keycloakService.create({
      email: data.email,
      name: data.name,
      password: data.password,
    });

    // 3. Persistência
    return this.repository.create({
      ...data,
      keycloakId: kcUser.id,
    });
  }
}
```

**Exemplo de DTO:**

```typescript
export class CreateAccountDTO {
  @IsString()
  @Length(3, 100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Validate(IsCPFOrCNPJ)
  identification: string;

  @IsStrongPassword()
  password: string;
}
```

**Princípios:**
- Um service por caso de uso
- Services não conhecem HTTP/Controllers
- DTOs validam dados de entrada
- Coordenam múltiplos repositories/services
- Tratam regras de negócio

---

### 3. Domain Layer (Camada de Domínio)

**Responsabilidade:** Representar o núcleo do negócio com suas regras e entidades.

**Componentes:**
- **Entities**: Modelos de domínio
- **Business Rules**: Regras de negócio puras
- **Domain Services**: Lógica de domínio complexa

**Localização:**
```
prisma/
└── schema.prisma    # Definição das entidades

src/
└── */
    └── domain/      # DTOs e regras de negócio
```

**Exemplo de Entidade (Prisma):**

```prisma
model Account {
  id             String   @id @default(uuid())
  name           String
  identification String   @unique
  email          String   @unique
  first_access   Boolean  @default(true)
  email_checked  Boolean  @default(false)
  keycloakId     String   @unique
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

**Princípios:**
- Entidades contêm regras de negócio fundamentais
- Independente de frameworks e bibliotecas
- Validações de domínio (não técnicas)
- Encapsulamento de dados

---

### 4. Infrastructure Layer (Camada de Infraestrutura)

**Responsabilidade:** Implementar detalhes técnicos e comunicação com recursos externos.

**Componentes:**
- **Repositories**: Acesso a banco de dados
- **ORM Services**: Prisma, TypeORM, etc.
- **External Services**: APIs externas, Keycloak, etc.
- **Database Migrations**: Versionamento do schema

**Localização:**
```
src/
├── orm/
│   ├── prisma.service.ts
│   └── orm.module.ts
├── keycloak/
│   ├── keycloak-user.service.ts
│   └── keycloak-auth.service.ts
└── */
    └── repository.ts

prisma/
└── migrations/
```

**Exemplo de Repository:**

```typescript
@Injectable()
export class AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAccountDTO): Promise<Account> {
    return this.prisma.account.create({ data });
  }

  async findById(id: string): Promise<Account | null> {
    return this.prisma.account.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<Account | null> {
    return this.prisma.account.findUnique({ where: { email } });
  }

  async findAll(params: PaginationParams<Account>): Promise<Account[]> {
    const { offset, limit, orderBy, order } = params;
    
    return this.prisma.account.findMany({
      skip: offset,
      take: limit,
      orderBy: orderBy ? { [orderBy]: order } : undefined,
    });
  }

  async update(id: string, data: UpdateAccountDTO): Promise<Account> {
    return this.prisma.account.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.account.delete({ where: { id } });
  }
}
```

**Princípios:**
- Repositories abstraem acesso a dados
- Não expõem detalhes de implementação do ORM
- Retornam entidades de domínio
- Isolam lógica de persistência

---

## 🔄 Fluxo de Dados

### Fluxo de uma Requisição

```
1. Client HTTP Request
        ↓
2. Controller (Presentation)
   - Validação de formato (DTO)
   - Autenticação (Guards)
   - Autorização (Roles)
        ↓
3. Service (Application)
   - Validações de negócio
   - Orquestração
        ↓
4. Repository (Infrastructure)
   - Acesso ao banco de dados
        ↓
5. Database
        ↓
6. Repository → Service → Controller → Client
```

### Exemplo Prático

**Requisição:** `POST /account`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "identification": "12345678900",
  "password": "SecurePass123!"
}
```

**Fluxo:**

1. **Controller recebe requisição**
   ```typescript
   @Post()
   async create(@Body() data: CreateAccountDTO) {
     return this.createService.execute(data);
   }
   ```

2. **DTO valida dados**
   ```typescript
   // Valida formato, tipo, comprimento, etc.
   // Se inválido, lança exceção automaticamente
   ```

3. **Service executa lógica**
   ```typescript
   async execute(data: CreateAccountDTO) {
     // Verifica se email já existe
     const exists = await this.repository.findByEmail(data.email);
     if (exists) throw new AppError('Email in use', 409);
     
     // Cria usuário no Keycloak
     const kcUser = await this.keycloakService.create(data);
     
     // Salva no banco
     return this.repository.create({...data, keycloakId: kcUser.id});
   }
   ```

4. **Repository persiste**
   ```typescript
   async create(data: CreateAccountDTO) {
     return this.prisma.account.create({ data });
   }
   ```

5. **Resposta retorna ao cliente**
   ```json
   {
     "id": "uuid",
     "name": "John Doe",
     "email": "john@example.com",
     "keycloakId": "kc-uuid",
     "createdAt": "2024-01-01T00:00:00Z"
   }
   ```

---

## 🧩 Padrões de Design

### 1. Repository Pattern

**Objetivo:** Abstrair acesso a dados

**Implementação:**

```typescript
// Interface (contrato)
interface IUserRepository {
  create(data: CreateUserDTO): Promise<User>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
}

// Implementação
@Injectable()
class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}
  
  async create(data: CreateUserDTO): Promise<User> {
    return this.prisma.user.create({ data });
  }
}
```

**Benefícios:**
- Desacopla lógica de negócio da persistência
- Facilita testes (mocking)
- Permite trocar implementação (ex: Prisma → TypeORM)

---

### 2. Service Pattern

**Objetivo:** Encapsular lógica de negócio

**Implementação:**

```typescript
@Injectable()
class CreateUserService {
  constructor(
    private repository: UserRepository,
    private emailService: EmailService,
  ) {}
  
  async execute(data: CreateUserDTO): Promise<User> {
    // Validações
    // Orquestração
    // Persistência
  }
}
```

**Benefícios:**
- Lógica de negócio isolada
- Reutilizável
- Testável
- Single Responsibility

---

### 3. DTO Pattern

**Objetivo:** Validar e transferir dados entre camadas

**Implementação:**

```typescript
export class CreateUserDTO {
  @IsString()
  @Length(3, 100)
  name: string;

  @IsEmail()
  email: string;
}
```

**Benefícios:**
- Validação automática
- Documentação implícita
- Type safety
- Transformação de dados

---

### 4. Dependency Injection

**Objetivo:** Inverter controle de dependências

**Implementação:**

```typescript
@Injectable()
class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly emailService: EmailService,
  ) {}
}

@Module({
  providers: [UserService, UserRepository, EmailService],
})
class UserModule {}
```

**Benefícios:**
- Desacoplamento
- Facilita testes
- Modularidade
- Inversão de dependência (SOLID)

---

### 5. Module Pattern

**Objetivo:** Organizar código em módulos coesos

**Implementação:**

```typescript
@Module({
  imports: [OrmModule, KeycloakModule],
  controllers: [UserController],
  providers: [
    UserRepository,
    CreateUserService,
    FindUserService,
  ],
  exports: [UserRepository],
})
export class UserModule {}
```

**Benefícios:**
- Organização clara
- Lazy loading
- Encapsulamento
- Reutilização

---

## 🔐 Segurança na Arquitetura

### Camadas de Segurança

```
1. Network Level
   ↓ (Firewall, VPN)
2. Application Level
   ↓ (HTTPS, CORS)
3. Authentication
   ↓ (Keycloak, JWT)
4. Authorization
   ↓ (Guards, Roles)
5. Business Logic
   ↓ (Validation, Sanitization)
6. Data Access
   ↓ (ORM, Prepared Statements)
```

### Implementação

**1. Guards de Autenticação:**

```typescript
@UseGuards(AuthGuard, ResourceGuard, RoleGuard)
@Controller('users')
export class UserController {}
```

**2. Validação de Dados:**

```typescript
@IsEmail()
email: string;

@IsStrongPassword()
password: string;
```

**3. Proteção contra SQL Injection:**

```typescript
// Prisma usa prepared statements automaticamente
this.prisma.user.findUnique({ where: { email } });
```

**4. Tratamento de Erros:**

```typescript
throw new AppError('Unauthorized', 401);
```

---

## 📊 Diagrama de Módulos

```
┌─────────────────────────────────────────────────────────┐
│                       AppModule                          │
├─────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ OrmModule  │  │KeycloakModule│  │ConfigModule   │  │
│  │            │  │              │  │(Global)       │  │
│  └────────────┘  └──────────────┘  └───────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │           AccountModule (Example)              │    │
│  ├────────────────────────────────────────────────┤    │
│  │ Controllers: AccountController                 │    │
│  │ Providers:   AccountRepository                 │    │
│  │              CreateAccountService              │    │
│  │              FindAccountsService               │    │
│  │              FindOneAccountService             │    │
│  │              UpdateAccountService              │    │
│  │              DeleteAccountService              │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Ciclo de Vida da Aplicação

```
1. Bootstrap (main.ts)
   ↓
2. AppModule initialization
   ↓
3. Global modules (Config, ORM)
   ↓
4. Feature modules (Account, Keycloak)
   ↓
5. Providers instantiation (DI)
   ↓
6. Middleware registration
   ↓
7. Guards registration
   ↓
8. Interceptors registration
   ↓
9. Pipes registration (Validation)
   ↓
10. Application listening
```

---

## 📚 Referências

- [NestJS Architecture](https://docs.nestjs.com/fundamentals/async-providers)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)

