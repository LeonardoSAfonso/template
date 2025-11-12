# GitHub Workflows e Configurações

Este diretório contém templates e workflows do GitHub para automação de processos.

---

## 📋 Estrutura

```
.github/
├── workflows/               # GitHub Actions workflows
│   ├── pr-validation.yml   # Validação de Pull Requests
│   └── code-quality.yml    # Análise de qualidade de código
├── labeler.yml             # Configuração de labels automáticos
├── pull_request_template.md # Template de Pull Request
└── README.md               # Este arquivo
```

---

## 🔄 Workflows

### 1. PR Validation (`pr-validation.yml`)

Executa validações básicas em todos os Pull Requests.

**Quando executa:**
- Pull Requests para `main` ou `develop`
- Eventos: opened, synchronize, reopened

**Jobs:**

#### validate-title
- Valida se o título segue Conventional Commits
- Tipos aceitos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`
- Exemplo válido: `feat: adiciona validação de email`

#### lint-and-format
- Executa ESLint (`npm run lint`)
- Verifica formatação Prettier
- Falha se houver erros de lint ou formatação

#### test
- Sobe PostgreSQL como service
- Executa migrações Prisma
- Roda testes unitários
- Gera relatório de cobertura
- Upload para Codecov (opcional)

#### build
- Verifica se a aplicação compila
- Executa `npm run build`
- Falha se build falhar

#### pr-size
- Verifica tamanho do PR
- Avisa se > 300 linhas alteradas
- Falha se > 500 linhas alteradas

#### pr-labels
- Adiciona labels automaticamente baseado em arquivos alterados
- Usa configuração em `labeler.yml`

#### comment-checklist
- Posta comentário de boas-vindas no PR
- Inclui checklist e links para documentação
- Executa apenas quando PR é aberto

**Exemplo de uso:**

```yaml
# .github/workflows/pr-validation.yml
on:
  pull_request:
    branches: [main, develop]
```

---

### 2. Code Quality (`code-quality.yml`)

Análise avançada de qualidade e segurança de código.

**Quando executa:**
- Pull Requests para `main` ou `develop`
- Push para `main` ou `develop`

**Jobs:**

#### sonarqube
- Executa análise SonarQube
- Verifica quality gates
- Requer configuração de secrets:
  - `SONAR_TOKEN`
  - `SONAR_HOST_URL`

#### code-review (opcional)
- Review automatizado com AI
- Requer `OPENAI_API_KEY`
- Pode ser desabilitado

#### dependency-review
- Revisa dependências adicionadas/modificadas
- Verifica vulnerabilidades conhecidas
- Bloqueia licenças GPL

#### security-scan
- Executa `npm audit`
- Scan de vulnerabilidades com Trivy
- Upload de resultados para GitHub Security

**Configuração necessária:**

```bash
# Secrets do GitHub
SONAR_TOKEN=your_sonar_token
SONAR_HOST_URL=https://sonarqube.example.com
OPENAI_API_KEY=your_openai_key (opcional)
```

---

## 🏷 Labels Automáticos

O arquivo `labeler.yml` configura labels automáticos baseado em arquivos modificados.

### Labels Disponíveis

| Label | Quando aplicado |
|-------|----------------|
| `documentation` | Arquivos em `docs/`, `*.md` |
| `tests` | Arquivos em `test/`, `*.spec.ts` |
| `infrastructure` | Docker, GitHub Actions |
| `configuration` | Config files, tsconfig, etc |
| `database` | Arquivos Prisma |
| `backend` | Arquivos TypeScript em `src/` |
| `dto` | Arquivos `*.dto.ts` |
| `service` | Arquivos em `services/` |
| `controller` | Arquivos `*.controller.ts` |
| `repository` | Arquivos `repository.ts` |
| `module` | Arquivos `*.module.ts` |
| `auth` | Arquivos em `keycloak/`, `auth/` |
| `dependencies` | `package.json` |
| `critical` | `main.ts`, `app.module.ts`, `schema.prisma` |

### Exemplo de Configuração

```yaml
# .github/labeler.yml
documentation:
  - changed-files:
    - any-glob-to-any-file: ['docs/**/*', '*.md']

tests:
  - changed-files:
    - any-glob-to-any-file: ['test/**/*', '**/*.spec.ts']
