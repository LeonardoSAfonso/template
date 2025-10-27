# SonarQube 10.8 LTS - Quick Start

## Início Rápido 🚀

```bash
# 1. Iniciar SonarQube
npm run sonar:up

# 2. Aguardar inicialização (1-2 minutos)
# Acesse: http://localhost:9000
# Login: admin / admin (altere na primeira vez)

# 3. Gerar token
# My Account → Security → Generate Tokens

# 4. Configurar token
cp env.sonar.example .env.sonar
# Edite .env.sonar e adicione seu token

# 5. Executar análise
source .env.sonar  # Carregar variáveis de ambiente
npm run sonar:analysis

# 6. Ver resultados
# http://localhost:9000
```

## Comandos Disponíveis

- `npm run sonar:up` - Inicia containers
- `npm run sonar:down` - Para containers
- `npm run sonar:scan` - Apenas scan
- `npm run sonar:analysis` - Testes + scan

## Arquivos

- `sonar-project.properties` - Configuração do projeto
- `env.sonar.example` - Exemplo de variáveis de ambiente
- `SONARQUBE.md` - Documentação completa

## Portas

- **9000** - Interface Web do SonarQube

## Volumes Persistentes

Os dados são salvos em volumes Docker:

- `sonarqube-db-data` - Banco de dados
- `sonarqube-data` - Dados do SonarQube
- `sonarqube-extensions` - Plugins
- `sonarqube-logs` - Logs

---

📚 Veja `SONARQUBE.md` para documentação completa.
