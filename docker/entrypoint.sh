#!/bin/sh

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

# Aguarda PostgreSQL
wait_for postgres 5432 30

# Espera HTTP 200 do endpoint do realm
until curl -sSf http://keycloak:8080/auth/realms/template > /dev/null; do
  echo "⏳ Aguardando Keycloak carregar o realm..."
  sleep 2
done

echo "✅ Realm do Keycloak disponível!"

echo "✅ Todos os serviços estão prontos! Iniciando aplicação..."

# Executa o comando original passado no CMD do Dockerfile
exec "$@"