```

---

## 📝 Template de Pull Request

O arquivo `pull_request_template.md` é usado automaticamente quando um PR é criado.

### Seções do Template

1. **Descrição** - O que foi feito
2. **Tipo de Mudança** - Checkboxes para tipo
3. **Issue Relacionada** - Link para issue
4. **Como Testar** - Passos para reproduzir
5. **Checklist** - Itens de qualidade
   - Qualidade de Código
   - Testes
   - Documentação
   - Qualidade e Formatação
   - Git
   - Revisão
6. **Screenshots** - Imagens (se aplicável)
7. **Observações** - Informações adicionais
8. **Referências** - Links úteis

### Personalizando o Template

Edite `.github/pull_request_template.md` para adicionar/remover seções.

---

## 🚀 Como Usar

### Criar um Pull Request

1. **Crie uma branch:**
   ```bash
   git checkout -b feature/minha-feature
   ```

2. **Faça commits seguindo Conventional Commits:**
   ```bash
   git commit -m "feat: adiciona nova funcionalidade"
   ```

3. **Push para o GitHub:**
   ```bash
   git push origin feature/minha-feature
   ```

4. **Abra o PR:**
   - Vá para GitHub
   - Clique em "New Pull Request"
   - O template será preenchido automaticamente
   - Preencha as informações
   - Marque os checkboxes
   - Submeta o PR

5. **Aguarde validações:**
   - Os workflows executarão automaticamente
   - Verifique os checks no PR
   - Corrija erros se necessário

### Verificar Status dos Workflows

```bash
# Ver status dos workflows via CLI
gh pr checks

# Ver detalhes de um workflow específico
gh run view <run-id>

# Re-executar workflows falhados
gh run rerun <run-id>
```

---

## ⚙️ Configuração

### Habilitar Workflows

1. Vá em **Settings** → **Actions** → **General**
2. Em "Actions permissions", selecione:
   - "Allow all actions and reusable workflows"
3. Em "Workflow permissions", selecione:
   - "Read and write permissions"
4. Marque "Allow GitHub Actions to create and approve pull requests"

### Configurar Secrets

Vá em **Settings** → **Secrets and variables** → **Actions**:

```bash
# Obrigatórios (se usar SonarQube)
SONAR_TOKEN=your_token
SONAR_HOST_URL=http://sonarqube:9000

# Opcionais
OPENAI_API_KEY=your_key        # Para AI code review
CODECOV_TOKEN=your_token       # Para upload de cobertura
```

### Configurar Branch Protection

Vá em **Settings** → **Branches** → **Add rule**:

1. **Branch name pattern**: `main`
2. Marque:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
3. Status checks obrigatórios:
   - `validate-title`
   - `lint-and-format`
   - `test`
   - `build`

---

## 🔧 Troubleshooting

### Workflow não executa

**Problema:** Workflow não executa automaticamente

**Solução:**
1. Verifique se workflows estão habilitados
2. Verifique permissões em Settings → Actions
3. Verifique se os arquivos YAML estão corretos

### Erro de permissão

**Problema:** `Error: Resource not accessible by integration`

**Solução:**
1. Vá em Settings → Actions → General
2. Em "Workflow permissions", selecione "Read and write permissions"

### SonarQube falha

**Problema:** Job `sonarqube` falha

**Solução:**
1. Verifique se `SONAR_TOKEN` está configurado
2. Verifique se `SONAR_HOST_URL` está acessível
3. Se não usar SonarQube, remova o job ou adicione `continue-on-error: true`

### Testes falham

**Problema:** Job `test` falha

**Solução:**
1. Execute testes localmente: `npm run test`
2. Verifique se banco de dados está configurado
3. Verifique se migrações estão atualizadas

---

## 📚 Recursos

### GitHub Actions

- [Documentação Oficial](https://docs.github.com/actions)
- [Workflow Syntax](https://docs.github.com/actions/reference/workflow-syntax-for-github-actions)
- [Events that trigger workflows](https://docs.github.com/actions/reference/events-that-trigger-workflows)

### Conventional Commits

- [Especificação](https://www.conventionalcommits.org/)
- [Commitizen](https://github.com/commitizen/cz-cli)

### SonarQube

- [SonarQube Scan Action](https://github.com/SonarSource/sonarqube-scan-action)
- [Quality Gate Action](https://github.com/SonarSource/sonarqube-quality-gate-action)

---

## 🤝 Contribuindo

Para adicionar novos workflows ou modificar existentes:

1. Edite os arquivos em `.github/workflows/`
2. Teste localmente usando [act](https://github.com/nektos/act)
3. Abra um PR com as mudanças
4. Documente as mudanças neste README

---

**Última atualização:** Novembro 2024

