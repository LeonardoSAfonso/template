# Guia de Contribuição

Este documento descreve como contribuir com o projeto e adicionar novos recursos ao template.

---

## 📋 Índice

- [Começando](#-começando)
- [Workflow de Desenvolvimento](#-workflow-de-desenvolvimento)
- [Padrões de Código](#-padrões-de-código)
- [Como Criar um Novo Módulo](#-como-criar-um-novo-módulo)
- [Como Adicionar um Endpoint](#-como-adicionar-um-endpoint)
- [Como Adicionar Validações](#-como-adicionar-validações)
- [Como Trabalhar com Banco de Dados](#-como-trabalhar-com-banco-de-dados)
- [Commits e Branches](#-commits-e-branches)
- [Pull Requests](#-pull-requests)
- [Revisão de Código](#-revisão-de-código)

---

## 🚀 Começando

### 1. Fork do Repositório

```bash
# Via GitHub UI ou CLI
gh repo fork <repository-url>
```

### 2. Clonar Localmente

```bash
git clone https://github.com/seu-usuario/template.git
cd template
```

### 3. Instalar Dependências

```bash
npm install
```

### 4. Configurar Ambiente

```bash
# Copiar .env de exemplo
cp .env.example .env

# Subir serviços
docker-compose up -d postgres keycloak

# Executar migrações
npx prisma migrate dev
```

### 5. Executar Projeto

```bash
npm run start:dev
```

---

## 🔄 Workflow de Desenvolvimento

### 1. Criar Branch

```bash
# Para nova funcionalidade
git checkout -b feature/nome-da-funcionalidade

# Para correção de bug
git checkout -b fix/nome-do-bug

# Para melhorias
git checkout -b improvement/nome-da-melhoria

# Para documentação
git checkout -b docs/nome-da-doc
```

### 2. Desenvolver

```bash
# Fazer alterações no código
# Seguir os padrões de código
# Adicionar testes
```

### 3. Testar

```bash
# Executar testes unitários
npm run test

# Executar testes e2e
npm run test:e2e

# Verificar cobertura
npm run test:cov

# Executar linter
npm run lint

# Formatar código
npm run format
```

### 4. Commit

```bash
git add .
git commit -m "feat: adiciona funcionalidade X"
```

### 5. Push

```bash
git push origin feature/nome-da-funcionalidade
```

### 6. Pull Request

- Abrir PR no GitHub
- Descrever mudanças
- Aguardar revisão

---

## 📝 Padrões de Código

### TypeScript Guidelines

Siga as diretrizes no README principal:

- **Nomenclatura:** camelCase para variáveis, PascalCase para classes
- **Tipagem:** Sempre declarar tipos
- **Funções:** Curtas (<20 linhas) com propósito único
- **Classes:** SOLID e Clean Code

### ESLint

```bash
# Verificar problemas
npm run lint

# Corrigir automaticamente
npm run lint -- --fix
```

### Prettier

```bash
# Formatar código
npm run format
```

---

## 🧩 Como Criar um Novo Módulo

### Passo 1: Criar Estrutura de Diretórios

```bash
mkdir -p src/my-module/{domain,services,utils}
```

Estrutura:

```
src/my-module/
├── domain/
│   ├── create.dto.ts
│   └── update.dto.ts
├── services/
│   ├── create.ts
│   ├── find.ts
│   ├── findOne.ts
│   ├── update.ts
│   └── delete.ts
├── utils/
├── repository.ts
├── my-module.controller.ts
└── my-module.module.ts
```

### Passo 2: Criar Modelo no Prisma

```prisma
// prisma/schema.prisma
model MyEntity {
  id        String   @id @default(uuid())
  name      String
  value     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Passo 3: Executar Migração

```bash
npx prisma migrate dev --name create_my_entity
npx prisma generate
```

### Passo 4: Criar DTOs

```typescript
// src/my-module/domain/create.dto.ts
import { IsString, Length } from 'class-validator';

export class CreateMyEntityDTO {
  @IsString()
  @Length(3, 100)
  name: string;

  @IsString()
  value: string;
}
```

```typescript
// src/my-module/domain/update.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { IsUUID } from 'class-validator';
import { CreateMyEntityDTO } from './create.dto';

export class UpdateMyEntityDTO extends PartialType(CreateMyEntityDTO) {
  @IsUUID()
  id: string;
}
```

### Passo 5: Criar Repository

```typescript
// src/my-module/repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/orm/prisma.service';
import { MyEntity } from 'prisma/client';
import { CreateMyEntityDTO } from './domain/create.dto';
import { UpdateMyEntityDTO } from './domain/update.dto';
import { PaginationParams } from 'src/shared/types/pagination.type';

@Injectable()
export default class MyEntityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMyEntityDTO): Promise<MyEntity> {
    return this.prisma.myEntity.create({ data });
  }

  async findAll(params: PaginationParams<MyEntity>): Promise<MyEntity[]> {
    const { offset, limit, orderBy, order, searchBy, searchFor } = params;

    return this.prisma.myEntity.findMany({
      skip: offset,
      take: limit,
      orderBy: orderBy ? { [orderBy]: order } : undefined,
      where: searchBy && searchFor
        ? { [searchBy]: { contains: searchFor } }
        : undefined,
    });
  }

  async findById(id: string): Promise<MyEntity | null> {
    return this.prisma.myEntity.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateMyEntityDTO): Promise<MyEntity> {
    return this.prisma.myEntity.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.myEntity.delete({ where: { id } });
  }
}
```

### Passo 6: Criar Services

```typescript
// src/my-module/services/create.ts
import { Injectable } from '@nestjs/common';
import { MyEntity } from 'prisma/client';
import AppError from 'src/shared/AppError';
import { CreateMyEntityDTO } from '../domain/create.dto';
import MyEntityRepository from '../repository';

@Injectable()
export default class CreateMyEntityService {
  constructor(private readonly repository: MyEntityRepository) {}

  public async execute(data: CreateMyEntityDTO): Promise<MyEntity> {
    // Validações de negócio
    const existingEntity = await this.repository.findByName(data.name);
    
    if (existingEntity) {
      throw new AppError('Entity already exists', 409);
    }

    // Criar entidade
    return this.repository.create(data);
  }
}
```

Criar services similares para `find.ts`, `findOne.ts`, `update.ts`, `delete.ts`.

### Passo 7: Criar Controller

```typescript
// src/my-module/my-module.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { MyEntity } from 'prisma/client';
import { PaginationParams } from 'src/shared/types/pagination.type';
import { CreateMyEntityDTO } from './domain/create.dto';
import { UpdateMyEntityDTO } from './domain/update.dto';
import CreateMyEntityService from './services/create';
import DeleteMyEntityService from './services/delete';
import FindMyEntitiesService from './services/find';
import FindOneMyEntityService from './services/findOne';
import UpdateMyEntityService from './services/update';

@Roles({ roles: ['admin'] })
@Controller('my-entity')
export default class MyModuleController {
  constructor(
    private readonly createService: CreateMyEntityService,
    private readonly findService: FindMyEntitiesService,
    private readonly findOneService: FindOneMyEntityService,
    private readonly updateService: UpdateMyEntityService,
    private readonly deleteService: DeleteMyEntityService,
  ) {}

  @Post()
  async create(@Body() data: CreateMyEntityDTO) {
    return this.createService.execute(data);
  }

  @Get()
  async find(@Query() query: PaginationParams<MyEntity>) {
    return this.findService.execute(new PaginationParams<MyEntity>(query));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.findOneService.execute(id);
  }

  @Put()
  async update(@Body() data: UpdateMyEntityDTO) {
    return this.updateService.execute(data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.deleteService.execute(id);
  }
}
```

### Passo 8: Criar Module

```typescript
// src/my-module/my-module.module.ts
import { Module } from '@nestjs/common';
import MyModuleController from './my-module.controller';
import MyEntityRepository from './repository';
import CreateMyEntityService from './services/create';
import DeleteMyEntityService from './services/delete';
import FindMyEntitiesService from './services/find';
import FindOneMyEntityService from './services/findOne';
import UpdateMyEntityService from './services/update';

@Module({
  controllers: [MyModuleController],
  providers: [
    MyEntityRepository,
    CreateMyEntityService,
    FindMyEntitiesService,
    FindOneMyEntityService,
    UpdateMyEntityService,
    DeleteMyEntityService,
  ],
  exports: [MyEntityRepository],
})
export class MyModule {}
```

### Passo 9: Registrar no AppModule

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { MyModule } from './my-module/my-module.module';
// outros imports...

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    OrmModule,
    KeycloakModule.forRoot(),
    MyModule, // <-- Adicionar aqui
  ],
})
export class AppModule {}
```

### Passo 10: Criar Testes

```typescript
// test/my-module/services/create.spec.ts
describe('CreateMyEntityService', () => {
  let sut: CreateMyEntityService;
  let stubRepository: jest.Mocked<MyEntityRepository>;

  beforeEach(() => {
    stubRepository = {
      create: jest.fn(),
      findByName: jest.fn(),
    } as any;

    sut = new CreateMyEntityService(stubRepository);
  });

  it('should create entity', async () => {
    // Arrange
    const inputData = { name: 'Test', value: 'test-value' };
    const expectedEntity = { id: '1', ...inputData };
    stubRepository.findByName.mockResolvedValue(null);
    stubRepository.create.mockResolvedValue(expectedEntity);

    // Act
    const actualEntity = await sut.execute(inputData);

    // Assert
    expect(actualEntity).toEqual(expectedEntity);
  });

  it('should throw error if entity exists', async () => {
    // Arrange
    const inputData = { name: 'Existing', value: 'test' };
    stubRepository.findByName.mockResolvedValue({ id: '1' } as any);

    // Act & Assert
    await expect(sut.execute(inputData)).rejects.toThrow(
      new AppError('Entity already exists', 409)
    );
  });
});
```

---

## 🎯 Como Adicionar um Endpoint

### 1. No Controller Existente

```typescript
@Get('custom-endpoint')
async customEndpoint(@Query('param') param: string) {
  return this.customService.execute(param);
}
```

### 2. Criar Service

```typescript
// services/custom.ts
@Injectable()
export class CustomService {
  async execute(param: string): Promise<any> {
    // Lógica
    return result;
  }
}
```

### 3. Registrar no Module

```typescript
@Module({
  providers: [
    // outros services...
    CustomService,
  ],
})
export class MyModule {}
```

### 4. Adicionar Testes

```typescript
describe('CustomService', () => {
  // testes...
});
```

---

## ✅ Como Adicionar Validações

### Validação com Decorators

```typescript
import {
  IsString,
  IsEmail,
  IsInt,
  Min,
  Max,
  Length,
  IsOptional,
  IsEnum,
  Matches,
  ValidateNested,
  IsArray,
} from 'class-validator';

export class MyDTO {
  @IsString()
  @Length(3, 100)
  name: string;

  @IsEmail()
  email: string;

  @IsInt()
  @Min(0)
  @Max(100)
  age: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['active', 'inactive'])
  status: string;

  @Matches(/^[A-Z]{3}-\d{4}$/)
  code: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
```

### Validação Customizada

```typescript
// utils/custom.validator.ts
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isCustom', async: false })
export class IsCustomValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    // Lógica de validação
    return /* condição */;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Custom validation failed';
  }
}
```

**Uso:**

```typescript
import { Validate } from 'class-validator';
import { IsCustomValidator } from './utils/custom.validator';

export class MyDTO {
  @Validate(IsCustomValidator)
  customField: string;
}
```

---

## 🗄️ Como Trabalhar com Banco de Dados

### Adicionar Nova Tabela

```prisma
// prisma/schema.prisma
model NewTable {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relacionamentos
  userId    String
  user      User     @relation(fields: [userId], references: [id])
}
```

### Criar Migração

```bash
npx prisma migrate dev --name add_new_table
```

### Adicionar Coluna

```prisma
model ExistingTable {
  // colunas existentes...
  
  newColumn String @default("")
}
```

```bash
npx prisma migrate dev --name add_new_column
```

### Relacionamentos

**Um para Muitos:**

```prisma
model User {
  id       String    @id @default(uuid())
  posts    Post[]
}

model Post {
  id       String @id @default(uuid())
  userId   String
  user     User   @relation(fields: [userId], references: [id])
}
```

**Muitos para Muitos:**

```prisma
model Post {
  id         String       @id @default(uuid())
  categories PostCategory[]
}

model Category {
  id    String       @id @default(uuid())
  posts PostCategory[]
}

model PostCategory {
  postId     String
  categoryId String
  post       Post     @relation(fields: [postId], references: [id])
  category   Category @relation(fields: [categoryId], references: [id])
  
  @@id([postId, categoryId])
}
```

---

## 📝 Commits e Branches

### Padrão de Commits (Conventional Commits)

```bash
# Formato
<tipo>(<escopo>): <descrição>

# Tipos
feat:     Nova funcionalidade
fix:      Correção de bug
docs:     Documentação
style:    Formatação (não afeta código)
refactor: Refatoração
test:     Adicionar/modificar testes
chore:    Manutenção (deps, config)
perf:     Melhoria de performance

# Exemplos
feat: adiciona módulo de produtos
feat(account): adiciona validação de CPF
fix: corrige erro ao criar conta
fix(auth): corrige expiração de token
docs: atualiza README com instruções
refactor(account): simplifica serviço de criação
test: adiciona testes para AccountService
chore: atualiza dependências
```

### Padrão de Branches

```bash
# Feature
feature/nome-da-funcionalidade
feature/add-product-module

# Fix
fix/nome-do-bug
fix/account-creation-error

# Hotfix (correção urgente)
hotfix/critical-security-issue

# Improvement
improvement/optimize-database-queries

# Documentation
docs/api-documentation
```

---

## 🔍 Pull Requests

### Checklist

Antes de abrir um PR, certifique-se de:

- [ ] Código segue os padrões
- [ ] Testes unitários adicionados/atualizados
- [ ] Testes e2e adicionados (se aplicável)
- [ ] Todos os testes passando
- [ ] Linter sem erros
- [ ] Código formatado
- [ ] Documentação atualizada
- [ ] Commits semânticos
- [ ] Branch atualizada com `main`

### Template de PR

```markdown
## Descrição

Breve descrição das mudanças.

## Tipo de Mudança

- [ ] Nova funcionalidade (feature)
- [ ] Correção de bug (fix)
- [ ] Melhoria (improvement)
- [ ] Documentação (docs)
- [ ] Refatoração (refactor)

## Como Testar

1. Passo 1
2. Passo 2
3. Resultado esperado

## Checklist

- [ ] Testes adicionados
- [ ] Documentação atualizada
- [ ] Linter passou
- [ ] Todos os testes passando

## Screenshots (se aplicável)

Adicionar screenshots ou GIFs.

## Observações Adicionais

Qualquer informação adicional relevante.
```

---

## 👀 Revisão de Código

### O que Revisar

1. **Funcionalidade:**
   - Código funciona conforme esperado?
   - Tratamento de erros adequado?

2. **Padrões:**
   - Segue as convenções do projeto?
   - Nomenclatura adequada?

3. **Testes:**
   - Cobertura adequada?
   - Casos de erro testados?

4. **Performance:**
   - Algoritmos eficientes?
   - Sem N+1 queries?

5. **Segurança:**
   - Validações adequadas?
   - Dados sensíveis protegidos?

### Como Revisar

```markdown
# Comentário Positivo
✅ Ótima implementação da validação de CPF!

# Sugestão de Melhoria
💡 Sugestão: Poderia extrair essa lógica para um helper separado para melhor reutilização.

# Problema Encontrado
❌ Problema: Este método pode causar N+1 query. Considere usar `include` no Prisma.

# Pergunta
❓ Por que optou por essa abordagem ao invés de usar X?
```

---

## 📚 Recursos Adicionais

### Documentação

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)

### Ferramentas

- [Postman](https://www.postman.com/) - Testar API
- [DBeaver](https://dbeaver.io/) - Cliente de banco de dados
- [VS Code](https://code.visualstudio.com/) - Editor recomendado

### Extensões VS Code Recomendadas

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "orta.vscode-jest",
    "humao.rest-client"
  ]
}
```

---

## 🆘 Ajuda

### Dúvidas Frequentes

**Q: Como resolver conflitos de merge?**

```bash
git checkout main
git pull origin main
git checkout minha-branch
git merge main
# Resolver conflitos manualmente
git add .
git commit -m "merge: resolve conflicts"
```

**Q: Como reverter um commit?**

```bash
# Reverter último commit (mantém mudanças)
git reset --soft HEAD~1

# Reverter último commit (descarta mudanças)
git reset --hard HEAD~1
```

**Q: Erro ao executar migrações?**

```bash
# Resetar banco de dados (CUIDADO!)
npx prisma migrate reset

# Aplicar migrações
npx prisma migrate deploy
```

### Contato

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.

---

**Obrigado por contribuir! 🎉**

