#!/bin/sh
set -e

echo "Esperando a SQL Server (sqlserver_main:1433)..."
until nc -z sqlserver_main 1433; do
  sleep 2
done

echo "SQL Server está listo, iniciando API..."
exec "$@"
