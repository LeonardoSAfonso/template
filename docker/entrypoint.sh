#!/bin/sh

set -e

wait_for() {
  HOST=$1
  PORT=$2
  TIMEOUT=${3:-30}
  START_TS=$(date +%s)

  echo "⏳ Aguardando ${HOST}:${PORT} por até ${TIMEOUT}s..."

  while :
  do
    nc -z "$HOST" "$PORT" >/dev/null 2>&1
    if [ $? -eq 0 ]; then
      END_TS=$(date +%s)
      echo "✅ ${HOST}:${PORT} está disponível após $((END_TS - START_TS))s"
      break
    fi

    CURRENT_TS=$(date +%s)
    if [ $((CURRENT_TS - START_TS)) -ge $TIMEOUT ]; then
      echo "❌ Timeout ao aguardar ${HOST}:${PORT}"
      exit 1
    fi

    sleep 1
  done
}

wait_for_keycloak_realm() {
  REALM=${KC_REALM:-template}
  KC_URL=${KC_AUTH_SERVER_URL:-http://keycloak:8080/auth}
  TIMEOUT=${1:-120}
  START_TS=$(date +%s)

  echo "⏳ Aguardando Keycloak realm '${REALM}' por até ${TIMEOUT}s..."

  while :
  do
    if curl -sSf "${KC_URL}/realms/${REALM}" > /dev/null 2>&1; then
      END_TS=$(date +%s)
      echo "✅ Keycloak realm '${REALM}' está disponível após $((END_TS - START_TS))s"
      break
    fi

    CURRENT_TS=$(date +%s)
    if [ $((CURRENT_TS - START_TS)) -ge $TIMEOUT ]; then
      echo "❌ Timeout ao aguardar Keycloak realm '${REALM}'"
      echo "🔍 Tentando verificar status do Keycloak..."
      curl -v "${KC_URL}/realms/${REALM}" || true
      exit 1
    fi

    echo "⏳ Aguardando Keycloak carregar o realm '${REALM}'..."
    sleep 3
  done
}

# Aguarda PostgreSQL
wait_for postgres 5432 60

# Aguarda Keycloak estar disponível
wait_for keycloak 8080 60

# Aguarda o realm estar disponível
wait_for_keycloak_realm 180

echo "✅ Todos os serviços estão prontos! Iniciando aplicação..."

# Executa o comando original passado no CMD do Dockerfile
exec "$@"
