# Template NestJS

Template base para projetos NestJS com arquitetura modular, autenticação Keycloak, Prisma ORM e padrões de desenvolvimento consolidados.

> 🎯 **Objetivo**: Este projeto serve como template para ser usado como base para outros projetos, contendo serviços fundamentais e padrões de desenvolvimento que devem ser seguidos.

---

## 📚 Índice de Documentos

### Para quem quer rodar o projeto

- **[Configuração](./docs/CONFIGURATION.md)** - Guia detalhado de configuração e variáveis de ambiente
- **[Documentação da API](./docs/API.md)** - Referência completa de endpoints e exemplos

### Para quem quer utilizar o template

- **[Arquitetura](./docs/ARCHITECTURE.md)** - Estrutura do projeto, padrões de design e fluxo de dados
- **[Padrões de Código](./docs/CODING_STANDARDS.md)** - Convenções TypeScript e NestJS (ver README principal)
- **[Guia de Testes](./docs/TESTING.md)** - Estratégias de teste, convenções e exemplos
- **[Guia de Contribuição](./docs/CONTRIBUTING.md)** - Como contribuir, criar módulos e fazer PRs

---

## 🔍 Busca Rápida

### Precisa encontrar...

**Como configurar variáveis de ambiente?**
→ [Configuração](./CONFIGURATION.md#-variáveis-de-ambiente)

**Como funciona a autenticação?**
→ [API](./API.md#-autenticação)

**Como funciona a paginação?**
→ [API](./API.md#-paginação-e-filtros)

**Qual é a estrutura de um módulo?**
→ [Arquitetura](./ARCHITECTURE.md#estrutura-de-módulo)

**Como criar um novo endpoint?**
→ [Contribuição](./CONTRIBUTING.md#-como-adicionar-um-endpoint)

**Como testar meu código?**
→ [Testes](./TESTING.md#-testes-unitários)

**Como fazer um PR?**
→ [Contribuição](./CONTRIBUTING.md#-pull-requests)

---

## 🎯 Visão Geral

Este template fornece uma base sólida para desenvolvimento de APIs REST com NestJS, incluindo:

- ✅ Autenticação e autorização com Keycloak
- ✅ ORM com Prisma e PostgreSQL
- ✅ Validação de dados com class-validator
- ✅ Tratamento de erros padronizado
- ✅ Testes unitários e e2e configurados
- ✅ Docker e Docker Compose para desenvolvimento
- ✅ Integração com SonarQube para qualidade de código
- ✅ Paginação e busca padronizadas
- ✅ CORS configurado
- ✅ TypeScript com configurações otimizadas

---

## 🛠 Tecnologias

### Core

- **[NestJS](https://nestjs.com/)** - Framework Node.js progressivo
- **[TypeScript](https://www.typescriptlang.org/)** - Superset JavaScript tipado
- **[Prisma](https://www.prisma.io/)** - ORM moderno para Node.js
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional

### Autenticação

- **[Keycloak](https://www.keycloak.org/)** - Gerenciamento de identidade e acesso
- **[nest-keycloak-connect](https://www.npmjs.com/package/nest-keycloak-connect)** - Integração Keycloak com NestJS
- **[JWT](https://jwt.io/)** - Tokens de autenticação

### Validação e Transformação

- **[class-validator](https://github.com/typestack/class-validator)** - Validação declarativa
- **[class-transformer](https://github.com/typestack/class-transformer)** - Transformação de objetos
- **[cpf-cnpj-validator](https://www.npmjs.com/package/cpf-cnpj-validator)** - Validação de CPF/CNPJ

### Testes

- **[Jest](https://jestjs.io/)** - Framework de testes
- **[Supertest](https://github.com/visionmedia/supertest)** - Testes HTTP

### Qualidade de Código

- **[ESLint](https://eslint.org/)** - Linter JavaScript/TypeScript
- **[Prettier](https://prettier.io/)** - Formatador de código
- **[SonarQube](https://www.sonarqube.org/)** - Análise de qualidade de código

### DevOps

- **[Docker](https://www.docker.com/)** - Containerização
- **[Docker Compose](https://docs.docker.com/compose/)** - Orquestração de containers

## 📞 Suporte

### Canais de Ajuda

1. **Issues**: Abra uma issue no GitHub
2. **Equipe**: Entre em contato com a equipe de desenvolvimento

---

## 🔄 Atualizações

Este documento é atualizado regularmente. Última atualização: **Novembro 2025**

---

## ⭐ Próximos Passos

Depois de ler esta documentação:

1. ✅ Configure seu [ambiente](./docs/CONFIGURATION.md)
2. ✅ Entenda a [arquitetura](./docs/ARCHITECTURE.md)
3. ✅ Explore a [API](./docs/API.md)
4. ✅ Crie seu primeiro [módulo](./docs/CONTRIBUTING.md#-como-criar-um-novo-módulo)
5. ✅ Escreva [testes](./docs/TESTING.md)
6. ✅ Faça seu primeiro [PR](./docs/CONTRIBUTING.md#-pull-requests)

---

**Boa Sorte! 🚀**
